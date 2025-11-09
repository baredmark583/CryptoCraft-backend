"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NovaPoshtaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovaPoshtaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let NovaPoshtaService = NovaPoshtaService_1 = class NovaPoshtaService {
    constructor(configService) {
        this.configService = configService;
        this.apiUrl = 'https://api.novaposhta.ua/v2.0/json/';
        this.logger = new common_1.Logger(NovaPoshtaService_1.name);
        this.apiKey = this.configService.get('NOVA_POSHTA_API_KEY');
        if (!this.apiKey) {
            this.logger.error('NOVA_POSHTA_API_KEY is not configured!');
        }
    }
    async makeRequest(modelName, calledMethod, methodProperties) {
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
            const response = await axios_1.default.post(this.apiUrl, requestBody);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Nova Poshta API request failed for ${calledMethod}`, error.response?.data || error.message);
            throw new Error('Failed to fetch data from Nova Poshta API');
        }
    }
    async findCities(search) {
        this.logger.log(`Searching for cities with query: ${search}`);
        return this.makeRequest('Address', 'getCities', { FindByString: search, Limit: 20 });
    }
    async findWarehouses(cityRef, search) {
        this.logger.log(`Searching for warehouses in city ${cityRef} with query: ${search}`);
        const properties = { CityRef: cityRef, Limit: '50' };
        if (search) {
            properties.FindByString = search;
        }
        return this.makeRequest('AddressGeneral', 'getWarehouses', properties);
    }
};
exports.NovaPoshtaService = NovaPoshtaService;
exports.NovaPoshtaService = NovaPoshtaService = NovaPoshtaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NovaPoshtaService);
//# sourceMappingURL=nova-poshta.service.js.map