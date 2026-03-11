import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { CreatePostDto, UpdatePostDto, CreateReplyDto, UpdateReplyDto } from './dto/forum.dto';

@Injectable()
export class ForumService {
    constructor(
        private prisma: PrismaService,
        private xpService: XpService,
    ) { }

    async createPost(userId: string, dto: CreatePostDto) {
        const post = await this.prisma.forumPost.create({
            data: {
                title: dto.title,
                body: dto.body,
                subject: dto.subject,
                tags: dto.tags || [],
                fileUrl: dto.fileUrl,
                authorId: userId,
            },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true, level: true, title: true }
                }
            }
        });
        return post;
    }

    async getPosts(
        cursor?: string,
        take: number = 20,
        subject?: string,
        tags?: string[],
        solved?: boolean,
        sort: 'recent' | 'votes' | 'unanswered' = 'recent'
    ) {
        // build where clause
        const where: any = {};
        if (subject) where.subject = subject;
        if (solved !== undefined) where.solved = solved;
        if (tags && tags.length > 0) {
            where.tags = { hasSome: tags };
        }

        // unanswered specific filter
        if (sort === 'unanswered') {
            where.replies = { none: {} };
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'votes') orderBy = { upvotes: 'desc' };

        const args: any = {
            take,
            where,
            orderBy,
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true, level: true, title: true }
                },
                _count: { select: { replies: true } }
            }
        };
        if (cursor) {
            args.cursor = { id: cursor };
            args.skip = 1;
        }

        const posts = await this.prisma.forumPost.findMany(args);

        const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;
        return { data: posts, nextCursor };
    }

    async getPostById(postId: string) {
        const post = await this.prisma.forumPost.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true, level: true, title: true }
                },
                replies: {
                    include: {
                        author: { select: { id: true, username: true, avatarUrl: true, level: true, title: true } }
                    },
                    orderBy: [
                        { isAccepted: 'desc' },
                        { upvotes: 'desc' },
                        { createdAt: 'asc' }
                    ]
                }
            }
        });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }

    async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
        const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');

        if (post.authorId !== userId) {
            throw new ForbiddenException('Only the author can update this post');
        }

        const hrsPassed = (new Date().getTime() - post.createdAt.getTime()) / (1000 * 60 * 60);
        if (hrsPassed > 24) {
            throw new ForbiddenException('Posts can only be edited within the first 24 hours');
        }

        return this.prisma.forumPost.update({
            where: { id: postId },
            data: dto
        });
    }

    async deletePost(userId: string, postId: string) {
        const post = await this.prisma.forumPost.findUnique({ where: { id: postId }, include: { author: true } });
        if (!post) throw new NotFoundException('Post not found');

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (post.authorId !== userId && user?.role !== 'admin' && user?.role !== 'moderator') {
            throw new ForbiddenException('Only the author or a moderator can delete this post');
        }

        await this.prisma.forumPost.delete({ where: { id: postId } });
        return { success: true };
    }

    async togglePostUpvote(userId: string, postId: string) {
        const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');
        if (post.authorId === userId) throw new BadRequestException('You cannot upvote your own post');

        const existing = await this.prisma.forumPostUpvote.findUnique({
            where: { postId_userId: { postId, userId } }
        });

        if (existing) {
            await this.prisma.forumPostUpvote.delete({ where: { id: existing.id } });
            const updatedPost = await this.prisma.forumPost.update({
                where: { id: postId },
                data: { upvotes: { decrement: 1 } }
            });
            return { upvoted: false, totalVotes: updatedPost.upvotes };
        } else {
            await this.prisma.forumPostUpvote.create({ data: { postId, userId } });
            const updatedPost = await this.prisma.forumPost.update({
                where: { id: postId },
                data: { upvotes: { increment: 1 } }
            });
            return { upvoted: true, totalVotes: updatedPost.upvotes };
        }
    }

    async createReply(userId: string, postId: string, dto: CreateReplyDto) {
        const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');

        const reply = await this.prisma.forumReply.create({
            data: {
                postId,
                authorId: userId,
                body: dto.body,
                fileUrl: dto.fileUrl
            },
            include: {
                author: { select: { id: true, username: true, avatarUrl: true, level: true, title: true } }
            }
        });
        return reply;
    }

    async updateReply(userId: string, replyId: string, dto: UpdateReplyDto) {
        const reply = await this.prisma.forumReply.findUnique({ where: { id: replyId } });
        if (!reply) throw new NotFoundException('Reply not found');

        if (reply.authorId !== userId) {
            throw new ForbiddenException('Only the author can update this reply');
        }

        const hrsPassed = (new Date().getTime() - reply.createdAt.getTime()) / (1000 * 60 * 60);
        if (hrsPassed > 24) throw new ForbiddenException('Replies can only be edited within the first 24 hours');

        return this.prisma.forumReply.update({
            where: { id: replyId },
            data: dto
        });
    }

    async acceptReply(userId: string, replyId: string) {
        const reply = await this.prisma.forumReply.findUnique({ where: { id: replyId }, include: { post: true } });
        if (!reply) throw new NotFoundException('Reply not found');
        if (reply.post.authorId !== userId) throw new ForbiddenException('Only the post author can mark a reply as accepted');

        // Deselect any previous accepted reply
        await this.prisma.forumReply.updateMany({
            where: { postId: reply.postId, isAccepted: true },
            data: { isAccepted: false }
        });

        const updatedReply = await this.prisma.forumReply.update({
            where: { id: replyId },
            data: { isAccepted: true }
        });

        await this.prisma.forumPost.update({
            where: { id: reply.postId },
            data: { solved: true }
        });

        // Reward the reply author
        await this.xpService.addXP(reply.authorId, 20, 'REPLY', reply.postId);

        return updatedReply;
    }

    async toggleReplyUpvote(userId: string, replyId: string) {
        const reply = await this.prisma.forumReply.findUnique({ where: { id: replyId } });
        if (!reply) throw new NotFoundException('Reply not found');
        if (reply.authorId === userId) throw new BadRequestException('You cannot upvote your own reply');

        const existing = await this.prisma.forumReplyUpvote.findUnique({
            where: { replyId_userId: { replyId, userId } }
        });

        if (existing) {
            await this.prisma.forumReplyUpvote.delete({ where: { id: existing.id } });
            const updatedReply = await this.prisma.forumReply.update({
                where: { id: replyId },
                data: { upvotes: { decrement: 1 } }
            });
            return { upvoted: false, totalVotes: updatedReply.upvotes };
        } else {
            await this.prisma.forumReplyUpvote.create({ data: { replyId, userId } });
            const updatedReply = await this.prisma.forumReply.update({
                where: { id: replyId },
                data: { upvotes: { increment: 1 } }
            });
            return { upvoted: true, totalVotes: updatedReply.upvotes };
        }
    }

    // === Moderation methods ===

    async deleteAnyPost(postId: string) {
        const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');
        await this.prisma.forumPost.delete({ where: { id: postId } });
        return { success: true };
    }

    async updateAnyPost(postId: string, dto: UpdatePostDto) {
        const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');
        return this.prisma.forumPost.update({
            where: { id: postId },
            data: dto,
        });
    }

    async pinPost(postId: string) {
        const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');
        // pinned field not yet in schema — just acknowledge for now
        return { success: true, message: 'Pin toggled' };
    }

    async deleteAnyReply(replyId: string) {
        const reply = await this.prisma.forumReply.findUnique({ where: { id: replyId } });
        if (!reply) throw new NotFoundException('Reply not found');
        await this.prisma.forumReply.delete({ where: { id: replyId } });
        return { success: true };
    }
}
