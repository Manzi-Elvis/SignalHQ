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

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentsRepo: Repository<Incident>,
  ) {}

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

    incident.status = dto.status;
    await this.incidentsRepo.save(incident);
    return this.findOne(id);
  }

  async updateSeverity(id: string, dto: UpdateSeverityDto): Promise<Incident> {
    const incident = await this.findOne(id);
    incident.severity = dto.severity;
    await this.incidentsRepo.save(incident);
    return this.findOne(id);
  }

  async assignOwner(id: string, dto: AssignOwnerDto): Promise<Incident> {
    const incident = await this.findOne(id);
    incident.owner = { id: dto.ownerId } as any;
    await this.incidentsRepo.save(incident);
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
}