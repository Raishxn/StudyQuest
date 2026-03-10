import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { StudyService } from './study.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('study/sessions')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post()
  create(@Request() req, @Body() createSessionDto: CreateSessionDto) {
    return this.studyService.createSession(req.user.id, createSessionDto);
  }

  @Get()
  getHistory(@Request() req, @Query() query: any) {
    return this.studyService.getSessionHistory(req.user.id, query);
  }

  @Get('active')
  getActive(@Request() req) {
    return this.studyService.getActiveSession(req.user.id);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.studyService.getStats(req.user.id);
  }

  @Get(':id')
  getById(@Request() req, @Param('id') id: string) {
    return this.studyService.getById(id, req.user.id);
  }

  @Patch(':id/heartbeat')
  heartbeat(@Request() req, @Param('id') id: string) {
    return this.studyService.heartbeat(id, req.user.id);
  }

  @Patch(':id/pause')
  pause(@Request() req, @Param('id') id: string) {
    return this.studyService.pause(id, req.user.id);
  }

  @Patch(':id/resume')
  resume(@Request() req, @Param('id') id: string) {
    return this.studyService.resume(id, req.user.id);
  }

  @Patch(':id/pomodoro-complete')
  pomodoroComplete(@Request() req, @Param('id') id: string) {
    return this.studyService.pomodoroComplete(id, req.user.id);
  }

  @Patch(':id/end')
  end(@Request() req, @Param('id') id: string, @Body() endSessionDto: EndSessionDto) {
    return this.studyService.endSession(id, req.user.id, endSessionDto);
  }
}
