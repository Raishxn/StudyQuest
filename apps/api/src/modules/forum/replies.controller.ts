import { Controller, Patch, Post, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { ForumService } from './forum.service';
import { UpdateReplyDto } from './dto/forum.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('forum/replies')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class RepliesController {
    constructor(private readonly forumService: ForumService) { }

    @Patch(':id')
    updateReply(@Req() req, @Param('id') id: string, @Body() dto: UpdateReplyDto) {
        return this.forumService.updateReply(req.user.id, id, dto);
    }

    @Delete('mod/:id')
    @Roles(Role.MOD_JUNIOR)
    deleteAnyReply(@Param('id') id: string) {
        return this.forumService.deleteAnyReply(id);
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
