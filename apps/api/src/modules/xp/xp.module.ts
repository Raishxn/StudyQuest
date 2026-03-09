import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { XpService } from './xp.service';
import { AchievementsService } from './achievements.service';
import { StreakService } from './streak.service';
import { XpEventsProcessor } from './xp-events.processor';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'xp-events',
    }),
  ],
  providers: [
    XpService,
    AchievementsService,
    StreakService,
    XpEventsProcessor,
    PrismaService,
  ],
  exports: [XpService, AchievementsService, StreakService],
})
export class XpModule {}
