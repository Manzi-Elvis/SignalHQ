import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';

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
    return this.attachmentsRepo.save(attachment);
  }
}