import { DataSourceOptions } from 'typeorm';
/**
 * Configuración compartida de base de datos
 * Usada tanto por NestJS (runtime) como por TypeORM CLI (migraciones)
 */
export const getDatabaseConfig = (): DataSourceOptions => {
    const config: DataSourceOptions = {
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'trucking_db',

        // Entidades
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],

        // Migraciones
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],

        // Configuraciones
        synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
        migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
        logging: process.env.DATABASE_LOGGING === 'true',

        // Seguridad
        dropSchema: false,
    };

    console.log('=== Database Configuration ===');
    console.log(`Host: ${config.host}`);
    console.log(`Port: ${config['port']}`);
    console.log(`User: ${config['username']}`);
    console.log(`DB: ${config['database']}`);
    console.log('==============================');

    return config;
};
