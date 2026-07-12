import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from './entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentStatus } from '../common/enums/incident.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { IncidentStateMachine } from './incident-state-machine';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateSeverityDto } from './dto/update-severity.dto';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { Role } from '../common/enums/roles.enum';
import { UsersService } from '../users/users.service';
import { IncidentEvent } from '../events/entities/incident-event.entity';
import { IncidentEventType } from '../common/enums/incident.enum';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentsRepo: Repository<Incident>,
    @InjectRepository(IncidentEvent)
    private readonly eventsRepo: Repository<IncidentEvent>,
    private readonly usersService: UsersService,
  ) {}

  private async logEvent(
    incidentId: string,
    type: IncidentEventType,
    authorId: string,
    content: string,
  ): Promise<IncidentEvent> {
    const event = this.eventsRepo.create({
      incident: { id: incidentId } as any,
      type,
      author: { id: authorId } as any,
      content,
    });
    return this.eventsRepo.save(event);
  }

  async create(dto: CreateIncidentDto, reporter: AuthenticatedUser): Promise<Incident> {
    const incident = this.incidentsRepo.create({
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      status: IncidentStatus.OPEN,
      reporter: { id: reporter.id } as any,
      owner: null,
    });
    const saved = await this.incidentsRepo.save(incident);
    await this.logEvent(saved.id, IncidentEventType.CREATED, reporter.id, 'Incident reported');
    return this.findOne(saved.id);
  }

  async findAll(): Promise<Incident[]> {
    return this.incidentsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Incident> {
    const incident = await this.incidentsRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    actorId: string,
    actorRole: Role,
  ): Promise<Incident> {
    const incident = await this.findOne(id);
    IncidentStateMachine.assertValidTransition(incident.status, dto.status);

    if (dto.status === IncidentStatus.RESOLVED) {
      this.assertCanClose(incident, actorId, actorRole);
      incident.resolvedAt = new Date();
    }

    const from = incident.status;
    incident.status = dto.status;
    await this.incidentsRepo.save(incident);
    await this.logEvent(
      id,
      IncidentEventType.STATUS_CHANGE,
      actorId,
      `Status changed from "${from}" to "${dto.status}"`,
    );
    return this.findOne(id);
  }

  async updateSeverity(id: string, dto: UpdateSeverityDto, actorId: string): Promise<Incident> {
    const incident = await this.findOne(id);
    const from = incident.severity;
    incident.severity = dto.severity;
    await this.incidentsRepo.save(incident);
    await this.logEvent(
      id,
      IncidentEventType.SEVERITY_CHANGE,
      actorId,
      `Severity changed from "${from}" to "${dto.severity}"`,
    );
    return this.findOne(id);
  }

  async assignOwner(id: string, dto: AssignOwnerDto, actorId: string): Promise<Incident> {
    const incident = await this.findOne(id);
    const newOwner = await this.usersService.findById(dto.ownerId);
    incident.owner = newOwner;
    await this.incidentsRepo.save(incident);
    await this.logEvent(
      id,
      IncidentEventType.ASSIGNMENT_CHANGE,
      actorId,
      `Owner set to ${newOwner.name}`,
    );
    return this.findOne(id);
  }

  assertCanClose(incident: Incident, actorId: string, actorRole: Role): void {
    const isOwner = incident.owner?.id === actorId;
    const isAdmin = actorRole === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Only the assigned owner or an admin can resolve this incident',
      );
    }
  }

  async getTimeline(incidentId: string): Promise<IncidentEvent[]> {
    await this.findOne(incidentId); // 404s if the incident doesn't exist
    return this.eventsRepo.find({
      where: { incident: { id: incidentId } },
      order: { createdAt: 'ASC' },
    });
  }

  async addComment(id: string, dto: AddCommentDto, actorId: string): Promise<IncidentEvent> {
    await this.findOne(id); // 404s if the incident doesn't exist
    return this.logEvent(id, IncidentEventType.COMMENT, actorId, dto.content);
  }
}