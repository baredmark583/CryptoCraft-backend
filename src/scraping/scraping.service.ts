import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScrapingService {
  async scrapeUrl(url: string): Promise<{ cleanText: string }> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }
    try {
      // We are making a direct request, but with headers that mimic a real browser
      // to increase the chances of getting a successful response from protected sites.
      const response = await axios.get(url, {
        timeout: 20000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8,uk;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
        },
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const html = response.data;
      const $ = cheerio.load(html);

      // Using the user's suggested robust selectors for OLX
      const mainContent = $('[data-testid="main"]');
      const asideContent = $('[data-testid="aside"]');

      if (mainContent.length === 0 && asideContent.length === 0) {
        throw new Error(
          'Could not find key content areas on the page. The site structure may have changed or is protected.',
        );
      }

      const title = asideContent.find('h1').text().trim();
      const price = asideContent
        .find('h3[data-testid="ad-price-container"]')
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
          if (!fullUrl.includes('placeholder') && !fullUrl.includes('avatar')) {
            imageUrls.add(fullUrl);
          }
        }
      });

      const cleanText = `Source URL: ${url}\nTitle: ${title}\nPrice: ${price}\nDescription: ${description.substring(0, 4000)}\nImage URLs: ${Array.from(imageUrls).slice(0, 10).join('\n')}`;

      if (!title && !description) {
        throw new Error(
          'Could not extract meaningful content from the targeted sections.',
        );
      }

      return { cleanText };
    } catch (error) {
      console.error(`Scraping error for ${url}:`, error.message);
      throw new BadRequestException(
        `Не удалось получить данные со страницы ${url}. Сайт может быть защищен от автоматического сбора данных.`,
      );
    }
  }
}
