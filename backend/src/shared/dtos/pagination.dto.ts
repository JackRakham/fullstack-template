import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaginationSchema = z.object({
    page: z.preprocess((v) => Number(v), z.number().min(1).optional().default(1)),
    page_size: z.preprocess((v) => Number(v), z.number().min(1).optional().default(10)),
});

export class PaginationDto extends createZodDto(PaginationSchema) {}

export class PaginatedResponseDto<T> {
    items: T[];
    total: number;
}
