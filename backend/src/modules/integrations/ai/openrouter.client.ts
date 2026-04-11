import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from '../../../config/config.keys';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | any[];
  tool_call_id?: string;
  name?: string;
}

export interface ChatOptions {
  model?: string;
  tools?: any[];
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generic HTTP client for the OpenRouter API.
 *
 * OpenRouter is a unified gateway to 100+ LLM providers (OpenAI, Anthropic,
 * Google, Meta, etc.) using a single API key and an OpenAI-compatible format.
 *
 * @see https://openrouter.ai/docs
 */
@Injectable()
export class OpenRouterClient {
  private readonly logger = new Logger(OpenRouterClient.name);
  private apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>(ConfigKey.OPENROUTER_API_KEY) || '';
  }

  async initialize() {
    if (!this.apiKey) {
      this.logger.warn('OPENROUTER_API_KEY is not set. AI calls will fail.');
    }
  }

  /**
   * Send a chat completion request to OpenRouter.
   *
   * @param messages - Array of chat messages (system, user, assistant, tool)
   * @param options - Model, tools, jsonMode, temperature, maxTokens
   * @returns Raw API response (OpenAI-compatible format)
   */
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<any> {
    const model = options.model || this.configService.get<string>(ConfigKey.OPENROUTER_MODEL) || 'google/gemini-2.0-flash-001';

    try {
      const bodyPayload: any = {
        model,
        messages,
      };

      if (options.tools && options.tools.length > 0) {
        bodyPayload.tools = options.tools;
      }

      if (options.jsonMode) {
        bodyPayload.response_format = { type: 'json_object' };
      }

      if (options.temperature !== undefined) {
        bodyPayload.temperature = options.temperature;
      }

      if (options.maxTokens !== undefined) {
        bodyPayload.max_tokens = options.maxTokens;
      }

      const appName = this.configService.get<string>('APP_NAME') || 'Fullstack App';
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.configService.get<string>('APP_URL') || 'http://localhost:3000',
          'X-Title': appName,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Error calling OpenRouter:', error);
      throw error;
    }
  }
}
