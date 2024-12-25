import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export function setupSwagger(app: INestApplication): void {
  const environment = process.env.NODE_ENV || 'homologation';

  const title =
    environment === 'production'
      ? 'Push Notification API'
      : `Push Notification API (${environment})`;

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(
      'API to send push notifications to devices using Firebase Cloud Messaging',
    )
    .setVersion(`${process.env.SERVICE_VERSION || '1.0.0'}`)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'Access Token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const theme = new SwaggerTheme();
  const darkStyle = theme.getBuffer(SwaggerThemeNameEnum.DARK);

  SwaggerModule.setup('api', app, document, {
    customCss: darkStyle,
    customSiteTitle: 'Push Notification API - Swagger',
  });
}
