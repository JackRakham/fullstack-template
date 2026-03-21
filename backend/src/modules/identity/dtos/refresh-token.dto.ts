import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
