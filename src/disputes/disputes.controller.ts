import { Controller, Get, Patch, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateDisputeDto } from './dto/update-dispute.dto';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  findAll() {
    return this.disputesService.findAll();
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDisputeDto: UpdateDisputeDto) {
    return this.disputesService.update(id, updateDisputeDto);
  }
}