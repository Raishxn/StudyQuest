import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RankingService } from './ranking.service';
import { Request } from 'express';

@Controller('ranking')
@UseGuards(JwtAuthGuard)
export class RankingController {
    constructor(private readonly rankingService: RankingService) { }

    @Get('global')
    async getGlobalRanking(@Req() req: any, @Query('period') period: string) {
        return this.rankingService.getGlobalRanking(req.user['sub'], period || 'alltime');
    }

    @Get('subject/:subject')
    async getSubjectRanking(@Req() req: any, @Param('subject') subject: string, @Query('period') period: string) {
        return this.rankingService.getSubjectRanking(req.user['sub'], subject, period || 'alltime');
    }

    @Get('friends')
    async getFriendsRanking(@Req() req: any, @Query('period') period: string) {
        return this.rankingService.getFriendsRanking(req.user['sub'], period || 'alltime');
    }

    @Get('institution')
    async getInstitutionRanking(@Req() req: any, @Query('period') period: string) {
        return this.rankingService.getInstitutionRanking(req.user['sub'], period || 'alltime');
    }

    @Get('me')
    async getUserPositions(@Req() req: any) {
        return this.rankingService.getUserPositions(req.user['sub']);
    }
}
