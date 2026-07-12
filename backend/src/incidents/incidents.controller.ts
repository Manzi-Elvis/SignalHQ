import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/roles.enum';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateSeverityDto } from './dto/update-severity.dto';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() dto: CreateIncidentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.incidentsService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.incidentsService.getTimeline(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ON_CALL_ENGINEER, Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.updateStatus(id, dto, user.id, user.email, user.role);
  }

  @Patch(':id/severity')
  @UseGuards(RolesGuard)
  @Roles(Role.ON_CALL_ENGINEER, Role.ADMIN)
  updateSeverity(
    @Param('id') id: string,
    @Body() dto: UpdateSeverityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.updateSeverity(id, dto, user.id, user.email);
  }

  @Patch(':id/owner')
  @UseGuards(RolesGuard)
  @Roles(Role.ON_CALL_ENGINEER, Role.ADMIN)
  assignOwner(
    @Param('id') id: string,
    @Body() dto: AssignOwnerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.assignOwner(id, dto, user.id, user.email);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidentsService.addComment(id, dto, user.id);
  }
}