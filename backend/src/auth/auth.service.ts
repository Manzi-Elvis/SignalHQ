import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Role } from '../common/enums/roles.enum';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: Role.VIEWER, // always VIEWER on self-registration
    });
    return this.issueToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // Same error whether the email doesn't exist or the password is wrong
    // — avoids leaking which emails have accounts (user enumeration).
    const invalidCredentials = () => new UnauthorizedException('Invalid email or password');

    if (!user) throw invalidCredentials();

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) throw invalidCredentials();

    return this.issueToken(user.id, user.email, user.role);
  }

  private issueToken(id: string, email: string, role: Role) {
    const accessToken = this.jwtService.sign({ sub: id, email, role });
    return { accessToken, user: { id, email, role } };
  }
}