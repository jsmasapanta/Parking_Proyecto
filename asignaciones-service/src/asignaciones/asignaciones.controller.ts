import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { AsignacionVehiculo } from './entities/asignacion-vehiculo.entity';
import { TrazabilidadAsignacion } from './entities/trazabilidad.entity';
import { FlotaResponseDto } from './dto/flota-response.dto';

@ApiTags('asignaciones')
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly service: AsignacionesService) {}

  @Post()
  @ApiOperation({ summary: 'RF1 — Asignar un vehículo a un propietario' })
  @ApiResponse({ status: 201, type: AsignacionVehiculo })
  @ApiResponse({ status: 409, description: 'Vehículo ya tiene propietario activo' })
  create(@Body() dto: CreateAsignacionDto): Promise<AsignacionVehiculo> {
    return this.service.create(dto);
  }

  // Rutas estáticas ANTES que las parametrizadas para evitar conflictos de enrutamiento
  @Get('trazabilidad')
  @ApiOperation({ summary: 'RF2 — Listar todo el historial de auditoría' })
  @ApiResponse({ status: 200, type: [TrazabilidadAsignacion] })
  findAllTrazabilidad(): Promise<TrazabilidadAsignacion[]> {
    return this.service.findAllTrazabilidad();
  }

  @Get('propietario/:userId')
  @ApiOperation({ summary: 'RF3 — Consultar flota de vehículos de un propietario' })
  @ApiParam({ name: 'userId', description: 'ID del propietario' })
  @ApiResponse({ status: 200, type: FlotaResponseDto })
  findFlota(@Param('userId') userId: string): Promise<FlotaResponseDto> {
    return this.service.findFlotaByPropietario(userId);
  }

  @Get(':userId/:vehicleId')
  @ApiOperation({ summary: 'Obtener una asignación específica por clave compuesta' })
  @ApiParam({ name: 'userId', description: 'ID del propietario' })
  @ApiParam({ name: 'vehicleId', description: 'ID del vehículo' })
  @ApiResponse({ status: 200, type: AsignacionVehiculo })
  findOne(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<AsignacionVehiculo> {
    return this.service.findOne(userId, vehicleId);
  }

  @Patch(':userId/:vehicleId')
  @ApiOperation({ summary: 'RF1/RF2 — Modificar estado de una asignación' })
  @ApiResponse({ status: 200, type: AsignacionVehiculo })
  update(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
    @Body() dto: UpdateAsignacionDto,
  ): Promise<AsignacionVehiculo> {
    return this.service.update(userId, vehicleId, dto);
  }

  @Delete(':userId/:vehicleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'RF2 — Eliminar asignación (genera registro de auditoría)' })
  @ApiResponse({ status: 204 })
  remove(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<void> {
    return this.service.remove(userId, vehicleId);
  }

  @Get(':userId/:vehicleId/trazabilidad')
  @ApiOperation({ summary: 'RF2 — Historial de auditoría de una asignación específica' })
  @ApiParam({ name: 'userId', description: 'ID del propietario' })
  @ApiParam({ name: 'vehicleId', description: 'ID del vehículo' })
  @ApiResponse({ status: 200, type: [TrazabilidadAsignacion] })
  findTrazabilidad(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<TrazabilidadAsignacion[]> {
    return this.service.findTrazabilidad(userId, vehicleId);
  }
}
