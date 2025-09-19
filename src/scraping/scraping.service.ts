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
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 10000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // --- Intelligent Content Extraction ---
      // These selectors are generic and might need adjustment for specific sites.
      // The goal is to reduce the content size before sending it to the AI.
      
      // Try to find a specific main content area to reduce noise
      const mainContent = $('main, #main-content, #root, .product-details, body').first();

      const title = mainContent.find('h1').first().text().trim();
      
      // Try multiple common selectors for description
      let description = mainContent.find('div[class*="description"], #description, .description, [data-testid="description"]').first().text().trim();
      if (!description) {
          // Fallback to a simpler paragraph search if a specific description class isn't found
          description = mainContent.find('p').map((i, el) => $(el).text().trim()).get().join('\n').substring(0, 2000);
      }
      
      const imageUrls = mainContent.find('img').map((i, el) => $(el).attr('src')).get()
        .filter(src => src && (src.startsWith('http') || src.startsWith('//')))
        .map(src => src.startsWith('//') ? `https:${src}` : src)
        .slice(0, 20); // Limit to the first 20 relevant images

      // Combine the extracted data into a concise text block for the AI
      const cleanText = `
        Extracted Product Information:
        URL: ${url}
        Title: ${title}
        Description: ${description}
        Image URLs found: ${imageUrls.join(', ')}
      `;

      return { cleanText };

    } catch (error) {
      console.error(`Scraping error for ${url}:`, error.message);
      throw new BadRequestException(`Failed to scrape URL: ${url}. The site may be protected or temporarily unavailable.`);
    }
  }
}
