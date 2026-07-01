import { IsNotEmpty, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'La cédula debe tener exactamente 10 dígitos numéricos' })
  cedula: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Matches(/^[A-Z]{3}-?\d{3,4}$/, { message: 'Formato de placa inválido (ej: ABC-1234)' })
  placa: string;

  @IsUUID('4', { message: 'El zonaId debe ser un UUID válido' })
  zonaId: string;
}
