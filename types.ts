
export enum UserRole {
  ADMIN = 'ADMIN',
  MINISTER = 'MINISTER',
  DIRECTOR = 'DIRECTOR',
  SECRETARIAT = 'SECRETARIAT',
  STAFF = 'STAFF'
}

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'MANAGE_MEETINGS'
  | 'VIEW_ALL_MEETINGS'
  | 'MANAGE_USERS'
  | 'MANAGE_ROOMS'
  | 'MANAGE_ROLES'
  | 'VIEW_ANALYTICS'
  | 'EDIT_MINUTES'
  | 'APPROVE_ACTIONS'
  | 'MANAGE_SYSTEM'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_API'
  | 'TRIGGER_CRISIS'
  | 'MANAGE_FOIA';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; 
}

export interface User {
  id: string;
  name: string;
  role: string; 
  department: string;
  email: string;
  avatar: string;
  isActive: boolean;
  hourlyRate: number;
}

// New: Budget & Fiscal Intelligence
export interface BudgetStatus {
  totalAllocated: number;
  totalSpent: number;
  burnRate: number;
  warningThreshold: number;
}

// New: FOIA Request Management
export interface FoiaRequest {
  id: string;
  requesterName: string;
  organization: string;
  meetingId: string;
  status: 'PENDING' | 'REDACTION_NEEDED' | 'APPROVED' | 'RELEASED' | 'REJECTED';
  requestDate: string;
  dueDate: string;
  publicLink?: string;
}

// New: Legislative Intelligence
export interface LegislativeLink {
  actName: string;
  section: string;
  relevance: string;
  impactScore: number;
}

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  location: string;
  isAvailable: boolean;
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  CRISIS = 'CRISIS'
}

export interface MinuteVersion {
  versionId: string;
  timestamp: string;
  editorId: string;
  content: MeetingMinutes;
  changeNote: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  timestamp: string;
}

export interface CloudDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  timestamp: string;
  category: 'POLICY' | 'REPORT' | 'CONTRACT' | 'LEGAL' | 'OTHER';
  isSecured: boolean;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalStep {
  stepId: string;
  roleRequired: string; 
  label: string;
  status: ApprovalStatus;
  signedBy?: string;
  signedByName?: string;
  timestamp?: string;
  signatureHash?: string;
}

export interface ComplianceIssue {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  decisionText: string;
  policyReference: string;
  description: string;
}

export interface ExecutiveBrief {
  summary: string;
  unresolvedIssues: string[];
  decisionContext: string;
  generatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: MeetingStatus;
  organizerId: string;
  qrCodeUrl: string;
  agenda: string[];
  attendees: string[]; 
  transcript?: string;
  minutes?: MeetingMinutes;
  minuteHistory?: MinuteVersion[];
  isCrisis?: boolean;
  attachments?: Attachment[];
  minutesPublished?: boolean;
  currentCost?: number;
  approvalChain?: ApprovalStep[];
  complianceIssues?: ComplianceIssue[];
  executiveBrief?: ExecutiveBrief;
  publicRedactedMinutes?: string;
  legislativeLinks?: LegislativeLink[]; // NEW: Intelligence
}

export interface AttendanceRecord {
  id: string;
  meetingId: string;
  userId: string;
  timestamp: string;
  method: 'QR' | 'MANUAL' | 'NFC' | 'GEOFENCE' | 'FACE_ID';
  status: 'PRESENT' | 'LATE' | 'EXCUSED';
  verifiedLocation?: string;
  syncStatus?: 'PENDING' | 'SYNCED';
}

export interface ActionItem {
  id: string;
  meetingId: string;
  description: string;
  assigneeId: string; 
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  status: 'NEW' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  attachments?: Attachment[];
}

export interface MeetingMinutes {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  resolutions: string[];
  actionItems: Omit<ActionItem, 'id' | 'meetingId' | 'status'>[];
  risks?: string[];
  nextMeetingDate?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  resourceId: string;
  details: string;
  hash: string;
}

export interface ApiToken {
  id: string;
  name: string;
  service: string;
  token: string;
  lastUsed: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'SUCCESS' | 'INFO';
  timestamp: string;
  isRead: boolean;
  userId: string;
}

export interface CrisisPlan {
  immediateActions: string[];
  communicationDraft: string;
  stakeholdersToNotify: string[];
  severityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ToDoItem {
  id: string;
  userId: string;
  text: string;
  isCompleted: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
}

export interface View {
  type: 'DASHBOARD' | 'MEETINGS' | 'ACTION_ITEMS' | 'ATTENDANCE' | 'SETTINGS' | 'ADMIN' | 'KNOWLEDGE_BASE' | 'CRISIS_CENTER' | 'NOTIFICATIONS' | 'TODO' | 'DOCUMENT_CLOUD' | 'AI_TRANSCRIBER' | 'FOIA_PORTAL';
}

export type ViewType = View['type'];
