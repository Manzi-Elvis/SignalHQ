import { IncidentStatus } from '../types';

const LABELS: Record<IncidentStatus, string> = {
  [IncidentStatus.OPEN]: 'Open',
  [IncidentStatus.INVESTIGATING]: 'Investigating',
  [IncidentStatus.IDENTIFIED]: 'Identified',
  [IncidentStatus.MONITORING]: 'Monitoring',
  [IncidentStatus.RESOLVED]: 'Resolved',
  [IncidentStatus.POSTMORTEM]: 'Postmortem',
};

const CLASSES: Record<IncidentStatus, string> = {
  [IncidentStatus.OPEN]: 'bg-slate-200 text-slate-800',
  [IncidentStatus.INVESTIGATING]: 'bg-blue-100 text-blue-800',
  [IncidentStatus.IDENTIFIED]: 'bg-indigo-100 text-indigo-800',
  [IncidentStatus.MONITORING]: 'bg-purple-100 text-purple-800',
  [IncidentStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [IncidentStatus.POSTMORTEM]: 'bg-slate-800 text-white',
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CLASSES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}