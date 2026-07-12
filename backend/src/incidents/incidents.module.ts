import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { UsersModule } from '../users/users.module';
import { IncidentEvent } from '../events/entities/incident-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incident, IncidentEvent]), UsersModule],
  providers: [IncidentsService],
  controllers: [IncidentsController],
  exports: [IncidentsService],
})
export class IncidentsModule {}