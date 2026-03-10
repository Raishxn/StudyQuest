import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RankingCron {
    private readonly logger = new Logger(RankingCron.name);

    constructor(
        private prisma: PrismaService,
        private redisService: RedisService,
    ) { }

    // 1. Global & Friends (Every 5 mins)
    @Cron('*/5 * * * *')
    async calculateGlobalRanking() {
        this.logger.log('Calculando ranking global...');
        const periods = ['alltime', 'monthly', 'weekly'];

        for (const period of periods) {
            const dateGte = this.getDateFromPeriod(period);
            const whereClause = dateGte ? {
                xpHistory: { some: { createdAt: { gte: dateGte } } }
            } : {};

            const top500 = await this.prisma.user.findMany({
                where: whereClause,
                orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
                take: 500,
                select: {
                    id: true, username: true, avatarUrl: true,
                    title: true, level: true, xp: true,
                }
            });

            await this.redisService.set(`ranking:global:${period}`, JSON.stringify(top500), 360);
        }
    }

    // 2. Subject Ranking (Every 10 mins)
    @Cron('*/10 * * * *')
    async calculateSubjectRanking() {
        this.logger.log('Calculando ranking por matéria...');
        const topSubjectsRaw = await this.prisma.studySession.groupBy({
            by: ['subject'],
            _count: { subject: true },
            orderBy: { _count: { subject: 'desc' } },
            take: 5
        });

        const periods = ['alltime', 'weekly'];

        for (const subj of topSubjectsRaw) {
            const subject = subj.subject;
            for (const period of periods) {
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
                        id: true, username: true, avatarUrl: true,
                        title: true, level: true,
                        sessions: {
                            where: {
                                subject,
                                ...(dateGte ? { startedAt: { gte: dateGte } } : {})
                            },
                            select: { xpGained: true }
                        }
                    }
                });

                const aggregated = usersRanking.map(u => ({
                    id: u.id, username: u.username, avatarUrl: u.avatarUrl,
                    title: u.title, level: u.level,
                    xp: u.sessions.reduce((acc, s) => acc + s.xpGained, 0)
                })).sort((a, b) => b.xp - a.xp).slice(0, 500);

                await this.redisService.set(`ranking:subject:${subject}:${period}`, JSON.stringify(aggregated), 720);
            }
        }
    }

    // 3. Institution Ranking (Every 10 mins)
    @Cron('2-59/10 * * * *')
    async calculateInstitutionRanking() {
        this.logger.log('Calculando ranking por instituição...');
        const periods = ['alltime', 'weekly'];

        const institutions = await this.prisma.institution.findMany({ where: { active: true }, select: { id: true } });

        for (const inst of institutions) {
            for (const period of periods) {
                const dateGte = this.getDateFromPeriod(period);
                const whereClause: any = { institutionId: inst.id };
                if (dateGte) {
                    whereClause['xpHistory'] = { some: { createdAt: { gte: dateGte } } };
                }

                const top500 = await this.prisma.user.findMany({
                    where: whereClause,
                    orderBy: [{ xp: 'desc' }, { createdAt: 'asc' }],
                    take: 500,
                    select: { id: true, username: true, avatarUrl: true, title: true, level: true, xp: true }
                });

                if (top500.length > 0) {
                    await this.redisService.set(`ranking:institution:${inst.id}:${period}`, JSON.stringify(top500), 720);
                }
            }
        }
    }

    // 5. Weekly Snapshot (Sunday 23:59)
    @Cron('59 23 * * 0')
    async saveWeeklySnapshot() {
        this.logger.log('Salvando snapshot semanal do ranking...');
        const cached = await this.redisService.get('ranking:global:weekly');
        const globalWeekly: any[] = cached ? (JSON.parse(cached) || []) : [];

        const snapshots = globalWeekly.map((user, index) => ({
            userId: user.id,
            xp: user.xp,
            rank: index + 1,
            type: 'GLOBAL',
            period: 'WEEKLY'
        }));

        if (snapshots.length > 0) {
            await this.prisma.rankingSnapshot.createMany({ data: snapshots });
        }
    }

    private getDateFromPeriod(period: string): Date | null {
        if (period === 'alltime') return null;
        const d = new Date();
        if (period === 'weekly') d.setDate(d.getDate() - 7);
        else if (period === 'monthly') d.setMonth(d.getMonth() - 1);
        return d;
    }
}
