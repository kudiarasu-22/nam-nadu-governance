"""
Nam Nadu — Application Configuration
Centralized settings from environment variables with .env support.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    # ── Application ──────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    API_TITLE: str = "Nam Nadu API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Citizens-Government Governance Platform for Tamil Nadu"
    DEBUG: bool = True

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./nam_nadu.db"

    # ── JWT Authentication ───────────────────────────────────────
    SECRET_KEY: str = "nam-nadu-dev-secret-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ─────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # ── Security ─────────────────────────────────────────────────
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Singleton — import this everywhere
settings = Settings()
