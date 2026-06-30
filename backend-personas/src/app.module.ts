import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasModule } from './personas/personas.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin123',
      database: 'db_personas',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    PersonasModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
