import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIconDto } from './dto/create-icon.dto';
import { UpdateIconDto } from './dto/update-icon.dto';
import { Icon } from './entities/icon.entity';

@Injectable()
export class IconsService {
  constructor(
    @InjectRepository(Icon)
    private readonly iconRepository: Repository<Icon>,
  ) {}
  
  create(createIconDto: CreateIconDto) {
    const icon = this.iconRepository.create(createIconDto);
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
    const icon = await this.iconRepository.preload({ id, ...updateIconDto });
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