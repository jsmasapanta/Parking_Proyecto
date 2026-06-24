import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PersonasClient } from './personas.client';
import { VehiculosClient } from './vehiculos.client';

@Module({
  imports: [HttpModule],
  providers: [PersonasClient, VehiculosClient],
  exports: [PersonasClient, VehiculosClient],
})
export class ExternalModule {}
