import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const PaginationSchema = z.object({
    page: z.preprocess((v) => Number(v), z.number().min(1).optional().default(1)),
    page_size: z.preprocess((v) => Number(v), z.number().min(1).optional().default(10)),
    include_relations: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional().default(false)),
});

export class PaginationDto extends createZodDto(PaginationSchema) {
    @ApiProperty({ required: false })
    include_relations?: boolean;
}

export class PaginatedResponseDto<T> {
    items: T[];
    total: number;
}

