import { Module } from '@nestjs/common';
import { OpenRouterClient } from './openrouter.client';
import { AiService } from './ai.service';

@Module({
  providers: [AiService, OpenRouterClient],
  exports: [AiService],
})
export class AiModule {}
