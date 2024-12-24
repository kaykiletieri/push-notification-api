import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const logger = new Logger('bootstrap');
  const port = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule);
  await app.listen(port);

  logger.log(`Running on ${process.env.NODE_ENV} environment`);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
