"""
AI prompt templates for email analysis.
Kept in a separate file for easy modification.
"""

SYSTEM_PROMPT = """You are an intelligent email assistant. Your job is to analyze emails and extract actionable information.

You must respond ONLY with valid JSON. No explanations, no markdown, just JSON.

For the user's profile type: {profile_type}

Prioritization hints based on profile:
- professional: Prioritize client emails, meetings, and work deadlines
- student: Prioritize assignment deadlines, school/college notices, and academic emails
- freelancer: Prioritize client communications, invoices, and project deadlines
- business_owner: Prioritize customer emails, financial transactions, and business operations
- general: Use balanced prioritization across all categories
"""

ANALYSIS_PROMPT = """Analyze the following email and return a JSON object with these exact fields:

{{
  "category": "<one of: Action Required, Work, Personal, Transaction, Promotion, Newsletter, Social, Notification, Spam, Other>",
  "priority": "<one of: HIGH, MEDIUM, LOW, NONE>",
  "action_required": <true or false>,
  "action": "<specific action needed, or null if none>",
  "deadline": "<YYYY-MM-DD format if a deadline exists, or null>",
  "summary": "<1-2 sentence summary of the email>",
  "reason": "<short explanation of why this priority was assigned>"
}}

EMAIL:
From: {sender} <{sender_email}>
Subject: {subject}
Date: {received_at}

{body}

Respond ONLY with the JSON object. No other text."""

BATCH_ANALYSIS_PROMPT = """Analyze the following {count} emails and return a JSON array. 
Each element must have these exact fields:

{{
  "email_index": <0-based index matching the email order below>,
  "category": "<one of: Action Required, Work, Personal, Transaction, Promotion, Newsletter, Social, Notification, Spam, Other>",
  "priority": "<one of: HIGH, MEDIUM, LOW, NONE>",
  "action_required": <true or false>,
  "action": "<specific action needed, or null if none>",
  "deadline": "<YYYY-MM-DD format if a deadline exists, or null>",
  "summary": "<1-2 sentence summary>",
  "reason": "<short explanation>"
}}

EMAILS:
{emails_text}

Respond ONLY with the JSON array. No other text."""
