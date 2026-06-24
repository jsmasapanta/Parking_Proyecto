import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrazabilidadAsignacion, TipoAccion } from '../entities/trazabilidad.entity';
import {
  ASIGNACION_EVENTS,
  AsignacionCreadaEvent,
  AsignacionModificadaEvent,
  AsignacionEliminadaEvent,
} from '../events/asignacion.events';

/**
 * Listener de Domain Events — patrón desacoplado para trazabilidad (RF2).
 * El servicio de negocio emite eventos; este listener persiste el registro
 * de auditoría sin que AsignacionesService conozca los detalles de auditoría.
 */
@Injectable()
export class TrazabilidadListener {
  constructor(
    @InjectRepository(TrazabilidadAsignacion)
    private readonly repo: Repository<TrazabilidadAsignacion>,
  ) {}

  @OnEvent(ASIGNACION_EVENTS.CREADA)
  async onCreada(event: AsignacionCreadaEvent): Promise<void> {
    await this.repo.save({
      userId: event.asignacion.userId,
      vehicleId: event.asignacion.vehicleId,
      tipoAccion: TipoAccion.CREACION,
      timestamp: new Date(),
      datosAnteriores: null,
      datosNuevos: event.asignacion,
    });
  }

  @OnEvent(ASIGNACION_EVENTS.MODIFICADA)
  async onModificada(event: AsignacionModificadaEvent): Promise<void> {
    await this.repo.save({
      userId: event.nuevo.userId,
      vehicleId: event.nuevo.vehicleId,
      tipoAccion: TipoAccion.MODIFICACION,
      timestamp: new Date(),
      datosAnteriores: event.anterior,
      datosNuevos: event.nuevo,
    });
  }

  @OnEvent(ASIGNACION_EVENTS.ELIMINADA)
  async onEliminada(event: AsignacionEliminadaEvent): Promise<void> {
    await this.repo.save({
      userId: event.asignacion.userId,
      vehicleId: event.asignacion.vehicleId,
      tipoAccion: TipoAccion.ELIMINACION,
      timestamp: new Date(),
      datosAnteriores: event.asignacion,
      datosNuevos: null,
    });
  }
}
