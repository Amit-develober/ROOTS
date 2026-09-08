"""
AI Email Action Manager — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from backend.database.db import init_db
from backend.api.routes import router as api_router
from backend.config import settings


@asynccontextmanager
async def lifespan(app):
    """Startup and shutdown events."""
    init_db()
    print("[OK] Database initialized")
    print(f"[READY] AI Email Action Manager running at http://{settings.app_host}:{settings.app_port}")
    if not settings.google_oauth_configured:
        print("[INFO] Google OAuth not configured - Demo mode active")
    if not settings.gemini_configured:
        print("[INFO] Gemini API key not configured - Demo mode active")
    yield


# Initialize FastAPI app
app = FastAPI(
    title="AI Email Action Manager",
    description="From Inbox Overload to Clarity & Action",
    version="1.0.0-mvp",
    lifespan=lifespan
)

# CORS middleware (needed for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.is_development else [settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

# Serve frontend static files
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/css", StaticFiles(directory=frontend_path / "css"), name="css")
    app.mount("/js", StaticFiles(directory=frontend_path / "js"), name="js")

    @app.get("/")
    async def serve_index():
        return FileResponse(frontend_path / "index.html")

    # Catch-all for SPA routing — serve index.html for any non-API route
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't catch API routes or static files
        if full_path.startswith("api/") or full_path.startswith("css/") or full_path.startswith("js/"):
            return None
        file_path = frontend_path / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_path / "index.html")

