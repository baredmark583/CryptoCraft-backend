import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { CategoriesService } from '../categories/categories.service';
import { getCategoryNames } from '../constants'; // Assuming constants file is accessible
import type { SellerAnalytics, SellerDashboardData, ImportedListingData } from '../types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    private categoriesService: CategoriesService,
    ) {
    const apiKey = this.configService.get<string>('API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('Gemini API key is not configured');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateListingDetails(imageBase64: string, userDescription: string) {
    const prompt = `Ты — интеллектуальный ассистент для маркетплейса CryptoCraft. Твоя задача — проанализировать изображение товара и краткое описание от пользователя, чтобы автоматически создать полноценное объявление.

    Пользовательское описание: "${userDescription}"
    
    Действуй в три этапа:
    1.  **Классификация:** Определи наиболее подходящую категорию для этого товара из списка доступных категорий.
    2.  **Извлечение Атрибутов:** На основе изображения и текста, извлеки значения для специфических характеристик (атрибутов), которые соответствуют выбранной категории. Если какую-то характеристику невозможно определить, оставь для нее пустое значение или пропусти ее.
    3.  **Генерация Контента:** Напиши привлекательный, SEO-дружелюбный заголовок, подробное описание и предложи рыночную цену в USDT.
    
    Твой ответ ДОЛЖЕН быть только в формате JSON и строго соответствовать предоставленной схеме. Ключами в объекте 'dynamicAttributes' должны быть ТОЧНО такие же строки, как 'label' в схемах категорий (например, "Бренд", "Основной материал").
    
    ВАЖНО: Поле 'dynamicAttributes' ДОЛЖНО БЫТЬ СТРОКОЙ, содержащей валидный JSON. Например: "{\\"Материал\\": \\"Керамика\\", \\"Цвет\\": \\"Бежевый\\"}".`;

    const imagePart = {
      inlineData: { mimeType: 'image/jpeg', data: imageBase64 },
    };

    try {
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
            required: ["title", "description", "price", "category", "dynamicAttributes"]
          }
        }
      });
      
      const parsedJson = JSON.parse(response.text);
      if (typeof parsedJson.dynamicAttributes === 'string') {
          parsedJson.dynamicAttributes = JSON.parse(parsedJson.dynamicAttributes);
      }
      return parsedJson;
    } catch (error) {
      console.error("Error in generateListingDetails:", error);
      throw new InternalServerErrorException('Failed to generate listing details from AI');
    }
  }

  async editImage(imageBase64: string, mimeType: string, prompt: string): Promise<{ base64Image: string }> {
     try {
        const response = await this.ai.models.generateContent({
            // FIX: Updated model name to 'gemini-2.5-flash-image' as per guidelines.
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return { base64Image: part.inlineData.data };
            }
        }
        throw new Error("AI did not return an image.");
    } catch (error) {
        console.error("Error in editImage:", error);
        if (error.message?.includes('RESOURCE_EXHAUSTED')) {
             throw new BadRequestException('RATE_LIMIT:Слишком много запросов. Пожалуйста, попробуйте еще раз через минуту.');
        }
        throw new InternalServerErrorException('Failed to edit image with AI');
    }
  }
  
  async analyzeDocumentForVerification(imageBase64: string) {
    const prompt = `Проанализируй это изображение. 
1. Определи, является ли это изображение официальным документом, удостоверяющим личность (например, паспорт, водительские права, ID-карта).
2. Если это документ, извлеки из него полное имя (Фамилия, Имя, Отчество). Если имя не указано или его невозможно прочитать, оставь поле пустым.
Ответь только в формате JSON, соответствующем предоставленной схеме.`;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isDocument: { type: Type.BOOLEAN },
                        fullName: { type: Type.STRING }
                    },
                    required: ["isDocument"]
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error in analyzeDocumentForVerification:", error);
        throw new InternalServerErrorException('Failed to analyze document with AI');
    }
  }

  async getAnalyticsInsights(analyticsData: SellerAnalytics) {
       const prompt = `Проанализируй JSON-объект с данными по аналитике продавца на маркетплейсе. Выступи в роли эксперта по e-commerce и дай 3-4 кратких, но очень конкретных и действенных совета, которые помогут продавцу увеличить продажи.

        Данные для анализа:
        ${JSON.stringify(analyticsData, null, 2)}
        
        Твоя задача:
        1.  Изучить метрики: просмотры, продажи, конверсию, популярные товары, источники трафика.
        2.  Найти сильные и слабые стороны, а также неиспользованные возможности.
        3.  Сформулировать четкие рекомендации. Например, вместо "улучшите фото", напиши "для товара 'X' с высоким числом просмотров, но низкой конверсией, стоит добавить видеообзор".
        4.  Ответь ТОЛЬКО в формате JSON, строго соответствующем предоставленной схеме.`;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            recommendation: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['OPTIMIZATION', 'OPPORTUNITY', 'WARNING'] }
                        },
                        required: ['title', 'recommendation', 'type']
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error in getAnalyticsInsights:", error);
        throw new InternalServerErrorException('Failed to get analytics insights from AI');
    }
  }
  
  async generateDashboardFocus(dashboardData: SellerDashboardData) {
      const prompt = `Ты — AI-ассистент и бизнес-коуч для продавца на маркетплейсе. Проанализируй JSON с данными о его сегодняшней активности. Твоя задача — определить САМОЕ ВАЖНОЕ действие, на котором ему стоит сфокусироваться ПРЯМО СЕЙЧАС, и дать краткий, мотивирующий совет.

        Приоритеты для анализа:
        1.  Новые заказы (самый высокий приоритет).
        2.  Новые сообщения (второй по важности, требует быстрого ответа).
        3.  Добавления в избранное (отличная возможность для персонального предложения).
        4.  Если ничего срочного нет, предложи стратегическое действие (проанализировать продажи, создать промокод).

        Данные для анализа:
        ${JSON.stringify(dashboardData, null, 2)}

        Твой ответ ДОЛЖЕН быть только в формате JSON и строго соответствовать предоставленной схеме. Поле 'ctaLink' должно быть одним из: 'sales', 'chat', 'analytics', 'settings'.`;

       try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        ctaText: { type: Type.STRING },
                        ctaLink: { type: Type.STRING, enum: ['sales', 'chat', 'analytics', 'settings'] },
                    },
                    required: ['title', 'reason', 'ctaText', 'ctaLink']
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error in generateDashboardFocus:", error);
        throw new InternalServerErrorException('Failed to generate dashboard focus from AI');
    }
  }
  
  async processImportedHtml(html: string): Promise<ImportedListingData> {
    const promptInstructions = `Проанализируй HTML-код страницы товара. Игнорируй навигацию, рекламу, похожие товары.
Ответ должен быть СТРОГО в формате JSON, по схеме.

- title: SEO-заголовок.
- description: Подробное описание.
- originalPrice: Цена (число).
- originalCurrency: Валюта ("грн", "$").
- imageUrls: Массив ПОЛНЫХ URL-адресов изображений.
- category: Одна из категорий: [${getCategoryNames().join(', ')}].
- dynamicAttributes: JSON-строка с атрибутами. Пример: "{\\"Материал\\": \\"Хлопок\\"}".
- saleType: "AUCTION" или "FIXED_PRICE".
- giftWrapAvailable: true/false.

HTML для анализа:`;

    const fullPrompt = `${promptInstructions}\n\n${html}`;
    
    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        originalPrice: { type: Type.NUMBER },
                        originalCurrency: { type: Type.STRING },
                        imageUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
                        category: { type: Type.STRING, enum: getCategoryNames() },
                        dynamicAttributes: { type: Type.STRING },
                        saleType: { type: Type.STRING, enum: ['FIXED_PRICE', 'AUCTION'] },
                        giftWrapAvailable: { type: Type.BOOLEAN }
                    },
                    required: ["title", "description", "originalPrice", "originalCurrency", "imageUrls", "category", "dynamicAttributes", "saleType", "giftWrapAvailable"]
                }
            }
        });

        const parsedJson = JSON.parse(response.text);
        if (typeof parsedJson.dynamicAttributes === 'string') {
            try {
                parsedJson.dynamicAttributes = JSON.parse(parsedJson.dynamicAttributes);
            } catch (e) {
                this.logger.warn(`AI returned malformed JSON for dynamicAttributes: "${parsedJson.dynamicAttributes}". Defaulting to empty object.`);
                parsedJson.dynamicAttributes = {}; // Graceful failure
            }
        } else if (typeof parsedJson.dynamicAttributes !== 'object') {
             parsedJson.dynamicAttributes = {};
        }
        return parsedJson;
    } catch (error) {
        this.logger.error(`Error in processImportedHtml:`, error);
        if (error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new BadRequestException('Превышен лимит запросов к AI. Пожалуйста, попробуйте позже.');
        }
        throw new InternalServerErrorException('Failed to process HTML with AI');
    }
  }

  async generateCategoryStructure(description: string) {
    const prompt = `Ты — AI-архитектор для e-commerce платформ. Твоя задача — создать полную и логичную иерархическую структуру категорий для маркетплейса на основе его описания.

    **Описание маркетплейса:** "${description}"

    **Требования к результату:**
    1.  **Глубина:** Структура должна иметь до 4 уровней вложенности (категория -> подкатегория -> ...).
    2.  **Поля (Атрибуты):** Для КАЖДОЙ категории и подкатегории сгенерируй от 2 до 5 релевантных полей (атрибутов), которые помогут продавцам детально описывать свои товары.
    3.  **Формат полей:** Каждое поле должно иметь 'name' (техническое, snake_case), 'label' (читаемое), 'type' ('text', 'number', 'select'), и необязательные 'required' (boolean) и 'options' (массив строк для типа 'select').
    4.  **Формат ответа:** Ответ должен быть СТРОГО в формате JSON. Это должен быть массив объектов, где каждый объект представляет категорию верхнего уровня и может содержать вложенный массив 'subcategories'.

    Пример требуемой структуры для одного элемента:
    {
      "name": "Одежда",
      "fields": [
        { "name": "size", "label": "Размер", "type": "select", "options": ["XS", "S", "M", "L", "XL"], "required": true },
        { "name": "color", "label": "Цвет", "type": "text", "required": false }
      ],
      "subcategories": [
        {
          "name": "Женская одежда",
          "fields": [...],
          "subcategories": [...]
        }
      ]
    }
    `;

    const categoryFieldSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Техническое имя поля, в snake_case, например 'main_material'" },
            label: { type: Type.STRING, description: "Отображаемое имя поля, например 'Основной материал'" },
            type: { type: Type.STRING, enum: ['text', 'number', 'select'] },
            required: { type: Type.BOOLEAN, description: "Является ли поле обязательным" },
            options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Массив опций для полей типа 'select'"
            }
        },
        required: ["name", "label", "type"]
    };
    
    // Manually unfold the recursive schema to a fixed depth to avoid API errors
    // Level 4 (Innermost, no subcategories)
    const categorySchemaLevel4 = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            fields: { type: Type.ARRAY, items: categoryFieldSchema },
        },
        required: ['name', 'fields'],
    };

    // Level 3
    const categorySchemaLevel3 = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            fields: { type: Type.ARRAY, items: categoryFieldSchema },
            subcategories: { type: Type.ARRAY, items: categorySchemaLevel4 },
        },
        required: ['name', 'fields'],
    };

    // Level 2
    const categorySchemaLevel2 = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            fields: { type: Type.ARRAY, items: categoryFieldSchema },
            subcategories: { type: Type.ARRAY, items: categorySchemaLevel3 },
        },
        required: ['name', 'fields'],
    };
    
    // Level 1 (Root)
    const categorySchemaLevel1 = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            fields: { type: Type.ARRAY, items: categoryFieldSchema },
            subcategories: { type: Type.ARRAY, items: categorySchemaLevel2 },
        },
        required: ['name', 'fields'],
    };


    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: categorySchemaLevel1
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error in generateCategoryStructure:", error);
        throw new InternalServerErrorException('Failed to generate category structure with AI');
    }
  }

  async generateAndSaveSubcategories(parentId: string, parentName: string) {
    const prompt = `Ты — AI-архитектор для e-commerce платформ. Твоя задача — создать полную и логичную иерархическую структуру ПОДКАГЕГОРИЙ для заданной родительской категории.

    **Родительская категория:** "${parentName}"

    **Требования к результату:**
    1.  **Глубина:** Структура должна иметь до 3 уровней вложенности (подкатегория -> под-подкатегория -> ...).
    2.  **Поля (Атрибуты):** Для КАЖДОЙ сгенерированной подкатегории, придумай от 2 до 5 релевантных полей (атрибутов), которые помогут продавцам детально описывать свои товары.
    3.  **Формат полей:** Каждое поле должно иметь 'name' (техническое, snake_case), 'label' (читаемое), 'type' ('text', 'number', 'select'), и необязательные 'required' (boolean) и 'options' (массив строк для типа 'select').
    4.  **Формат ответа:** Ответ должен быть СТРОГО в формате JSON. Это должен быть массив объектов, где каждый объект представляет подкатегорию первого уровня для "${parentName}" и может содержать вложенный массив 'subcategories'.
    
    Не включай в ответ саму родительскую категорию "${parentName}". Только её дочерние элементы.`;

    const categoryFieldSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Техническое имя поля, в snake_case, например 'main_material'" },
            label: { type: Type.STRING, description: "Отображаемое имя поля, например 'Основной материал'" },
            type: { type: Type.STRING, enum: ['text', 'number', 'select'] },
            required: { type: Type.BOOLEAN, description: "Является ли поле обязательным" },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Массив опций для полей типа 'select'" }
        },
        required: ["name", "label", "type"]
    };
    
    const categorySchemaLevel3 = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            fields: { type: Type.ARRAY, items: categoryFieldSchema },
        },
        required: ['name', 'fields'],
    };

    const categorySchemaLevel2 = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            fields: { type: Type.ARRAY, items: categoryFieldSchema },
            subcategories: { type: Type.ARRAY, items: categorySchemaLevel3 },
        },
        required: ['name', 'fields'],
    };
    
    const categorySchemaLevel1 = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            fields: { type: Type.ARRAY, items: categoryFieldSchema },
            subcategories: { type: Type.ARRAY, items: categorySchemaLevel2 },
        },
        required: ['name', 'fields'],
    };


    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: categorySchemaLevel1
                }
            }
        });
        const generatedStructure = JSON.parse(response.text);

        await this.categoriesService.batchCreateSubcategories(generatedStructure, parentId);
        
        return { success: true, message: 'Subcategories generated and saved successfully.' };
    } catch (error) {
        console.error("Error in generateAndSaveSubcategories:", error);
        throw new InternalServerErrorException('Failed to generate and save subcategories with AI');
    }
  }
}
