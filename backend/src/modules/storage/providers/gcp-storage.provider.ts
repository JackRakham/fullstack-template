import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { IStorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class GcpStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(GcpStorageProvider.name);

  constructor() {
    this.logger.log('GCP Storage Provider Initialized (Skeleton)');
    // Initialize @google-cloud/storage here when needed
  }

  async uploadFile(file: Express.Multer.File, path?: string): Promise<string> {
    throw new NotImplementedException('GCP upload not implemented yet');
  }

  async deleteFile(fileUrl: string): Promise<void> {
    throw new NotImplementedException('GCP delete not implemented yet');
  }

  getFileUrl(path: string): string {
    throw new NotImplementedException('GCP get URL not implemented yet');
  }

  generatePresignedUrl(path: string, expiresInSeconds: number): Promise<string> | string {
    throw new NotImplementedException('GCP presigned URL not implemented yet');
  }
}
