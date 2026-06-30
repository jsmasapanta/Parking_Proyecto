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
import { Public } from '../auth/public.decorator';

@ApiTags('asignaciones')
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly service: AsignacionesService) {}

  @Post()
  @ApiOperation({ summary: 'RF1 — Asignar vehículo a propietario (requiere token)' })
  @ApiResponse({ status: 201, type: AsignacionVehiculo })
  @ApiResponse({ status: 409, description: 'Vehículo ya tiene propietario activo' })
  create(@Body() dto: CreateAsignacionDto): Promise<AsignacionVehiculo> {
    return this.service.create(dto);
  }

  @Get('trazabilidad')
  @ApiOperation({ summary: 'RF2 — Historial completo de auditoría (requiere token)' })
  @ApiResponse({ status: 200, type: [TrazabilidadAsignacion] })
  findAllTrazabilidad(): Promise<TrazabilidadAsignacion[]> {
    return this.service.findAllTrazabilidad();
  }

  @Public()
  @Get('propietario/:userId')
  @ApiOperation({ summary: 'RF3 — Consultar flota de un propietario (público — rol invitado)' })
  @ApiParam({ name: 'userId', description: 'ID del propietario' })
  @ApiResponse({ status: 200, type: FlotaResponseDto })
  findFlota(@Param('userId') userId: string): Promise<FlotaResponseDto> {
    return this.service.findFlotaByPropietario(userId);
  }

  @Public()
  @Get(':userId/:vehicleId')
  @ApiOperation({ summary: 'Obtener asignación por clave compuesta (público)' })
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
  @ApiOperation({ summary: 'RF1/RF2 — Modificar asignación (requiere token)' })
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
  @ApiOperation({ summary: 'RF2 — Eliminar asignación (requiere token)' })
  @ApiResponse({ status: 204 })
  remove(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<void> {
    return this.service.remove(userId, vehicleId);
  }

  @Public()
  @Get(':userId/:vehicleId/trazabilidad')
  @ApiOperation({ summary: 'RF2 — Trazabilidad de asignación específica (público)' })
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
