import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NovaPoshtaService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.novaposhta.ua/v2.0/json/';
  private readonly logger = new Logger(NovaPoshtaService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('NOVA_POSHTA_API_KEY');
    if (!this.apiKey) {
      this.logger.error('NOVA_POSHTA_API_KEY is not configured!');
    }
  }

  private async makeRequest(modelName: string, calledMethod: string, methodProperties: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Nova Poshta API Key is missing.');
    }

    const requestBody = {
      apiKey: this.apiKey,
      modelName,
      calledMethod,
      methodProperties,
    };
    
    try {
        const response = await axios.post(this.apiUrl, requestBody);
        return response.data;
    } catch (error) {
        this.logger.error(`Nova Poshta API request failed for ${calledMethod}`, error.response?.data || error.message);
        throw new Error('Failed to fetch data from Nova Poshta API');
    }
  }

  async findCities(search: string): Promise<any> {
    this.logger.log(`Searching for cities with query: ${search}`);
    return this.makeRequest('Address', 'getCities', { FindByString: search, Limit: 20 });
  }

  async findWarehouses(cityRef: string, search: string): Promise<any> {
    this.logger.log(`Searching for warehouses in city ${cityRef} with query: ${search}`);
    const properties: any = { CityRef: cityRef, Limit: '50' };
    if (search) {
        properties.FindByString = search;
    }
    return this.makeRequest('AddressGeneral', 'getWarehouses', properties);
  }
}
