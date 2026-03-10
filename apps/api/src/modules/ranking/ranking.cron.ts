import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RankingCron {
    private readonly logger = new Logger(RankingCron.name);

    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
            } : {}; // Activity in timeframe

            const top500 = await this.prisma.user.findMany({
                where: whereClause,
                orderBy: [
                    { xp: 'desc' },
                    { createdAt: 'asc' } // Tie-breaker
                ],
                take: 500,
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    title: true,
                    level: true,
                    xp: true,
                }
            });

            await this.cacheManager.set(`ranking:global:${period}`, top500, 360000); // 6 mins (360s * 1000)

            // Friends are derived dynamically on the service side from this global map, 
            // but we can pre-calculate global mapping to make it O(1)
        }
    }

    // 2. Subject Ranking (Every 10 mins)
    @Cron('*/10 * * * *')
    async calculateSubjectRanking() {
        this.logger.log('Calculando ranking por matéria...');
        // Em um sistema real, buscaríamos os top assuntos distintos de StudySession.
        // Simplificado: as top 5 matérias com mais sessões no geral
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

                // Usuários ordenados por xpGained NAQUELA MATÉRIA
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
                        id: true,
                        username: true,
                        avatarUrl: true,
                        title: true,
                        level: true,
                        sessions: {
                            where: {
                                subject,
                                ...(dateGte ? { startedAt: { gte: dateGte } } : {})
                            },
                            select: { xpGained: true }
                        }
                    }
                });

                // Somar XP da matéria em memória e ordenar (se muitos dados, usar query raw SQL)
                const aggregated = usersRanking.map(u => ({
                    id: u.id,
                    username: u.username,
                    avatarUrl: u.avatarUrl,
                    title: u.title,
                    level: u.level,
                    xp: u.sessions.reduce((acc, s) => acc + s.xpGained, 0)
                })).sort((a, b) => b.xp - a.xp).slice(0, 500);

                await this.cacheManager.set(`ranking:subject:${subject}:${period}`, aggregated, 720000); // 12 mins
            }
        }
    }

    // 3. Institution Ranking (Every 10 mins)
    @Cron('2-59/10 * * * *') // Offset para evitar picos
    async calculateInstitutionRanking() {
        this.logger.log('Calculando ranking por instituição...');
        const periods = ['alltime', 'weekly'];

        // Pegar todas as instituições ativas (num cenario real, paginar)
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
                    await this.cacheManager.set(`ranking:institution:${inst.id}:${period}`, top500, 720000);
                }
            }
        }
    }

    // 5. Weekly Snapshot (Sunday 23:59)
    @Cron('59 23 * * 0')
    async saveWeeklySnapshot() {
        this.logger.log('Salvando snapshot semanal do ranking...');
        const globalWeekly: any[] = await this.cacheManager.get(`ranking:global:weekly`) || [];

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
        if (period === 'weekly') {
            d.setDate(d.getDate() - 7);
        } else if (period === 'monthly') {
            d.setMonth(d.getMonth() - 1);
        }
        return d;
    }
}
