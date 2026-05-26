"""
Nam Nadu — Enum Definitions
All domain enums used by ORM models and schemas.
"""
import enum


class RoleName(str, enum.Enum):
    CITIZEN = "citizen"
    OFFICER = "officer"
    COUNCILLOR = "councillor"
    LEADERSHIP_ADMIN = "leadership_admin"
    VOLUNTEER = "volunteer"


class ComplaintStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ASSIGNED = "assigned"
    WORK_STARTED = "work_started"
    IN_PROGRESS = "in_progress"
    INSPECTION_PENDING = "inspection_pending"
    CITIZEN_VERIFICATION = "citizen_verification"
    COMPLETED = "completed"
    REOPENED = "reopened"
    REJECTED = "rejected"


class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ProjectStatus(str, enum.Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"


class NotificationType(str, enum.Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    COMPLAINT_UPDATE = "complaint_update"
    PROJECT_UPDATE = "project_update"
    EMERGENCY = "emergency"


class NotificationChannel(str, enum.Enum):
    IN_APP = "in_app"
    SMS = "sms"
    PUSH = "push"
    EMAIL = "email"


class Severity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class VoteType(str, enum.Enum):
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"


class TaskType(str, enum.Enum):
    VERIFICATION = "verification"
    COMMUNITY = "community"
    HEALTH = "health"


class TaskStatus(str, enum.Enum):
    OPEN = "open"
    CLAIMED = "claimed"
    COMPLETED = "completed"
