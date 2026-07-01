import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Registrar nueva persona (público)' })
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'ROOT')
  @Get()
  @ApiOperation({ summary: 'Listar todas las personas (ADMIN, ROOT)' })
  findAll() {
    return this.personasService.findAll();
  }

  @Public()
  @Get('cedula/:cedula')
  @ApiOperation({ summary: 'Buscar por cédula (público — usado por tickets-service)' })
  findByCedula(@Param('cedula') cedula: string) {
    return this.personasService.findByCedula(cedula);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'ROOT')
  @Get('username/:username')
  @ApiOperation({ summary: 'Buscar por username (ADMIN, ROOT)' })
  findByUsername(@Param('username') username: string) {
    return this.personasService.findByUsername(username);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'ROOT')
  @Get('apellido/:apellido')
  @ApiOperation({ summary: 'Buscar por apellido (ADMIN, ROOT)' })
  findByApellido(@Param('apellido') apellido: string) {
    return this.personasService.findByApellido(apellido);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar persona por ID (público — usado por asignaciones-service)' })
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'ROOT')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar persona (ADMIN, ROOT)' })
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'ROOT')
  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado activo/inactivo (ADMIN, ROOT)' })
  cambiarEstado(@Param('id') id: string, @Body() body: { active: boolean }) {
    return this.personasService.cambiarEstado(id, body.active);
  }

  @UseGuards(RolesGuard)
  @Roles('ROOT')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar persona (ROOT)' })
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}
