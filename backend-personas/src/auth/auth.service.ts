import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../personas/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { username: dto.username },
      relations: { persona: true, usuarioRoles: { rol: true } },
    });

    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const passwordOk = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Credenciales incorrectas');

    const roles = usuario.usuarioRoles?.map((ur) => ur.rol?.name).filter(Boolean) ?? [];

    const payload = {
      sub: usuario.idPerson,
      username: usuario.username,
      roles: roles.length > 0 ? roles : ['INVITADO'],
      dni: usuario.persona?.dni,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.generateRefreshToken(usuario.idPerson),
      usuario: {
        id: usuario.idPerson,
        username: usuario.username,
        roles: payload.roles,
        nombre: `${usuario.persona?.firstName ?? ''} ${usuario.persona?.lastName ?? ''}`.trim(),
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const usuario = await this.usuarioRepo.findOne({
        where: { idPerson: payload.sub },
        relations: { persona: true, usuarioRoles: { rol: true } },
      });

      if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

      const roles = usuario.usuarioRoles?.map((ur) => ur.rol?.name).filter(Boolean) ?? [];

      const newPayload = {
        sub: usuario.idPerson,
        username: usuario.username,
        roles: roles.length > 0 ? roles : ['INVITADO'],
        dni: usuario.persona?.dni,
      };

      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.generateRefreshToken(usuario.idPerson),
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      },
    );
  }

  getProfile(user: any) {
    return user;
  }
}