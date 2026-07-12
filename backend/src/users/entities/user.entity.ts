import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../common/enums/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  email!: string;

  // select: false means ordinary queries never return this column — it has
  // to be explicitly opted into with .addSelect(). This is what stops a
  // password hash from silently leaking into some future endpoint that
  // returns a User object (e.g. an incident's `reporter` field).
  @Column({ select: false })
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: Role, default: Role.VIEWER })
  role!: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}