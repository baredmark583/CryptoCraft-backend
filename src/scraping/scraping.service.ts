import { Injectable, BadRequestException } from '@nestjs/common';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

@Injectable()
export class ScrapingService {
  async scrapeUrl(url: string): Promise<{ cleanText: string }> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }
    let browser;
    try {
      // Для production-окружений, таких как Render, требуются специальные аргументы.
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', // Может понадобиться или нет
          '--disable-gpu',
        ],
      });
      const page = await browser.newPage();

      // Имитируем браузер реального пользователя
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/527.36',
      );
      await page.setViewport({ width: 1280, height: 800 });

      // Переходим на страницу, ожидая полной загрузки
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });

      // Дополнительное ожидание может помочь сайтам с динамической подгрузкой
      await page.waitForTimeout(2000);

      const html = await page.content();

      const $ = cheerio.load(html);

      // Исправленные селекторы на основе отзыва пользователя и анализа
      const mainContent = $('[data-testid="main"]');
      const asideContent = $('[data-testid="aside"]');

      if (mainContent.length === 0 && asideContent.length === 0) {
        // Это может произойти, если мы получили страницу с CAPTCHA
        throw new Error(
          'Не удалось найти ключевые области контента. Сайт, вероятно, защищен CAPTCHA.',
        );
      }

      const title = asideContent.find('h1').text().trim();
      const price = asideContent
        .find('[data-testid="ad-price-container"]')
        .text()
        .trim();

      const descriptionParts: string[] = [];
      mainContent.find('div[data-cy="ad_description"]').each((_i, el) => {
        descriptionParts.push($(el).text().trim());
      });
      const description = descriptionParts.join('\n\n');

      const imageUrls = new Set<string>();
      $('img').each((_i, el) => {
        const src = $(el).attr('src');
        if (src && (src.startsWith('http') || src.startsWith('//'))) {
          const fullUrl = src.startsWith('//') ? `https:${src}` : src;
          // Добавляем фильтрацию, чтобы избежать нерелевантных маленьких изображений/иконок
          if (
            !fullUrl.includes('placeholder') &&
            !fullUrl.includes('avatar') &&
            !fullUrl.endsWith('.svg')
          ) {
            imageUrls.add(fullUrl);
          }
        }
      });

      const cleanText = `Source URL: ${url}\nTitle: ${title}\nPrice: ${price}\nDescription: ${description.substring(
        0,
        4000,
      )}\nImage URLs: ${Array.from(imageUrls).slice(0, 10).join('\n')}`;

      if (!title && !description) {
        throw new Error(
          'Не удалось извлечь значимый контент. Возможно, страница загрузилась некорректно.',
        );
      }

      return { cleanText };
    } catch (error) {
      console.error(`Scraping error for ${url}:`, error.message);
      throw new BadRequestException(
        `Не удалось получить данные со страницы ${url}. Сайт может быть защищен от автоматического сбора данных.`,
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}