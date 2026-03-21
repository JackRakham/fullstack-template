import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AssociateTripsSchema = z.object({
    trip_ids: z.array(z.number().int()),
});

export class AssociateTripsDto extends createZodDto(AssociateTripsSchema) {}
