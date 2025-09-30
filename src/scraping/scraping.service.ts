import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  // FIX: Implemented the `scrapeUrl` method, which was missing and causing a compile error in `ImportService`.
  // This enables the backend to scrape URLs directly, which is more reliable than frontend scraping due to CORS.
  async scrapeUrl(url: string): Promise<{ html: string }> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }
    this.logger.log(`Scraping URL: ${url}`);
    try {
      const { data: rawHtml } = await axios.get(url, {
        headers: {
          // Use a common user-agent to avoid simple bot blocks
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
        timeout: 15000, // 15 seconds timeout
      });

      this.logger.log(
        `Scraping successful, returning raw HTML of length ${rawHtml.length}`,
      );
      return { html: rawHtml };
    } catch (error) {
      this.logger.error(`Failed to scrape URL ${url}: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to scrape content from the provided URL. The site may be down or blocking requests.`,
      );
    }
  }
}
