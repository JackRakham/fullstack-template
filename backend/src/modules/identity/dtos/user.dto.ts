import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationSchema } from 'src/shared/dtos/pagination.dto';
import { MediaResponseDto } from '../../storage/dtos/media.dto';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'The name of the user is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'The password must be at least 6 characters'),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

// UpdateUserDto is now defined at the bottom with avatarId support

export class UserPaginationDto extends createZodDto(PaginationSchema) {}

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  created_at: Date;

  @ApiProperty()
  @Expose()
  updated_at: Date;

  @ApiPropertyOptional()
  @Expose()
  avatar_url?: string;

  @ApiPropertyOptional({ type: () => MediaResponseDto })
  @Expose()
  avatar?: MediaResponseDto;

  @ApiPropertyOptional()
  @Expose()
  avatar_id?: number;
}

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  avatar_id: z.number().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
