import { Controller, Patch, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ForumService } from './forum.service';
import { UpdateReplyDto } from './dto/forum.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('forum/replies')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class RepliesController {
    constructor(private readonly forumService: ForumService) { }

    @Patch(':id')
    updateReply(@Req() req, @Param('id') id: string, @Body() dto: UpdateReplyDto) {
        return this.forumService.updateReply(req.user.id, id, dto);
    }

    @Patch(':id/accept')
    acceptReply(@Req() req, @Param('id') id: string) {
        return this.forumService.acceptReply(req.user.id, id);
    }

    @Post(':id/upvote')
    toggleUpvote(@Req() req, @Param('id') id: string) {
        return this.forumService.toggleReplyUpvote(req.user.id, id);
    }
}
