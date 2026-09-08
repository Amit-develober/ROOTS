"""
Configuration module for AI Email Action Manager.
Loads environment variables and provides app-wide settings.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/callback"

    # Gemini AI
    gemini_api_key: str = ""

    # Application
    app_secret_key: str = "dev-secret-key-change-in-production"
    app_env: str = "development"
    app_host: str = "localhost"
    app_port: int = 8000
    frontend_url: str = "http://localhost:8000"

    # Database
    database_url: str = "sqlite:///./data/email_manager.db"

    # Email settings
    max_emails_to_fetch: int = 30
    max_emails_to_analyze: int = 30

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def google_oauth_configured(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret)

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key)




# Singleton settings instance
settings = Settings()

# Ensure data directory exists
data_dir = Path("./data")
data_dir.mkdir(exist_ok=True)
