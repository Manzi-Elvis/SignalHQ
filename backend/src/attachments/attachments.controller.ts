import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AttachmentsService } from './attachments.service';

// Evidence attached to incidents is limited to what a responder would
// actually paste in: logs and screenshots. No .exe/.zip/etc -- this is an
// incident timeline, not a general file store, and a narrow allow-list is
// cheap insurance against someone using it as one.
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'text/plain',
  'text/csv',
  'application/json',
  'application/pdf',
]);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

@Controller('incidents/:incidentId/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        // Randomized filename on disk -- the original name is preserved
        // only as metadata in Postgres, never used as a path. This is what
        // prevents path traversal and collisions from user-controlled
        // filenames.
        filename: (_req, file, cb) => {
          const unique = randomUUID();
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(new BadRequestException(`File type "${file.mimetype}" is not allowed`), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @Param('incidentId') incidentId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    return this.attachmentsService.saveMetadata({
      incidentId,
      originalName: file.originalname,
      storageKey: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploaderId: user.id,
    });
  }
}