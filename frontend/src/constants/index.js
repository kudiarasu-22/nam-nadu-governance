/**
 * Nam Nadu — Application Constants
 * Central location for all app-wide constants
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Nam Nadu';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Helper to ensure API URLs are correctly formatted without duplicate /api/v1 paths
const getApiBaseUrl = () => {
  let rawApiUrl = import.meta.env.VITE_API_URL || '';
  
  // If no API URL is provided, or if it accidentally contains a dev localhost in production, fallback to a relative path
  if (!rawApiUrl || rawApiUrl.includes('127.0.0.1') || rawApiUrl.includes('localhost')) {
    rawApiUrl = ''; // Relative path allows Vite proxy to work in dev
  }

  // Remove all trailing slashes
  rawApiUrl = rawApiUrl.replace(/\/+$/, '');
  // Remove any trailing /api/v1 or /api to avoid duplication
  rawApiUrl = rawApiUrl.replace(/(\/api\/v1|\/api)+$/, '');
  
  // Append standard /api/v1
  return `${rawApiUrl}/api/v1`;
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || '';

export const TOKEN_KEY = 'nam_nadu_access_token';
export const REFRESH_TOKEN_KEY = 'nam_nadu_refresh_token';
export const USER_KEY = 'nam_nadu_user';

export const MLA_TOKEN_KEY = 'mla_token';
export const MLA_USER_KEY = 'mla_user';

export const CM_TOKEN_KEY = 'cm_token';
export const CM_USER_KEY = 'cm_user';

export const COMPLAINT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  WORK_STARTED: 'work_started',
  IN_PROGRESS: 'in_progress',
  INSPECTION_PENDING: 'inspection_pending',
  CITIZEN_VERIFICATION: 'citizen_verification',
  COMPLETED: 'completed',
  REOPENED: 'reopened',
  REJECTED: 'rejected',
};

export const PROJECT_STATUS = {
  PROPOSED: 'proposed',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
};

export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const COMPLAINT_CATEGORIES = [
  'Road Damage', 'Water Supply', 'Drainage', 'Garbage Collection',
  'Streetlight Failure', 'Flooding', 'Corruption Complaint', 'Welfare Issue'
];

export const MAP_DEFAULTS = {
  CENTER: [13.0827, 80.2707], // Chennai coordinates
  ZOOM: 12
};

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
