import { IsUUID } from 'class-validator';

export class AssignOwnerDto {
  @IsUUID()
  ownerId!: string;
}