import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { IStorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor() {
    this.logger.log('S3 Storage Provider Initialized (Skeleton)');
    // Initialize aws-sdk/client-s3 here when needed
  }

  async uploadFile(file: Express.Multer.File, path?: string): Promise<string> {
    throw new NotImplementedException('S3 upload not implemented yet');
  }

  async deleteFile(fileUrl: string): Promise<void> {
    throw new NotImplementedException('S3 delete not implemented yet');
  }

  getFileUrl(path: string): string {
    throw new NotImplementedException('S3 get URL not implemented yet');
  }

  generatePresignedUrl(path: string, expiresInSeconds: number): Promise<string> | string {
    throw new NotImplementedException('S3 presigned URL not implemented yet');
  }
}
