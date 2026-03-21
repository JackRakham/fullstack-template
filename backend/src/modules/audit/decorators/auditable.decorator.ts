import { SetMetadata } from '@nestjs/common';

export const IS_AUDITABLE_KEY = 'is_auditable';
export const Auditable = () => SetMetadata(IS_AUDITABLE_KEY, true);
