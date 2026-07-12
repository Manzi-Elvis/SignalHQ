import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface RecordAuditParams {
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  // Awaited deliberately -- a silently-failing audit write is worse than a
  // slightly slower request.
  async record(params: RecordAuditParams): Promise<void> {
    await this.auditRepo.save(
      this.auditRepo.create({
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        metadata: params.metadata ?? null,
        ipAddress: params.ipAddress ?? null,
      }),
    );
  }

  async search(params: { action?: string; page: number; limit: number }) {
    const qb = this.auditRepo.createQueryBuilder('log').orderBy('log.createdAt', 'DESC');
    if (params.action) qb.andWhere('log.action = :action', { action: params.action });

    const [data, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return { data, total, page: params.page, limit: params.limit };
  }
}