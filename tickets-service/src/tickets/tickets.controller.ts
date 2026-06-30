import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Post('entrada')
  @ApiOperation({ summary: 'Registrar entrada al parqueadero (público — rol invitado)' })
  crearEntrada(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.crearEntrada(createTicketDto);
  }

  @Public()
  @Patch('salida/:ticketId')
  @ApiOperation({ summary: 'Procesar salida y calcular tarifa (público — rol invitado)' })
  procesarSalida(@Param('ticketId') ticketId: string) {
    return this.ticketsService.procesarSalida(ticketId);
  }

  @Get('activos')
  @ApiOperation({ summary: 'Ver tickets activos (requiere token — solo administradores)' })
  findActivos() {
    return this.ticketsService.findActivos();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de ticket (público)' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }
}
