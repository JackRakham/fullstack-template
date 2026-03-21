import { DataSource } from 'typeorm';
import { getDatabaseConfig } from './database.config';

/**
 * DataSource para TypeORM CLI
 * Usado por comandos de migración: migration:run, migration:create, etc.
 */
export const AppDataSource = new DataSource(getDatabaseConfig());
