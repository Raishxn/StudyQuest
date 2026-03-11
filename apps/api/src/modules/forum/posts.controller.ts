import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreatePostDto, UpdatePostDto, CreateReplyDto } from './dto/forum.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('forum/posts')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class PostsController {
    constructor(private readonly forumService: ForumService) { }

    @Post()
    @Throttle({ default: { limit: 5, ttl: 3600 } }) // 5 posts per hour
    createPost(@Req() req, @Body() dto: CreatePostDto) {
        return this.forumService.createPost(req.user.id, dto);
    }

    @Get()
    getPosts(
        @Query('cursor') cursor?: string,
        @Query('take') take?: string,
        @Query('subject') subject?: string,
        @Query('tags') tags?: string,
        @Query('solved') solved?: string,
        @Query('sort') sort?: 'recent' | 'votes' | 'unanswered',
    ) {
        const isSolved = solved === 'true' ? true : solved === 'false' ? false : undefined;
        const tagList = tags ? tags.split(',') : undefined;
        return this.forumService.getPosts(cursor, take ? parseInt(take) : 20, subject, tagList, isSolved, sort);
    }

    @Get(':id')
    getPostById(@Param('id') id: string) {
        return this.forumService.getPostById(id);
    }

    @Patch(':id')
    updatePost(@Req() req, @Param('id') id: string, @Body() dto: UpdatePostDto) {
        return this.forumService.updatePost(req.user.id, id, dto);
    }

    @Delete(':id')
    deletePost(@Req() req, @Param('id') id: string) {
        return this.forumService.deletePost(req.user.id, id);
    }

    @Delete('mod/:id')
    @Roles(Role.MOD_JUNIOR)
    deleteAnyPost(@Param('id') id: string) {
        // Will be intercepted and checked by RolesGuard
        return this.forumService.deleteAnyPost(id);
    }

    @Patch('mod/:id')
    @Roles(Role.MOD_JUNIOR)
    updateAnyPost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
        return this.forumService.updateAnyPost(id, dto);
    }

    @Post(':id/pin')
    @Roles(Role.MOD_SENIOR)
    pinPost(@Param('id') id: string) {
        return this.forumService.pinPost(id);
    }

    @Post(':id/upvote')
    toggleUpvote(@Req() req, @Param('id') id: string) {
        return this.forumService.togglePostUpvote(req.user.id, id);
    }

    @Post(':id/replies')
    @Throttle({ default: { limit: 20, ttl: 3600 } }) // 20 replies per hour
    createReply(@Req() req, @Param('id') id: string, @Body() dto: CreateReplyDto) {
        return this.forumService.createReply(req.user.id, id, dto);
    }
}
