import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PersonasClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('PERSONAS_SERVICE_URL', 'http://localhost:3001');
  }

  async findById(userId: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/personas/${userId}`),
      );
      return data;
    } catch {
      throw new HttpException(
        `Usuario con id '${userId}' no encontrado en el servicio de personas`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
