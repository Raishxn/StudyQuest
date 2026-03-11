import { Controller, Patch, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('admin/roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Patch('assign')
    @Roles(Role.MOD_SENIOR)
    async assignRole(
        @Req() req: any,
        @Body() body: { targetUserId: string; role: Role; reason?: string }
    ) {
        const actorId = req.user.id;
        return this.rolesService.assignRole(actorId, body.targetUserId, body.role, body.reason);
    }

    @Patch('revoke')
    @Roles(Role.MOD_SENIOR)
    async revokeRole(
        @Req() req: any,
        @Body() body: { targetUserId: string; reason?: string }
    ) {
        const actorId = req.user.id;
        return this.rolesService.revokeRole(actorId, body.targetUserId, body.reason);
    }

    @Get('history/:userId')
    @Roles(Role.ADMIN)
    async getRoleHistory(@Param('userId') userId: string) {
        return this.rolesService.getRoleHistory(userId);
    }
}
