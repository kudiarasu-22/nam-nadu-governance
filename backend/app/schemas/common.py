"""
Nam Nadu — Common Schemas
Shared Pydantic models for API responses.
"""
from typing import Any, List

from pydantic import BaseModel


class MessageResponse(BaseModel):
    """Generic success/failure message."""
    message: str
    success: bool = True


class PaginatedResponse(BaseModel):
    """Paginated list response."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


class ErrorResponse(BaseModel):
    """Standard error payload."""
    detail: str
    success: bool = False


class PaginationParams(BaseModel):
    """Query parameters for pagination."""
    page: int = 1
    page_size: int = 10
    search: str | None = None
    sort_by: str | None = None
    sort_order: str = "desc"
