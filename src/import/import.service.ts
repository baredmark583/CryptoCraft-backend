import { Injectable, Logger } from '@nestjs/common';
import { ScrapingService } from '../scraping/scraping.service';
import { AiService } from '../ai/ai.service';
import { UploadService } from '../upload/upload.service';
import { ImportedListingData } from '../types';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    private readonly scrapingService: ScrapingService,
    private readonly aiService: AiService,
    private readonly uploadService: UploadService,
  ) {}

  private async convertCurrency(amount: number, fromCurrency: string): Promise<number> {
    const rates: Record<string, number> = {
        'UAH': 0.025,
        'ГРН': 0.025,
        'USD': 1.0,
        '$': 1.0,
        'EUR': 1.08,
        '€': 1.08,
    };
    
    // Find rate by checking if the currency string includes any key
    const upperCurrency = fromCurrency.toUpperCase();
    const rateKey = Object.keys(rates).find(key => upperCurrency.includes(key));
    const rate = rateKey ? rates[rateKey] : null;

    if (!rate) {
        this.logger.warn(`No conversion rate found for currency: ${fromCurrency}. Returning original amount.`);
        return amount;
    }
    
    const convertedAmount = amount * rate;
    this.logger.log(`Converted ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} USDT`);
    return parseFloat(convertedAmount.toFixed(2));
  }

  async processUrl(url: string): Promise<ImportedListingData> {
    this.logger.log(`Starting import process for URL: ${url}`);

    // 1. Scrape the URL to get clean HTML
    const { cleanHtml } = await this.scrapingService.scrapeUrl(url);
    this.logger.log(`Scraping successful. HTML length: ${cleanHtml.length}`);

    // 2. Process HTML with AI to extract structured data
    const aiData = await this.aiService.processImportedHtml(cleanHtml);
    this.logger.log(`AI processing successful. Title: "${aiData.title}"`);

    // 3. Process images: download from original source and upload to Cloudinary
    const uploadedImageUrls = await Promise.all(
        aiData.imageUrls.slice(0, 5).map(async (imageUrl) => { // Limit to 5 images
            try {
                const absoluteUrl = new URL(imageUrl, url).href;
                const { url: cloudinaryUrl } = await this.uploadService.uploadFileFromUrl(absoluteUrl);
                this.logger.log(`Uploaded image ${imageUrl} to ${cloudinaryUrl}`);
                return cloudinaryUrl;
            } catch (error) {
                this.logger.warn(`Failed to process image URL: ${imageUrl}. Skipping. Error: ${error.message}`);
                return null; // Return null for failed uploads
            }
        })
    );
    
    const finalImageUrls = uploadedImageUrls.filter(Boolean); // Filter out nulls
    this.logger.log(`Successfully uploaded ${finalImageUrls.length} images.`);

    // 4. Convert currency to USDT
    const priceInUsdt = await this.convertCurrency(aiData.originalPrice, aiData.originalCurrency);

    // 5. Assemble and return the final listing data
    const finalListing: ImportedListingData = {
        ...aiData,
        imageUrls: finalImageUrls,
        price: priceInUsdt, // Add the converted price
    };

    this.logger.log(`Import process completed for URL: ${url}`);
    return finalListing;
  }
}
