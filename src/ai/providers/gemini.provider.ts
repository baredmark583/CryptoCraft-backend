import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AiProvider } from './ai.provider';
import type { AiProviderResult, AiUsageMetrics } from '../ai.types';
import { getCategoryNames } from '../../constants';

@Injectable()
export class GeminiProvider implements AiProvider {
  readonly name = 'gemini' as const;
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('Gemini API key is not configured');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  private mapUsage(response: any): AiUsageMetrics | undefined {
    const usage = response?.response?.usageMetadata ?? response?.usageMetadata;
    if (!usage) {
      return undefined;
    }
    return {
      promptTokens:
        usage.promptTokenCount ??
        usage.promptTokens ??
        usage.inputTokenCount,
      completionTokens:
        usage.candidatesTokenCount ??
        usage.completionTokens ??
        usage.outputTokenCount,
      totalTokens: usage.totalTokenCount ?? usage.totalTokens,
      cachedTokens: usage.cachedContentTokenCount ?? usage.cachedTokens,
    };
  }

  async generateListingDetails(
    imageBase64: string,
    userDescription: string,
  ): Promise<AiProviderResult<any>> {
    const prompt = `Ты — интеллектуальный ассистент для маркетплейса CryptoCraft. ...`;
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            price: { type: Type.NUMBER },
            category: { type: Type.STRING, enum: getCategoryNames() },
            dynamicAttributes: { type: Type.STRING },
          },
          required: ['title','description','price','category','dynamicAttributes']
        }
      }
    });
    const parsed = JSON.parse(response.text);
    if (typeof parsed.dynamicAttributes === 'string') {
      parsed.dynamicAttributes = JSON.parse(parsed.dynamicAttributes);
    }
    return { data: parsed, usage: this.mapUsage(response) };
  }

  async editImage(
    imageBase64: string,
    mimeType: string,
    prompt: string,
  ): Promise<AiProviderResult<{ base64Image: string }>> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] },
      config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          data: { base64Image: part.inlineData.data },
          usage: this.mapUsage(response),
        };
      }
    }
    throw new InternalServerErrorException('AI did not return an image');
  }

  async analyzeDocumentForVerification(imageBase64: string): Promise<AiProviderResult<any>> {
    const prompt = `Проанализируй это изображение...`;
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }, { text: prompt }] },
      config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { isDocument: { type: Type.BOOLEAN }, fullName: { type: Type.STRING } }, required: ['isDocument'] } }
    });
    return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
  }

  async getAnalyticsInsights(analyticsData: any): Promise<AiProviderResult<any>> {
    const prompt = `Проанализируй JSON-объект ... ${JSON.stringify(analyticsData, null, 2)}`;
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json', responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, recommendation: { type: Type.STRING }, type: { type: Type.STRING, enum: ['OPTIMIZATION','OPPORTUNITY','WARNING'] } }, required: ['title','recommendation','type'] } } }
    });
    return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
  }

  async generateDashboardFocus(dashboardData: any): Promise<AiProviderResult<any>> {
    const prompt = `Ты — AI-ассистент ... ${JSON.stringify(dashboardData, null, 2)}`;
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, reason: { type: Type.STRING }, ctaText: { type: Type.STRING }, ctaLink: { type: Type.STRING, enum: ['sales','chat','analytics','settings'] } }, required: ['title','reason','ctaText','ctaLink'] } }
    });
    return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
  }

  async processImportedHtml(html: string): Promise<AiProviderResult<any>> {
    const prompt = `Проанализируй HTML-код ...`;
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt + '\n\n' + html,
      config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, originalPrice: { type: Type.NUMBER }, originalCurrency: { type: Type.STRING }, imageUrls: { type: Type.ARRAY, items: { type: Type.STRING } }, category: { type: Type.STRING, enum: getCategoryNames() }, dynamicAttributes: { type: Type.STRING }, saleType: { type: Type.STRING, enum: ['FIXED_PRICE','AUCTION'] }, giftWrapAvailable: { type: Type.BOOLEAN } }, required: ['title','description','originalPrice','originalCurrency','imageUrls','category','dynamicAttributes','saleType','giftWrapAvailable'] } }
    });
    const parsed = JSON.parse(response.text);
    if (typeof parsed.dynamicAttributes === 'string') {
      try { parsed.dynamicAttributes = JSON.parse(parsed.dynamicAttributes); } catch { parsed.dynamicAttributes = {}; }
    }
    return { data: parsed, usage: this.mapUsage(response) };
  }

  async generateCategoryStructure(description: string): Promise<AiProviderResult<any>> {
    const prompt = `Ты — AI-архитектор ... "${description}"`;
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json', responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT } } }
    });
    return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
  }

  async generateSubcategories(parentName: string): Promise<AiProviderResult<any>> {
    const prompt = `Сгенерируй подкатегории для "${parentName}" ...`;
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });
    return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
  }
}


