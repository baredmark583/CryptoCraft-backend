import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalPromoCode } from './entities/global-promocode.entity';
import { CreateGlobalPromoCodeDto } from './dto/create-global-promocode.dto';
import { UpdateGlobalPromoCodeDto } from './dto/update-global-promocode.dto';

@Injectable()
export class GlobalPromoCodesService {
  constructor(
    @InjectRepository(GlobalPromoCode)
    private readonly globalPromoCodeRepository: Repository<GlobalPromoCode>,
  ) {}

  findAll() {
    return this.globalPromoCodeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateGlobalPromoCodeDto, userId?: string) {
    const payload: Partial<GlobalPromoCode> = {
      ...dto,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      createdBy: userId,
      updatedBy: userId,
    };
    const entity = this.globalPromoCodeRepository.create(payload);
    return this.globalPromoCodeRepository.save(entity);
  }

  async update(id: string, dto: UpdateGlobalPromoCodeDto, userId?: string) {
    const payload: Partial<GlobalPromoCode> = {
      ...dto,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      updatedBy: userId,
    };
    const entity = await this.globalPromoCodeRepository.preload({
      id,
      ...payload,
    });
    if (!entity) {
      throw new NotFoundException(`Global promo code with ID ${id} not found.`);
    }
    return this.globalPromoCodeRepository.save(entity);
  }

  async remove(id: string) {
    const result = await this.globalPromoCodeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Global promo code with ID ${id} not found.`);
    }
    return { success: true };
  }
}
