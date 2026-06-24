import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAsignacionDto {
  @ApiProperty({ description: 'ID del usuario propietario (parte 1 de la clave compuesta)' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'ID del vehículo a asignar (parte 2 de la clave compuesta)' })
  @IsString()
  @IsNotEmpty()
  vehicleId: string;
}
