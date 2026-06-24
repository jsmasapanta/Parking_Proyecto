import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Asignaciones Service')
    .setDescription('Microservicio de Asignación y Trazabilidad de Vehículos a Propietarios')
    .setVersion('1.0')
    .addTag('asignaciones')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3005);
  console.log(`Asignaciones Service corriendo en: http://localhost:${process.env.PORT ?? 3005}`);
  console.log(`Swagger: http://localhost:${process.env.PORT ?? 3005}/api/docs`);
}
bootstrap();
