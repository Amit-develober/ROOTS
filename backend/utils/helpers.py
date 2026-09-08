"""
Utility helpers for the AI Email Action Manager.
"""

from datetime import datetime, timezone, timedelta


def get_greeting() -> str:
    """Return a time-appropriate greeting."""
    hour = datetime.now().hour
    if hour < 12:
        return "Good morning"
    elif hour < 17:
        return "Good afternoon"
    else:
        return "Good evening"


def format_relative_date(date_str: str) -> str:
    """Convert a date string to a relative label like 'Today', 'Tomorrow', etc."""
    if not date_str:
        return "No deadline"

    try:
        deadline = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return date_str

    today = datetime.now().date()
    diff = (deadline - today).days

    if diff < 0:
        return f"Overdue ({abs(diff)} days ago)"
    elif diff == 0:
        return "Today"
    elif diff == 1:
        return "Tomorrow"
    elif diff <= 7:
        return f"This week ({deadline.strftime('%A')})"
    else:
        return deadline.strftime("%b %d, %Y")


def get_deadline_section(date_str: str) -> str:
    """Categorize a deadline into sections: overdue, today, tomorrow, this_week, no_deadline."""
    if not date_str:
        return "no_deadline"

    try:
        deadline = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return "no_deadline"

    today = datetime.now().date()
    diff = (deadline - today).days

    if diff < 0:
        return "overdue"
    elif diff == 0:
        return "today"
    elif diff == 1:
        return "tomorrow"
    elif diff <= 7:
        return "this_week"
    else:
        return "later"


def truncate_text(text: str, max_length: int = 200) -> str:
    """Truncate text to max_length, adding ellipsis if truncated."""
    if not text:
        return ""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def sanitize_html_to_text(html_content: str) -> str:
    """Strip HTML tags and return plain text. Lightweight approach."""
    if not html_content:
        return ""
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html_content, "html.parser")
        # Remove script and style elements
        for element in soup(["script", "style"]):
            element.decompose()
        text = soup.get_text(separator="\n")
        # Clean up whitespace
        lines = [line.strip() for line in text.splitlines()]
        return "\n".join(line for line in lines if line)
    except Exception:
        # Fallback: simple tag stripping
        import re
        clean = re.sub(r'<[^>]+>', '', html_content)
        return clean.strip()
