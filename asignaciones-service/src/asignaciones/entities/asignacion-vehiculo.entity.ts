import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Clave compuesta obligatoria: (user_id, vehicle_id) — RF1
 * Un vehículo sólo puede tener una asignación activa a la vez.
 */
@Entity('asignaciones_vehiculos')
export class AsignacionVehiculo {
  @ApiProperty({ description: 'ID del propietario (clave compuesta)' })
  @PrimaryColumn({ name: 'user_id', type: 'varchar' })
  userId: string;

  @ApiProperty({ description: 'ID del vehículo (clave compuesta)' })
  @PrimaryColumn({ name: 'vehicle_id', type: 'varchar' })
  vehicleId: string;

  @ApiProperty({ description: 'Indica si la asignación está activa' })
  @Column({ default: true })
  activo: boolean;

  @ApiProperty({ description: 'Fecha exacta de la asignación' })
  @Column({ name: 'fecha_asignacion', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaAsignacion: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
