import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEntity } from './entities/media.entity';
import { IStorageProvider } from './interfaces/storage-provider.interface';
import { STORAGE_SERVICE, STORAGE_PROVIDER_REGISTRY } from './storage.constants';
import { MediaStorageTypeEnum } from 'src/shared/models/enums/media-storage-type.enum';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/config/config.keys';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageProvider: IStorageProvider,

    @Inject(STORAGE_PROVIDER_REGISTRY)
    private readonly providerRegistry: Record<string, IStorageProvider>,

    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,

    private readonly configService: ConfigService,
  ) {}

  private getProviderForMedia(media: MediaEntity): IStorageProvider {
    const provider = this.providerRegistry[media.storage_type];
    if (!provider) {
      this.logger.error(`No provider found for storage type: ${media.storage_type}`);
      // Fallback to active provider if possible, but this is a state error
      return this.storageProvider;
    }
    return provider;
  }

  async uploadFile(file: Express.Multer.File, title?: string, customPath?: string): Promise<MediaEntity> {
    const uploadedPath = await this.storageProvider.uploadFile(file, customPath);
    const providerType = this.configService.get<string>(ConfigKey.STORAGE_PROVIDER) || 'local';

    let storageType = MediaStorageTypeEnum.LOCAL;
    switch (providerType) {
      case 's3':
        storageType = MediaStorageTypeEnum.S3;
        break;
      case 'gcs':
        storageType = MediaStorageTypeEnum.GCS;
        break;
      default:
        storageType = MediaStorageTypeEnum.LOCAL;
    }

    const media = this.mediaRepository.create({
      title: title || file.originalname,
      mimetype: file.mimetype,
      path: uploadedPath,
      storage_type: storageType,
      size: file.size,
    });

    const savedMedia = await this.mediaRepository.save(media);
    this.logger.log(`Successfully uploaded file [${savedMedia.id}] to provider ${storageType}: ${uploadedPath}`);
    return savedMedia;
  }

  async saveExternalLink(title: string, url: string): Promise<MediaEntity> {
    const media = this.mediaRepository.create({
      title,
      mimetype: 'application/octet-stream', // Default for unknown external links
      path: url,
      storage_type: MediaStorageTypeEnum.EXTERNAL,
      size: 0,
    });

    const savedMedia = await this.mediaRepository.save(media);
    this.logger.log(`Saved external media link [${savedMedia.id}]: ${url}`);
    return savedMedia;
  }

  async getMedia(id: number): Promise<MediaEntity> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      this.logger.warn(`Media lookup failed: ID ${id} not found`);
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async getServeUrl(id: number): Promise<string> {
    const media = await this.getMedia(id);

    if (media.storage_type === MediaStorageTypeEnum.EXTERNAL) {
      this.logger.debug(`Serving external URL directly for media [${media.id}]`);
      return media.path; // Redirect directly to the external link
    }

    const provider = this.getProviderForMedia(media);
    const serveUrl = provider.getFileUrl(media.path);
    this.logger.debug(`Generated serve URL for media [${media.id}] via ${media.storage_type} provider`);
    return serveUrl;
  }

  async generatePresignedUrl(id: number, expiresInSeconds: number = 3600): Promise<string> {
    const media = await this.getMedia(id);

    if (media.storage_type === MediaStorageTypeEnum.EXTERNAL) {
      this.logger.debug(`Serving external URL directly for media [${media.id}] presign`);
      return media.path;
    }

    const provider = this.getProviderForMedia(media);
    const url = await provider.generatePresignedUrl(media.path, expiresInSeconds);
    this.logger.debug(`Generated presigned URL for media [${media.id}] via ${media.storage_type} provider`);
    return url;
  }

  async resolveFilePath(media: MediaEntity): Promise<string> {
    if (media.storage_type === MediaStorageTypeEnum.LOCAL) {
      return path.join(process.cwd(), 'uploads', media.path);
    }

    throw new Error(`Resolving physical path for storage type ${media.storage_type} is not implemented yet`);
  }

  async deleteMedia(id: number): Promise<void> {
    const media = await this.getMedia(id);

    if (media.storage_type !== MediaStorageTypeEnum.EXTERNAL) {
      this.logger.log(`Invoking provider delete for physical file: ${media.path} (Media ID: ${id}, Type: ${media.storage_type})`);
      const provider = this.getProviderForMedia(media);
      await provider.deleteFile(media.path);
    } else {
      this.logger.log(`Media [${id}] is EXTERNAL; skipping provider file deletion`);
    }

    await this.mediaRepository.remove(media);
    this.logger.log(`Successfully removed MediaEntity [${id}] from database`);
  }
}
