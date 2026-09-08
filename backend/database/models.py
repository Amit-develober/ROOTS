"""
SQLAlchemy ORM models for the AI Email Action Manager.
Tables: users, emails, email_analysis, actions, user_preferences
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship, DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


class User(Base):
    """User account linked to a Google identity."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    google_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture = Column(String(512), nullable=True)
    gmail_connected = Column(Boolean, default=False)
    gmail_token = Column(Text, nullable=True)  # Encrypted OAuth token JSON
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    emails = relationship("Email", back_populates="user", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user",
                               uselist=False, cascade="all, delete-orphan")


class Email(Base):
    """Stored email metadata fetched from Gmail."""
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    gmail_message_id = Column(String(255), nullable=False, index=True)
    thread_id = Column(String(255), nullable=True)
    sender = Column(String(255), nullable=True)
    sender_email = Column(String(255), nullable=True)
    subject = Column(String(512), nullable=True)
    body = Column(Text, nullable=True)
    received_at = Column(DateTime, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="emails")
    analysis = relationship("EmailAnalysis", back_populates="email",
                            uselist=False, cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="email", cascade="all, delete-orphan")


class EmailAnalysis(Base):
    """AI-generated analysis for an email."""
    __tablename__ = "email_analysis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email_id = Column(Integer, ForeignKey("emails.id", ondelete="CASCADE"),
                      unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, default="Other")
    priority = Column(String(10), nullable=False, default="NONE")
    action_required = Column(Boolean, default=False)
    action = Column(Text, nullable=True)
    deadline = Column(String(50), nullable=True)
    summary = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    needs_review = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    email = relationship("Email", back_populates="analysis")


class Action(Base):
    """Extracted action items from emails."""
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    email_id = Column(Integer, ForeignKey("emails.id", ondelete="CASCADE"), nullable=False)
    action_text = Column(Text, nullable=False)
    priority = Column(String(10), nullable=False, default="NONE")
    deadline = Column(String(50), nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="actions")
    email = relationship("Email", back_populates="actions")


class UserPreference(Base):
    """User personalization preferences."""
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     unique=True, nullable=False, index=True)
    profile_type = Column(String(50), nullable=False, default="general")
    email_fetch_count = Column(Integer, default=30)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="preferences")
