import { IncidentStateMachine } from './incident-state-machine';
import { IncidentStatus } from '../common/enums/incident.enum';
import { BadRequestException } from '@nestjs/common';

describe('IncidentStateMachine', () => {
  it('allows the standard forward path from open to postmortem', () => {
    const path = [
      IncidentStatus.OPEN,
      IncidentStatus.INVESTIGATING,
      IncidentStatus.IDENTIFIED,
      IncidentStatus.MONITORING,
      IncidentStatus.RESOLVED,
      IncidentStatus.POSTMORTEM,
    ];
    for (let i = 0; i < path.length - 1; i++) {
      expect(() =>
        IncidentStateMachine.assertValidTransition(path[i], path[i + 1]),
      ).not.toThrow();
    }
  });

  it('allows stepping back one stage (identified -> investigating)', () => {
    expect(() =>
      IncidentStateMachine.assertValidTransition(
        IncidentStatus.IDENTIFIED,
        IncidentStatus.INVESTIGATING,
      ),
    ).not.toThrow();
  });

  it('rejects skipping stages (open -> resolved)', () => {
    expect(() =>
      IncidentStateMachine.assertValidTransition(IncidentStatus.OPEN, IncidentStatus.RESOLVED),
    ).toThrow(BadRequestException);
  });

  it('rejects any transition out of postmortem (terminal state)', () => {
    expect(() =>
      IncidentStateMachine.assertValidTransition(
        IncidentStatus.POSTMORTEM,
        IncidentStatus.OPEN,
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects a no-op transition to the same status', () => {
    expect(() =>
      IncidentStateMachine.assertValidTransition(IncidentStatus.OPEN, IncidentStatus.OPEN),
    ).toThrow(BadRequestException);
  });

  it('reports the correct next states for a given status', () => {
    expect(IncidentStateMachine.nextStates(IncidentStatus.OPEN)).toEqual([
      IncidentStatus.INVESTIGATING,
    ]);
    expect(IncidentStateMachine.nextStates(IncidentStatus.POSTMORTEM)).toEqual([]);
  });
});