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
      // We continue to use a proxy, but we'll add a User-Agent header
      // to better simulate a request from a real browser.
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        url,
      )}`;

      const response = await axios.get(proxyUrl, {
        timeout: 20000,
        headers: {
          // This header helps us look more like a standard web browser.
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        },
      });

      if (response.status !== 200 || !response.data.contents) {
        throw new Error(`Proxy request failed with status ${response.status}`);
      }

      const html = response.data.contents;
      const $ = cheerio.load(html);

      // --- NEW APPROACH BASED ON USER FEEDBACK ---
      // We will specifically target the main content and aside sections
      // as suggested, making the extraction more robust for OLX.
      const mainContent = $('[data-testid="main-content"]');
      const asideContent = $('[data-testid="aside"]');

      // If these specific containers don't exist, we can't reliably parse the page.
      if (mainContent.length === 0 && asideContent.length === 0) {
        throw new Error(
          'Could not find key content areas on the page. The site structure may have changed or is protected.',
        );
      }

      // Now we search for details *within* these containers.
      const title = asideContent.find('h1').text().trim();
      const price = asideContent
        .find('h3[data-testid="ad-price-container"]')
        .text()
        .trim();
      // For description, combine different parts if necessary
      const descriptionParts: string[] = [];
      mainContent.find('div[data-cy="ad_description"]').each((i, el) => {
        descriptionParts.push($(el).text().trim());
      });
      const description = descriptionParts.join('\n\n');

      const imageUrls = new Set<string>();
      mainContent.find('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && (src.startsWith('http') || src.startsWith('//'))) {
          const fullUrl = src.startsWith('//') ? `https:${src}` : src;
          // A simple filter to avoid tiny icons. OLX images are usually large.
          if (!fullUrl.includes('placeholder')) {
            imageUrls.add(fullUrl);
          }
        }
      });

      const cleanText = `
        Source URL: ${url}
        Title: ${title}
        Price: ${price}
        Description: ${description.substring(0, 4000)}
        Image URLs: ${Array.from(imageUrls).slice(0, 10).join('\n')}
      `;

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
