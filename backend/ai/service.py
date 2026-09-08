"""
AI Analysis Service for Email Processing.
Supports Google Gemini API with seamless rule-based fallback.
"""

import json
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from backend.config import settings
from backend.ai.prompts import SYSTEM_PROMPT, ANALYSIS_PROMPT


class EmailAnalyzer:
    """Service to classify emails and extract tasks, deadlines, and priorities."""

    def __init__(self):
        self.client = None
        if settings.gemini_configured:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.gemini_api_key)
                self.client = genai.GenerativeModel("gemini-1.5-flash")
                print("[OK] Gemini AI analyzer initialized")
            except Exception as e:
                print(f"[WARN] Failed to initialize Gemini model: {e}. Falling back to rule-based.")
                self.client = None

    async def analyze_email(self, email_data: Dict[str, Any], profile_type: str = "general") -> Dict[str, Any]:
        """Analyze a single email using Gemini or rule-based fallback."""
        if self.client:
            try:
                return await self._analyze_with_gemini(email_data, profile_type)
            except Exception as e:
                print(f"[WARN] Gemini analysis failed ({e}), falling back to heuristic analyzer")

        return self._analyze_rule_based(email_data, profile_type)

    async def _analyze_with_gemini(self, email_data: Dict[str, Any], profile_type: str) -> Dict[str, Any]:
        """Query Gemini API with structured prompt."""
        system_text = SYSTEM_PROMPT.format(profile_type=profile_type)
        prompt_text = ANALYSIS_PROMPT.format(
            sender=email_data.get("sender", ""),
            sender_email=email_data.get("sender_email", ""),
            subject=email_data.get("subject", ""),
            received_at=str(email_data.get("received_at", "")),
            body=(email_data.get("body", "") or "")[:2000]
        )

        full_prompt = f"{system_text}\n\n{prompt_text}"
        response = self.client.generate_content(full_prompt)
        text = response.text.strip()

        # Clean JSON markdown if model wrapped it in ```json ... ```
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join([line for line in lines if not line.startswith("```")])

        data = json.loads(text.strip())
        return self._sanitize_analysis(data)

    def _analyze_rule_based(self, email_data: Dict[str, Any], profile_type: str) -> Dict[str, Any]:
        """Heuristic analyzer when Gemini is not configured or offline."""
        subject = (email_data.get("subject") or "").lower()
        body = (email_data.get("body") or "").lower()
        sender = (email_data.get("sender") or "").lower()
        full_text = f"{subject} {body}"

        # 1. Check for spam / promotion / newsletter
        if any(w in full_text for w in ["unsubscribe", "view in browser", "sale", "discount", "off your next", "% off", "deals"]):
            category = "Promotion"
            priority = "LOW"
            action_required = False
            action = None
            deadline = None
            summary = f"Promotional message from {email_data.get('sender', 'Sender')}"
            reason = "Contains promotional keywords or discount offers"
        elif any(w in full_text for w in ["newsletter", "weekly digest", "roundup", "daily brief"]):
            category = "Newsletter"
            priority = "LOW"
            action_required = False
            action = None
            deadline = None
            summary = f"Newsletter: {email_data.get('subject')}"
            reason = "Regular content digest or newsletter format"
        # 2. Urgent / High Priority Actions
        elif any(w in full_text for w in ["urgent", "asap", "deadline", "action required", "immediate", "overdue", "critical"]):
            category = "Action Required"
            priority = "HIGH"
            action_required = True
            action = f"Review and respond to urgent request regarding: {email_data.get('subject')}"
            deadline = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
            summary = f"Urgent request from {email_data.get('sender')}: {email_data.get('subject')}"
            reason = "Email indicates immediate action or deadline required"
        # 3. Meetings / Calendar / Invites
        elif any(w in full_text for w in ["meeting", "zoom.us", "meet.google", "interview", "call scheduled", "sync up"]):
            category = "Work"
            priority = "HIGH" if profile_type in ["professional", "freelancer"] else "MEDIUM"
            action_required = True
            action = f"Prepare and attend meeting: {email_data.get('subject')}"
            deadline = (datetime.now(timezone.utc) + timedelta(days=2)).strftime("%Y-%m-%d")
            summary = f"Meeting invitation or discussion from {email_data.get('sender')}"
            reason = "Calendar event or scheduled discussion"
        # 4. Invoices / Bills / Payments
        elif any(w in full_text for w in ["invoice", "receipt", "payment due", "bill", "subscription renewed", "transaction"]):
            category = "Transaction"
            priority = "MEDIUM"
            action_required = "due" in full_text or "unpaid" in full_text
            action = "Review payment receipt or pay invoice" if action_required else None
            deadline = (datetime.now(timezone.utc) + timedelta(days=3)).strftime("%Y-%m-%d") if action_required else None
            summary = f"Financial statement/invoice from {email_data.get('sender')}"
            reason = "Receipt or billing communication"
        # 5. General Work / Collaboration
        elif any(w in full_text for w in ["review", "feedback", "submit", "please find", "proposal", "contract", "update"]):
            category = "Work"
            priority = "MEDIUM"
            action_required = True
            action = f"Review document / respond to {email_data.get('sender')}"
            deadline = (datetime.now(timezone.utc) + timedelta(days=3)).strftime("%Y-%m-%d")
            summary = f"Work correspondence regarding {email_data.get('subject')}"
            reason = "Collaboration or request for review"
        else:
            category = "Notification"
            priority = "LOW"
            action_required = False
            action = None
            deadline = None
            summary = email_data.get("subject") or "Standard email message"
            reason = "Informational update requiring no immediate action"

        # Look for explicit date references (e.g., YYYY-MM-DD or by tomorrow)
        date_match = re.search(r"\b(202[4-9]-\d{2}-\d{2})\b", full_text)
        if date_match:
            deadline = date_match.group(1)

        return {
            "category": category,
            "priority": priority,
            "action_required": action_required,
            "action": action,
            "deadline": deadline,
            "summary": summary,
            "reason": reason
        }

    def _sanitize_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize LLM outputs."""
        categories = [
            "Action Required", "Work", "Personal", "Transaction",
            "Promotion", "Newsletter", "Social", "Notification", "Spam", "Other"
        ]
        priorities = ["HIGH", "MEDIUM", "LOW", "NONE"]

        cat = data.get("category", "Other")
        if cat not in categories:
            cat = "Other"

        prio = str(data.get("priority", "MEDIUM")).upper()
        if prio not in priorities:
            prio = "MEDIUM"

        action_req = bool(data.get("action_required", False))
        action = data.get("action") if action_req else None
        deadline = data.get("deadline")
        if deadline and not re.match(r"^\d{4}-\d{2}-\d{2}$", str(deadline)):
            deadline = None

        return {
            "category": cat,
            "priority": prio,
            "action_required": action_req,
            "action": action,
            "deadline": deadline,
            "summary": data.get("summary") or "",
            "reason": data.get("reason") or ""
        }


# Singleton analyzer instance
analyzer = EmailAnalyzer()
