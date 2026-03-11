import { Controller, Get, UseGuards } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionsController {
    constructor(private readonly missionsService: MissionsService) { }

    @Get('weekly')
    async getWeeklyMissions(@CurrentUser() user: any) {
        return this.missionsService.getMyWeeklyMissions(user.id);
    }
}
