import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Post('entrada')
  @ApiOperation({ summary: 'Registrar entrada al parqueadero' })
  crearEntrada(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.crearEntrada(createTicketDto);
  }

  @UseGuards(RolesGuard)
  @Roles('RECAUDADOR', 'ADMIN', 'ROOT')
  @Patch('salida/:ticketId')
  @ApiOperation({ summary: 'Procesar salida y calcular tarifa (RECAUDADOR, ADMIN, ROOT)' })
  procesarSalida(@Param('ticketId') ticketId: string, @Request() req: any) {
    return this.ticketsService.procesarSalida(ticketId, req.user?.username);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'ROOT')
  @Patch(':ticketId/anular')
  @ApiOperation({ summary: 'Anular un ticket activo (ADMIN, ROOT)' })
  anularTicket(@Param('ticketId') ticketId: string, @Request() req: any) {
    return this.ticketsService.anularTicket(ticketId, req.user?.username);
  }

  @UseGuards(RolesGuard)
  @Roles('RECAUDADOR', 'ADMIN', 'ROOT')
  @Get('activos')
  @ApiOperation({ summary: 'Ver tickets activos (RECAUDADOR, ADMIN, ROOT)' })
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
