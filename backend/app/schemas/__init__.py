"""Schemas package."""
from .common import ErrorResponse, MessageResponse, PaginatedResponse, PaginationParams
from .auth import LoginRequest, RegisterRequest, TokenResponse, RefreshRequest, UserResponse
from .officer import (
    DashboardStatsResponse, ComplaintResponse, ComplaintListResponse, 
    ComplaintOfficerUpdate, ProjectResponse, ProjectListResponse, ProjectOfficerUpdate
)
from .complaint import (
    ComplaintCreate, ComplaintDetailResponse, ComplaintListResponse as CitizenComplaintListResponse,
    ComplaintReopen, ComplaintMediaResponse, ComplaintAuditLogResponse
)
from .project import ProjectDetailResponse, CitizenProjectListResponse, ProjectVerifyRequest, ProjectProgressResponse, ProjectSummaryResponse

__all__ = [
    "ErrorResponse", "MessageResponse", "PaginatedResponse", "PaginationParams",
    "LoginRequest", "RegisterRequest", "TokenResponse", "RefreshRequest", "UserResponse",
    "DashboardStatsResponse", "ComplaintResponse", "ComplaintListResponse",
    "ComplaintOfficerUpdate", "ProjectResponse", "ProjectListResponse", "ProjectOfficerUpdate",
    "ComplaintCreate", "ComplaintDetailResponse", "CitizenComplaintListResponse",
    "ComplaintReopen", "ComplaintMediaResponse", "ComplaintAuditLogResponse",
    "ProjectDetailResponse", "CitizenProjectListResponse", "ProjectVerifyRequest", "ProjectProgressResponse", "ProjectSummaryResponse"
]
