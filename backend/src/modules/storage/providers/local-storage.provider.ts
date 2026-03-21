import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider } from '../interfaces/storage-provider.interface';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Created local upload directory at ${this.uploadDir}`);
    }
  }

  async uploadFile(file: Express.Multer.File, customPath?: string): Promise<string> {
    const filename = `${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`;
    const targetDir = customPath ? path.join(this.uploadDir, customPath) : this.uploadDir;

    if (!fs.existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    await writeFile(filePath, file.buffer);

    this.logger.log(`File saved locally: ${filePath}`);
    
    // Return relative path for URL generation
    return customPath ? `${customPath}/${filename}` : filename;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileUrl);
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
      this.logger.log(`Deleted local file: ${filePath}`);
    } else {
      this.logger.warn(`Attempted to delete non-existent local file: ${filePath}`);
    }
  }

  getFileUrl(filePath: string): string {
    // Assuming you have a static assets middleware serving the '/uploads' folder
    return `/uploads/${filePath}`;
  }
}
