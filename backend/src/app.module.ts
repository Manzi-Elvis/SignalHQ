import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Incident } from './incidents/entities/incident.entity';
import { IncidentsModule } from './incidents/incidents.module';
import { IncidentEvent } from './events/entities/incident-event.entity';
import { Attachment } from './attachments/entities/attachment.entity';
import { AttachmentsModule } from './attachments/attachments.module';
import { AuditLog } from './audit/entities/audit-log.entity';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        // Neon (and most managed Postgres providers) require SSL and give
        // you one connection string instead of separate host/port/user
        // pieces. Local Docker Postgres has no SSL and uses the individual
        // DB_* vars -- this branch keeps both working without duplicating
        // the whole config block.
        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            entities: [User, Incident, IncidentEvent, Attachment, AuditLog],
            synchronize: false,
            logging: true,
          };
        }

        return {
          type: 'postgres' as const,
          host: config.getOrThrow<string>('DB_HOST'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.getOrThrow<string>('DB_USERNAME'),
          password: config.getOrThrow<string>('DB_PASSWORD'),
          database: config.getOrThrow<string>('DB_NAME'),
          entities: [User, Incident, IncidentEvent, Attachment, AuditLog],
          synchronize: false,
          logging: true,
        };
      },
    }),
    UsersModule,
    AuthModule,
    IncidentsModule,
    AttachmentsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}