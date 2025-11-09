import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiProvider } from './ai.provider';
import type { AiProviderResult, AiUsageMetrics } from '../ai.types';

@Injectable()
export class DeepSeekProvider implements AiProvider {
  readonly name = 'deepseek' as const;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('DEEPSEEK_API_BASE_URL') || 'https://api.deepseek.com';
  }

  private mapUsage(usage: any): AiUsageMetrics | undefined {
    if (!usage) {
      return undefined;
    }
    return {
      promptTokens: usage.prompt_tokens ?? usage.promptTokens,
      completionTokens: usage.completion_tokens ?? usage.completionTokens,
      totalTokens: usage.total_tokens ?? usage.totalTokens,
    };
  }

  private async chatJson(prompt: any): Promise<AiProviderResult<any>> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('DeepSeek API key is not configured');
    }
    // NOTE: Эндпоинт/формат ответа может отличаться. Это заготовка-адаптер, который мы уточним при подключении.
    const res = await axios.post(
      `${this.baseUrl}/v1/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      },
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
    const text = res.data?.choices?.[0]?.message?.content || '{}';
    return {
      data: JSON.parse(text),
      usage: this.mapUsage(res.data?.usage),
    };
  }

  async generateListingDetails(imageBase64: string, userDescription: string): Promise<AiProviderResult<any>> {
    const prompt = `Сформируй JSON для листинга по описанию: ${userDescription}. Изображение не обрабатывай.`;
    return this.chatJson(prompt);
  }

  async editImage(): Promise<AiProviderResult<{ base64Image: string }>> {
    throw new BadRequestException('DeepSeek does not support image editing in this adapter');
  }

  async analyzeDocumentForVerification(imageBase64: string): Promise<AiProviderResult<any>> {
    const prompt = `Определи, является ли изображение документом. Верни JSON с полями isDocument, fullName (если есть).`;
    return this.chatJson(prompt);
  }

  async getAnalyticsInsights(analyticsData: any): Promise<AiProviderResult<any>> {
    const prompt = `Проанализируй метрики и дай советы. Данные: ${JSON.stringify(analyticsData)}`;
    return this.chatJson(prompt);
  }

  async generateDashboardFocus(dashboardData: any): Promise<AiProviderResult<any>> {
    const prompt = `Определи главное действие и верни JSON с title, reason, ctaText, ctaLink. Данные: ${JSON.stringify(dashboardData)}`;
    return this.chatJson(prompt);
  }

  async processImportedHtml(html: string): Promise<AiProviderResult<any>> {
    const prompt = `Извлеки данные товара из HTML и верни JSON (title, description, price, images, category, dynamicAttributes, saleType, giftWrapAvailable).`;
    return this.chatJson(prompt);
  }

  async generateCategoryStructure(description: string): Promise<AiProviderResult<any>> {
    const prompt = `Сгенерируй структуру категорий (до 4 уровней) и поля. Описание: ${description}`;
    return this.chatJson(prompt);
  }

  async generateSubcategories(parentName: string): Promise<AiProviderResult<any>> {
    const prompt = `Сгенерируй подкатегории для ${parentName} c полями.`;
    return this.chatJson(prompt);
  }
}


