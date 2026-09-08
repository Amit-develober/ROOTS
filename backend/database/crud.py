"""
CRUD operations for the AI Email Action Manager.
All operations scoped by user_id for multi-tenant safety.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from backend.database.models import User, Email, EmailAnalysis, Action, UserPreference


# ─── User Operations ─────────────────────────────────────────

def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
    """Find a user by their Google ID."""
    return db.query(User).filter(User.google_id == google_id).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Find a user by internal ID."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, google_id: str, email: str, name: str,
                picture: str = None) -> User:
    """Create a new user from Google OAuth data."""
    user = User(
        google_id=google_id,
        email=email,
        name=name,
        picture=picture
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_gmail_token(db: Session, user_id: int, token_json: str,
                            connected: bool = True) -> Optional[User]:
    """Store or update Gmail OAuth token for a user."""
    user = get_user_by_id(db, user_id)
    if user:
        user.gmail_token = token_json
        user.gmail_connected = connected
        db.commit()
        db.refresh(user)
    return user


def disconnect_gmail(db: Session, user_id: int) -> Optional[User]:
    """Remove Gmail connection for a user."""
    user = get_user_by_id(db, user_id)
    if user:
        user.gmail_token = None
        user.gmail_connected = False
        db.commit()
        db.refresh(user)
    return user


# ─── Email Operations ────────────────────────────────────────

def create_email(db: Session, user_id: int, gmail_message_id: str,
                 thread_id: str = None, sender: str = None,
                 sender_email: str = None, subject: str = None,
                 body: str = None, received_at: datetime = None,
                 is_read: bool = False) -> Email:
    """Store a fetched email."""
    email = Email(
        user_id=user_id,
        gmail_message_id=gmail_message_id,
        thread_id=thread_id,
        sender=sender,
        sender_email=sender_email,
        subject=subject,
        body=body,
        received_at=received_at,
        is_read=is_read
    )
    db.add(email)
    db.commit()
    db.refresh(email)
    return email


def get_emails_by_user(db: Session, user_id: int, limit: int = 100) -> list[Email]:
    """Get all emails for a user, most recent first."""
    return (db.query(Email)
            .filter(Email.user_id == user_id)
            .options(joinedload(Email.analysis))
            .order_by(Email.received_at.desc())
            .limit(limit)
            .all())


def get_email_by_id(db: Session, email_id: int, user_id: int) -> Optional[Email]:
    """Get a specific email, scoped to user for security."""
    return (db.query(Email)
            .filter(Email.id == email_id, Email.user_id == user_id)
            .options(joinedload(Email.analysis))
            .first())


def get_email_by_gmail_id(db: Session, user_id: int,
                          gmail_message_id: str) -> Optional[Email]:
    """Check if an email is already stored (avoid duplicates)."""
    return (db.query(Email)
            .filter(Email.user_id == user_id,
                    Email.gmail_message_id == gmail_message_id)
            .first())


def delete_user_emails(db: Session, user_id: int) -> int:
    """Delete all emails (and cascading analysis/actions) for a user."""
    count = db.query(Email).filter(Email.user_id == user_id).delete()
    db.commit()
    return count


# ─── Email Analysis Operations ───────────────────────────────

def create_email_analysis(db: Session, email_id: int, category: str,
                          priority: str, action_required: bool,
                          action: str = None, deadline: str = None,
                          summary: str = None, reason: str = None,
                          needs_review: bool = False) -> EmailAnalysis:
    """Store AI analysis for an email."""
    analysis = EmailAnalysis(
        email_id=email_id,
        category=category,
        priority=priority,
        action_required=action_required,
        action=action,
        deadline=deadline,
        summary=summary,
        reason=reason,
        needs_review=needs_review
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


def get_analyses_by_user(db: Session, user_id: int) -> list[EmailAnalysis]:
    """Get all email analyses for a user."""
    return (db.query(EmailAnalysis)
            .join(Email)
            .filter(Email.user_id == user_id)
            .all())


# ─── Action Operations ───────────────────────────────────────

def create_action(db: Session, user_id: int, email_id: int,
                  action_text: str, priority: str = "NONE",
                  deadline: str = None) -> Action:
    """Create an action item extracted from an email."""
    action = Action(
        user_id=user_id,
        email_id=email_id,
        action_text=action_text,
        priority=priority,
        deadline=deadline,
        status="pending"
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


def get_actions_by_user(db: Session, user_id: int,
                        status: str = None) -> list[Action]:
    """Get all actions for a user, optionally filtered by status."""
    query = (db.query(Action)
             .filter(Action.user_id == user_id)
             .options(joinedload(Action.email)))
    if status:
        query = query.filter(Action.status == status)
    return query.order_by(Action.deadline.asc().nullslast(),
                          Action.created_at.desc()).all()


def mark_action_complete(db: Session, action_id: int,
                         user_id: int) -> Optional[Action]:
    """Mark an action as completed. Scoped to user for security."""
    action = (db.query(Action)
              .filter(Action.id == action_id, Action.user_id == user_id)
              .first())
    if action:
        action.status = "completed"
        action.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(action)
    return action


def mark_action_pending(db: Session, action_id: int,
                        user_id: int) -> Optional[Action]:
    """Revert an action to pending. Scoped to user for security."""
    action = (db.query(Action)
              .filter(Action.id == action_id, Action.user_id == user_id)
              .first())
    if action:
        action.status = "pending"
        action.completed_at = None
        db.commit()
        db.refresh(action)
    return action


# ─── User Preferences Operations ─────────────────────────────

def get_or_create_preferences(db: Session, user_id: int) -> UserPreference:
    """Get user preferences, creating defaults if none exist."""
    pref = (db.query(UserPreference)
            .filter(UserPreference.user_id == user_id)
            .first())
    if not pref:
        pref = UserPreference(user_id=user_id, profile_type="general")
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


def update_profile_type(db: Session, user_id: int,
                        profile_type: str) -> UserPreference:
    """Update the user's profile type for personalization."""
    pref = get_or_create_preferences(db, user_id)
    pref.profile_type = profile_type
    db.commit()
    db.refresh(pref)
    return pref


def update_email_fetch_count(db: Session, user_id: int, count: int) -> UserPreference:
    """Update how many recent emails to analyze for this user."""
    pref = get_or_create_preferences(db, user_id)
    pref.email_fetch_count = count
    db.commit()
    db.refresh(pref)
    return pref


# ─── Data Deletion ───────────────────────────────────────────

def delete_user_data(db: Session, user_id: int) -> dict:
    """Delete all stored data for a user (emails, analyses, actions).
    Keeps the user account but removes all email-related data."""
    actions_deleted = db.query(Action).filter(Action.user_id == user_id).delete()
    emails_deleted = db.query(Email).filter(Email.user_id == user_id).delete()
    db.commit()
    return {
        "emails_deleted": emails_deleted,
        "actions_deleted": actions_deleted
    }
