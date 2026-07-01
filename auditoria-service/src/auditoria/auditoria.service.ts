import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoAuditoria } from './entities/evento-auditoria.entity';
import { CreateEventoDto } from './dto/create-evento.dto';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(EventoAuditoria)
    private readonly repo: Repository<EventoAuditoria>,
  ) {}

  async registrar(dto: CreateEventoDto): Promise<EventoAuditoria> {
    const evento = this.repo.create({
      servicio: dto.servicio,
      accion: dto.accion,
      usuarioId: dto.usuarioId ?? null,
      datos: dto.datos ?? null,
      timestampEvento: new Date(),
    });
    return this.repo.save(evento);
  }

  findAll(servicio?: string, accion?: string): Promise<EventoAuditoria[]> {
    const where: any = {};
    if (servicio) where.servicio = servicio;
    if (accion) where.accion = accion;
    return this.repo.find({ where, order: { timestampEvento: 'DESC' }, take: 500 });
  }

  findByUsuario(usuarioId: string): Promise<EventoAuditoria[]> {
    return this.repo.find({
      where: { usuarioId },
      order: { timestampEvento: 'DESC' },
      take: 200,
    });
  }
}
