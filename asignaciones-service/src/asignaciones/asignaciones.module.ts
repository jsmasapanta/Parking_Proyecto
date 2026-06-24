import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionVehiculo } from './entities/asignacion-vehiculo.entity';
import { TrazabilidadAsignacion } from './entities/trazabilidad.entity';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { TrazabilidadListener } from './listeners/trazabilidad.listener';
import { ExternalModule } from '../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsignacionVehiculo, TrazabilidadAsignacion]),
    ExternalModule,
  ],
  controllers: [AsignacionesController],
  providers: [AsignacionesService, TrazabilidadListener],
})
export class AsignacionesModule {}
