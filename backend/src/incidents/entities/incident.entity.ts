import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IncidentSeverity, IncidentStatus } from '../../common/enums/incident.enum';
import { User } from '../../users/entities/user.entity';

@Entity('incidents')
// Composite index backing the most common dashboard query: "open
// incidents, by severity" — without this it'd be a sequential scan once
// the table has real history.
@Index(['status', 'severity'])
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: IncidentSeverity })
  severity!: IncidentSeverity;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.OPEN })
  status!: IncidentStatus;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  // Nullable: an incident can exist briefly before an on-call engineer
  // claims it.
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner!: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Explicit type here, same reasoning as the AuditLog bug we fixed
  // earlier — a `Date | null` union can't be reliably inferred by
  // reflect-metadata, so we tell TypeORM the column type outright rather
  // than risk it falling back to something Postgres rejects.
  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: 'tsvector', select: false, nullable: true, name: 'search_vector' })
  searchVector!: string;
}