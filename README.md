# AI Email Action Manager

> *"From Inbox Overload to Clarity & Action"*

An AI-powered productivity web application that connects to your email, identifies messages requiring attention, extracts actionable tasks with deadlines, and transforms inbox clutter into a prioritized daily action list.

---

## 🌟 Key Features

- **Automated AI Analysis**: Categorizes emails into 10 distinct classifications (Work, Personal, Transactions, Promotions, Newsletters, etc.).
- **Smart Prioritization**: Dynamically categorizes items into **HIGH**, **MEDIUM**, and **LOW** priority.
- **Action & Deadline Extraction**: Identifies explicit deliverables, meetings, and dates directly from email bodies.
- **Interactive Daily Action Dashboard**: Clear visual layout of today's urgent actions with one-click completion.
- **Simplified Inbox Filtering**: Filter by *Action Required*, *Important*, *Transactions*, or *Promotions*.
- **Personalization Engine**: Customize prioritization based on profile type (*Student*, *Freelancer*, *Professional*, *Business Owner*).
- **Zero-Setup Demo Mode**: Realistic test dataset with 15 scenarios and live scanning animation—no API keys required for presentation!

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn
- **Database**: SQLite with SQLAlchemy 2.0 ORM (5 tables, scoped by `user_id` for multi-tenant isolation)
- **Validation**: Pydantic v2 schemas
- **Frontend**: HTML5, Vanilla CSS (Modern Design System with Inter typography), Client-side SPA Router (Vanilla JS)
- **Email & Auth (Production)**: Google OAuth 2.0 & Gmail API (configured for low-cost deployment)
- **AI Integration**: Gemini API / extensible service layer

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Amit-develober/ReminderAi.git
cd ReminderAi
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables (Optional for Demo Mode)
```bash
cp .env.example .env
```
Fill in your credentials if using live Google OAuth or Gemini API:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`

### 4. Run the application
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open your browser at **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

---

## 🧪 Running Tests

Run the comprehensive test suite with `pytest`:
```bash
python -m pytest tests/ -v
```

---

## 🔒 Privacy & Security

- Minimal permissions requested via Google OAuth.
- Passwords are never stored or handled.
- Users can disconnect Gmail and permanently delete stored analyzed email data anytime from Settings.
- Full multi-tenant isolation by `user_id`.

---

## 📄 License
MIT License
