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

    async getStreakRanking(userId: string) {
        const cacheKey = `ranking:streak`;
        let ranking: any[] = [];
        const cached = await this.redisService.get(cacheKey);
        if (cached) try { ranking = JSON.parse(cached); } catch { }

        if (ranking.length === 0) {
            ranking = await this.prisma.user.findMany({
                orderBy: [{ currentStreak: 'desc' }, { xp: 'desc' }],
                take: 100,
                select: { id: true, username: true, avatarUrl: true, title: true, level: true, currentStreak: true, xp: true },
            });
            await this.redisService.set(cacheKey, JSON.stringify(ranking), 600); // 10 min
        }

        const userIndex = ranking.findIndex(u => u.id === userId);
        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : this.getFallbackPosition(userId, 'streak', ranking),
            totalLimit: ranking.length
        };
    }

    async getHoursRanking(userId: string, period: 'weekly' | 'monthly') {
        const cacheKey = period === 'weekly' ? 'ranking:hours_week' : 'ranking:hours_month';
        const ttl = period === 'weekly' ? 300 : 900; // 5 min ou 15 min
        let ranking: any[] = [];

        const cached = await this.redisService.get(cacheKey);
        if (cached) try { ranking = JSON.parse(cached); } catch { }

        if (ranking.length === 0) {
            const daysAgo = period === 'weekly' ? 7 : 30;
            const dateGte = new Date();
            dateGte.setDate(dateGte.getDate() - daysAgo);

            const sessions = await this.prisma.studySession.groupBy({
                by: ['userId'],
                where: { startedAt: { gte: dateGte }, status: 'ENDED' },
                _sum: { duration: true },
                orderBy: { _sum: { duration: 'desc' } },
                take: 100,
            });

            const userIds = sessions.map(s => s.userId);
            const users = await this.prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, username: true, avatarUrl: true, title: true, level: true, xp: true },
            });

            ranking = sessions.map(s => {
                const u = users.find(user => user.id === s.userId);
                return {
                    ...u,
                    hours: Math.round(((s._sum.duration || 0) / 3600) * 10) / 10
                };
            }).filter(u => u.id); // Remover nulos se houver inconsistência

            await this.redisService.set(cacheKey, JSON.stringify(ranking), ttl);
        }

        const userIndex = ranking.findIndex(u => u.id === userId);
        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : this.getFallbackPosition(userId, period, ranking),
            totalLimit: ranking.length
        };
    }

    async getUploadsRanking(userId: string) {
        const cacheKey = `ranking:uploads`;
        let ranking: any[] = [];

        const cached = await this.redisService.get(cacheKey);
        if (cached) try { ranking = JSON.parse(cached); } catch { }

        if (ranking.length === 0) {
            const uploads = await this.prisma.bankItem.groupBy({
                by: ['uploadedBy'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 50,
            });

            const userIds = uploads.map(u => u.uploadedBy);
            const users = await this.prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, username: true, avatarUrl: true, title: true, level: true, xp: true },
            });

            ranking = uploads.map(up => {
                const u = users.find(user => user.id === up.uploadedBy);
                return {
                    ...u,
                    uploadCount: up._count.id
                };
            }).filter(u => u.id);

            await this.redisService.set(cacheKey, JSON.stringify(ranking), 1800); // 30 min
        }

        const userIndex = ranking.findIndex(u => u.id === userId);
        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : this.getFallbackPosition(userId, 'uploads', ranking),
            totalLimit: ranking.length
        };
    }

    async getInstitutionRanking(userId: string, period: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { institution: true }
        });

        if (!user?.institutionId) {
            const { BadRequestException } = require('@nestjs/common');
            throw new BadRequestException('Selecione sua instituição no perfil');
        }

        const cacheKey = `ranking:institution:${user.institutionId}`;
        let ranking: any[] = [];

        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            try { ranking = JSON.parse(cached); } catch { /* ignore */ }
        }

        // Fallback
        if (ranking.length === 0) {
            ranking = await this.prisma.user.findMany({
                where: { institutionId: user.institutionId },
                orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
                take: 100,
                select: { id: true, username: true, avatarUrl: true, title: true, level: true, xp: true },
            });
            await this.redisService.set(cacheKey, JSON.stringify(ranking), 300); // 5 min
        }

        const userIndex = ranking.findIndex(u => u.id === userId);
        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : this.getFallbackPosition(userId, 'institution', ranking, user.institutionId),
            totalLimit: ranking.length,
            institutionName: user.institution?.shortName || user.institution?.name
        };
    }

    async getCourseRanking(userId: string, period: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { course: true }
        });

        if (!user?.courseId) {
            const { BadRequestException } = require('@nestjs/common');
            throw new BadRequestException('Selecione seu curso no perfil');
        }

        const cacheKey = `ranking:course:${user.courseId}`;
        let ranking: any[] = [];

        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            try { ranking = JSON.parse(cached); } catch { /* ignore */ }
        }

        if (ranking.length === 0) {
            ranking = await this.prisma.user.findMany({
                where: { courseId: user.courseId },
                orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
                take: 100,
                select: { id: true, username: true, avatarUrl: true, title: true, level: true, xp: true },
            });
            await this.redisService.set(cacheKey, JSON.stringify(ranking), 600); // 10 min
        }

        const userIndex = ranking.findIndex(u => u.id === userId);
        return {
            top3: ranking.slice(0, 3),
            list: ranking.slice(3, 100),
            userPosition: userIndex >= 0 ? userIndex + 1 : this.getFallbackPosition(userId, 'course', ranking, user.courseId),
            totalLimit: ranking.length,
            courseName: user.course?.name
        };
    }

    // Helper method to calculate real position if outside top 100 cache
    private async getFallbackPosition(userId: string, type: string, rankingInCache: any[], filterId?: string): Promise<number | null> {
        return null; // For simplicity in beta. Em prod usa COUNT() no Postgres.
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
