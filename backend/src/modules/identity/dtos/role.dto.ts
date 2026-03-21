import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export const CreateRoleSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}

export class UpdateRoleDto extends createZodDto(CreateRoleSchema.partial()) {}

export class RoleResponseDto {
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
