import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async createUser(params: {
    email: string;
    passwordHash: string;
    name: string;
    role?: Role;
  }): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { email: params.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }
    const user = this.usersRepo.create({
      email: params.email,
      passwordHash: params.passwordHash,
      name: params.name,
      role: params.role ?? Role.VIEWER,
    });
    return this.usersRepo.save(user);
  }

  // Ordinary repository methods never return passwordHash (select: false on
  // the entity) — this is the one explicit path that opts back in, used
  // only during login.
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}