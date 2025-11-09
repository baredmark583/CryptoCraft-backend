import { Controller, Get, Patch, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.MODERATOR)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  findAll() {
    return this.disputesService.findAll();
  }

  @Get('report')
  getReport() {
    return this.disputesService.getReport();
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDisputeDto: UpdateDisputeDto) {
    return this.disputesService.update(id, updateDisputeDto);
  }
}
