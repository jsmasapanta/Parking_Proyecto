import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of required) {
    if (!configService.get<string>(key)) {
      throw new Error(`Variable de entorno requerida no definida: ${key}`);
    }
  }

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Personas API')
    .setDescription(
      'Microservicio de gestión de personas, usuarios y autenticación JWT. ' +
        'POST /auth/login devuelve el token. Rutas marcadas 🔓 son públicas.',
    )
    .setVersion('1.0')
    .addTag('auth')
    .addTag('personas')
    .addTag('roles')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
}
void bootstrap();