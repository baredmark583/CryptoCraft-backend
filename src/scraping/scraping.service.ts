import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  async scrapeUrl(url: string): Promise<{ cleanHtml: string }> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    let browser;
    try {
      this.logger.log(`Launching Puppeteer for URL: ${url}`);
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      );
      
      this.logger.log(`Navigating to page...`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const html = await page.content();
      
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
        
        const currentAttrs = element.attr();
        if (currentAttrs) {
            for (const attrName in currentAttrs) {
                element.removeAttr(attrName);
            }
        }
    
        element.attr(preservedAttrs);
      });

      const cleanHtml = body.html();

      if (!cleanHtml || cleanHtml.trim().length < 100) {
        throw new Error(
          'Cleaned content is too short, page might be blocked or empty.',
        );
      }

      return { cleanHtml };
    } catch (error) {
      this.logger.error(`Error scraping ${url} with Puppeteer:`, error.message);
      throw new BadRequestException(`Failed to scrape the URL. It may be protected, invalid, or timed out.`);
    } finally {
        if(browser) {
            this.logger.log('Closing Puppeteer browser.');
            await browser.close();
        }
    }
  }
}