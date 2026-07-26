import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/users/entities/user.entity';
import { Incident } from './src/incidents/entities/incident.entity';
import { IncidentEvent } from './src/events/entities/incident-event.entity';
import { Attachment } from './src/attachments/entities/attachment.entity';
import { AuditLog } from './src/audit/entities/audit-log.entity';

config();

const entities = [User, Incident, IncidentEvent, Attachment, AuditLog];
const migrations = ['src/database/migrations/*.ts'];

// Same DATABASE_URL-or-fallback pattern as app.module.ts -- this file is
// only used by the TypeORM CLI (migration:generate/run/revert), never by
// the running app itself, but it needs to be able to target Neon too when
// we run migrations against production.
export default process.env.DATABASE_URL
  ? new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities,
      migrations,
    })
  : new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities,
      migrations,
    });