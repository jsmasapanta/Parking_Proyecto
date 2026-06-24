import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAsignacionDto {
  @ApiPropertyOptional({ description: 'Cambiar estado activo/inactivo de la asignación' })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
