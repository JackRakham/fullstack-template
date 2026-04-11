import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { GcpStorageProvider } from './providers/gcp-storage.provider';
import { MediaEntity } from './entities/media.entity';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { ConfigKey } from 'src/config/config.keys';
import { MediaStorageTypeEnum } from 'src/shared/models/enums/media-storage-type.enum';

import { STORAGE_SERVICE, STORAGE_PROVIDER_REGISTRY } from './storage.constants';

const storageProviders = [
  LocalStorageProvider,
  S3StorageProvider,
  GcpStorageProvider,
];

const storageProviderRegistryFactory = {
  provide: STORAGE_PROVIDER_REGISTRY,
  useFactory: (
    local: LocalStorageProvider,
    s3: S3StorageProvider,
    gcp: GcpStorageProvider,
  ) => {
    return {
      [MediaStorageTypeEnum.LOCAL]: local,
      [MediaStorageTypeEnum.S3]: s3,
      [MediaStorageTypeEnum.GCS]: gcp,
    };
  },
  inject: [LocalStorageProvider, S3StorageProvider, GcpStorageProvider],
};

const activeStorageProviderFactory = {
  provide: STORAGE_SERVICE,
  useFactory: (configService: ConfigService, registry: any) => {
    const providerType = configService.get<string>(ConfigKey.STORAGE_PROVIDER) || 'local';
    const logger = new Logger('StorageModule');

    const provider = registry[providerType];
    if (!provider) {
      logger.warn(`Provider type "${providerType}" not found in registry. Falling back to local.`);
      return registry[MediaStorageTypeEnum.LOCAL];
    }

    logger.log(`Active Storage Provider: ${providerType}`);
    return provider;
  },
  inject: [ConfigService, STORAGE_PROVIDER_REGISTRY],
};

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MediaEntity])],
  providers: [
    ...storageProviders,
    storageProviderRegistryFactory,
    activeStorageProviderFactory,
    StorageService,
  ],
  controllers: [StorageController],
  exports: [STORAGE_SERVICE, STORAGE_PROVIDER_REGISTRY, StorageService, TypeOrmModule],
})
export class StorageModule {}
