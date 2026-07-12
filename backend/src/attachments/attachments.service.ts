import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { IncidentEvent } from '../events/entities/incident-event.entity';
import { IncidentEventType } from '../common/enums/incident.enum';
import { IncidentsGateway } from '../websocket/incidents.gateway';

interface SaveMetadataParams {
  incidentId: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploaderId: string;
}

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentsRepo: Repository<Attachment>,
    @InjectRepository(IncidentEvent)
    private readonly eventsRepo: Repository<IncidentEvent>,
    private readonly gateway: IncidentsGateway,
  ) {}

  async saveMetadata(params: SaveMetadataParams): Promise<Attachment> {
    const attachment = this.attachmentsRepo.create({
      incident: { id: params.incidentId } as any,
      originalName: params.originalName,
      storageKey: params.storageKey,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
      uploadedBy: { id: params.uploaderId } as any,
    });
    const saved = await this.attachmentsRepo.save(attachment);

    const event = await this.eventsRepo.save(
      this.eventsRepo.create({
        incident: { id: params.incidentId } as any,
        type: IncidentEventType.ATTACHMENT_ADDED,
        author: { id: params.uploaderId } as any,
        content: `Uploaded ${params.originalName}`,
      }),
    );
    this.gateway.emitNewEvent(params.incidentId, event);

    return saved;
  }
}