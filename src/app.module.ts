import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from './modules/clients/clients.module';
import { ScopeModule } from './modules/scope/scope.module';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().default('postgres'),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().default('push_notification_db'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
    
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT') || 5432,
          username: configService.get<string>('DB_USER') || 'postgres',
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE') || 'push_notification_db',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          migrationsTableName: 'migrations',
          synchronize: false,
          migrationsRun: true,
          logging: isDevelopment,
        };
      },
    }),    
    ClientsModule,
    ScopeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
