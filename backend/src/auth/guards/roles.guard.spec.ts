import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../common/enums/roles.enum';

function makeContext(user: { role: Role } | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows access when no @Roles() metadata is present', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext({ role: Role.VIEWER }))).toBe(true);
  });

  it('allows access when the user has one of the required roles', () => {
    const reflector = {
      getAllAndOverride: () => [Role.ON_CALL_ENGINEER, Role.ADMIN],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext({ role: Role.ON_CALL_ENGINEER }))).toBe(true);
  });

  it('rejects access when the user lacks all required roles', () => {
    const reflector = { getAllAndOverride: () => [Role.ADMIN] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(makeContext({ role: Role.VIEWER }))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects access when there is no authenticated user at all', () => {
    const reflector = { getAllAndOverride: () => [Role.ADMIN] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext(undefined))).toBe(false);
  });
});