import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
      usuario: {
        id: usuario.idPerson,
        username: usuario.username,
        roles: payload.roles,
        nombre: `${usuario.persona?.firstName ?? ''} ${usuario.persona?.lastName ?? ''}`.trim(),
      },
    };
  }

  getProfile(user: any) {
    return user;
  }
}
