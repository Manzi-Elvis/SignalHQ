import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Role } from '../common/enums/roles.enum';
import { AuditService } from '../audit/audit.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: Role.VIEWER,
    });

    await this.auditService.record({
      actorId: user.id,
      actorEmail: user.email,
      action: 'auth.registered',
      entityType: 'user',
      entityId: user.id,
    });

    return this.issueToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    const invalidCredentials = () => new UnauthorizedException('Invalid email or password');

    if (!user) throw invalidCredentials();

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      await this.auditService.record({
        actorId: user.id,
        actorEmail: user.email,
        action: 'auth.login_failed',
        entityType: 'user',
        entityId: user.id,
      });
      throw invalidCredentials();
    }

    await this.auditService.record({
      actorId: user.id,
      actorEmail: user.email,
      action: 'auth.login_succeeded',
      entityType: 'user',
      entityId: user.id,
    });

    return this.issueToken(user.id, user.email, user.role);
  }

  private issueToken(id: string, email: string, role: Role) {
    const accessToken = this.jwtService.sign({ sub: id, email, role });
    return { accessToken, user: { id, email, role } };
  }
}