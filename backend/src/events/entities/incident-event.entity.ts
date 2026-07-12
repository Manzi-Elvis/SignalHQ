import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IncidentEventType } from '../../common/enums/incident.enum';
import { Incident } from '../../incidents/entities/incident.entity';
import { User } from '../../users/entities/user.entity';

// Append-only: rows here are never updated or deleted (except via cascade
// when the parent incident itself is deleted). This is what makes the
// incident timeline a trustworthy record of what happened, not just the
// current state.
@Entity('incident_events')
@Index(['incident'])
export class IncidentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Incident, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'incident_id' })
  incident: Incident;

  @Column({ type: 'enum', enum: IncidentEventType })
  type: IncidentEventType;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}