import { BadRequestException } from '@nestjs/common';
import { IncidentStatus } from '../common/enums/incident.enum';

/**
 * The incident lifecycle modeled as an explicit state machine, rather than
 * scattered `if` checks in a service. The transitions map below is the
 * single source of truth for "what can happen next" — the API and (later)
 * the frontend dropdown both read from this same shape, so they can't
 * silently drift apart.
 *
 * This is a plain class with no dependencies and no side effects — it just
 * validates — so there's no reason to route it through Nest's DI container.
 */
export class IncidentStateMachine {
  private static readonly transitions: Record<IncidentStatus, IncidentStatus[]> = {
    [IncidentStatus.OPEN]: [IncidentStatus.INVESTIGATING],
    [IncidentStatus.INVESTIGATING]: [IncidentStatus.IDENTIFIED, IncidentStatus.OPEN],
    [IncidentStatus.IDENTIFIED]: [IncidentStatus.MONITORING, IncidentStatus.INVESTIGATING],
    [IncidentStatus.MONITORING]: [IncidentStatus.RESOLVED, IncidentStatus.IDENTIFIED],
    [IncidentStatus.RESOLVED]: [IncidentStatus.POSTMORTEM, IncidentStatus.MONITORING],
    // Postmortem is terminal — reopening a written-up incident should be a
    // new incident, not a status flip backwards.
    [IncidentStatus.POSTMORTEM]: [],
  };

  static assertValidTransition(from: IncidentStatus, to: IncidentStatus): void {
    if (from === to) {
      throw new BadRequestException(`Incident is already in status "${from}"`);
    }
    const allowed = this.transitions[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Invalid transition: cannot move from "${from}" to "${to}". ` +
          `Allowed next states: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}`,
      );
    }
  }

  static nextStates(from: IncidentStatus): IncidentStatus[] {
    return this.transitions[from] ?? [];
  }
}