import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Post('request')
    async sendRequest(@CurrentUser() user: any, @Body('targetUserId') targetUserId: string) {
        return this.friendsService.sendRequest(user.id, targetUserId);
    }

    @Get('requests')
    async listPendingRequests(@CurrentUser() user: any) {
        return this.friendsService.listPendingRequests(user.id);
    }

    @Patch(':id/accept')
    @HttpCode(HttpStatus.OK)
    async acceptRequest(@CurrentUser() user: any, @Param('id') id: string) {
        return this.friendsService.acceptRequest(user.id, id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async removeFriendship(@CurrentUser() user: any, @Param('id') id: string) {
        return this.friendsService.removeFriendship(user.id, id);
    }

    @Post(':id/block')
    @HttpCode(HttpStatus.OK)
    async blockUser(@CurrentUser() user: any, @Param('id') id: string) {
        return this.friendsService.blockUser(user.id, id);
    }

    @Get()
    async listFriends(
        @CurrentUser() user: any,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.friendsService.listFriends(user.id, parseInt(page), parseInt(limit));
    }

    @Get('status/:targetUserId')
    async getFriendshipStatus(@CurrentUser() user: any, @Param('targetUserId') targetUserId: string) {
        return this.friendsService.getFriendshipStatus(user.id, targetUserId);
    }

    @Get('search')
    async searchFriends(@CurrentUser() user: any, @Query('q') query: string) {
        return this.friendsService.searchUsers(user.id, query);
    }
}
