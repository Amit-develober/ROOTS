"""
Tests for API endpoints, database initialization, and demo data integrity.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.db import init_db

client = TestClient(app)

def test_startup_db_init():
    """Verify database initialization without errors."""
    init_db()

def test_health_check():
    """Verify health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_demo_dashboard():
    """Verify demo dashboard returns actions grouped by priority and statistics."""
    response = client.get("/api/demo/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "actions_by_priority" in data
    assert "HIGH" in data["actions_by_priority"]
    assert "MEDIUM" in data["actions_by_priority"]
    assert "LOW" in data["actions_by_priority"]
    assert "stats" in data
    assert data["stats"]["total_emails"] == 15
    assert data["stats"]["action_required"] > 0

def test_demo_emails_list():
    """Verify demo emails listing."""
    response = client.get("/api/demo/emails")
    assert response.status_code == 200
    data = response.json()
    assert "emails" in data
    assert len(data["emails"]) == 15
    first = data["emails"][0]
    assert "sender" in first
    assert "subject" in first
    assert "analysis" in first
    assert "category" in first["analysis"]

def test_demo_email_detail():
    """Verify demo email detail view."""
    response = client.get("/api/demo/emails/1")
    assert response.status_code == 200
    email = response.json()
    assert email["id"] == 1
    assert "Rahul Mehta" in email["sender"]
    assert email["analysis"]["priority"] == "HIGH"

def test_demo_actions_sections():
    """Verify demo actions grouped by deadline."""
    response = client.get("/api/demo/actions")
    assert response.status_code == 200
    data = response.json()
    assert "sections" in data
    sections = data["sections"]
    assert "today" in sections
    assert "tomorrow" in sections
    assert "this_week" in sections

def test_static_index_serving():
    """Verify that root URL serves the frontend index.html."""
    response = client.get("/")
    assert response.status_code == 200
    assert "AI Email Action Manager" in response.text

def test_firebase_login_and_user_flow():
    """Verify Firebase Google sign-in endpoint creates user and returns info."""
    login_payload = {
        "google_id": "test_google_12345",
        "email": "testuser@gmail.com",
        "name": "Test User",
        "picture": "https://example.com/photo.jpg",
        "access_token": "ya29.fake_token_for_testing"
    }
    resp = client.post("/api/auth/firebase-login", json=login_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["user"]["email"] == "testuser@gmail.com"
    assert data["user"]["gmail_connected"] is True

    # Test /api/me with google_id
    me_resp = client.get("/api/me?google_id=test_google_12345")
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["is_demo"] is False
    assert me_data["user"]["name"] == "Test User"

    # Test disconnect
    dc_resp = client.post("/api/auth/disconnect", json={"google_id": "test_google_12345"})
    assert dc_resp.status_code == 200
    assert dc_resp.json()["status"] == "ok"

