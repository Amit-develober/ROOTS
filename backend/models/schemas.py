"""
Pydantic schemas for API request/response validation.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


# ─── User Schemas ─────────────────────────────────────────────

class UserBase(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    google_id: str
    gmail_connected: bool
    created_at: datetime


# ─── Email Schemas ────────────────────────────────────────────

class EmailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    gmail_message_id: str
    thread_id: Optional[str] = None
    sender: Optional[str] = None
    sender_email: Optional[str] = None
    subject: Optional[str] = None
    received_at: Optional[datetime] = None
    is_read: bool = False
    analysis: Optional["EmailAnalysisResponse"] = None


class EmailDetailResponse(EmailResponse):
    body: Optional[str] = None


# ─── Email Analysis Schemas ───────────────────────────────────

class EmailAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email_id: int
    category: str
    priority: str
    action_required: bool
    action: Optional[str] = None
    deadline: Optional[str] = None
    summary: Optional[str] = None
    reason: Optional[str] = None
    needs_review: bool = False
    created_at: datetime


class AIAnalysisResult(BaseModel):
    """Schema for validating AI-generated analysis JSON."""
    category: str = Field(
        ...,
        description="Email category",
        pattern="^(Action Required|Work|Personal|Transaction|Promotion|Newsletter|Social|Notification|Spam|Other)$"
    )
    priority: str = Field(
        ...,
        description="Priority level",
        pattern="^(HIGH|MEDIUM|LOW|NONE)$"
    )
    action_required: bool
    action: Optional[str] = None
    deadline: Optional[str] = None
    summary: str = Field(..., max_length=500)
    reason: str = Field(..., max_length=500)


# ─── Action Schemas ───────────────────────────────────────────

class ActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email_id: int
    action_text: str
    priority: str
    deadline: Optional[str] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    email: Optional[EmailResponse] = None


class ActionUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(pending|completed)$")


# ─── User Preferences Schemas ────────────────────────────────

class UserPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    profile_type: str
    created_at: datetime


class ProfileTypeUpdate(BaseModel):
    profile_type: str = Field(
        ...,
        pattern="^(professional|student|freelancer|business_owner|general)$"
    )


# ─── Dashboard / Stats Schemas ───────────────────────────────

class DashboardStats(BaseModel):
    total_emails: int = 0
    important_emails: int = 0
    action_required: int = 0
    promotional: int = 0
    newsletters: int = 0
    high_priority: int = 0
    medium_priority: int = 0
    low_priority: int = 0
    completed_actions: int = 0
    pending_actions: int = 0


# ─── Auth Schemas ─────────────────────────────────────────────

class LoginResponse(BaseModel):
    message: str
    user: UserResponse
    redirect_url: str = "/dashboard"


# Resolve forward references
EmailResponse.model_rebuild()
