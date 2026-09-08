"""
API routes for the AI Email Action Manager.
Includes demo endpoints and real Firebase/Gmail integration endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from backend.database.db import get_db
from backend.database import crud
from backend.services.demo_data import get_demo_emails, get_demo_stats
from backend.utils.helpers import get_greeting, get_deadline_section, format_relative_date
from backend.gmail.client import GmailClient
from backend.ai.service import analyzer

router = APIRouter(prefix="/api", tags=["api"])


# ─── Pydantic Request Models ─────────────────────────────────

class FirebaseLoginRequest(BaseModel):
    google_id: str
    email: str
    name: str
    picture: Optional[str] = None
    access_token: Optional[str] = None


class SyncEmailsRequest(BaseModel):
    user_id: Optional[int] = None
    google_id: Optional[str] = None
    access_token: Optional[str] = None
    max_results: int = 20


class DisconnectRequest(BaseModel):
    user_id: Optional[int] = None
    google_id: Optional[str] = None


# ─── Auth Endpoints ──────────────────────────────────────────

@router.post("/auth/firebase-login")
def firebase_login(payload: FirebaseLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate/register user using Firebase Google Sign-in credentials.
    Stores user info and Gmail OAuth access token in the database.
    """
    user = crud.get_user_by_google_id(db, payload.google_id)
    if not user:
        # Check by email in case of re-register
        user = db.query(crud.User).filter(crud.User.email == payload.email).first()
        if user:
            user.google_id = payload.google_id
            user.name = payload.name
            user.picture = payload.picture
            db.commit()
            db.refresh(user)
        else:
            user = crud.create_user(
                db=db,
                google_id=payload.google_id,
                email=payload.email,
                name=payload.name,
                picture=payload.picture
            )

    if payload.access_token:
        crud.update_user_gmail_token(db, user.id, payload.access_token, connected=True)

    return {
        "status": "ok",
        "user": {
            "id": user.id,
            "google_id": user.google_id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
            "gmail_connected": user.gmail_connected
        }
    }


@router.post("/auth/disconnect")
def disconnect_gmail(payload: DisconnectRequest, db: Session = Depends(get_db)):
    """Disconnect Gmail for the specified user."""
    user = None
    if payload.user_id:
        user = crud.get_user_by_id(db, payload.user_id)
    elif payload.google_id:
        user = crud.get_user_by_google_id(db, payload.google_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    crud.disconnect_gmail(db, user.id)
    return {"status": "ok", "message": "Gmail disconnected successfully"}


@router.get("/me")
def get_current_user(
    google_id: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Get current user info. Falls back to demo user if unauthenticated."""
    user = None
    if user_id:
        user = crud.get_user_by_id(db, user_id)
    elif google_id:
        user = crud.get_user_by_google_id(db, google_id)

    if user:
        return {
            "is_demo": False,
            "user": {
                "id": user.id,
                "google_id": user.google_id,
                "name": user.name,
                "email": user.email,
                "picture": user.picture,
                "gmail_connected": user.gmail_connected
            }
        }

    # Demo fallback
    return {
        "is_demo": True,
        "user": {
            "name": "Demo User",
            "email": "demo@example.com",
            "picture": None,
            "gmail_connected": True
        }
    }


# ─── Live Gmail Sync & Processing ────────────────────────────

@router.post("/emails/sync")
async def sync_emails(payload: SyncEmailsRequest, db: Session = Depends(get_db)):
    """
    Fetch recent emails from Gmail using the OAuth access token,
    analyze them using the AI service, and store them in the database.
    """
    user = None
    if payload.user_id:
        user = crud.get_user_by_id(db, payload.user_id)
    elif payload.google_id:
        user = crud.get_user_by_google_id(db, payload.google_id)

    # Determine access token
    access_token = payload.access_token
    if not access_token and user and user.gmail_token:
        access_token = user.gmail_token

    if not access_token:
        raise HTTPException(
            status_code=400,
            detail="No Gmail access token provided. Please connect Gmail via Google Sign-In."
        )

    # If user doesn't exist yet, we can create a temporary or require login
    if not user:
        raise HTTPException(status_code=400, detail="User account not found. Please log in first.")

    # Update token if provided
    if payload.access_token and user.gmail_token != payload.access_token:
        crud.update_user_gmail_token(db, user.id, payload.access_token, connected=True)

    # Fetch emails from Gmail REST API
    gmail_client = GmailClient(access_token)
    try:
        raw_emails = await gmail_client.fetch_recent_emails(max_results=payload.max_results)
    except PermissionError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to communicate with Gmail: {str(e)}")

    user_pref = crud.get_or_create_preferences(db, user.id)
    profile_type = user_pref.profile_type if user_pref else "general"

    synced_count = 0
    new_count = 0

    for msg in raw_emails:
        synced_count += 1
        existing = crud.get_email_by_gmail_id(db, user.id, msg["gmail_message_id"])
        if existing:
            continue

        # Save Email
        email_record = crud.create_email(
            db=db,
            user_id=user.id,
            gmail_message_id=msg["gmail_message_id"],
            thread_id=msg.get("thread_id"),
            sender=msg.get("sender"),
            sender_email=msg.get("sender_email"),
            subject=msg.get("subject"),
            body=msg.get("body"),
            received_at=msg.get("received_at"),
            is_read=msg.get("is_read", False)
        )
        new_count += 1

        # Run AI analysis
        analysis_data = await analyzer.analyze_email(msg, profile_type=profile_type)

        crud.create_email_analysis(
            db=db,
            email_id=email_record.id,
            category=analysis_data.get("category", "Other"),
            priority=analysis_data.get("priority", "MEDIUM"),
            action_required=analysis_data.get("action_required", False),
            action=analysis_data.get("action"),
            deadline=analysis_data.get("deadline"),
            summary=analysis_data.get("summary"),
            reason=analysis_data.get("reason"),
            needs_review=False
        )

        # Create action item if action is required
        if analysis_data.get("action_required") and analysis_data.get("action"):
            crud.create_action(
                db=db,
                user_id=user.id,
                email_id=email_record.id,
                action_text=analysis_data["action"],
                priority=analysis_data.get("priority", "MEDIUM"),
                deadline=analysis_data.get("deadline")
            )

    return {
        "status": "ok",
        "synced_count": synced_count,
        "new_count": new_count,
        "message": f"Successfully processed {synced_count} emails ({new_count} new)."
    }


# ─── Live User Data Endpoints ────────────────────────────────

@router.get("/emails")
def get_user_emails(
    user_id: Optional[int] = Query(None),
    google_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get stored emails for the authenticated user."""
    user = None
    if user_id:
        user = crud.get_user_by_id(db, user_id)
    elif google_id:
        user = crud.get_user_by_google_id(db, google_id)

    if not user:
        # Return demo emails as fallback
        return get_demo_email_list()

    emails = crud.get_emails_by_user(db, user.id, limit=50)
    result = []
    for email in emails:
        analysis_dict = None
        if email.analysis:
            analysis_dict = {
                "category": email.analysis.category,
                "priority": email.analysis.priority,
                "action_required": email.analysis.action_required,
                "action": email.analysis.action,
                "deadline": email.analysis.deadline,
                "summary": email.analysis.summary,
                "reason": email.analysis.reason
            }

        result.append({
            "id": email.id,
            "gmail_message_id": email.gmail_message_id,
            "thread_id": email.thread_id,
            "sender": email.sender,
            "sender_email": email.sender_email,
            "subject": email.subject,
            "received_at": email.received_at.isoformat() if email.received_at else None,
            "is_read": email.is_read,
            "analysis": analysis_dict
        })

    return {"emails": result}


@router.get("/emails/{email_id}")
def get_user_email_detail(
    email_id: int,
    user_id: Optional[int] = Query(None),
    google_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get full details for a single email, scoped to the user."""
    user = None
    if user_id:
        user = crud.get_user_by_id(db, user_id)
    elif google_id:
        user = crud.get_user_by_google_id(db, google_id)

    if not user:
        return get_demo_email_detail(email_id)

    email = crud.get_email_by_id(db, email_id, user.id)
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    analysis_dict = None
    if email.analysis:
        analysis_dict = {
            "category": email.analysis.category,
            "priority": email.analysis.priority,
            "action_required": email.analysis.action_required,
            "action": email.analysis.action,
            "deadline": email.analysis.deadline,
            "summary": email.analysis.summary,
            "reason": email.analysis.reason
        }

    return {
        "id": email.id,
        "gmail_message_id": email.gmail_message_id,
        "thread_id": email.thread_id,
        "sender": email.sender,
        "sender_email": email.sender_email,
        "subject": email.subject,
        "body": email.body,
        "received_at": email.received_at.isoformat() if email.received_at else None,
        "is_read": email.is_read,
        "analysis": analysis_dict
    }


@router.get("/dashboard")
def get_user_dashboard(
    user_id: Optional[int] = Query(None),
    google_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get user dashboard — actions grouped by priority and statistics."""
    user = None
    if user_id:
        user = crud.get_user_by_id(db, user_id)
    elif google_id:
        user = crud.get_user_by_google_id(db, google_id)

    if not user:
        return get_demo_dashboard()

    actions = crud.get_actions_by_user(db, user.id)
    emails = crud.get_emails_by_user(db, user.id, limit=100)

    actions_by_priority = {"HIGH": [], "MEDIUM": [], "LOW": []}
    completed_count = 0
    urgent_count = 0

    for a in actions:
        if a.status == "completed":
            completed_count += 1

        if a.priority == "HIGH" and a.status == "pending":
            urgent_count += 1

        action_dict = {
            "id": a.id,
            "email_id": a.email_id,
            "gmail_message_id": a.email.gmail_message_id if a.email else "",
            "thread_id": a.email.thread_id if a.email else "",
            "sender": a.email.sender if a.email else "Unknown",
            "subject": a.email.subject if a.email else "",
            "action_text": a.action_text,
            "priority": a.priority,
            "deadline": a.deadline,
            "deadline_relative": format_relative_date(a.deadline) if a.deadline else "No deadline",
            "summary": a.email.analysis.summary if a.email and a.email.analysis else "",
            "status": a.status
        }

        if a.priority in actions_by_priority:
            actions_by_priority[a.priority].append(action_dict)

    promotional_count = sum(1 for e in emails if e.analysis and e.analysis.category == "Promotion")
    newsletters_count = sum(1 for e in emails if e.analysis and e.analysis.category == "Newsletter")
    important_count = sum(1 for e in emails if e.analysis and e.analysis.priority in ("HIGH", "MEDIUM"))

    stats = {
        "total_emails": len(emails),
        "important_emails": important_count,
        "action_required": len(actions),
        "promotional": promotional_count,
        "newsletters": newsletters_count,
        "urgent_count": urgent_count,
        "completed_count": completed_count,
        "estimated_time_saved_min": len(emails) * 3
    }

    return {
        "greeting": get_greeting(),
        "message": f"Welcome back, {user.name.split()[0]}! Here is what needs your attention.",
        "actions_by_priority": actions_by_priority,
        "stats": stats,
        "is_demo": False
    }


@router.get("/actions")
def get_user_actions(
    user_id: Optional[int] = Query(None),
    google_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get user actions grouped by deadline sections."""
    user = None
    if user_id:
        user = crud.get_user_by_id(db, user_id)
    elif google_id:
        user = crud.get_user_by_google_id(db, google_id)

    if not user:
        return get_demo_actions()

    actions = crud.get_actions_by_user(db, user.id)

    sections = {
        "overdue": [],
        "today": [],
        "tomorrow": [],
        "this_week": [],
        "no_deadline": []
    }

    for a in actions:
        section = get_deadline_section(a.deadline)
        action_dict = {
            "id": a.id,
            "email_id": a.email_id,
            "gmail_message_id": a.email.gmail_message_id if a.email else "",
            "thread_id": a.email.thread_id if a.email else "",
            "sender": a.email.sender if a.email else "Unknown",
            "subject": a.email.subject if a.email else "",
            "action_text": a.action_text,
            "priority": a.priority,
            "deadline": a.deadline,
            "summary": a.email.analysis.summary if a.email and a.email.analysis else "",
            "category": a.email.analysis.category if a.email and a.email.analysis else "Other",
            "status": a.status
        }
        if section in sections:
            sections[section].append(action_dict)
        else:
            sections["no_deadline"].append(action_dict)

    return {"sections": sections, "is_demo": False}


@router.post("/actions/{action_id}/complete")
def complete_action(action_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    """Mark an action as completed."""
    action = crud.mark_action_complete(db, action_id, user_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return {"status": "ok", "action_id": action_id, "state": "completed"}


@router.post("/actions/{action_id}/pending")
def revert_action(action_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    """Revert an action to pending."""
    action = crud.mark_action_pending(db, action_id, user_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return {"status": "ok", "action_id": action_id, "state": "pending"}


# ─── Demo Mode Endpoints ─────────────────────────────────────

@router.get("/demo/emails")
def get_demo_email_list():
    """Get all demo emails with analysis."""
    emails = get_demo_emails()
    result = []
    for i, email in enumerate(emails):
        result.append({
            "id": i + 1,
            "gmail_message_id": email["gmail_message_id"],
            "thread_id": email["thread_id"],
            "sender": email["sender"],
            "sender_email": email["sender_email"],
            "subject": email["subject"],
            "received_at": email["received_at"],
            "is_read": email["is_read"],
            "analysis": email["analysis"]
        })
    return {"emails": result}


@router.get("/demo/emails/{email_id}")
def get_demo_email_detail(email_id: int):
    """Get a specific demo email with full details."""
    emails = get_demo_emails()
    if email_id < 1 or email_id > len(emails):
        raise HTTPException(status_code=404, detail="Email not found")
    email = emails[email_id - 1]
    return {
        "id": email_id,
        **email
    }


@router.get("/demo/dashboard")
def get_demo_dashboard():
    """Get demo dashboard data — actions grouped by priority."""
    emails = get_demo_emails()
    greeting = get_greeting()

    actions_by_priority = {"HIGH": [], "MEDIUM": [], "LOW": []}
    for i, email in enumerate(emails):
        analysis = email["analysis"]
        if analysis["action_required"]:
            action_item = {
                "id": i + 1,
                "email_id": i + 1,
                "sender": email["sender"],
                "subject": email["subject"],
                "action_text": analysis["action"],
                "priority": analysis["priority"],
                "deadline": analysis.get("deadline"),
                "deadline_relative": _format_demo_deadline(analysis.get("deadline")),
                "summary": analysis["summary"],
                "status": "pending"
            }
            if analysis["priority"] in actions_by_priority:
                actions_by_priority[analysis["priority"]].append(action_item)

    stats = get_demo_stats()

    return {
        "greeting": greeting,
        "message": "Here's what needs your attention.",
        "actions_by_priority": actions_by_priority,
        "stats": stats,
        "is_demo": True
    }


@router.get("/demo/actions")
def get_demo_actions():
    """Get demo actions grouped by deadline section."""
    emails = get_demo_emails()

    sections = {
        "overdue": [],
        "today": [],
        "tomorrow": [],
        "this_week": [],
        "no_deadline": []
    }

    for i, email in enumerate(emails):
        analysis = email["analysis"]
        if analysis["action_required"]:
            section = get_deadline_section(analysis.get("deadline"))
            action_item = {
                "id": i + 1,
                "email_id": i + 1,
                "sender": email["sender"],
                "subject": email["subject"],
                "action_text": analysis["action"],
                "priority": analysis["priority"],
                "deadline": analysis.get("deadline"),
                "summary": analysis["summary"],
                "category": analysis["category"],
                "status": "pending"
            }
            if section in sections:
                sections[section].append(action_item)
            else:
                sections["no_deadline"].append(action_item)

    return {"sections": sections, "is_demo": True}


@router.get("/demo/stats")
def get_demo_statistics():
    """Get demo statistics."""
    return get_demo_stats()


# ─── Health Check ─────────────────────────────────────────────

@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "AI Email Action Manager is running"}


# ─── Helper ──────────────────────────────────────────────────

def _format_demo_deadline(date_str):
    """Format deadline for demo display."""
    return format_relative_date(date_str) if date_str else "No deadline"
