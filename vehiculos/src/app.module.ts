import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { Vehiculo } from './vehiculos/entities/vehiculo.entity';
import { Auto } from './vehiculos/entities/auto.entity';
import { Motocicleta } from './vehiculos/entities/motocicleta.entity';
import { Camioneta } from './vehiculos/entities/camioneta.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USUARIO'),
        password: configService.get('DB_CONTRASENA'),
        database: configService.get('DB_NOMBRE'),
        entities: [Vehiculo, Auto, Motocicleta, Camioneta],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'parking_secret_2026'),
        signOptions: { expiresIn: 86400 },
      }),
      inject: [ConfigService],
    }),
    VehiculosModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
