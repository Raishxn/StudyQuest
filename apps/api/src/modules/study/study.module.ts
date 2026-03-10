import { Module } from '@nestjs/common';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';
import { SessionCleanupCron } from './session-cleanup.cron';
import { XpModule } from '../xp/xp.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [XpModule],
  controllers: [StudyController],
  providers: [StudyService, SessionCleanupCron, PrismaService],
  exports: [StudyService],
})
export class StudyModule {}
