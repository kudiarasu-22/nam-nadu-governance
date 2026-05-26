"""
Nam Nadu Backend — FastAPI Application
Entry point: uvicorn app.main:app --reload
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.logging import logger
from app.database import init_db
from app.routers import health, auth, officer, master, complaints, notifications, analytics, projects, leadership, volunteer
from app.middleware.error_handler import (
    global_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
)
from app.middleware.request_logger import RequestLoggerMiddleware


# ── Static Uploads ───────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)


# ── Lifespan ─────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    logger.info("[STARTUP] Starting Nam Nadu API [%s]", settings.ENVIRONMENT)
    init_db()
    logger.info("[STARTUP] Database tables created / verified")
    yield
    logger.info("[SHUTDOWN] Shutting down Nam Nadu API")


# ── App Factory ──────────────────────────────────────────────────
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── CORS ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Logger ───────────────────────────────────────────────
app.add_middleware(RequestLoggerMiddleware)

# ── Exception Handlers ───────────────────────────────────────────
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)


# ── Routers ──────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(officer.router)
app.include_router(master.router)
app.include_router(complaints.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(projects.router)
app.include_router(leadership.router)
app.include_router(volunteer.router)


# ── Root ─────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    """API root — basic info."""
    return {
        "name": settings.API_TITLE,
        "version": settings.API_VERSION,
        "description": settings.API_DESCRIPTION,
        "docs": "/docs",
    }
