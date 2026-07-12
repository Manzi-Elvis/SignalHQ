import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Incident } from '../../incidents/entities/incident.entity';
import { User } from '../../users/entities/user.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Incident, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'incident_id' })
  incident!: Incident;

  // Original filename as uploaded -- shown in the UI, never used as a
  // filesystem path.
  @Column({ name: 'original_name' })
  originalName!: string;

  // Randomized name actually used on disk. This is what prevents path
  // traversal (e.g. "../../etc/passwd" as a filename) and collisions --
  // user-controlled input never touches the filesystem directly.
  @Column({ name: 'storage_key' })
  storageKey!: string;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes!: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}