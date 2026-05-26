/**
 * Nam Nadu — Role & Permission Configuration
 * Defines all user roles and their associated permissions
 */

// User role identifiers
export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  COUNCILLOR: 'councillor',
  LEADERSHIP_ADMIN: 'leadership_admin',
  VOLUNTEER: 'volunteer',
};

// Human-readable role labels
export const ROLE_LABELS = {
  [ROLES.CITIZEN]: 'Citizen',
  [ROLES.OFFICER]: 'Officer',
  [ROLES.COUNCILLOR]: 'Councillor',
  [ROLES.LEADERSHIP_ADMIN]: 'Leadership Admin',
  [ROLES.VOLUNTEER]: 'Volunteer',
};

// Role-based permissions matrix
export const PERMISSIONS = {
  // Complaint management
  CREATE_COMPLAINT: [ROLES.CITIZEN],
  VIEW_OWN_COMPLAINTS: [ROLES.CITIZEN],
  VIEW_ALL_COMPLAINTS: [ROLES.OFFICER, ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN],
  UPDATE_COMPLAINT: [ROLES.OFFICER, ROLES.LEADERSHIP_ADMIN],
  ASSIGN_COMPLAINT: [ROLES.OFFICER, ROLES.LEADERSHIP_ADMIN],

  // Project management
  VIEW_PROJECTS: [ROLES.CITIZEN, ROLES.OFFICER, ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN, ROLES.VOLUNTEER],
  CREATE_PROJECT: [ROLES.LEADERSHIP_ADMIN],
  UPDATE_PROJECT: [ROLES.OFFICER, ROLES.LEADERSHIP_ADMIN],
  DELETE_PROJECT: [ROLES.LEADERSHIP_ADMIN],

  // Fund management
  VIEW_FUNDS: [ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN],
  MANAGE_FUNDS: [ROLES.LEADERSHIP_ADMIN],

  // Analytics & Reports
  VIEW_ANALYTICS: [ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN],
  VIEW_PUBLIC_ANALYTICS: [ROLES.CITIZEN, ROLES.OFFICER, ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN, ROLES.VOLUNTEER],

  // User management
  MANAGE_USERS: [ROLES.LEADERSHIP_ADMIN],
  MANAGE_OFFICERS: [ROLES.LEADERSHIP_ADMIN],

  // Volunteer management
  VIEW_VOLUNTEER_TASKS: [ROLES.VOLUNTEER, ROLES.OFFICER, ROLES.LEADERSHIP_ADMIN],
  MANAGE_VOLUNTEERS: [ROLES.OFFICER, ROLES.LEADERSHIP_ADMIN],

  // Notifications
  SEND_BROADCAST: [ROLES.LEADERSHIP_ADMIN, ROLES.OFFICER],
  SEND_EMERGENCY_ALERT: [ROLES.LEADERSHIP_ADMIN],

  // Departments
  MANAGE_DEPARTMENTS: [ROLES.LEADERSHIP_ADMIN],

  // Feedback & voting
  SUBMIT_FEEDBACK: [ROLES.CITIZEN, ROLES.VOLUNTEER],
  VOTE: [ROLES.CITIZEN],
};

// Dashboard route mapping per role
export const ROLE_DASHBOARDS = {
  [ROLES.CITIZEN]: '/dashboard/citizen',
  [ROLES.OFFICER]: '/dashboard/officer',
  [ROLES.COUNCILLOR]: '/dashboard/leadership',
  [ROLES.LEADERSHIP_ADMIN]: '/dashboard/leadership',
  [ROLES.VOLUNTEER]: '/dashboard/volunteer',
};

// Role-based default redirect after login
export const getDefaultDashboard = (role) => {
  return ROLE_DASHBOARDS[role] || '/dashboard/citizen';
};

// Check if a role has a specific permission
export const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  const perms = [];
  for (const [perm, roles] of Object.entries(PERMISSIONS)) {
    if (roles.includes(role)) {
      perms.push(perm);
    }
  }
  return perms;
};
