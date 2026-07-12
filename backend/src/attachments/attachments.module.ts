import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { IncidentEvent } from '../events/entities/incident-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment, IncidentEvent])],
  providers: [AttachmentsService],
  controllers: [AttachmentsController],
})

export class AttachmentsModule {}