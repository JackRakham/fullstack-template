import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from '../../../config/config.keys';
import { OpenRouterClient, ChatMessage, ChatOptions } from './openrouter.client';

/**
 * A tool executor function that receives the tool name and parsed args,
 * and returns the result to feed back into the conversation.
 */
export type ToolExecutor = (toolName: string, args: Record<string, any>) => Promise<any>;

/**
 * Generic AI service for common LLM tasks.
 *
 * This service abstracts the OpenRouter client into high-level methods
 * that any application module can consume. Domain-specific prompts and
 * tool definitions should live in the consuming module, not here.
 *
 * @example
 * // In your feature module:
 * constructor(private readonly ai: AiService) {}
 *
 * async summarize(text: string) {
 *   return this.ai.chat([
 *     { role: 'system', content: 'You are a concise summarizer.' },
 *     { role: 'user', content: text },
 *   ]);
 * }
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly openRouterClient: OpenRouterClient,
  ) {}

  // ─── Simple Chat ────────────────────────────────────────────────

  /**
   * Send a one-shot chat completion and return the assistant's text.
   *
   * @example
   * const reply = await aiService.chat([
   *   { role: 'system', content: 'Reply in Spanish.' },
   *   { role: 'user', content: 'Hello, how are you?' },
   * ]);
   * // reply = "¡Hola! Estoy bien, gracias."
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    await this.openRouterClient.initialize();
    const response = await this.openRouterClient.chat(messages, options);
    return response.choices?.[0]?.message?.content || '';
  }

  // ─── Chat with Tools (Function Calling Loop) ───────────────────

  /**
   * Send a chat completion that may invoke tools, and loop until the
   * model returns a final text response (max `maxTurns` iterations).
   *
   * The caller provides:
   * - `tools`: OpenAI-format tool definitions
   * - `toolExecutor`: a callback that runs the tool and returns the result
   *
   * @example
   * const tools = [{
   *   type: 'function',
   *   function: {
   *     name: 'getWeather',
   *     description: 'Get current weather for a city',
   *     parameters: {
   *       type: 'object',
   *       properties: { city: { type: 'string' } },
   *       required: ['city'],
   *     },
   *   },
   * }];
   *
   * const executor: ToolExecutor = async (name, args) => {
   *   if (name === 'getWeather') return { temp: 22, condition: 'sunny' };
   *   return { error: 'Unknown tool' };
   * };
   *
   * const reply = await aiService.chatWithTools(
   *   [{ role: 'user', content: 'What is the weather in Lima?' }],
   *   tools,
   *   executor,
   * );
   */
  async chatWithTools(
    messages: ChatMessage[],
    tools: any[],
    toolExecutor: ToolExecutor,
    options?: ChatOptions & { maxTurns?: number },
  ): Promise<string> {
    const maxTurns = options?.maxTurns ?? 5;
    const chatMessages = [...messages];

    await this.openRouterClient.initialize();

    let response = await this.openRouterClient.chat(chatMessages, { ...options, tools });
    let message = response.choices[0].message;
    let turns = 0;

    while (message.tool_calls && turns < maxTurns) {
      turns++;
      chatMessages.push(message);

      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        this.logger.debug(`Tool call [${turns}]: ${functionName}(${JSON.stringify(args)})`);
        const result = await toolExecutor(functionName, args);

        chatMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(result),
        });
      }

      response = await this.openRouterClient.chat(chatMessages, { ...options, tools });
      message = response.choices[0].message;
    }

    return message.content || 'I could not generate a response at this time.';
  }

  // ─── Structured JSON Extraction ────────────────────────────────

  /**
   * Prompt the LLM to extract structured JSON data from a text input.
   * Returns `null` if the LLM response isn't parseable JSON.
   *
   * @param systemPrompt - Instructs the model on what JSON structure to produce
   * @param text - The raw text to extract data from
   *
   * @example
   * const data = await aiService.extractJsonFromText<{ name: string; age: number }>(
   *   'Extract the person\'s name and age. Return JSON: { "name": "...", "age": N }',
   *   'My name is Carlos and I am 30 years old.',
   * );
   * // data = { name: "Carlos", age: 30 }
   */
  async extractJsonFromText<T = any>(systemPrompt: string, text: string, options?: ChatOptions): Promise<T | null> {
    try {
      const raw = await this.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        { ...options, jsonMode: true },
      );

      // Strip markdown fences if the model wraps the JSON
      const cleaned = raw.trim().replace(/```\w*\s*/g, '').replace(/```\s*/g, '');
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');

      if (firstBrace > -1 && lastBrace > firstBrace) {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1)) as T;
      }

      // Try parsing the whole response
      return JSON.parse(cleaned) as T;
    } catch (error) {
      this.logger.error('Failed to extract JSON from AI response:', error);
      return null;
    }
  }

  // ─── Text Classification ───────────────────────────────────────

  /**
   * Classify a text into one of the provided categories. Returns the
   * classification label, confidence score, and reasoning.
   *
   * @param text - The text to classify
   * @param categories - Array of category labels (e.g. ['SPAM', 'INQUIRY', 'COMPLAINT'])
   * @param context - Optional extra instructions for the classifier
   *
   * @example
   * const result = await aiService.classifyText(
   *   'I need a copy of the invoice from last week',
   *   ['DOCUMENT_REQUEST', 'STATUS_INQUIRY', 'COMPLAINT', 'SPAM', 'OTHER'],
   *   'You are classifying customer support emails for a logistics company.',
   * );
   * // result = { category: "DOCUMENT_REQUEST", confidence: 0.95, reasoning: "..." }
   */
  async classifyText(
    text: string,
    categories: string[],
    context?: string,
  ): Promise<{ category: string; confidence: number; reasoning: string } | null> {
    const systemPrompt = `${context || 'You are a text classifier.'}

Classify the following text into exactly ONE of these categories: ${categories.join(', ')}.

Return ONLY valid JSON (no markdown fences):
{
  "category": "ONE_OF_THE_CATEGORIES",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}`;

    return this.extractJsonFromText<{ category: string; confidence: number; reasoning: string }>(
      systemPrompt,
      text,
    );
  }
}
