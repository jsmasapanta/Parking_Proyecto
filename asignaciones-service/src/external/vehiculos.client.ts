import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VehiculosClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('VEHICULOS_SERVICE_URL', 'http://localhost:3002');
  }

  async findById(vehicleId: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/vehiculos/${vehicleId}`),
      );
      return data;
    } catch {
      throw new HttpException(
        `Vehículo con id '${vehicleId}' no encontrado en el servicio de vehículos`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
