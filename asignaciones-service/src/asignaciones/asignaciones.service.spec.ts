import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionVehiculo } from './entities/asignacion-vehiculo.entity';
import { TrazabilidadAsignacion } from './entities/trazabilidad.entity';
import { PersonasClient } from '../external/personas.client';
import { VehiculosClient } from '../external/vehiculos.client';
import { ASIGNACION_EVENTS } from './events/asignacion.events';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockPersonasClient = { findById: jest.fn() };
const mockVehiculosClient = { findById: jest.fn() };
const mockEventEmitter = { emit: jest.fn() };

describe('AsignacionesService', () => {
  let service: AsignacionesService;
  let asignacionRepo: ReturnType<typeof mockRepo>;
  let trazabilidadRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsignacionesService,
        { provide: getRepositoryToken(AsignacionVehiculo), useFactory: mockRepo },
        { provide: getRepositoryToken(TrazabilidadAsignacion), useFactory: mockRepo },
        { provide: PersonasClient, useValue: mockPersonasClient },
        { provide: VehiculosClient, useValue: mockVehiculosClient },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AsignacionesService>(AsignacionesService);
    asignacionRepo = module.get(getRepositoryToken(AsignacionVehiculo));
    trazabilidadRepo = module.get(getRepositoryToken(TrazabilidadAsignacion));

    jest.clearAllMocks();
  });

  // ─── RF1: Creación ───────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = { userId: 'user-1', vehicleId: 'vehicle-1' };

    it('crea la asignación correctamente y emite evento CREADA', async () => {
      mockPersonasClient.findById.mockResolvedValue({ id: 'user-1' });
      mockVehiculosClient.findById.mockResolvedValue({ id: 'vehicle-1' });
      asignacionRepo.findOne.mockResolvedValue(null);
      asignacionRepo.create.mockReturnValue({ ...dto, activo: true });
      asignacionRepo.save.mockResolvedValue({ ...dto, activo: true, fechaAsignacion: new Date() });

      const result = await service.create(dto);

      expect(result.userId).toBe('user-1');
      expect(result.activo).toBe(true);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        ASIGNACION_EVENTS.CREADA,
        expect.any(Object),
      );
    });

    it('lanza ConflictException si el vehículo ya tiene propietario activo', async () => {
      mockPersonasClient.findById.mockResolvedValue({ id: 'user-1' });
      mockVehiculosClient.findById.mockResolvedValue({ id: 'vehicle-1' });
      // Primera llamada findOne devuelve vehículo ocupado
      asignacionRepo.findOne.mockResolvedValueOnce({ userId: 'user-2', vehicleId: 'vehicle-1', activo: true });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('lanza ConflictException si la clave compuesta ya existe', async () => {
      mockPersonasClient.findById.mockResolvedValue({ id: 'user-1' });
      mockVehiculosClient.findById.mockResolvedValue({ id: 'vehicle-1' });
      asignacionRepo.findOne
        .mockResolvedValueOnce(null) // vehículo no ocupado por otro propietario
        .mockResolvedValueOnce({ userId: 'user-1', vehicleId: 'vehicle-1' }); // duplicado

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── RF2: Trazabilidad ───────────────────────────────────────────────────────

  describe('update', () => {
    it('actualiza y emite evento MODIFICADA', async () => {
      const asignacion = { userId: 'user-1', vehicleId: 'vehicle-1', activo: true };
      asignacionRepo.findOne.mockResolvedValue(asignacion);
      asignacionRepo.save.mockResolvedValue({ ...asignacion, activo: false });

      const result = await service.update('user-1', 'vehicle-1', { activo: false });

      expect(result.activo).toBe(false);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        ASIGNACION_EVENTS.MODIFICADA,
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
    it('elimina la asignación y emite evento ELIMINADA', async () => {
      const asignacion = { userId: 'user-1', vehicleId: 'vehicle-1', activo: true };
      asignacionRepo.findOne.mockResolvedValue(asignacion);
      asignacionRepo.remove.mockResolvedValue(undefined);

      await service.remove('user-1', 'vehicle-1');

      expect(asignacionRepo.remove).toHaveBeenCalledWith(asignacion);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        ASIGNACION_EVENTS.ELIMINADA,
        expect.any(Object),
      );
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('retorna la asignación existente', async () => {
      const asignacion = { userId: 'user-1', vehicleId: 'vehicle-1', activo: true };
      asignacionRepo.findOne.mockResolvedValue(asignacion);

      const result = await service.findOne('user-1', 'vehicle-1');
      expect(result).toEqual(asignacion);
    });

    it('lanza NotFoundException si no existe', async () => {
      asignacionRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('user-x', 'vehicle-x')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── RF3: Flota ──────────────────────────────────────────────────────────────

  describe('findFlotaByPropietario', () => {
    it('retorna flota con detalles de vehículos', async () => {
      mockPersonasClient.findById.mockResolvedValue({ id: 'user-1' });
      asignacionRepo.find.mockResolvedValue([
        { userId: 'user-1', vehicleId: 'v-1', activo: true, fechaAsignacion: new Date() },
      ]);
      mockVehiculosClient.findById.mockResolvedValue({
        id: 'v-1',
        placa: 'ABC-1234',
        clasificacion: 'ELECTRICO',
        marca: 'Toyota',
        modelo: 'Corolla',
        color: 'Blanco',
        anio: 2022,
      });

      const result = await service.findFlotaByPropietario('user-1');

      expect(result.userId).toBe('user-1');
      expect(result.totalVehiculos).toBe(1);
      expect(result.vehiculos[0].categoria).toBe('ELECTRICO');
    });
  });

  // ─── Trazabilidad queries ─────────────────────────────────────────────────────

  describe('findTrazabilidad', () => {
    it('retorna historial ordenado por timestamp descendente', async () => {
      const registros = [
        { id: '1', userId: 'user-1', vehicleId: 'v-1', tipoAccion: 'CREACION' },
      ];
      trazabilidadRepo.find.mockResolvedValue(registros);

      const result = await service.findTrazabilidad('user-1', 'v-1');
      expect(result).toEqual(registros);
      expect(trazabilidadRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', vehicleId: 'v-1' } }),
      );
    });
  });
});
