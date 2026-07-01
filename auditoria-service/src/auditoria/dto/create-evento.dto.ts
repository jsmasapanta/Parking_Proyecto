import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { AccionAuditoria } from '../entities/evento-auditoria.entity';

export class CreateEventoDto {
  @ApiProperty({ example: 'tickets-service' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  servicio: string;

  @ApiProperty({ enum: AccionAuditoria })
  @IsEnum(AccionAuditoria)
  accion: AccionAuditoria;

  @ApiProperty({ example: 'jperez', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  usuarioId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  datos?: Record<string, any>;
}
