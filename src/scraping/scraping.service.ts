import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ScrapingService {
  async scrapeUrl(url: string): Promise<{ html: string }> {
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
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
        timeout: 10000, // 10 second timeout
      });
      return { html: response.data };
    } catch (error) {
      console.error(`Scraping error for ${url}:`, error.message);
      throw new BadRequestException(`Failed to scrape URL: ${url}. The site may be protected or temporarily unavailable.`);
    }
  }
}
