import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateExternalMediaSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
});

export class CreateExternalMediaDto extends createZodDto(CreateExternalMediaSchema) {}
