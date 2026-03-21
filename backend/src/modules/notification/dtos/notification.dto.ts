import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateNotificationSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
});

export class CreateNotificationDto extends createZodDto(CreateNotificationSchema) {}

export class UpdateNotificationDto extends createZodDto(CreateNotificationSchema.partial()) {}

export class NotificationResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;
}

import { PaginationSchema } from 'src/shared/dtos/pagination.dto';

export class NotificationPaginationDto extends createZodDto(PaginationSchema) {}
