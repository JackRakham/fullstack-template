import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEntity } from './entities/media.entity';
import { IStorageProvider } from './interfaces/storage-provider.interface';
import { STORAGE_SERVICE } from './storage.constants';
import { MediaStorageTypeEnum } from 'src/shared/models/enums/media-storage-type.enum';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/config/config.keys';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageProvider: IStorageProvider,

    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,

    private readonly configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File, title?: string, customPath?: string): Promise<MediaEntity> {
    const uploadedPath = await this.storageProvider.uploadFile(file, customPath);
    const providerType = this.configService.get<string>(ConfigKey.STORAGE_PROVIDER);

    const storageType = providerType === 's3' ? MediaStorageTypeEnum.S3 
                      : providerType === 'gcs' ? MediaStorageTypeEnum.GCS 
                      : MediaStorageTypeEnum.LOCAL;

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

    const serveUrl = this.storageProvider.getFileUrl(media.path);
    this.logger.debug(`Generated serve URL for media [${media.id}] via active provider`);
    return serveUrl;
  }

  async deleteMedia(id: number): Promise<void> {
    const media = await this.getMedia(id);

    if (media.storage_type !== MediaStorageTypeEnum.EXTERNAL) {
      this.logger.log(`Invoking provider delete for physical file: ${media.path} (Media ID: ${id})`);
      await this.storageProvider.deleteFile(media.path);
    } else {
      this.logger.log(`Media [${id}] is EXTERNAL; skipping provider file deletion`);
    }

    await this.mediaRepository.remove(media);
    this.logger.log(`Successfully removed MediaEntity [${id}] from database`);
  }
}
