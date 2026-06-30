import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('vehiculos')
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar vehículo (requiere token)' })
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar vehículos (público)' })
  findAll() {
    return this.vehiculosService.findAll();
  }

  @Public()
  @Get('placa/:placa')
  @ApiOperation({ summary: 'Buscar por placa (público — usado por tickets-service)' })
  findByPlaca(@Param('placa') placa: string) {
    return this.vehiculosService.findByPlaca(placa);
  }

  @Public()
  @Get('disponibilidad/:placa')
  @ApiOperation({ summary: 'Verificar disponibilidad (público)' })
  checkDisponibilidad(@Param('placa') placa: string) {
    return this.vehiculosService.checkDisponibilidad(placa);
  }

  @Patch('placa/:placa/estado-parqueo')
  @ApiOperation({ summary: 'Actualizar estado de parqueo (requiere token)' })
  actualizarEstadoParqueo(
    @Param('placa') placa: string,
    @Body() body: { enParqueadero: boolean },
  ) {
    return this.vehiculosService.actualizarEstadoParqueo(placa, body.enParqueadero);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener vehículo por ID (público — usado por asignaciones)' })
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar vehículo (requiere token)' })
  update(
    @Param('id') id: string,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
  ) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar vehículo (requiere token)' })
  remove(@Param('id') id: string) {
    return this.vehiculosService.remove(id);
  }
}
