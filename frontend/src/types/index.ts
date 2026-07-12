export const Role = {
  ADMIN: 'admin',
  ON_CALL_ENGINEER: 'on_call_engineer',
  RESPONDER: 'responder',
  VIEWER: 'viewer',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const IncidentSeverity = {
  SEV1: 'sev1',
  SEV2: 'sev2',
  SEV3: 'sev3',
  SEV4: 'sev4',
} as const;
export type IncidentSeverity = (typeof IncidentSeverity)[keyof typeof IncidentSeverity];

export const IncidentStatus = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  IDENTIFIED: 'identified',
  MONITORING: 'monitoring',
  RESOLVED: 'resolved',
  POSTMORTEM: 'postmortem',
} as const;
export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus];

export const IncidentEventType = {
  CREATED: 'created',
  STATUS_CHANGE: 'status_change',
  SEVERITY_CHANGE: 'severity_change',
  ASSIGNMENT_CHANGE: 'assignment_change',
  COMMENT: 'comment',
  ATTACHMENT_ADDED: 'attachment_added',
} as const;
export type IncidentEventType = (typeof IncidentEventType)[keyof typeof IncidentEventType];

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reporter: User;
  owner: User | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface IncidentEvent {
  id: string;
  type: IncidentEventType;
  author: User;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: User;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}