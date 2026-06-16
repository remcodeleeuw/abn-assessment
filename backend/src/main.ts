import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  await app.listen(3000);
  console.log("Backend listening on port 3000")
}
bootstrap();
