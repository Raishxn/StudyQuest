import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StudyService } from './study.service';

@Injectable()
export class SessionCleanupCron {
  private readonly logger = new Logger(SessionCleanupCron.name);

  constructor(private readonly studyService: StudyService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAbandonedSessions() {
    this.logger.log('Starting abandoned sessions cleanup...');
    try {
      await this.studyService.autoEndAbandonedSessions();
    } catch (error) {
      this.logger.error('Failed to cleanup abandoned sessions', error);
    }
  }
}
