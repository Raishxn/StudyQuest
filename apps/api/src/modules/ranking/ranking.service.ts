import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RankingService {
    private readonly logger = new Logger(RankingService.name);

    constructor(
        private redisService: RedisService,
        private prisma: PrismaService,
    ) { }

    async getGlobalRanking(userId: string, period: string, page: number = 1) {
        const cacheKey = `ranking:global:${period}`;

        // Try cache first
        const cached = await this.redisService.get(cacheKey);
        let ranking: any[] = [];

        if (cached) {
            try {
                ranking = JSON.parse(cached);
            } catch {
                // Invalid JSON in cache — ignore
            }
        }

        // Fallback: query PostgreSQL directly
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

            // Try to cache (non-blocking, best-effort)
            await this.redisService.set(cacheKey, JSON.stringify(ranking), 300);
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
        let ranking: any[] = [];

        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            try { ranking = JSON.parse(cached); } catch { /* ignore */ }
        }

        // Fallback: if cache is empty, query DB
        if (ranking.length === 0) {
            const dateGte = this.getDateFromPeriod(period);
            const usersRanking = await this.prisma.user.findMany({
                where: {
                    sessions: {
                        some: {
                            subject,
                            ...(dateGte ? { startedAt: { gte: dateGte } } : {})
                        }
                    }
                },
                select: {
                    id: true, username: true, avatarUrl: true, title: true, level: true,
                    sessions: {
                        where: { subject, ...(dateGte ? { startedAt: { gte: dateGte } } : {}) },
                        select: { xpGained: true },
                    },
                },
            });
            ranking = usersRanking
                .map(u => ({
                    id: u.id, username: u.username, avatarUrl: u.avatarUrl,
                    title: u.title, level: u.level,
                    xp: u.sessions.reduce((acc, s) => acc + s.xpGained, 0),
                }))
                .sort((a, b) => b.xp - a.xp)
                .slice(0, 100);
        }

        const userIndex = ranking.findIndex(u => u.id === userId);

        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : null,
        };
    }

    async getFriendsRanking(userId: string, period: string) {
        const cacheKey = `ranking:global:${period}`;
        let globalRanking: any[] = [];

        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            try { globalRanking = JSON.parse(cached); } catch { /* ignore */ }
        }

        // Fallback: query DB directly if cache is empty
        if (globalRanking.length === 0) {
            const dateGte = this.getDateFromPeriod(period);
            const whereClause = dateGte ? {
                xpHistory: { some: { createdAt: { gte: dateGte } } }
            } : {};
            globalRanking = await this.prisma.user.findMany({
                where: whereClause,
                orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
                take: 100,
                select: { id: true, username: true, avatarUrl: true, title: true, level: true, xp: true },
            });
        }

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
        let ranking: any[] = [];

        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            try { ranking = JSON.parse(cached); } catch { /* ignore */ }
        }

        // Fallback
        if (ranking.length === 0) {
            const dateGte = this.getDateFromPeriod(period);
            const whereClause: any = { institutionId: user.institutionId };
            if (dateGte) {
                whereClause['xpHistory'] = { some: { createdAt: { gte: dateGte } } };
            }
            ranking = await this.prisma.user.findMany({
                where: whereClause,
                orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
                take: 100,
                select: { id: true, username: true, avatarUrl: true, title: true, level: true, xp: true },
            });
        }

        const userIndex = ranking.findIndex(u => u.id === userId);
        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : null,
        };
    }

    async getUserPositions(userId: string) {
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
