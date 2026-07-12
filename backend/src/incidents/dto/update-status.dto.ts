import { IsEnum } from 'class-validator';
import { IncidentStatus } from '../../common/enums/incident.enum';

export class UpdateStatusDto {
  @IsEnum(IncidentStatus)
  status!: IncidentStatus;
}