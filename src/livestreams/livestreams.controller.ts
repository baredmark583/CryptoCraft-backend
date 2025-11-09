import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe, Patch } from '@nestjs/common';
import { LivestreamsService } from './livestreams.service';
import { CreateLivestreamDto } from './dto/create-livestream.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { FlagLivestreamDto } from './dto/flag-livestream.dto';
import { AttachRecordingDto } from './dto/attach-recording.dto';

@Controller('livestreams')
export class LivestreamsController {
  constructor(
    private readonly livestreamsService: LivestreamsService,
    private readonly jwtService: JwtService,
    ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() createLivestreamDto: CreateLivestreamDto) {
    return this.livestreamsService.create(req.user.userId, createLivestreamDto);
  }

  @Get()
  findAll() {
    return this.livestreamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.livestreamsService.findOne(id);
  }
  
  @Post(':id/token')
  async generateToken(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = this.jwtService.verify(token);
            user = { userId: payload.sub, username: payload.username };
        } catch (e) {
            // Invalid token, treat as guest
            user = null;
        }
    }
    
    const token = await this.livestreamsService.generateJoinToken(id, user);
    return { token };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/end')
  endStream(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.livestreamsService.endStream(id, req.user.userId, req.user.role);
  }

  @Post(':id/report')
  async flagStream(@Req() req, @Param('id', ParseUUIDPipe) id: string, @Body() dto: FlagLivestreamDto) {
    let reporterId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = this.jwtService.verify(token);
        reporterId = payload.sub;
      } catch {
        reporterId = null;
      }
    }
    await this.livestreamsService.flagLivestream(id, reporterId, dto);
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/recording')
  attachRecording(@Req() req, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AttachRecordingDto) {
    return this.livestreamsService.attachRecording(id, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/analytics')
  getAnalytics(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.livestreamsService.getAnalytics(id, { id: req.user.userId, role: req.user.role });
  }
}
