import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NovaPoshtaService } from './nova-poshta.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nova-poshta')
@UseGuards(JwtAuthGuard) // Защищаем эндпоинты
export class NovaPoshtaController {
  constructor(private readonly novaPoshtaService: NovaPoshtaService) {}

  @Get('cities')
  async getCities(@Query('search') search: string) {
    const response = await this.novaPoshtaService.findCities(search);
    // Возвращаем только массив данных, как ожидает фронтенд
    return { data: response.data || [] };
  }

  @Get('warehouses')
  async getWarehouses(@Query('cityRef') cityRef: string, @Query('search') search: string) {
    const response = await this.novaPoshtaService.findWarehouses(cityRef, search);
    return { data: response.data || [] };
  }
}
