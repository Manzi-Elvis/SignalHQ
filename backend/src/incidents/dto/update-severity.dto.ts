import { IsEnum } from 'class-validator';
import { IncidentSeverity } from '../../common/enums/incident.enum';

export class UpdateSeverityDto {
  @IsEnum(IncidentSeverity)
  severity!: IncidentSeverity;
}