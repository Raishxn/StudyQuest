import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RankingService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private prisma: PrismaService,
    ) { }

    async getGlobalRanking(userId: string, period: string, page: number = 1) {
        const cacheKey = `ranking:global:${period}`;
        let ranking: any[] = await this.cacheManager.get(cacheKey) || [];

        if (ranking.length === 0) {
            const dateGte = this.getDateFromPeriod(period);
            const whereClause = dateGte ? {
                xpHistory: { some: { createdAt: { gte: dateGte } } }
            } : {};

            ranking = await this.prisma.user.findMany({
                where: whereClause,
                orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
                take: 100,
                select: { id: true, username: true, avatarUrl: true, title: true, level: true, xp: true }
            });
        }

        const userIndex = ranking.findIndex(u => u.id === userId);
        const userPosition = userIndex >= 0 ? userIndex + 1 : null;

        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition,
            totalLimit: ranking.length
        };
    }

    async getSubjectRanking(userId: string, subject: string, period: string) {
        const cacheKey = `ranking:subject:${subject}:${period}`;
        const ranking: any[] = await this.cacheManager.get(cacheKey) || [];

        const userIndex = ranking.findIndex(u => u.id === userId);

        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : null,
        };
    }

    async getFriendsRanking(userId: string, period: string) {
        const cacheKey = `ranking:global:${period}`;
        const globalRanking: any[] = await this.cacheManager.get(cacheKey) || [];

        const friendships = await this.prisma.friendship.findMany({
            where: {
                OR: [{ fromId: userId }, { toId: userId }],
                status: 'ACCEPTED'
            }
        });

        const friendIds = new Set(friendships.map(f => f.fromId === userId ? f.toId : f.fromId));
        friendIds.add(userId);

        const friendsRanking = globalRanking.filter(u => friendIds.has(u.id));
        const userIndex = friendsRanking.findIndex(u => u.id === userId);

        return {
            top3: friendsRanking.slice(0, 3),
            list: friendsRanking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : null,
        };
    }

    async getInstitutionRanking(userId: string, period: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { institutionId: true } });
        if (!user?.institutionId) return { top3: [], list: [], userPosition: null };

        const cacheKey = `ranking:institution:${user.institutionId}:${period}`;
        const ranking: any[] = await this.cacheManager.get(cacheKey) || [];

        const userIndex = ranking.findIndex(u => u.id === userId);

        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : null,
        };
    }

    async getUserPositions(userId: string) {
        // Placeholder positions
        return {
            global: { period: 'weekly', rank: 42, xp: 5000 },
            institution: { period: 'weekly', rank: 5, xp: 5000 }
        };
    }

    private getDateFromPeriod(period: string): Date | null {
        if (period === 'alltime') return null;
        const d = new Date();
        if (period === 'weekly') d.setDate(d.getDate() - 7);
        else if (period === 'monthly') d.setMonth(d.getMonth() - 1);
        return d;
    }
}
