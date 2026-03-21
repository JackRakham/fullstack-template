import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const FirebaseLoginSchema = z.object({
  firebaseToken: z.string().min(1, 'Token is required'),
});

export class FirebaseLoginDto extends createZodDto(FirebaseLoginSchema) {}
