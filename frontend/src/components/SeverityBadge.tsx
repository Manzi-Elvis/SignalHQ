import { IncidentSeverity } from '../types';

const LABELS: Record<IncidentSeverity, string> = {
  [IncidentSeverity.SEV1]: 'SEV1 · Critical',
  [IncidentSeverity.SEV2]: 'SEV2 · Major',
  [IncidentSeverity.SEV3]: 'SEV3 · Minor',
  [IncidentSeverity.SEV4]: 'SEV4 · Low',
};

const CLASSES: Record<IncidentSeverity, string> = {
  [IncidentSeverity.SEV1]: 'bg-red-100 text-red-800 border-red-300',
  [IncidentSeverity.SEV2]: 'bg-orange-100 text-orange-800 border-orange-300',
  [IncidentSeverity.SEV3]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [IncidentSeverity.SEV4]: 'bg-lime-100 text-lime-800 border-lime-300',
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CLASSES[severity]}`}
    >
      {LABELS[severity]}
    </span>
  );
}