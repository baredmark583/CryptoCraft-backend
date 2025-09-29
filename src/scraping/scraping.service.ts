import { Injectable, BadRequestException, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class ScrapingService implements OnModuleDestroy {
  private readonly logger = new Logger(ScrapingService.name);
  private browser: Browser | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeBrowser();
  }

  async onModuleDestroy() {
    this.logger.log('Closing Puppeteer browser instance...');
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async initializeBrowser() {
    this.logger.log('Initializing Puppeteer browser instance...');
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        // These arguments are crucial for running Puppeteer in Docker/serverless environments like Render
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', 
          '--disable-gpu',
        ],
      });
      this.logger.log('Puppeteer browser initialized successfully.');
    } catch (error) {
        this.logger.error('Failed to initialize Puppeteer browser:', error);
        this.browser = null;
    }
  }

  async scrapeUrl(url: string): Promise<{ cleanText: string }> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    if (!this.browser) {
        this.logger.error('Puppeteer browser is not initialized. Attempting to re-initialize...');
        await this.initializeBrowser();
        if (!this.browser) {
             throw new BadRequestException('Scraping service is not available. Please try again later.');
        }
    }

    const page = await this.browser.newPage();
    try {
      this.logger.log(`Navigating to ${url} with Puppeteer...`);
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      );
      
      await page.goto(url, {
        waitUntil: 'networkidle2', // Wait for network activity to cease
        timeout: 45000,
      });
      
      this.logger.log(`Page loaded. Getting content...`);
      const html = await page.content();

      if (!html) {
        throw new Error('Received empty HTML content from the page.');
      }

      const $ = cheerio.load(html);
      
      const body = $('body');
      body.find(
        'script, style, link[rel="stylesheet"], noscript, iframe, footer, header, nav, svg, path',
      ).remove();
      
      body.find('*').each(function () {
        const element = $(this);
        const preservedAttrs: { [key: string]: string } = {};
        
        if (element.is('img')) {
            const src = element.attr('src');
            const srcset = element.attr('srcset');
            if (src) preservedAttrs.src = src;
            if (srcset) preservedAttrs.srcset = srcset;
        }
        
        this.attribs = preservedAttrs;
      });

      const cleanHtml = body.html();

      if (!cleanHtml || cleanHtml.trim().length < 200) {
        throw new Error(
          'Cleaned content is too short, page might be blocked or empty.',
        );
      }

      return { cleanText: cleanHtml };
    } catch (error) {
      this.logger.error(`Error scraping ${url}:`, error.message);
      throw new BadRequestException(
        `Failed to get data from the page. The site may be unavailable or protected from scraping (e.g., with Cloudflare/CAPTCHA).`,
      );
    } finally {
        this.logger.log(`Closing page for ${url}`);
        await page.close();
    }
  }
}
