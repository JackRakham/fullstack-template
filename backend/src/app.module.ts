import { Module, RequestMethod } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import * as crypto from 'crypto';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';
import { IdentityModule } from './modules/identity/identity.module';
import { NotificationModule } from './modules/notification/notification.module';
import { StorageModule } from './modules/storage/storage.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { JwtAuthGuard } from './modules/identity/auth/guards/jwt-auth.guard';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './modules/audit/interceptors/audit.interceptor';
import { LoggerModule } from 'nestjs-pino';
import { TruckingModule } from './modules/trucking/trucking.module';
import { QueueModule } from './modules/queue/queue.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AiModule } from './modules/integrations/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-correlation-id'] || crypto.randomUUID(),
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport: process.env.NODE_ENV !== 'production'
          ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              levelFirst: true,
              translateTime: 'UTC:mm/dd/yyyy, h:MM:ss TT Z',
            },
          }
          : undefined,
        autoLogging: true,
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
          }),
        },
      },
      exclude: [
        { method: RequestMethod.ALL, path: 'api/docs' },
        { method: RequestMethod.GET, path: 'metrics' },
        { method: RequestMethod.GET, path: 'api/metrics' },
      ],
    }),
    ConfigModule,
    DatabaseModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('cache.ttl'),
        max: configService.get('cache.max'),
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    IdentityModule,
    NotificationModule,
    StorageModule,
    MailerModule,
    TruckingModule,
    QueueModule,
    AuditModule,
    HealthModule,
    MetricsModule,
    AiModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule { }
