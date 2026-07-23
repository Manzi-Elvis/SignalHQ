import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { UsersService } from './users.service';

class SetRoleDto {
  @IsEnum(Role)
  role!: Role;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Any authenticated user can see the roster -- needed for the
  // "assign owner" dropdown on the frontend. No @Roles() here means
  // auth-only (the global JwtAuthGuard already covers that).
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  setRole(@Param('id') id: string, @Body() dto: SetRoleDto) {
    return this.usersService.setRole(id, dto.role);
  }
}