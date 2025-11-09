import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CategoriesService } from '../categories/categories.service';
import type {
  GeneratedListing,
  ImportedListingData,
  SellerAnalytics,
  SellerDashboardData,
} from '../types';
import type { CategorySchema } from '../constants';
import { GeminiProvider } from './providers/gemini.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import type { AiProvider } from './providers/ai.provider';
import type {
  AiProviderName,
  AiProviderResult,
  AiResponse,
  AiScenario,
} from './ai.types';
import sharp from 'sharp';

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly providerRegistry: Record<AiProviderName, AiProvider>;
  private readonly scenarioProviders: Record<AiScenario, AiProvider>;
  private readonly maxImageBytes: number;
  private readonly maxHtmlChars: number;
  private readonly maxImageDimension: number;
  private readonly jpegQuality: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly categoriesService: CategoriesService,
    private readonly gemini: GeminiProvider,
    private readonly deepseek: DeepSeekProvider,
  ) {
    this.providerRegistry = {
      gemini: this.gemini,
      deepseek: this.deepseek,
    };
    this.scenarioProviders = {
      text: this.resolveProvider('AI_PROVIDER_TEXT', 'deepseek'),
      vision: this.resolveProvider('AI_PROVIDER_VISION', 'deepseek'),
      'image-edit': this.resolveProvider('AI_PROVIDER_IMAGE_EDIT', 'gemini'),
    };
    this.maxHtmlChars = this.getNumberEnv('AI_MAX_HTML_CHARS', 60000);
    const imageLimitMb = this.getNumberEnv('AI_MAX_IMAGE_MB', 4);
    this.maxImageBytes = this.getNumberEnv('AI_MAX_IMAGE_BYTES', imageLimitMb * 1024 * 1024);
    this.maxImageDimension = this.getNumberEnv('AI_MAX_IMAGE_DIMENSION', 1536);
    this.jpegQuality = this.getNumberEnv('AI_IMAGE_JPEG_QUALITY', 82);
  }

  async generateListingDetails(
    imageBase64: string,
    userDescription: string,
  ): Promise<AiResponse<GeneratedListing>> {
    const warnings: string[] = [];
    const { base64 } = await this.normalizeImagePayload(imageBase64, {
      scenario: 'vision',
      warnings,
    });
    return this.runWithMetrics(
      'vision',
      provider => provider.generateListingDetails(base64, userDescription),
      { warnings },
    );
  }

  async editImage(
    imageBase64: string,
    mimeType: string,
    prompt: string,
  ): Promise<AiResponse<{ base64Image: string }>> {
    const warnings: string[] = [];
    const { base64, mimeType: sanitizedMime } = await this.normalizeImagePayload(
      imageBase64,
      {
        scenario: 'image-edit',
        mimeType,
        warnings,
      },
    );
    return this.runWithMetrics(
      'image-edit',
      provider => provider.editImage(base64, sanitizedMime, prompt),
      { warnings },
    );
  }

  async analyzeDocumentForVerification(imageBase64: string): Promise<AiResponse<any>> {
    const warnings: string[] = [];
    const { base64 } = await this.normalizeImagePayload(imageBase64, {
      scenario: 'vision',
      warnings,
    });
    return this.runWithMetrics(
      'vision',
      provider => provider.analyzeDocumentForVerification(base64),
      { warnings },
    );
  }

  async getAnalyticsInsights(
    analyticsData: SellerAnalytics,
  ): Promise<AiResponse<any>> {
    return this.runWithMetrics('text', provider =>
      provider.getAnalyticsInsights(analyticsData),
    );
  }

  async generateDashboardFocus(
    dashboardData: SellerDashboardData,
  ): Promise<AiResponse<any>> {
    return this.runWithMetrics('text', provider =>
      provider.generateDashboardFocus(dashboardData),
    );
  }

  async processImportedHtml(html: string): Promise<AiResponse<ImportedListingData>> {
    const { payload, warnings } = this.truncateHtmlPayload(html);
    return this.runWithMetrics(
      'text',
      provider => provider.processImportedHtml(payload),
      { warnings },
    );
  }

  async generateCategoryStructure(description: string): Promise<AiResponse<CategorySchema[]>> {
    return this.runWithMetrics('text', provider =>
      provider.generateCategoryStructure(description),
    );
  }

  async generateAndSaveSubcategories(
    parentId: string,
    parentName: string,
  ): Promise<AiResponse<{ success: boolean; generatedCount: number; parentId: string }>> {
    const generated = await this.runWithMetrics('text', provider =>
      provider.generateSubcategories(parentName),
    );
    await this.categoriesService.batchCreateSubcategories(
      generated.data as CategorySchema[],
      parentId,
    );
    return {
      data: {
        success: true,
        generatedCount: Array.isArray(generated.data) ? generated.data.length : 0,
        parentId,
      },
      meta: generated.meta,
    };
  }

  private async runWithMetrics<T>(
    scenario: AiScenario,
    executor: (provider: AiProvider) => Promise<AiProviderResult<T>>,
    extra?: { warnings?: string[] },
  ): Promise<AiResponse<T>> {
    const provider = this.scenarioProviders[scenario];
    const startedAt = Date.now();
    try {
      const { data, usage } = await executor(provider);
      return {
        data,
        meta: {
          provider: provider.name,
          scenario,
          latencyMs: Date.now() - startedAt,
          usage,
          warnings: extra?.warnings?.length ? extra.warnings : undefined,
        },
      };
    } catch (error) {
      this.logger.error(
        `AI ${scenario} call via ${provider.name} failed`,
        error instanceof Error ? error.stack : error,
      );
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Сервис AI временно недоступен');
    }
  }

  private async normalizeImagePayload(
    base64: string,
    options: { scenario: AiScenario; mimeType?: string; warnings: string[] },
  ): Promise<{ base64: string; mimeType: string }> {
    const mime =
      options.mimeType && ALLOWED_IMAGE_MIME_TYPES.has(options.mimeType.toLowerCase())
        ? options.mimeType
        : 'image/jpeg';
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length <= this.maxImageBytes) {
      return { base64, mimeType: mime };
    }

    this.logger.warn(
      `Image payload for ${options.scenario} is ${this.bytesToMb(buffer.length)}MB, attempting resize`,
    );
    try {
      const resized = await sharp(buffer)
        .rotate()
        .resize({
          width: this.maxImageDimension,
          height: this.maxImageDimension,
          fit: 'inside',
        })
        .toFormat('jpeg', { quality: this.jpegQuality, mozjpeg: true })
        .toBuffer();

      if (resized.length > this.maxImageBytes) {
        throw new BadRequestException(
          `Изображение остаётся больше ${this.bytesToMb(this.maxImageBytes)}MB даже после сжатия`,
        );
      }

      options.warnings.push('IMAGE_RESIZED');
      return { base64: resized.toString('base64'), mimeType: 'image/jpeg' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Failed to downscale oversized image', error);
      throw new InternalServerErrorException(
        'Не удалось обработать изображение. Попробуйте файл меньшего размера.',
      );
    }
  }

  private truncateHtmlPayload(html: string): { payload: string; warnings?: string[] } {
    if (!html) {
      throw new BadRequestException('HTML контент не должен быть пустым');
    }
    if (html.length <= this.maxHtmlChars) {
      return { payload: html };
    }
    this.logger.warn(
      `HTML payload truncated from ${html.length} chars to ${this.maxHtmlChars}`,
    );
    return {
      payload: html.slice(0, this.maxHtmlChars),
      warnings: ['HTML_TRUNCATED'],
    };
  }

  private getNumberEnv(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private resolveProvider(envKey: string, fallback: AiProviderName): AiProvider {
    const requested = (this.configService.get<string>(envKey)?.toLowerCase() as AiProviderName) || fallback;
    const provider = this.providerRegistry[requested] ?? this.providerRegistry[fallback];
    if (!this.providerRegistry[requested]) {
      this.logger.warn(
        `Provider "${requested}" from ${envKey} is unavailable. Falling back to ${provider.name}`,
      );
    }
    return provider;
  }

  private bytesToMb(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(2);
  }
}
