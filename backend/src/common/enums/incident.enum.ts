export enum IncidentSeverity {
  SEV1 = 'sev1', // critical: full outage, all-hands
  SEV2 = 'sev2', // major: significant degradation
  SEV3 = 'sev3', // minor: limited impact
  SEV4 = 'sev4', // cosmetic / low urgency
}

// Order matters — used to validate forward transitions in the state machine.
export enum IncidentStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  IDENTIFIED = 'identified',
  MONITORING = 'monitoring',
  RESOLVED = 'resolved',
  POSTMORTEM = 'postmortem',
}

export enum IncidentEventType {
  CREATED = 'created',
  STATUS_CHANGE = 'status_change',
  SEVERITY_CHANGE = 'severity_change',
  ASSIGNMENT_CHANGE = 'assignment_change',
  COMMENT = 'comment',
  ATTACHMENT_ADDED = 'attachment_added',
}