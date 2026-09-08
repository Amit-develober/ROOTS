"""
Demo mode data — realistic sample emails with pre-generated AI analysis.
Used for presentations and testing without a real Gmail connection.
"""

from datetime import datetime, timedelta

# Helper to generate dates relative to "today"
def _today():
    return datetime.now()

def _days(n):
    return (_today() + timedelta(days=n)).strftime("%Y-%m-%d")

def _dt(days_offset=0, hour=10):
    return (_today() + timedelta(days=days_offset)).replace(
        hour=hour, minute=0, second=0, microsecond=0
    ).isoformat()


DEMO_EMAILS = [
    {
        "gmail_message_id": "demo_001",
        "thread_id": "thread_001",
        "sender": "Rahul Mehta",
        "sender_email": "rahul.mehta@techcorp.in",
        "subject": "Urgent: Project Deadline Revised — Need Confirmation",
        "body": "Hi,\n\nThe client has requested that we move the project deadline to this Friday. Please confirm if your team can deliver the updated modules by then.\n\nThis is critical — the client is waiting for our response by end of day.\n\nBest,\nRahul Mehta\nProject Manager, TechCorp Solutions",
        "received_at": _dt(0, 9),
        "is_read": False,
        "analysis": {
            "category": "Action Required",
            "priority": "HIGH",
            "action_required": True,
            "action": "Confirm revised project deadline with Rahul",
            "deadline": _days(0),
            "summary": "Client has moved the project deadline to this Friday. Rahul needs confirmation that the team can deliver on time.",
            "reason": "Urgent client request requiring immediate response with a same-day deadline."
        }
    },
    {
        "gmail_message_id": "demo_002",
        "thread_id": "thread_002",
        "sender": "ICICI Bank",
        "sender_email": "alerts@icicibank.com",
        "subject": "Electricity Bill Payment Due — ₹2,340",
        "body": "Dear Customer,\n\nYour electricity bill of ₹2,340 for August 2026 is due on " + _days(1) + ".\n\nAccount: XXXX-4521\nBiller: Tata Power\nAmount: ₹2,340.00\n\nPay now through ICICI Net Banking or the iMobile app to avoid late charges.\n\nRegards,\nICICI Bank",
        "received_at": _dt(-1, 14),
        "is_read": True,
        "analysis": {
            "category": "Transaction",
            "priority": "HIGH",
            "action_required": True,
            "action": "Pay electricity bill of ₹2,340",
            "deadline": _days(1),
            "summary": "Electricity bill of ₹2,340 due tomorrow. Payment through ICICI Bank to avoid late charges.",
            "reason": "Financial deadline tomorrow — failure to pay will result in late charges."
        }
    },
    {
        "gmail_message_id": "demo_003",
        "thread_id": "thread_003",
        "sender": "Prof. Ananya Sharma",
        "sender_email": "ananya.sharma@university.edu",
        "subject": "Assignment Submission — Extended Deadline",
        "body": "Dear Students,\n\nThe submission deadline for the Data Structures assignment has been extended to " + _days(3) + ".\n\nPlease ensure your submissions include:\n1. Source code with comments\n2. Analysis report (PDF)\n3. Test cases\n\nSubmit via the university portal.\n\nBest regards,\nProf. Ananya Sharma\nDepartment of Computer Science",
        "received_at": _dt(-1, 16),
        "is_read": False,
        "analysis": {
            "category": "Action Required",
            "priority": "MEDIUM",
            "action_required": True,
            "action": "Submit Data Structures assignment on university portal",
            "deadline": _days(3),
            "summary": "Assignment deadline extended. Must submit source code, analysis report, and test cases.",
            "reason": "Academic deadline in 3 days — important for grades but not immediately urgent."
        }
    },
    {
        "gmail_message_id": "demo_004",
        "thread_id": "thread_004",
        "sender": "Amazon",
        "sender_email": "shipment-tracking@amazon.in",
        "subject": "Your Order Has Shipped! 📦",
        "body": "Hello,\n\nGreat news! Your order #402-1234567-8901234 has shipped.\n\nItem: Sony WH-1000XM5 Wireless Headphones\nEstimated delivery: " + _days(2) + "\nTracking: AWB12345678\n\nTrack your package on Amazon.in\n\nThank you for shopping with Amazon!",
        "received_at": _dt(0, 7),
        "is_read": True,
        "analysis": {
            "category": "Transaction",
            "priority": "LOW",
            "action_required": False,
            "action": None,
            "deadline": None,
            "summary": "Sony WH-1000XM5 headphones have shipped. Expected delivery in 2 days.",
            "reason": "Order update — informational only, no action needed."
        }
    },
    {
        "gmail_message_id": "demo_005",
        "thread_id": "thread_005",
        "sender": "LinkedIn",
        "sender_email": "notifications@linkedin.com",
        "subject": "5 people viewed your profile this week",
        "body": "Hi,\n\nYou're getting noticed! 5 people viewed your profile this week, including recruiters from Google and Microsoft.\n\nSee who viewed your profile:\nhttps://linkedin.com/notifications\n\nKeep your profile updated to attract more views.\n\nLinkedIn Team",
        "received_at": _dt(0, 8),
        "is_read": True,
        "analysis": {
            "category": "Social",
            "priority": "LOW",
            "action_required": False,
            "action": None,
            "deadline": None,
            "summary": "5 people viewed your LinkedIn profile this week, including recruiters from major tech companies.",
            "reason": "Social notification — interesting but not actionable."
        }
    },
    {
        "gmail_message_id": "demo_006",
        "thread_id": "thread_006",
        "sender": "The Morning Brew",
        "sender_email": "newsletter@morningbrew.com",
        "subject": "☕ AI is Changing How We Work — Here's What You Need to Know",
        "body": "Good morning!\n\nToday's top stories:\n\n1. OpenAI launches new enterprise tools\n2. India's startup funding rebounds in Q3\n3. The future of remote work: hybrid is winning\n4. Tesla's India entry: what we know so far\n\nRead the full newsletter: https://morningbrew.com/daily\n\nHave a productive day!\n— Morning Brew Team",
        "received_at": _dt(0, 6),
        "is_read": False,
        "analysis": {
            "category": "Newsletter",
            "priority": "NONE",
            "action_required": False,
            "action": None,
            "deadline": None,
            "summary": "Daily newsletter covering AI enterprise tools, startup funding, remote work trends, and Tesla India news.",
            "reason": "Newsletter — informational content, no action required."
        }
    },
    {
        "gmail_message_id": "demo_007",
        "thread_id": "thread_007",
        "sender": "HDFC Bank",
        "sender_email": "alerts@hdfcbank.net",
        "subject": "Transaction Alert: ₹4,999 debited from your account",
        "body": "Dear Customer,\n\nINR 4,999.00 has been debited from your account XXXX1234 on " + _dt(0, 11) + ".\n\nMerchant: Flipkart Internet Pvt Ltd\nRef No: TXN987654321\n\nAvailable Balance: ₹23,456.00\n\nIf this transaction was not done by you, call 1800-XXX-XXXX immediately.\n\nRegards,\nHDFC Bank",
        "received_at": _dt(0, 11),
        "is_read": True,
        "analysis": {
            "category": "Transaction",
            "priority": "LOW",
            "action_required": False,
            "action": None,
            "deadline": None,
            "summary": "₹4,999 debited from HDFC account for a Flipkart purchase. Available balance ₹23,456.",
            "reason": "Transaction notification — no action unless unauthorized."
        }
    },
    {
        "gmail_message_id": "demo_008",
        "thread_id": "thread_008",
        "sender": "Priya Kapoor",
        "sender_email": "priya.kapoor@designstudio.co",
        "subject": "Meeting Tomorrow at 3 PM — Design Review",
        "body": "Hey,\n\nJust a reminder that we have the design review meeting scheduled for tomorrow at 3:00 PM.\n\nAgenda:\n- Review landing page mockups\n- Discuss color palette changes\n- Finalize mobile responsive design\n\nPlease come prepared with your latest updates.\n\nMeeting link: https://meet.google.com/abc-defg-hij\n\nSee you there!\nPriya",
        "received_at": _dt(0, 15),
        "is_read": False,
        "analysis": {
            "category": "Work",
            "priority": "MEDIUM",
            "action_required": True,
            "action": "Prepare updates for design review meeting at 3 PM tomorrow",
            "deadline": _days(1),
            "summary": "Design review meeting tomorrow at 3 PM. Need to prepare landing page mockups and responsive design updates.",
            "reason": "Scheduled meeting requiring preparation — important work commitment."
        }
    },
    {
        "gmail_message_id": "demo_009",
        "thread_id": "thread_009",
        "sender": "Flipkart",
        "sender_email": "offers@flipkart.com",
        "subject": "🎉 Big Billion Days Start Tomorrow! Up to 80% Off",
        "body": "Dear Shopper,\n\nThe wait is over! Big Billion Days start tomorrow.\n\n🔥 Up to 80% off on Electronics\n👕 Up to 70% off on Fashion\n🏠 Up to 60% off on Home & Kitchen\n\nPlus, extra 10% off with HDFC Bank cards!\n\nShop now: https://flipkart.com/bigbilliondays\n\nHappy Shopping!\nTeam Flipkart",
        "received_at": _dt(0, 10),
        "is_read": True,
        "analysis": {
            "category": "Promotion",
            "priority": "NONE",
            "action_required": False,
            "action": None,
            "deadline": None,
            "summary": "Flipkart Big Billion Days sale starting tomorrow with discounts up to 80% off on electronics and fashion.",
            "reason": "Promotional email — no action required unless interested in the sale."
        }
    },
    {
        "gmail_message_id": "demo_010",
        "thread_id": "thread_010",
        "sender": "Zomato",
        "sender_email": "no-reply@zomato.com",
        "subject": "Your food is on the way! 🍕",
        "body": "Hi there!\n\nYour order from Pizza Hut is on the way.\n\nOrder: 1x Margherita Pizza, 1x Garlic Bread, 1x Pepsi\nTotal: ₹549\nETA: 25 minutes\n\nTrack your order in the Zomato app.\n\nEnjoy your meal!\nTeam Zomato",
        "received_at": _dt(0, 13),
        "is_read": True,
        "analysis": {
            "category": "Notification",
            "priority": "NONE",
            "action_required": False,
            "action": None,
            "deadline": None,
            "summary": "Food delivery from Pizza Hut is on the way. ETA 25 minutes.",
            "reason": "Real-time delivery notification — no action needed."
        }
    },
    {
        "gmail_message_id": "demo_011",
        "thread_id": "thread_011",
        "sender": "Google Workspace",
        "sender_email": "workspace-noreply@google.com",
        "subject": "Your Google Workspace storage is 85% full",
        "body": "Hello,\n\nYour Google Workspace storage is 85% full (12.75 GB of 15 GB used).\n\nLarge files consuming storage:\n- Google Drive: 8.2 GB\n- Gmail: 3.1 GB\n- Google Photos: 1.45 GB\n\nManage your storage: https://one.google.com/storage\n\nConsider upgrading to Google One for more space.\n\nGoogle Workspace Team",
        "received_at": _dt(-2, 9),
        "is_read": False,
        "analysis": {
            "category": "Notification",
            "priority": "MEDIUM",
            "action_required": True,
            "action": "Clean up Google storage or consider upgrading plan",
            "deadline": None,
            "summary": "Google Workspace storage is 85% full. Need to free up space or upgrade to avoid running out.",
            "reason": "Storage warning — not urgent but needs attention soon to avoid disruption."
        }
    },
    {
        "gmail_message_id": "demo_012",
        "thread_id": "thread_012",
        "sender": "Arjun Patel",
        "sender_email": "arjun.patel@freelance.io",
        "subject": "Invoice #1247 — Payment Reminder",
        "body": "Hi,\n\nThis is a gentle reminder that Invoice #1247 for ₹15,000 is due on " + _days(2) + ".\n\nProject: Website Redesign — Phase 2\nAmount: ₹15,000\nDue Date: " + _days(2) + "\n\nBank Details:\nAccount: XXXX-5678\nIFSC: HDFC0001234\n\nPlease process at your earliest convenience.\n\nThanks,\nArjun Patel",
        "received_at": _dt(-1, 11),
        "is_read": False,
        "analysis": {
            "category": "Action Required",
            "priority": "HIGH",
            "action_required": True,
            "action": "Process payment of ₹15,000 for Invoice #1247",
            "deadline": _days(2),
            "summary": "Payment reminder for ₹15,000 invoice for website redesign project, due in 2 days.",
            "reason": "Financial obligation with upcoming deadline — impacts business relationship."
        }
    },
    {
        "gmail_message_id": "demo_013",
        "thread_id": "thread_013",
        "sender": "Swiggy",
        "sender_email": "offers@swiggy.in",
        "subject": "🥳 Flat 60% OFF on your next 3 orders!",
        "body": "Hey foodie!\n\nWe miss you! Here's a special offer just for you:\n\n🎉 Flat 60% OFF (up to ₹120) on your next 3 orders\n📅 Valid till " + _days(5) + "\n🏷️ Use code: COMEBACK60\n\nOrder now on Swiggy!\n\nTerms & conditions apply.\n\n— Team Swiggy",
        "received_at": _dt(0, 12),
        "is_read": True,
        "analysis": {
            "category": "Promotion",
            "priority": "NONE",
            "action_required": False,
            "action": None,
            "deadline": None,
            "summary": "Swiggy offering 60% off on next 3 orders with code COMEBACK60.",
            "reason": "Promotional offer — no action required."
        }
    },
    {
        "gmail_message_id": "demo_014",
        "thread_id": "thread_014",
        "sender": "GitHub",
        "sender_email": "notifications@github.com",
        "subject": "[project-alpha] Pull request #42 needs your review",
        "body": "Hey,\n\n@teammate requested your review on pull request #42:\n\n\"Add user authentication middleware\"\n\n+234 -12 across 5 files\n\nReview: https://github.com/org/project-alpha/pull/42\n\nThe PR has been open for 2 days and is blocking the release.\n\n— GitHub",
        "received_at": _dt(0, 14),
        "is_read": False,
        "analysis": {
            "category": "Work",
            "priority": "MEDIUM",
            "action_required": True,
            "action": "Review pull request #42 on GitHub",
            "deadline": None,
            "summary": "A pull request for user authentication middleware needs code review. It's blocking the release.",
            "reason": "Code review requested — blocking release pipeline, moderately urgent."
        }
    },
    {
        "gmail_message_id": "demo_015",
        "thread_id": "thread_015",
        "sender": "Spotify",
        "sender_email": "no-reply@spotify.com",
        "subject": "Your Discover Weekly is ready 🎵",
        "body": "Hey!\n\nYour personalized Discover Weekly playlist is ready with 30 fresh tracks picked just for you.\n\nThis week's highlights:\n- Arijit Singh — new release\n- The Weeknd — trending\n- Prateek Kuhad — based on your listening\n\nListen now on Spotify!\n\n— Spotify Team",
        "received_at": _dt(0, 5),
        "is_read": True,
        "analysis": {
            "category": "Social",
            "priority": "NONE",
            "action_required": False,
            "action": None,
            "deadline": None,
            "summary": "Weekly Spotify playlist is ready with 30 new tracks based on listening history.",
            "reason": "Entertainment notification — purely optional."
        }
    }
]


def get_demo_emails():
    """Return the demo email dataset."""
    return DEMO_EMAILS


def get_demo_stats():
    """Calculate stats from demo data."""
    emails = DEMO_EMAILS
    analyses = [e["analysis"] for e in emails]

    return {
        "total_emails": len(emails),
        "important_emails": sum(1 for a in analyses if a["priority"] in ("HIGH", "MEDIUM")),
        "action_required": sum(1 for a in analyses if a["action_required"]),
        "promotional": sum(1 for a in analyses if a["category"] == "Promotion"),
        "newsletters": sum(1 for a in analyses if a["category"] == "Newsletter"),
        "high_priority": sum(1 for a in analyses if a["priority"] == "HIGH"),
        "medium_priority": sum(1 for a in analyses if a["priority"] == "MEDIUM"),
        "low_priority": sum(1 for a in analyses if a["priority"] == "LOW"),
        "completed_actions": 0,
        "pending_actions": sum(1 for a in analyses if a["action_required"])
    }
