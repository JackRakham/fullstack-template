import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export const CreatePermissionSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

export class CreatePermissionDto extends createZodDto(CreatePermissionSchema) {}

export class UpdatePermissionDto extends createZodDto(CreatePermissionSchema.partial()) {}

export class PermissionResponseDto {
    @Expose()
    @ApiProperty()
    id: number;

    @Expose()
    @ApiProperty()
    name: string;

    @Expose()
    @ApiProperty({ required: false })
    description?: string;
}
