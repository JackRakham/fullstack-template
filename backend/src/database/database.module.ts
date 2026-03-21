import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

/**
 * Módulo de base de datos
 * Usa configuración compartida de database.config.ts
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => getDatabaseConfig() as any,
    }),
  ],
})
export class DatabaseModule { }
