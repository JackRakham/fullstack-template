import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export const CreateTripSchema = z.object({
    po_number: z.string().min(1),
});

export class CreateTripDto extends createZodDto(CreateTripSchema) {}

export class UpdateTripDto extends createZodDto(CreateTripSchema.partial()) {}

export class TripResponseDto {
    @ApiProperty()
    @Expose()
    id: number;

        @ApiProperty()
    @Expose()
    po_number: string;

    @ApiProperty()
    @Expose()
    created_at: Date;

    @ApiProperty()
    @Expose()
    updated_at: Date;
}
