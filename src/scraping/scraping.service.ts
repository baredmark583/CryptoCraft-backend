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
      // Use a public CORS proxy as a last resort to bypass anti-bot measures.
      // This is not recommended for production due to reliability and rate limits,
      // but it's a viable solution within the project's constraints.
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        url,
      )}`;

      const response = await axios.get(proxyUrl, { timeout: 20000 }); // Increased timeout for proxy

      if (response.status !== 200 || !response.data.contents) {
        throw new Error('Failed to retrieve HTML content via proxy.');
      }

      const html = response.data.contents;
      const $ = cheerio.load(html);

      // --- Enhanced Content Extraction ---
      // Prioritize specific, stable attributes (like data-cy) and then fall back to generic tags.
      const title =
        $('h1[data-cy="ad_title"]').text().trim() ||
        $('h1').first().text().trim();

      const description =
        $('div[data-cy="ad_description"]').text().trim() ||
        $('#description').text().trim() ||
        $('.description').text().trim();
        
      const price =
        $('h3[data-testid="ad-price-container"]').text().trim() ||
        $('[class*="price"]').first().text().trim();

      // Use a Set to avoid duplicate image URLs
      const imageUrls = new Set<string>();
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && (src.startsWith('http') || src.startsWith('//'))) {
          // Normalize URL
          const fullUrl = src.startsWith('//') ? `https:${src}` : src;
          // Filter out tiny images like icons or spacers
          const width = $(el).attr('width');
          const height = $(el).attr('height');
          if ((!width || parseInt(width) > 50) && (!height || parseInt(height) > 50)) {
            imageUrls.add(fullUrl);
          }
        }
      });

      // Combine the extracted data into a concise text block for the AI
      const cleanText = `
        Source URL: ${url}
        Title: ${title}
        Price: ${price}
        Description: ${description.substring(0, 4000)}
        Image URLs: ${Array.from(imageUrls).slice(0, 10).join('\n')}
      `;
      
      if (!title && !description) {
        throw new Error("Could not extract meaningful content. The page might be protected by JavaScript challenges.");
      }

      return { cleanText };
    } catch (error) {
      console.error(`Scraping error for ${url}:`, error.message);
      // Provide a more user-friendly error message
      throw new BadRequestException(
        `Не удалось получить данные со страницы ${url}. Сайт может быть защищен от автоматического сбора данных.`,
      );
    }
  }
}
