"""
Gmail API Client using HTTPX with OAuth2 Access Token.
Communicates directly with Google's Gmail REST API v1.
"""

import base64
import asyncio
import email.utils
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx


class GmailClient:
    """Async Gmail REST API client."""

    BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me"

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }

    async def list_messages(self, max_results: int = 20, query: Optional[str] = None) -> List[Dict[str, str]]:
        """List message IDs from the user's inbox."""
        params = {"maxResults": min(max_results, 50)}
        if query:
            params["q"] = query

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/messages",
                headers=self.headers,
                params=params
            )
            if resp.status_code == 401:
                raise PermissionError("Gmail access token has expired or is invalid.")
            resp.raise_for_status()
            data = resp.json()
            return data.get("messages", [])

    async def get_message(self, message_id: str, client: Optional[httpx.AsyncClient] = None) -> Dict[str, Any]:
        """Fetch and parse a single message by ID."""
        url = f"{self.BASE_URL}/messages/{message_id}?format=full"

        if client:
            resp = await client.get(url, headers=self.headers)
        else:
            async with httpx.AsyncClient(timeout=15.0) as local_client:
                resp = await local_client.get(url, headers=self.headers)

        if resp.status_code == 401:
            raise PermissionError("Gmail access token has expired or is invalid.")
        resp.raise_for_status()
        raw_msg = resp.json()

        return self._parse_message(raw_msg)

    async def fetch_recent_emails(self, max_results: int = 20) -> List[Dict[str, Any]]:
        """Fetch full details for the most recent emails concurrently."""
        message_stubs = await self.list_messages(max_results=max_results)
        if not message_stubs:
            return []

        semaphore = asyncio.Semaphore(5)

        async with httpx.AsyncClient(timeout=20.0) as client:
            async def fetch_one(stub):
                async with semaphore:
                    try:
                        return await self.get_message(stub["id"], client=client)
                    except Exception as err:
                        print(f"[WARN] Failed to fetch message {stub['id']}: {err}")
                        return None

            tasks = [fetch_one(stub) for stub in message_stubs]
            results = await asyncio.gather(*tasks)

        # Filter out failed items
        return [r for r in results if r is not None]

    def _parse_message(self, raw_msg: Dict[str, Any]) -> Dict[str, Any]:
        """Parse raw Gmail API response into clean email metadata."""
        message_id = raw_msg.get("id")
        thread_id = raw_msg.get("threadId")
        label_ids = raw_msg.get("labelIds", [])
        is_read = "UNREAD" not in label_ids
        snippet = raw_msg.get("snippet", "")

        payload = raw_msg.get("payload", {})
        headers_list = payload.get("headers", [])

        # Extract relevant headers
        headers = {}
        for h in headers_list:
            headers[h.get("name", "").lower()] = h.get("value", "")

        subject = headers.get("subject", "(No Subject)")
        raw_from = headers.get("from", "Unknown")
        sender_name, sender_email = email.utils.parseaddr(raw_from)
        if not sender_name:
            sender_name = sender_email.split("@")[0] if "@" in sender_email else raw_from

        # Parse date
        raw_date = headers.get("date")
        received_at = None
        if raw_date:
            try:
                parsed_tuple = email.utils.parsedate_to_datetime(raw_date)
                received_at = parsed_tuple.astimezone(timezone.utc)
            except Exception:
                received_at = datetime.now(timezone.utc)
        else:
            received_at = datetime.now(timezone.utc)

        # Extract body text
        body = self._extract_body(payload) or snippet

        return {
            "gmail_message_id": message_id,
            "thread_id": thread_id,
            "sender": sender_name or "Unknown",
            "sender_email": sender_email or "",
            "subject": subject,
            "body": body[:5000],  # Keep reasonable length for AI prompt
            "snippet": snippet,
            "received_at": received_at,
            "is_read": is_read
        }

    def _extract_body(self, payload: Dict[str, Any]) -> str:
        """Recursively extract plain text body from MIME structure."""
        body_text = ""
        mime_type = payload.get("mimeType", "")

        # Check direct body data
        body_data = payload.get("body", {}).get("data")
        if body_data and mime_type.startswith("text/plain"):
            try:
                decoded = base64.urlsafe_b64decode(body_data + "==").decode("utf-8", errors="replace")
                return decoded.strip()
            except Exception:
                pass

        # Check multi-part payload
        parts = payload.get("parts", [])
        for part in parts:
            part_mime = part.get("mimeType", "")
            part_data = part.get("body", {}).get("data")
            if part_data and part_mime == "text/plain":
                try:
                    return base64.urlsafe_b64decode(part_data + "==").decode("utf-8", errors="replace").strip()
                except Exception:
                    continue
            elif "parts" in part:
                nested = self._extract_body(part)
                if nested:
                    return nested

        # Fallback to html if no plain text
        for part in parts:
            if part.get("mimeType") == "text/html":
                part_data = part.get("body", {}).get("data")
                if part_data:
                    try:
                        raw_html = base64.urlsafe_b64decode(part_data + "==").decode("utf-8", errors="replace")
                        # Basic tag stripping
                        import re
                        # Remove script and style blocks entirely
                        clean = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw_html, flags=re.IGNORECASE | re.DOTALL)
                        # Remove remaining tags
                        clean = re.sub(r"<[^>]+>", " ", clean)
                        return " ".join(clean.split()).strip()
                    except Exception:
                        pass

        return body_text
