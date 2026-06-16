import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Cocktails API')
    .setDescription('API for managing and searching cocktails database')
    .setVersion('1.0')
    .addTag('cocktails')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log("Backend listening on port 3000")
}
bootstrap();
