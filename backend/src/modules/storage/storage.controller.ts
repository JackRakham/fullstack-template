import { Controller, Post, Get, Delete, Param, UploadedFile, UseInterceptors, Body, Res, ParseIntPipe, Query, Logger } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { CreateExternalMediaDto } from './dtos/external-media.dto';
import { MediaResponseDto } from './dtos/media.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/config/config.keys';
import { Public } from 'src/modules/identity/auth/decorators/public.decorator';
import * as crypto from 'crypto';
import * as path from 'path';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a local or cloud file' })
  @ApiOkResponse({ type: MediaResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.uploadFile(file);
  }

  @Post('external')
  @ApiOperation({ summary: 'Save an external media link' })
  async saveExternalLink(@Body() dto: CreateExternalMediaDto) {
    return this.storageService.saveExternalLink(dto.title, dto.url);
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Serve local media securely via HMAC signature' })
  async servePublicMedia(
    @Query('path') filePath: string,
    @Query('expires') expires: number,
    @Query('signature') signature: string,
    @Res() res: Response
  ) {
    if (!filePath || !expires || !signature) {
      return res.status(401).json({ message: 'Missing auth parameters' });
    }
    
    if (Date.now() > expires) {
      return res.status(410).json({ message: 'Presigned URL has expired' });
    }

    const secret = this.configService.get<string>(ConfigKey.JWT_SECRET) || 'fallback_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(`${filePath}:${expires}`)
      .digest('hex');

    if (Buffer.from(signature).length !== Buffer.from(expectedSignature).length || 
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return res.status(403).json({ message: 'Invalid signature' });
    }

    const safePath = path.join(process.cwd(), 'uploads', filePath);
    if (!safePath.startsWith(path.join(process.cwd(), 'uploads'))) {
      return res.status(403).json({ message: 'Invalid path' });
    }

    return res.sendFile(safePath);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get metadata of a media entity' })
  async getMedia(@Param('id', ParseIntPipe) id: number) {
    return this.storageService.getMedia(id);
  }

  @Get(':id/serve')
  @ApiOperation({ summary: 'Serve or redirect to the actual media file' })
  async serveMedia(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const serveUrl = await this.storageService.getServeUrl(id);
    return res.redirect(serveUrl);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media entity and its underlying file' })
  async deleteMedia(@Param('id', ParseIntPipe) id: number) {
    return this.storageService.deleteMedia(id);
  }

  @Get(':id/presign')
  @ApiOperation({ summary: 'Generate a short-lived presigned URL to view the file publicly' })
  async getPresignedUrl(@Param('id', ParseIntPipe) id: number) {
    const url = await this.storageService.generatePresignedUrl(id, 3600); // 1 hour validity
    return { url };
  }
}
