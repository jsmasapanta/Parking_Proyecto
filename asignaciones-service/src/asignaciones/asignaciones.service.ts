import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AsignacionVehiculo } from './entities/asignacion-vehiculo.entity';
import { TrazabilidadAsignacion } from './entities/trazabilidad.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { FlotaResponseDto, VehiculoDetalleDto } from './dto/flota-response.dto';
import { PersonasClient } from '../external/personas.client';
import { VehiculosClient } from '../external/vehiculos.client';
import {
  ASIGNACION_EVENTS,
  AsignacionCreadaEvent,
  AsignacionModificadaEvent,
  AsignacionEliminadaEvent,
} from './events/asignacion.events';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(AsignacionVehiculo)
    private readonly asignacionRepo: Repository<AsignacionVehiculo>,
    @InjectRepository(TrazabilidadAsignacion)
    private readonly trazabilidadRepo: Repository<TrazabilidadAsignacion>,
    private readonly personasClient: PersonasClient,
    private readonly vehiculosClient: VehiculosClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // RF1 — Asignar vehículo a propietario
  async create(dto: CreateAsignacionDto): Promise<AsignacionVehiculo> {
    await this.personasClient.findById(dto.userId);
    await this.vehiculosClient.findById(dto.vehicleId);

    // Un vehículo sólo puede tener un propietario activo a la vez
    const vehiculoOcupado = await this.asignacionRepo.findOne({
      where: { vehicleId: dto.vehicleId, activo: true },
    });
    if (vehiculoOcupado) {
      throw new ConflictException(
        `El vehículo '${dto.vehicleId}' ya está asignado a un propietario activo`,
      );
    }

    // La clave compuesta ya existente también es un conflicto
    const duplicado = await this.asignacionRepo.findOne({
      where: { userId: dto.userId, vehicleId: dto.vehicleId },
    });
    if (duplicado) {
      throw new ConflictException('Esta asignación (usuario + vehículo) ya existe');
    }

    const asignacion = this.asignacionRepo.create({
      userId: dto.userId,
      vehicleId: dto.vehicleId,
      activo: true,
      fechaAsignacion: new Date(),
    });

    const guardada = await this.asignacionRepo.save(asignacion);

    // Emitir Domain Event — TrazabilidadListener persiste el registro de auditoría
    this.eventEmitter.emit(ASIGNACION_EVENTS.CREADA, new AsignacionCreadaEvent(guardada));

    return guardada;
  }

  // RF3 — Consulta de flota por propietario (agrega datos del servicio de vehículos)
  async findFlotaByPropietario(userId: string): Promise<FlotaResponseDto> {
    await this.personasClient.findById(userId);

    const asignaciones = await this.asignacionRepo.find({
      where: { userId, activo: true },
    });

    const vehiculos: VehiculoDetalleDto[] = await Promise.all(
      asignaciones.map(async (a) => {
        const v = await this.vehiculosClient.findById(a.vehicleId);
        return {
          vehicleId: a.vehicleId,
          placa: v.placa,
          tipo: this.inferirTipo(v),
          categoria: v.clasificacion ?? v.categoria ?? 'desconocido',
          marca: v.marca,
          modelo: v.modelo,
          color: v.color,
          anio: v.anio,
          fechaAsignacion: a.fechaAsignacion,
        };
      }),
    );

    return { userId, totalVehiculos: vehiculos.length, vehiculos };
  }

  async findOne(userId: string, vehicleId: string): Promise<AsignacionVehiculo> {
    const asignacion = await this.asignacionRepo.findOne({
      where: { userId, vehicleId },
    });
    if (!asignacion) {
      throw new NotFoundException(
        `Asignación para usuario '${userId}' y vehículo '${vehicleId}' no encontrada`,
      );
    }
    return asignacion;
  }

  async update(
    userId: string,
    vehicleId: string,
    dto: UpdateAsignacionDto,
  ): Promise<AsignacionVehiculo> {
    const asignacion = await this.findOne(userId, vehicleId);
    const anterior = { ...asignacion };

    Object.assign(asignacion, dto);
    const actualizada = await this.asignacionRepo.save(asignacion);

    this.eventEmitter.emit(
      ASIGNACION_EVENTS.MODIFICADA,
      new AsignacionModificadaEvent(anterior, actualizada),
    );

    return actualizada;
  }

  async remove(userId: string, vehicleId: string): Promise<void> {
    const asignacion = await this.findOne(userId, vehicleId);
    // Snapshot antes de remove porque TypeORM limpia las PK del objeto tras la eliminación
    const snapshot = { ...asignacion };
    await this.asignacionRepo.remove(asignacion);

    this.eventEmitter.emit(
      ASIGNACION_EVENTS.ELIMINADA,
      new AsignacionEliminadaEvent(snapshot as AsignacionVehiculo),
    );
  }

  async findTrazabilidad(userId: string, vehicleId: string): Promise<TrazabilidadAsignacion[]> {
    return this.trazabilidadRepo.find({
      where: { userId, vehicleId },
      order: { timestamp: 'DESC' },
    });
  }

  async findAllTrazabilidad(): Promise<TrazabilidadAsignacion[]> {
    return this.trazabilidadRepo.find({ order: { timestamp: 'DESC' } });
  }

  private inferirTipo(vehiculo: any): string {
    if (vehiculo.numeroPuertas !== undefined) return 'Auto';
    if (vehiculo.capacidadCarga !== undefined) return 'Camioneta';
    if (vehiculo.tipoMoto !== undefined) return 'Motocicleta';
    return 'desconocido';
  }
}
