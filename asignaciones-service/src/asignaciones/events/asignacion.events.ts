import { AsignacionVehiculo } from '../entities/asignacion-vehiculo.entity';

export const ASIGNACION_EVENTS = {
  CREADA: 'asignacion.creada',
  MODIFICADA: 'asignacion.modificada',
  ELIMINADA: 'asignacion.eliminada',
} as const;

export class AsignacionCreadaEvent {
  constructor(public readonly asignacion: AsignacionVehiculo) {}
}

export class AsignacionModificadaEvent {
  constructor(
    public readonly anterior: Partial<AsignacionVehiculo>,
    public readonly nuevo: AsignacionVehiculo,
  ) {}
}

export class AsignacionEliminadaEvent {
  constructor(public readonly asignacion: AsignacionVehiculo) {}
}
