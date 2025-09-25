import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIconDto } from './dto/create-icon.dto';
import { UpdateIconDto } from './dto/update-icon.dto';
import { Icon } from './entities/icon.entity';
import axios from 'axios';

@Injectable()
export class IconsService {
  constructor(
    @InjectRepository(Icon)
    private readonly iconRepository: Repository<Icon>,
  ) {}

  private async fetchSvgFromUrl(url: string): Promise<string> {
    try {
        const response = await axios.get(url, {
            headers: { 'Accept': 'image/svg+xml' },
            timeout: 5000,
        });
        if (typeof response.data !== 'string' || !response.data.trim().startsWith('<svg')) {
            throw new Error('Response is not a valid SVG file.');
        }
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch SVG from ${url}`, error);
        throw new BadRequestException(`Could not fetch a valid SVG from the provided URL.`);
    }
  }
  
  async create(createIconDto: CreateIconDto) {
    const { iconUrl, ...restDto } = createIconDto;

    if (!iconUrl && !restDto.svgContent) {
        throw new BadRequestException('Either svgContent or iconUrl must be provided.');
    }
    
    const iconData = { ...restDto };

    if (iconUrl) {
        iconData.svgContent = await this.fetchSvgFromUrl(iconUrl);
    }
    
    const icon = this.iconRepository.create(iconData);
    return this.iconRepository.save(icon);
  }

  findAll() {
    return this.iconRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const icon = await this.iconRepository.findOneBy({ id });
    if (!icon) {
      throw new NotFoundException(`Icon with ID ${id} not found`);
    }
    return icon;
  }

  async update(id: string, updateIconDto: UpdateIconDto) {
    // FIX: Explicitly handle iconUrl property which exists on the DTO but not the entity.
    const { iconUrl, ...restDto } = updateIconDto;

    // FIX: Define iconData with an explicit type to allow adding svgContent property.
    const iconData: Partial<Icon> = { ...restDto };

    if (iconUrl) {
        iconData.svgContent = await this.fetchSvgFromUrl(iconUrl);
    }

    const icon = await this.iconRepository.preload({ id, ...iconData });
    if (!icon) {
      throw new NotFoundException(`Icon with ID ${id} not found`);
    }
    return this.iconRepository.save(icon);
  }

  async remove(id: string) {
    const result = await this.iconRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`Icon with ID ${id} not found`);
    }
    return { success: true };
  }
}