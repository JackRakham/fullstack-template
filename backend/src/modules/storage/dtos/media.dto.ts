import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MediaResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  mimetype: string;

  @ApiProperty()
  @Expose()
  url: string;

  @ApiProperty()
  @Expose()
  size: number;
}
