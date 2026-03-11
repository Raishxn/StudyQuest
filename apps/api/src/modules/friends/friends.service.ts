import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FriendsService {
    private readonly logger = new Logger(FriendsService.name);
    private readonly MAX_DAILY_REQUESTS = 20;
    private readonly MAX_FRIENDS = 500;

    constructor(private prisma: PrismaService) { }

    async sendRequest(fromId: string, targetUserId: string) {
        if (fromId === targetUserId) {
            throw new BadRequestException('Não é possível adicionar a si mesmo');
        }

        // Check target exists
        const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!target) throw new NotFoundException('Usuário não encontrado');

        // Check if blocked by target
        const blocked = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { fromId: targetUserId, toId: fromId, status: 'BLOCKED' },
                    { fromId, toId: targetUserId, status: 'BLOCKED' },
                ],
            },
        });
        if (blocked) throw new ForbiddenException('Não é possível enviar solicitação');

        // Check existing friendship
        const existing = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { fromId, toId: targetUserId },
                    { fromId: targetUserId, toId: fromId },
                ],
                status: { in: ['PENDING', 'ACCEPTED'] },
            },
        });
        if (existing) throw new ConflictException('Solicitação já existe ou já são amigos');

        // Check friend count limit
        const friendCount = await this.prisma.friendship.count({
            where: {
                OR: [{ fromId }, { toId: fromId }],
                status: 'ACCEPTED',
            },
        });
        if (friendCount >= this.MAX_FRIENDS) {
            throw new BadRequestException('Limite de amigos atingido (500)');
        }

        // Check daily request limit
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const dailyCount = await this.prisma.friendship.count({
            where: {
                fromId,
                status: 'PENDING',
                createdAt: { gte: startOfDay },
            },
        });
        if (dailyCount >= this.MAX_DAILY_REQUESTS) {
            throw new BadRequestException('Limite diário de solicitações atingido (20)');
        }

        return this.prisma.friendship.create({
            data: { fromId, toId: targetUserId, status: 'PENDING' },
            include: {
                to: { select: { id: true, username: true, avatarUrl: true, level: true } },
            },
        });
    }

    async listPendingRequests(userId: string) {
        return this.prisma.friendship.findMany({
            where: { toId: userId, status: 'PENDING' },
            include: {
                from: { select: { id: true, username: true, avatarUrl: true, level: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async acceptRequest(userId: string, friendshipId: string) {
        const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
        if (!friendship) throw new NotFoundException('Solicitação não encontrada');
        if (friendship.toId !== userId) throw new ForbiddenException('Não autorizado');
        if (friendship.status !== 'PENDING') throw new BadRequestException('Solicitação já processada');

        return this.prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: 'ACCEPTED' },
            include: {
                from: { select: { id: true, username: true, avatarUrl: true, level: true } },
                to: { select: { id: true, username: true, avatarUrl: true, level: true } },
            },
        });
    }

    async removeFriendship(userId: string, friendshipId: string) {
        const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
        if (!friendship) throw new NotFoundException('Amizade não encontrada');
        if (friendship.fromId !== userId && friendship.toId !== userId) {
            throw new ForbiddenException('Não autorizado');
        }

        await this.prisma.friendship.delete({ where: { id: friendshipId } });
        return { message: 'Amizade removida' };
    }

    async blockUser(userId: string, friendshipId: string) {
        const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
        if (!friendship) throw new NotFoundException('Relação não encontrada');
        if (friendship.fromId !== userId && friendship.toId !== userId) {
            throw new ForbiddenException('Não autorizado');
        }

        const targetId = friendship.fromId === userId ? friendship.toId : friendship.fromId;

        // Remove any reverse friendship
        await this.prisma.friendship.deleteMany({
            where: {
                OR: [
                    { fromId: targetId, toId: userId },
                    { fromId: userId, toId: targetId },
                ],
                id: { not: friendshipId },
            },
        });

        // Update to blocked
        return this.prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: 'BLOCKED', fromId: userId, toId: targetId },
        });
    }

    async listFriends(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [friendships, total] = await Promise.all([
            this.prisma.friendship.findMany({
                where: {
                    OR: [{ fromId: userId }, { toId: userId }],
                    status: 'ACCEPTED',
                },
                include: {
                    from: { select: { id: true, username: true, avatarUrl: true, level: true, title: true, xp: true } },
                    to: { select: { id: true, username: true, avatarUrl: true, level: true, title: true, xp: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.friendship.count({
                where: {
                    OR: [{ fromId: userId }, { toId: userId }],
                    status: 'ACCEPTED',
                },
            }),
        ]);

        return {
            friends: friendships.map(f => ({
                friendshipId: f.id,
                friend: f.fromId === userId ? f.to : f.from,
                since: f.createdAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getFriendshipStatus(userId: string, targetUserId: string) {
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { fromId: userId, toId: targetUserId },
                    { fromId: targetUserId, toId: userId },
                ],
            },
        });

        if (!friendship) return { status: 'NONE', friendshipId: null };

        return {
            status: friendship.status,
            friendshipId: friendship.id,
            direction: friendship.fromId === userId ? 'SENT' : 'RECEIVED',
        };
    }

    async searchUsers(userId: string, query: string) {
        if (!query || query.trim().length < 2) return [];

        const existingFriendships = await this.prisma.friendship.findMany({
            where: {
                OR: [{ fromId: userId }, { toId: userId }],
            },
            select: { fromId: true, toId: true }
        });

        const excludedIds = new Set<string>([userId]);
        existingFriendships.forEach(f => {
            excludedIds.add(f.fromId);
            excludedIds.add(f.toId);
        });

        // 5s timeout implementation for Prisma findMany
        const fetchPromise = this.prisma.user.findMany({
            where: {
                username: { contains: query.trim(), mode: 'insensitive' },
                id: { notIn: Array.from(excludedIds) },
            },
            take: 20,
            select: { id: true, username: true, name: true, avatarUrl: true, level: true, title: true, xp: true },
        });

        const timeoutPromise = new Promise<any[]>((_, reject) =>
            setTimeout(() => reject(new Error('Search timeout')), 5000)
        );

        return Promise.race([fetchPromise, timeoutPromise]);
    }
}
