import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateUserNotificationSchema = z.object({
    readed: z.boolean(),
    user_id: z.number(),
    notification_id: z.number(),
});

export class CreateUserNotificationDto extends createZodDto(CreateUserNotificationSchema) {}

export class UpdateUserNotificationDto extends createZodDto(CreateUserNotificationSchema.pick({ readed: true }).partial()) {}

export class UserNotificationResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    readed: boolean;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;
}

import { PaginationSchema } from 'src/shared/dtos/pagination.dto';

export class UserNotificationPaginationDto extends createZodDto(PaginationSchema) {}
