import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Enumeración de TTLs comunes para el caché (en milisegundos)
 */
export enum CacheTTL {
    ONE_MINUTE = 60 * 1000,
    FIVE_MINUTES = 5 * 60 * 1000,
    TEN_MINUTES = 10 * 60 * 1000,
    FIFTEEN_MINUTES = 15 * 60 * 1000,
    THIRTY_MINUTES = 30 * 60 * 1000,
    ONE_HOUR = 60 * 60 * 1000,
    ONE_DAY = 24 * 60 * 60 * 1000,
}

/**
 * Prefijos para las llaves del caché
 */
export enum CacheKey {
    USER_PROFILE = 'user:profile',
    USER_PERMISSIONS = 'user:permissions',
    USER_ROLES = 'user:roles',
    PROJECT = 'project',
    CONTRACT = 'contract',
    CONTRACT_ALIASES = 'contract:aliases',
    STANDARD = 'standard',
    MATRIX = 'matrix',
    SURVEY = 'survey',
    CALENDAR_STAGES = 'calendar:stages',
    STAGE_ACTIVITIES = 'stage:activities',
    STRATEGY_NODE_ASSIGNMENTS = 'strategy_node_assignments',
    STRATEGY_USER_ASSIGNMENTS = 'strategy_user_assignments',
}

/**
 * Servicio utilitario para operaciones de caché
 * Simplifica el uso del cache manager en toda la aplicación
 * Maneja gracefully cuando Redis no está disponible
 */
@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);
    private cacheAvailable = true;
    private redisClient: any = null;
    private static redisStoreInstance: any = null; // Store Redis original

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        // Intentar obtener el cliente de Redis al inicializar
        this.initializeRedisClient();
    }

    /**
     * Método estático para guardar la referencia al store de Redis original
     * Llamado desde app.module.ts antes de que Keyv lo envuelva
     */
    static setRedisStore(store: any): void {
        CacheService.redisStoreInstance = store;
        // Usamos Logger estático o simplemente dejamos que Nest lo maneje en el arranque
        new Logger('CacheService').log('✅ Redis store reference saved');
    }

    /**
     * Intenta obtener el cliente de Redis del cache manager
     */
    private async initializeRedisClient() {
        try {
            // Usar el store original guardado antes de que Keyv lo envuelva
            if (CacheService.redisStoreInstance) {
                const store = CacheService.redisStoreInstance;

                if (store.client && typeof store.client.scanIterator === 'function') {
                    this.redisClient = store.client;
                    // Solo logear la primera vez para evitar spam
                    if (!CacheService['_clientInitialized']) {
                        this.logger.log('✅ Redis client initialized for efficient pattern deletion');
                        CacheService['_clientInitialized'] = true;
                    }
                    return;
                }
            }

            this.logger.warn('⚠️  Redis client not available - pattern deletion will use fallback (manual key iteration)');
        } catch (error) {
            this.logger.warn(`⚠️  Error initializing Redis client: ${error.message}`);
        }
    }

    /**
     * Obtiene un valor del caché
     * @param key - La llave del valor
     * @returns El valor almacenado o undefined si no existe
     */
    async get<T>(key: string): Promise<T | undefined> {
        if (!this.cacheAvailable) {
            return undefined;
        }

        try {
            // Si tenemos cliente Redis, usarlo directamente
            if (this.redisClient) {
                const value = await this.redisClient.get(key);
                if (value) {
                    return JSON.parse(value) as T;
                }
                return undefined;
            }

            // Fallback a cache manager
            return await this.cacheManager.get<T>(key);
        } catch (error) {
            this.logger.warn(`⚠️  Cache no disponible [get:${key}]`);
            this.cacheAvailable = false;
            return undefined;
        }
    }

    /**
     * Guarda un valor en el caché
     * @param key - La llave para almacenar el valor
     * @param value - El valor a almacenar
     * @param ttl - Tiempo de vida en milisegundos (opcional, usa el TTL por defecto si no se especifica)
     */
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        if (!this.cacheAvailable) {
            return;
        }

        try {
            // Si tenemos cliente Redis, usarlo directamente
            if (this.redisClient) {
                const serializedValue = JSON.stringify(value);
                if (ttl) {
                    await this.redisClient.set(key, serializedValue, { PX: ttl });
                } else {
                    await this.redisClient.set(key, serializedValue);
                }
                return;
            }

            // Fallback a cache manager
            await this.cacheManager.set(key, value, ttl);
        } catch (error) {
            this.logger.warn(`⚠️  Cache no disponible [set:${key}]`);
            this.cacheAvailable = false;
        }
    }

    /**
     * Elimina un valor del caché
     * @param key - La llave del valor a eliminar
     */
    async del(key: string): Promise<void> {
        if (!this.cacheAvailable) {
            return;
        }

        try {
            // Si tenemos cliente Redis, usarlo directamente
            if (this.redisClient) {
                await this.redisClient.del(key);
                return;
            }

            // Fallback a cache manager
            await this.cacheManager.del(key);
        } catch (error) {
            this.logger.warn(`⚠️  Cache no disponible [del:${key}]`);
            this.cacheAvailable = false;
        }
    }

    /**
     * Elimina múltiples valores del caché por patrón usando Redis SCAN
     * @param pattern - El patrón de las llaves a eliminar (ej: "user:profile:*")
     * @returns El número de llaves eliminadas
     */
    async delPattern(pattern: string): Promise<number> {
        if (!this.cacheAvailable) {
            return 0;
        }

        try {
            // Intentar usar el cliente Redis directo para máxima eficiencia
            if (this.redisClient && typeof this.redisClient.scanIterator === 'function') {
                const keys: string[] = [];

                // Usar SCAN de Redis para encontrar keys que coincidan
                for await (const key of this.redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
                    keys.push(key);
                }

                if (keys.length > 0) {
                    const deletedCount = await this.redisClient.del(keys);
                    this.logger.log(`✅ Deleted ${deletedCount} keys matching pattern: ${pattern}`);
                    return deletedCount;
                }

                return 0;
            }

            // Fallback: usar cache-manager con iteración manual
            this.logger.warn(`⚠️  Using fallback method for pattern: ${pattern}`);

            const stores = (this.cacheManager as any).stores;
            if (!stores || !Array.isArray(stores) || stores.length === 0) {
                return 0;
            }

            let totalDeletedCount = 0;
            const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');

            for (const store of stores) {
                try {
                    if (store && typeof store.iterator === 'function') {
                        const keys: string[] = [];

                        for await (const [key] of store.iterator()) {
                            if (regexPattern.test(key)) {
                                keys.push(key);
                            }
                        }

                        for (const key of keys) {
                            await store.delete(key);
                            totalDeletedCount++;
                        }
                    }
                } catch (storeError) {
                    console.warn(`⚠️  Error in fallback deletion:`, storeError.message);
                }
            }

            if (totalDeletedCount > 0) {
                console.log(`✅ [CacheService] Deleted ${totalDeletedCount} keys using fallback`);
            }

            return totalDeletedCount;
        } catch (error) {
            console.warn(`⚠️  Error deleting cache pattern [${pattern}]:`, error.message);
            return 0;
        }
    }

    /**
     * Resetea todo el caché
     * USAR CON PRECAUCIÓN
     */
    async reset(): Promise<void> {
        try {
            await (this.cacheManager as any).reset?.();
        } catch (error) {
            console.error('Error reseteando el caché:', error);
        }
    }

    /**
     * Genera una llave de caché con prefijo
     * @param prefix - El prefijo (usar CacheKey enum)
     * @param id - El identificador único
     * @returns La llave formateada
     */
    static generateKey(prefix: CacheKey | string, id: string | number): string {
        return `${prefix}:${id}`;
    }

    /**
     * Helper para ejecutar una función con caché
     * Si el valor existe en caché, lo retorna; si no, ejecuta la función, guarda el resultado y lo retorna
     * @param key - La llave del caché
     * @param fn - La función a ejecutar si no hay caché
     * @param ttl - Tiempo de vida en milisegundos
     * @returns El valor del caché o el resultado de la función
     */
    async getOrSet<T>(
        key: string,
        fn: () => Promise<T>,
        ttl: number = CacheTTL.FIVE_MINUTES,
    ): Promise<T> {
        try {
            // Intentar obtener del caché
            const cached = await this.get<T>(key);
            if (cached !== undefined) {
                return cached;
            }

            // Si no existe, ejecutar la función
            const result = await fn();

            // Guardar en caché
            await this.set(key, result, ttl);

            return result;
        } catch (error) {
            console.error(`Error en getOrSet [${key}]:`, error);
            // Si hay error, ejecutar la función directamente sin caché
            return await fn();
        }
    }
}
