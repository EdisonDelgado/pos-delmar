import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../database/models/user.model';

export interface JwtPayload {
  sub: number;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    roles: string[];
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    console.log('🔐 [AuthService] Validando usuario:', email);

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      console.log('❌ [AuthService] Usuario no encontrado:', email);
      return null;
    }

    console.log('✓ [AuthService] Usuario encontrado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roles: user.roles?.map(r => r.name) || [],
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0
    });

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    console.log('🔑 [AuthService] Validación de contraseña:', isPasswordValid ? '✅ Válida' : '❌ Inválida');

    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      console.log('❌ [AuthService] Cuenta inactiva');
      throw new UnauthorizedException('La cuenta está inactiva');
    }

    console.log('✅ [AuthService] Validación exitosa');
    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    console.log('🚀 [AuthService] Intento de login:', loginDto.email);

    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      console.log('❌ [AuthService] Login falló - Credenciales inválidas');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const roles = user.roles?.map((role) => role.name) || [];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const token = this.jwtService.sign(payload);

    console.log('🎉 [AuthService] Login exitoso:', {
      userId: user.id,
      email: user.email,
      roles,
      tokenLength: token.length
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        roles,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(registerDto);

    const roles = user.roles?.map((role) => role.name) || [];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        roles,
      },
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
