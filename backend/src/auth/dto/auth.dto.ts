import { IsEmail, IsString, MinLength } from 'class-validator';

// Deliberately no `role` field — self-registration always lands as VIEWER,
// enforced in AuthService, not left as a client-suppliable default. Granting
// a higher role is a separate admin-only action we'll build later.
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}