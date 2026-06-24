import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoAccion {
  CREACION = 'CREACION',
  MODIFICACION = 'MODIFICACION',
  ELIMINACION = 'ELIMINACION',
}

/**
 * Registro de auditoría separado — RF2
 * Se genera automáticamente vía Domain Events, nunca de forma directa.
 */
@Entity('trazabilidad_asignaciones')
export class TrazabilidadAsignacion {
  @ApiProperty({ description: 'ID único del evento de auditoría' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID del propietario afectado' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'ID del vehículo afectado' })
  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @ApiProperty({ enum: TipoAccion, description: 'Tipo de acción realizada' })
  @Column({ name: 'tipo_accion', type: 'enum', enum: TipoAccion })
  tipoAccion: TipoAccion;

  @ApiProperty({ description: 'Fecha y hora exacta con zona horaria del evento' })
  @Column({ name: 'timestamp_evento', type: 'timestamptz' })
  timestamp: Date;

  @ApiProperty({ description: 'Estado anterior (null en CREACION)', nullable: true })
  @Column({ name: 'datos_anteriores', type: 'jsonb', nullable: true })
  datosAnteriores: Record<string, any> | null;

  @ApiProperty({ description: 'Estado posterior (null en ELIMINACION)', nullable: true })
  @Column({ name: 'datos_nuevos', type: 'jsonb', nullable: true })
  datosNuevos: Record<string, any> | null;
}
