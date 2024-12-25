import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';

async function bootstrap(): Promise<void> {
  const logger = new Logger('bootstrap');
  const port = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  setupSwagger(app);

  await app.listen(port);

  logger.log(`Running on ${process.env.NODE_ENV} environment`);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
