import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  async scrapeUrl(url: string): Promise<{ html: string }> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    try {
      this.logger.log(`Fetching HTML for URL: ${url}`);
      const response = await axios.get<string>(url, {
        headers: {
          // A common user agent to bypass simple bot detection
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 20000, // 20 seconds timeout
      });

      const html = response.data;
      if (!html) {
        throw new Error('Received empty HTML content.');
      }
      this.logger.log(`HTML received for ${url}. Length: ${html.length}`);
      return { html };
    } catch (error) {
      this.logger.error(`Error scraping ${url} with Axios: ${error.message}`);
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(`Failed to fetch URL. Status: ${error.response?.status}. It may be protected (e.g., by Cloudflare).`);
      }
      throw new BadRequestException(`Failed to scrape the URL. It may be invalid or timed out.`);
    }
  }
}
