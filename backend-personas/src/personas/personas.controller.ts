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
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Public } from '../auth/decorators/public.decorator';

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

  @Get()
  @ApiOperation({ summary: 'Listar todas las personas (requiere token)' })
  findAll() {
    return this.personasService.findAll();
  }

  @Public()
  @Get('cedula/:cedula')
  @ApiOperation({ summary: 'Buscar por cédula (público — usado por tickets-service)' })
  findByCedula(@Param('cedula') cedula: string) {
    return this.personasService.findByCedula(cedula);
  }

  @Get('username/:username')
  findByUsername(@Param('username') username: string) {
    return this.personasService.findByUsername(username);
  }

  @Get('apellido/:apellido')
  findByApellido(@Param('apellido') apellido: string) {
    return this.personasService.findByApellido(apellido);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar persona por ID (público — usado por asignaciones-service)' })
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { active: boolean },
  ) {
    return this.personasService.cambiarEstado(id, body.active);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personasService.remove(id);
  }
}
