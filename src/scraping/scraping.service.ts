import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  async scrapeUrl(url: string): Promise<{ cleanHtml: string }> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    try {
      this.logger.log(`Fetching URL with axios: ${url}`);
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 20000,
      });

      if (!html) {
        throw new Error('Received empty HTML content from the page.');
      }

      this.logger.log(`HTML received. Cleaning with Cheerio...`);
      const $ = cheerio.load(html);

      const body = $('body');
      body.find(
        'script, style, link[rel="stylesheet"], noscript, iframe, footer, header, nav, svg, path, aside, form',
      ).remove();
      
      body.find('*').each(function () {
        const element = $(this);
        const preservedAttrs: { [key: string]: string } = {};
        
        if (element.is('img')) {
            const src = element.attr('src');
            const srcset = element.attr('srcset');
            if (src) preservedAttrs.src = src;
            if (srcset) preservedAttrs.srcset = srcset;
        } else if (element.is('a')) {
            const href = element.attr('href');
            if(href) preservedAttrs.href = href;
        }
        
        element[0].attribs = preservedAttrs;
      });

      const cleanHtml = body.html();

      if (!cleanHtml || cleanHtml.trim().length < 100) {
        throw new Error(
          'Cleaned content is too short, page might be blocked or empty.',
        );
      }

      return { cleanHtml };
    } catch (error) {
      this.logger.error(`Error scraping ${url} with axios:`, error.message);
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(`Failed to get data from the page. Status: ${error.response?.status}. The site may be down or blocking requests.`);
      }
      throw new BadRequestException(`Failed to scrape the URL. It may be protected or invalid.`);
    }
  }
}
