import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingCron } from './ranking.cron';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [RankingController],
    providers: [RankingService, RankingCron, PrismaService],
})
export class RankingModule { }
