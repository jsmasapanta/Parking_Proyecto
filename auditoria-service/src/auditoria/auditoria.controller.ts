import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('auditoria')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Registrar evento de auditoría (interno — otros microservicios)' })
  registrar(@Body() dto: CreateEventoDto) {
    return this.auditoriaService.registrar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos (requiere token)' })
  @ApiQuery({ name: 'servicio', required: false })
  @ApiQuery({ name: 'accion', required: false })
  findAll(@Query('servicio') servicio?: string, @Query('accion') accion?: string) {
    return this.auditoriaService.findAll(servicio, accion);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Eventos por usuario (requiere token)' })
  findByUsuario(@Query('usuarioId') usuarioId: string) {
    return this.auditoriaService.findByUsuario(usuarioId);
  }
}
