/**
 * Client-Side Demo Data Fallback for GitHub Pages (Static Hosting)
 * Provides full interactivity even when running without the Python backend.
 */

const ClientDemoData = {
    _days(n) {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return d.toISOString().split('T')[0];
    },

    _dt(daysOffset = 0, hour = 10) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        d.setHours(hour, 0, 0, 0);
        return d.toISOString();
    },

    _greeting() {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    },

    _relativeDate(dateStr) {
        if (!dateStr) return "No deadline";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(dateStr);
        deadline.setHours(0, 0, 0, 0);
        const diff = Math.round((deadline - today) / (1000 * 60 * 60 * 24));

        if (diff < 0) return `Overdue (${Math.abs(diff)} days ago)`;
        if (diff === 0) return "Today";
        if (diff === 1) return "Tomorrow";
        if (diff <= 7) return `This week (${deadline.toLocaleDateString('en-US', { weekday: 'long' })})`;
        return dateStr;
    },

    _deadlineSection(dateStr) {
        if (!dateStr) return "no_deadline";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(dateStr);
        deadline.setHours(0, 0, 0, 0);
        const diff = Math.round((deadline - today) / (1000 * 60 * 60 * 24));

        if (diff < 0) return "overdue";
        if (diff === 0) return "today";
        if (diff === 1) return "tomorrow";
        if (diff <= 7) return "this_week";
        return "no_deadline";
    },

    getEmails() {
        return [
            {
                id: 1,
                gmail_message_id: "demo_001",
                thread_id: "thread_001",
                sender: "Rahul Mehta",
                sender_email: "rahul.mehta@techcorp.in",
                subject: "Urgent: Project Deadline Revised — Need Confirmation",
                body: "Hi,\n\nThe client has requested that we move the project deadline to this Friday. Please confirm if your team can deliver the updated modules by then.\n\nThis is critical — the client is waiting for our response by end of day.\n\nBest,\nRahul Mehta\nProject Manager, TechCorp Solutions",
                received_at: this._dt(0, 9),
                is_read: false,
                analysis: {
                    category: "Action Required",
                    priority: "HIGH",
                    action_required: true,
                    action: "Confirm revised project deadline with Rahul",
                    deadline: this._days(0),
                    summary: "Client has moved the project deadline to this Friday. Rahul needs confirmation that the team can deliver on time.",
                    reason: "Urgent client request requiring immediate response with a same-day deadline."
                }
            },
            {
                id: 2,
                gmail_message_id: "demo_002",
                thread_id: "thread_002",
                sender: "ICICI Bank",
                sender_email: "alerts@icicibank.com",
                subject: "Electricity Bill Payment Due — ₹2,340",
                body: "Dear Customer,\n\nYour electricity bill of ₹2,340 for August 2026 is due on " + this._days(1) + ".\n\nAccount: XXXX-4521\nBiller: Tata Power\nAmount: ₹2,340.00\n\nPay now through ICICI Net Banking or the iMobile app to avoid late charges.\n\nRegards,\nICICI Bank",
                received_at: this._dt(-1, 14),
                is_read: true,
                analysis: {
                    category: "Transaction",
                    priority: "HIGH",
                    action_required: true,
                    action: "Pay electricity bill of ₹2,340",
                    deadline: this._days(1),
                    summary: "Electricity bill of ₹2,340 due tomorrow. Payment through ICICI Bank to avoid late charges.",
                    reason: "Financial deadline tomorrow — failure to pay will result in late charges."
                }
            },
            {
                id: 3,
                gmail_message_id: "demo_003",
                thread_id: "thread_003",
                sender: "Prof. Ananya Sharma",
                sender_email: "ananya.sharma@university.edu",
                subject: "Assignment Submission — Extended Deadline",
                body: "Dear Students,\n\nThe submission deadline for the Data Structures assignment has been extended to " + this._days(3) + ".\n\nPlease ensure your submissions include:\n1. Source code with comments\n2. Analysis report (PDF)\n3. Test cases\n\nSubmit via the university portal.\n\nBest regards,\nProf. Ananya Sharma\nDepartment of Computer Science",
                received_at: this._dt(-1, 16),
                is_read: false,
                analysis: {
                    category: "Action Required",
                    priority: "MEDIUM",
                    action_required: true,
                    action: "Submit Data Structures assignment on university portal",
                    deadline: this._days(3),
                    summary: "Assignment deadline extended. Must submit source code, analysis report, and test cases.",
                    reason: "Academic deadline in 3 days — important for grades but not immediately urgent."
                }
            },
            {
                id: 4,
                gmail_message_id: "demo_004",
                thread_id: "thread_004",
                sender: "Amazon",
                sender_email: "shipment-tracking@amazon.in",
                subject: "Your Order Has Shipped! 📦",
                body: "Hello,\n\nGreat news! Your order #402-1234567-8901234 has shipped.\n\nItem: Sony WH-1000XM5 Wireless Headphones\nEstimated delivery: " + this._days(2) + "\nTracking: AWB12345678\n\nTrack your package on Amazon.in\n\nThank you for shopping with Amazon!",
                received_at: this._dt(0, 7),
                is_read: true,
                analysis: {
                    category: "Transaction",
                    priority: "LOW",
                    action_required: false,
                    action: null,
                    deadline: null,
                    summary: "Sony WH-1000XM5 headphones have shipped. Expected delivery in 2 days.",
                    reason: "Order update — informational only, no action needed."
                }
            },
            {
                id: 5,
                gmail_message_id: "demo_005",
                thread_id: "thread_005",
                sender: "LinkedIn",
                sender_email: "notifications@linkedin.com",
                subject: "5 people viewed your profile this week",
                body: "Hi,\n\nYou're getting noticed! 5 people viewed your profile this week, including recruiters from Google and Microsoft.\n\nSee who viewed your profile:\nhttps://linkedin.com/notifications\n\nKeep your profile updated to attract more views.\n\nLinkedIn Team",
                received_at: this._dt(0, 8),
                is_read: true,
                analysis: {
                    category: "Social",
                    priority: "LOW",
                    action_required: false,
                    action: null,
                    deadline: null,
                    summary: "5 people viewed your LinkedIn profile this week, including recruiters from major tech companies.",
                    reason: "Social notification — interesting but not actionable."
                }
            },
            {
                id: 6,
                gmail_message_id: "demo_006",
                thread_id: "thread_006",
                sender: "The Morning Brew",
                sender_email: "newsletter@morningbrew.com",
                subject: "☕ AI is Changing How We Work — Here's What You Need to Know",
                body: "Good morning!\n\nToday's top stories:\n\n1. OpenAI launches new enterprise tools\n2. India's startup funding rebounds in Q3\n3. The future of remote work: hybrid is winning\n4. Tesla's India entry: what we know so far\n\nRead the full newsletter: https://morningbrew.com/daily\n\nHave a productive day!\n— Morning Brew Team",
                received_at: this._dt(0, 6),
                is_read: false,
                analysis: {
                    category: "Newsletter",
                    priority: "NONE",
                    action_required: false,
                    action: null,
                    deadline: null,
                    summary: "Daily newsletter covering AI enterprise tools, startup funding, remote work trends, and Tesla India news.",
                    reason: "Newsletter — informational content, no action required."
                }
            },
            {
                id: 7,
                gmail_message_id: "demo_007",
                thread_id: "thread_007",
                sender: "HDFC Bank",
                sender_email: "alerts@hdfcbank.net",
                subject: "Transaction Alert: ₹4,999 debited from your account",
                body: "Dear Customer,\n\nINR 4,999.00 has been debited from your account XXXX1234 on " + this._dt(0, 11) + ".\n\nMerchant: Flipkart Internet Pvt Ltd\nRef No: TXN987654321\n\nAvailable Balance: ₹23,456.00\n\nIf this transaction was not done by you, call 1800-XXX-XXXX immediately.\n\nRegards,\nHDFC Bank",
                received_at: this._dt(0, 11),
                is_read: true,
                analysis: {
                    category: "Transaction",
                    priority: "LOW",
                    action_required: false,
                    action: null,
                    deadline: null,
                    summary: "₹4,999 debited from HDFC account for a Flipkart purchase. Available balance ₹23,456.",
                    reason: "Transaction notification — no action unless unauthorized."
                }
            },
            {
                id: 8,
                gmail_message_id: "demo_008",
                thread_id: "thread_008",
                sender: "Priya Kapoor",
                sender_email: "priya.kapoor@designstudio.co",
                subject: "Meeting Tomorrow at 3 PM — Design Review",
                body: "Hey,\n\nJust a reminder that we have the design review meeting scheduled for tomorrow at 3:00 PM.\n\nAgenda:\n- Review landing page mockups\n- Discuss color palette changes\n- Finalize mobile responsive design\n\nPlease come prepared with your latest updates.\n\nMeeting link: https://meet.google.com/abc-defg-hij\n\nSee you there!\nPriya",
                received_at: this._dt(0, 15),
                is_read: false,
                analysis: {
                    category: "Work",
                    priority: "MEDIUM",
                    action_required: true,
                    action: "Prepare updates for design review meeting at 3 PM tomorrow",
                    deadline: this._days(1),
                    summary: "Design review meeting tomorrow at 3 PM. Need to prepare landing page mockups and responsive design updates.",
                    reason: "Scheduled meeting requiring preparation — important work commitment."
                }
            },
            {
                id: 9,
                gmail_message_id: "demo_009",
                thread_id: "thread_009",
                sender: "Flipkart",
                sender_email: "offers@flipkart.com",
                subject: "🎉 Big Billion Days Start Tomorrow! Up to 80% Off",
                body: "Dear Shopper,\n\nThe wait is over! Big Billion Days start tomorrow.\n\n🔥 Up to 80% off on Electronics\n👕 Up to 70% off on Fashion\n🏠 Up to 60% off on Home & Kitchen\n\nPlus, extra 10% off with HDFC Bank cards!\n\nShop now: https://flipkart.com/bigbilliondays\n\nHappy Shopping!\nTeam Flipkart",
                received_at: this._dt(0, 10),
                is_read: true,
                analysis: {
                    category: "Promotion",
                    priority: "NONE",
                    action_required: false,
                    action: null,
                    deadline: null,
                    summary: "Flipkart Big Billion Days sale starting tomorrow with discounts up to 80% off on electronics and fashion.",
                    reason: "Promotional email — no action required unless interested in the sale."
                }
            },
            {
                id: 10,
                gmail_message_id: "demo_010",
                thread_id: "thread_010",
                sender: "Zomato",
                sender_email: "no-reply@zomato.com",
                subject: "Your food is on the way! 🍕",
                body: "Hi there!\n\nYour order from Pizza Hut is on the way.\n\nOrder: 1x Margherita Pizza, 1x Garlic Bread, 1x Pepsi\nTotal: ₹549\nETA: 25 minutes\n\nTrack your order in the Zomato app.\n\nEnjoy your meal!\nTeam Zomato",
                received_at: this._dt(0, 13),
                is_read: true,
                analysis: {
                    category: "Notification",
                    priority: "NONE",
                    action_required: false,
                    action: null,
                    deadline: null,
                    summary: "Food delivery from Pizza Hut is on the way. ETA 25 minutes.",
                    reason: "Real-time delivery notification — no action needed."
                }
            },
            {
                id: 11,
                gmail_message_id: "demo_011",
                thread_id: "thread_011",
                sender: "Google Workspace",
                sender_email: "workspace-noreply@google.com",
                subject: "Your Google Workspace storage is 85% full",
                body: "Hello,\n\nYour Google Workspace storage is 85% full (12.75 GB of 15 GB used).\n\nLarge files consuming storage:\n- Google Drive: 8.2 GB\n- Gmail: 3.1 GB\n- Google Photos: 1.45 GB\n\nManage your storage: https://one.google.com/storage\n\nConsider upgrading to Google One for more space.\n\nGoogle Workspace Team",
                received_at: this._dt(-2, 9),
                is_read: false,
                analysis: {
                    category: "Notification",
                    priority: "MEDIUM",
                    action_required: true,
                    action: "Clean up Google storage or consider upgrading plan",
                    deadline: null,
                    summary: "Google Workspace storage is 85% full. Need to free up space or upgrade to avoid running out.",
                    reason: "Storage warning — not urgent but needs attention soon to avoid disruption."
                }
            },
            {
                id: 12,
                gmail_message_id: "demo_012",
                thread_id: "thread_012",
                sender: "Arjun Patel",
                sender_email: "arjun.patel@freelance.io",
                subject: "Invoice #1247 — Payment Reminder",
                body: "Hi,\n\nThis is a gentle reminder that Invoice #1247 for ₹15,000 is due on " + this._days(2) + ".\n\nProject: Website Redesign — Phase 2\nAmount: ₹15,000\nDue Date: " + this._days(2) + "\n\nBank Details:\nAccount: XXXX-5678\nIFSC: HDFC0001234\n\nPlease process at your earliest convenience.\n\nThanks,\nArjun Patel",
                received_at: this._dt(-1, 11),
                is_read: false,
                analysis: {
                    category: "Action Required",
                    priority: "HIGH",
                    action_required: true,
                    action: "Process payment of ₹15,000 for Invoice #1247",
                    deadline: this._days(2),
                    summary: "Payment reminder for ₹15,000 invoice for website redesign project, due in 2 days.",
                    reason: "Financial obligation with upcoming deadline — impacts business relationship."
                }
            },
            {
                id: 13,
                gmail_message_id: "demo_013",
                thread_id: "thread_013",
                sender: "Swiggy",
                sender_email: "offers@swiggy.in",
                subject: "🥳 Flat 60% OFF on your next 3 orders!",
                body: "Hey foodie!\n\nWe miss you! Here's a special offer just for you:\n\n🎉 Flat 60% OFF (up to ₹120) on your next 3 orders\n📅 Valid till " + this._days(5) + "\n🏷️ Use code: COMEBACK60\n\nOrder now on Swiggy!\n\nTerms & conditions apply.\n\n— Team Swiggy",
                received_at: this._dt(0, 12),
                is_read: true,
                analysis: {
                    category: "Promotion",
                    priority: "NONE",
                    action_required: false,
                    action: null,
                    deadline: null,
                    summary: "Swiggy offering 60% off on next 3 orders with code COMEBACK60.",
                    reason: "Promotional offer — no action required."
                }
            },
            {
                id: 14,
                gmail_message_id: "demo_014",
                thread_id: "thread_014",
                sender: "GitHub",
                sender_email: "notifications@github.com",
                subject: "[project-alpha] Pull request #42 needs your review",
                body: "Hey,\n\n@teammate requested your review on pull request #42:\n\n\"Add user authentication middleware\"\n\n+234 -12 across 5 files\n\nReview: https://github.com/org/project-alpha/pull/42\n\nThe PR has been open for 2 days and is blocking the release.\n\n— GitHub",
                received_at: this._dt(0, 14),
                is_read: false,
                analysis: {
                    category: "Work",
                    priority: "MEDIUM",
                    action_required: true,
                    action: "Review pull request #42 on GitHub",
                    deadline: null,
                    summary: "A pull request for user authentication middleware needs code review. It's blocking the release.",
                    reason: "Code review requested — blocking release pipeline, moderately urgent."
                }
            },
            {
                id: 15,
                gmail_message_id: "demo_015",
                thread_id: "thread_015",
                sender: "Spotify",
                sender_email: "no-reply@spotify.com",
                subject: "Your Discover Weekly is ready 🎵",
                body: "Hey!\n\nYour personalized Discover Weekly playlist is ready with 30 fresh tracks picked just for you.\n\nThis week's highlights:\n- Arijit Singh — new release\n- The Weeknd — trending\n- Prateek Kuhad — based on your listening\n\nListen now on Spotify!\n\n— Spotify Team",
                received_at: this._dt(0, 5),
                is_read: true,
                analysis: {
                    category: "Social",
                    priority: "NONE",
                    action_required: false,
                    action: null,
                    deadline: null,
                    summary: "Weekly Spotify playlist is ready with 30 new tracks based on listening history.",
                    reason: "Entertainment notification — purely optional."
                }
            }
        ];
    },

    getStats() {
        const emails = this.getEmails();
        const analyses = emails.map(e => e.analysis);
        return {
            total_emails: emails.length,
            important_emails: analyses.filter(a => a.priority === "HIGH" || a.priority === "MEDIUM").length,
            action_required: analyses.filter(a => a.action_required).length,
            promotional: analyses.filter(a => a.category === "Promotion").length,
            newsletters: analyses.filter(a => a.category === "Newsletter").length,
            high_priority: analyses.filter(a => a.priority === "HIGH").length,
            medium_priority: analyses.filter(a => a.priority === "MEDIUM").length,
            low_priority: analyses.filter(a => a.priority === "LOW").length,
            completed_actions: 0,
            pending_actions: analyses.filter(a => a.action_required).length
        };
    },

    getDashboard() {
        const emails = this.getEmails();
        const actions_by_priority = { HIGH: [], MEDIUM: [], LOW: [] };

        emails.forEach(email => {
            const a = email.analysis;
            if (a.action_required) {
                const item = {
                    id: email.id,
                    email_id: email.id,
                    sender: email.sender,
                    subject: email.subject,
                    action_text: a.action,
                    priority: a.priority,
                    deadline: a.deadline,
                    deadline_relative: this._relativeDate(a.deadline),
                    summary: a.summary,
                    status: "pending"
                };
                if (actions_by_priority[a.priority]) {
                    actions_by_priority[a.priority].push(item);
                }
            }
        });

        return {
            greeting: this._greeting(),
            message: "Here's what needs your attention.",
            actions_by_priority,
            stats: this.getStats(),
            is_demo: true
        };
    },

    getActions() {
        const emails = this.getEmails();
        const sections = {
            overdue: [],
            today: [],
            tomorrow: [],
            this_week: [],
            no_deadline: []
        };

        emails.forEach(email => {
            const a = email.analysis;
            if (a.action_required) {
                const section = this._deadlineSection(a.deadline);
                const item = {
                    id: email.id,
                    email_id: email.id,
                    sender: email.sender,
                    subject: email.subject,
                    action_text: a.action,
                    priority: a.priority,
                    deadline: a.deadline,
                    summary: a.summary,
                    category: a.category,
                    status: "pending"
                };
                if (sections[section]) {
                    sections[section].push(item);
                } else {
                    sections.no_deadline.push(item);
                }
            }
        });

        return { sections, is_demo: true };
    }
};
