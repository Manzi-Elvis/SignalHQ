import { IsEnum, IsString, MinLength } from 'class-validator';
import { IncidentSeverity } from '../../common/enums/incident.enum';

export class CreateIncidentDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;
}