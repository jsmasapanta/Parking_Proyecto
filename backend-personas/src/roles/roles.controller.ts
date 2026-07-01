import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('roles')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'ROOT')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear rol (ADMIN, ROOT)' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles (ADMIN, ROOT)' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Post('assign')
  @ApiOperation({ summary: 'Asignar rol a usuario (ADMIN, ROOT)' })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.assignRole(assignRoleDto);
  }

  @Get('by-role/:name')
  @ApiOperation({ summary: 'Usuarios por rol (ADMIN, ROOT)' })
  findByRole(@Param('name') name: string) {
    return this.rolesService.findByRole(name);
  }
}
