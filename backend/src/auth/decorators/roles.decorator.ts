import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/roles.enum';

export const ROLES_KEY = 'roles';

// Usage: @Roles(Role.ADMIN, Role.ON_CALL_ENGINEER)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);