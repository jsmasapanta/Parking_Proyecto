import { ApiProperty } from '@nestjs/swagger';

export class VehiculoDetalleDto {
  @ApiProperty() vehicleId: string;
  @ApiProperty() placa: string;
  @ApiProperty({ description: 'Tipo: auto, camioneta, motocicleta' }) tipo: string;
  @ApiProperty({ description: 'Categoría energética: ELECTRICO, HIBRIDO, GASOLINA, DIESEL' }) categoria: string;
  @ApiProperty() marca: string;
  @ApiProperty() modelo: string;
  @ApiProperty() color: string;
  @ApiProperty() anio: number;
  @ApiProperty() fechaAsignacion: Date;
}

export class FlotaResponseDto {
  @ApiProperty() userId: string;
  @ApiProperty() totalVehiculos: number;
  @ApiProperty({ type: [VehiculoDetalleDto] }) vehiculos: VehiculoDetalleDto[];
}
