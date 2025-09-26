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

  async upsert(upsertIconDto: CreateIconDto) {
    const { name, iconUrl, svgContent } = upsertIconDto;

    if (!iconUrl && !svgContent) {
        throw new BadRequestException('Either svgContent or iconUrl must be provided.');
    }

    const iconData: Partial<Icon> = { name };
    if (iconUrl) {
        iconData.svgContent = await this.fetchSvgFromUrl(iconUrl);
    } else if (svgContent) {
        iconData.svgContent = svgContent;
    }

    const existingIcon = await this.iconRepository.findOne({ where: { name } });
    
    if (existingIcon) {
      await this.iconRepository.update(existingIcon.id, { svgContent: iconData.svgContent });
      return this.findOne(existingIcon.id);
    } else {
      const newIcon = this.iconRepository.create(iconData);
      return this.iconRepository.save(newIcon);
    }
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
    // FIX: The destructuring was causing a type error. This implementation now accesses properties directly from the DTO.
    const updatePayload: Partial<Icon> = {};

    const { name, iconUrl, svgContent } = updateIconDto;

    if (name) {
      updatePayload.name = name;
    }

    // `iconUrl` takes precedence over `svgContent` if both are provided.
    if (iconUrl) {
      updatePayload.svgContent = await this.fetchSvgFromUrl(iconUrl);
    } else if (svgContent) {
      updatePayload.svgContent = svgContent;
    }

    const icon = await this.iconRepository.preload({ id, ...updatePayload });
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