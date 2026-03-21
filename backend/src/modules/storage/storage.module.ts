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

import { STORAGE_SERVICE } from './storage.constants';

const storageProviderFactory = {
  provide: STORAGE_SERVICE,
  useFactory: (configService: ConfigService) => {
    const providerType = configService.get<string>(ConfigKey.STORAGE_PROVIDER);
    const logger = new Logger('StorageModule');

    switch (providerType) {
      case 's3':
        logger.log('Selecting S3 Storage Provider');
        return new S3StorageProvider();
      case 'gcs':
        logger.log('Selecting GCP Storage Provider');
        return new GcpStorageProvider();
      case 'local':
      default:
        logger.log('Selecting Local Storage Provider');
        return new LocalStorageProvider();
    }
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MediaEntity])],
  providers: [storageProviderFactory, StorageService],
  controllers: [StorageController],
  exports: [STORAGE_SERVICE, StorageService, TypeOrmModule], // Export the token and service
})
export class StorageModule {}
