
import { Permission } from './types';

export const PERMISSIONS_LIST: { id: Permission; label: string; group: string }[] = [
  { id: 'VIEW_DASHBOARD', label: 'View Dashboard', group: 'General' },
  { id: 'VIEW_ANALYTICS', label: 'View Analytics', group: 'General' },
  { id: 'MANAGE_MEETINGS', label: 'Create & Edit Meetings', group: 'Meetings' },
  { id: 'VIEW_ALL_MEETINGS', label: 'View All Meetings', group: 'Meetings' },
  { id: 'EDIT_MINUTES', label: 'Edit Minutes & Transcripts', group: 'Meetings' },
  { id: 'APPROVE_ACTIONS', label: 'Approve Action Items', group: 'Actions' },
  { id: 'MANAGE_USERS', label: 'Manage Users', group: 'Administration' },
  { id: 'MANAGE_ROOMS', label: 'Manage Rooms', group: 'Administration' },
  { id: 'MANAGE_ROLES', label: 'Manage Roles', group: 'Administration' },
  { id: 'MANAGE_SYSTEM', label: 'System Configuration', group: 'Administration' },
  { id: 'VIEW_AUDIT_LOGS', label: 'View Audit Logs', group: 'Compliance' },
  { id: 'MANAGE_API', label: 'Manage API Tokens', group: 'Integration' },
  { id: 'TRIGGER_CRISIS', label: 'Trigger Crisis Mode', group: 'Emergency' },
];
