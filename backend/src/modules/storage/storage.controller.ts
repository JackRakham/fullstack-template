import { Controller, Post, Get, Delete, Param, UploadedFile, UseInterceptors, Body, Res, ParseIntPipe } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateExternalMediaDto } from './dtos/external-media.dto';
import { Response } from 'express';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a local or cloud file' })
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
}

