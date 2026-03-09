import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AchievementsService } from './achievements.service';

@Processor('xp-events')
export class XpEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(XpEventsProcessor.name);

  constructor(private readonly achievementsService: AchievementsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing xp-events job: ${job.name} for User: ${job.data?.userId}`);

    const { userId, event, context } = job.data;

    try {
      if (job.name === 'check-achievements') {
        const unlocked = await this.achievementsService.checkAndUnlock(userId, event, context);
        if (unlocked.length > 0) {
          this.logger.log(`Job unlocked ${unlocked.length} achievements for user ${userId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}:`, error);
      throw error;
    }

    return {};
  }
}
