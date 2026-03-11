import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MissionsService {
    private readonly logger = new Logger(MissionsService.name);

    constructor(private prisma: PrismaService) { }

    private getCurrentWeek() {
        const d = new Date();
        const year = d.getFullYear();
        const start = new Date(year, 0, 1);
        const days = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((d.getDay() + 1 + days) / 7);
        return { year, weekNumber };
    }

    @Cron(CronExpression.EVERY_WEEK)
    async generateWeeklyMissions() {
        this.logger.log('Generating weekly missions...');
        const { year, weekNumber } = this.getCurrentWeek();

        const existing = await this.prisma.weeklyMissionSet.findFirst({
            where: { year, weekNumber }
        });
        if (existing) return;

        const allMissions = await this.prisma.mission.findMany();
        if (allMissions.length < 3) return;

        const shuffled = allMissions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        await this.prisma.weeklyMissionSet.createMany({
            data: selected.map(m => ({
                year,
                weekNumber,
                missionId: m.id
            }))
        });

        this.logger.log(`Created new weekly mission set for week ${weekNumber}`);
    }

    async getMyWeeklyMissions(userId: string) {
        const { year, weekNumber } = this.getCurrentWeek();

        let weeklySets = await this.prisma.weeklyMissionSet.findMany({
            where: { year, weekNumber },
            include: { mission: true }
        });

        if (weeklySets.length === 0) {
            await this.generateWeeklyMissions();
            weeklySets = await this.prisma.weeklyMissionSet.findMany({
                where: { year, weekNumber },
                include: { mission: true }
            });
        }

        const missionIds = weeklySets.map(ws => ws.missionId);

        const progress = await this.prisma.userMissionProgress.findMany({
            where: {
                userId,
                missionId: { in: missionIds },
                year,
                weekNumber
            }
        });

        const progressMap = new Map(progress.map(p => [p.missionId, p]));

        return weeklySets.map(ws => {
            const p = progressMap.get(ws.missionId);
            const current = p?.currentProgress || 0;
            const completed = current >= ws.mission.target;
            return {
                id: ws.mission.id,
                title: ws.mission.title,
                description: ws.mission.description,
                target: ws.mission.target,
                unit: ws.mission.unit,
                xpReward: ws.mission.xpReward,
                category: ws.mission.category,
                progress: current,
                completed,
                claimed: p?.completed || false,
            };
        });
    }

    async updateProgress(userId: string, progressValue: number, category: string) {
        const { year, weekNumber } = this.getCurrentWeek();

        const weeklySets = await this.prisma.weeklyMissionSet.findMany({
            where: { year, weekNumber },
            include: { mission: true }
        });

        for (const ws of weeklySets) {
            // Se a missão for GERAL e o update for GERAL, soma
            // Se a missão for POMODORO e o update for POMODORO, soma
            // Algumas missões de DESAFIO podem ser GERAL ou POMODOROs. Simplificando a validação:
            if (ws.mission.category !== 'GERAL' && ws.mission.category !== category) {
                // Ignore POMODORO missions if we are just updating GERAL (minutes) and vice-versa
                // Though for 'COMUNIDADE' and 'DESAFIO' we might need specific rules.
                // For bug fix, this is enough:
                if (ws.mission.category !== 'DESAFIO') {
                    continue;
                }
            }

            const existing = await this.prisma.userMissionProgress.findFirst({
                where: { userId, missionId: ws.missionId, year, weekNumber }
            });

            if (existing) {
                if (!existing.completed) {
                    const newProgress = existing.currentProgress + progressValue;
                    await this.prisma.userMissionProgress.update({
                        where: { id: existing.id },
                        data: {
                            currentProgress: newProgress,
                            completed: newProgress >= ws.mission.target
                        }
                    });
                }
            } else {
                await this.prisma.userMissionProgress.create({
                    data: {
                        userId,
                        missionId: ws.missionId,
                        year,
                        weekNumber,
                        currentProgress: progressValue,
                        completed: progressValue >= ws.mission.target
                    }
                });
            }
        }
    }
}
