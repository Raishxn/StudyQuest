import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private prisma: PrismaService) { }

    async getFullProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                institution: true,
                course: true,
                achievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' } },
            },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');

        const [sessionStats, totalAchievements, streak, globalRank, subjectStats] = await Promise.all([
            this.prisma.studySession.aggregate({
                where: { userId, status: 'ENDED' },
                _sum: { duration: true },
                _count: true,
            }),
            this.prisma.achievement.count(),
            this.calculateStreak(userId),
            this.getGlobalRank(userId),
            this.getSubjectStats(userId),
        ]);

        const allAchievements = await this.prisma.achievement.findMany({ orderBy: { category: 'asc' } });
        const unlockedIds = new Set(user.achievements.map(ua => ua.achievementId));
        const achievementsWithStatus = allAchievements.map(ach => ({
            ...ach,
            unlocked: unlockedIds.has(ach.id),
            unlockedAt: user.achievements.find(ua => ua.achievementId === ach.id)?.unlockedAt || null,
        }));

        // Strip sensitive fields
        const { passwordHash, refreshTokens, ...safeUser } = user as any;

        return {
            ...safeUser,
            achievements: achievementsWithStatus,
            subjectStats,
            stats: {
                totalStudyHours: Math.round(((sessionStats._sum.duration || 0) / 60) * 10) / 10,
                totalSessions: sessionStats._count || 0,
                achievementsUnlocked: unlockedIds.size,
                totalAchievements,
                streak,
                globalRank,
            },
        };
    }

    async getPublicProfile(username: string) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: {
                institution: true,
                course: true,
                achievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' } },
            },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');

        // Respect privacy preference
        const prefs = (user.preferences as any) || {};
        if (prefs.publicProfile === false) {
            throw new NotFoundException('Perfil privado');
        }

        const [sessionStats, subjectStats] = await Promise.all([
            this.prisma.studySession.aggregate({
                where: { userId: user.id, status: 'ENDED' },
                _sum: { duration: true },
                _count: true,
            }),
            this.getSubjectStats(user.id),
        ]);

        const allAchievements = await this.prisma.achievement.findMany({ orderBy: { category: 'asc' } });
        const unlockedIds = new Set(user.achievements.map(ua => ua.achievementId));
        const achievementsWithStatus = allAchievements.map(ach => ({
            ...ach,
            unlocked: unlockedIds.has(ach.id),
            unlockedAt: user.achievements.find(ua => ua.achievementId === ach.id)?.unlockedAt || null,
        }));

        return {
            id: user.id,
            name: (user as any).name || null,
            username: user.username,
            avatarUrl: user.avatarUrl,
            xp: user.xp,
            level: user.level,
            title: user.title,
            createdAt: user.createdAt,
            institution: user.institution,
            course: user.course,
            achievements: achievementsWithStatus,
            subjectStats,
            stats: {
                totalStudyHours: Math.round(((sessionStats._sum.duration || 0) / 60) * 10) / 10,
                totalSessions: sessionStats._count || 0,
                achievementsUnlocked: unlockedIds.size,
                totalAchievements: allAchievements.length,
            },
        };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        if (dto.username) {
            const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
            if (existing && existing.id !== userId) {
                throw new ConflictException('Username já em uso');
            }
        }

        const data: any = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.username !== undefined) data.username = dto.username;
        if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
        if (dto.institutionId !== undefined) data.institutionId = dto.institutionId;
        if (dto.courseId !== undefined) data.courseId = dto.courseId;
        if (dto.semester !== undefined) data.semester = dto.semester;
        if (dto.shift !== undefined) data.shift = dto.shift;
        if (dto.unidade !== undefined) data.unidade = dto.unidade;
        if (dto.preferences !== undefined) data.preferences = dto.preferences;

        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, username: true, email: true, avatarUrl: true, level: true, xp: true, title: true },
        });
    }

    async checkUsername(username: string) {
        if (!username || username.length < 3) {
            return { available: false, reason: 'Username deve ter pelo menos 3 caracteres' };
        }
        const existing = await this.prisma.user.findUnique({ where: { username } });
        return { available: !existing };
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new BadRequestException('Conta não possui senha (login social)');
        }

        const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('Senha atual incorreta');

        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
        await this.prisma.refreshToken.deleteMany({ where: { userId } });

        return { message: 'Senha alterada com sucesso' };
    }

    async deleteAccount(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                preferences: {
                    ...(user?.preferences as any || {}),
                    _deletionRequestedAt: new Date().toISOString(),
                    _deletionStatus: 'DELETION_REQUESTED',
                },
            },
        });
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
        return { message: 'Conta marcada para exclusão. Você tem 7 dias para cancelar.' };
    }

    async exportUserData(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                institution: true,
                course: true,
                achievements: { include: { achievement: true } },
            },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');

        const [sessions, xpHistory, posts, replies] = await Promise.all([
            this.prisma.studySession.findMany({
                where: { userId },
                orderBy: { startedAt: 'desc' },
            }),
            this.prisma.xPTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.forumPost.findMany({
                where: { authorId: userId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.forumReply.findMany({
                where: { authorId: userId },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        const { passwordHash, refreshTokens, ...safeUser } = user as any;

        return {
            exportedAt: new Date().toISOString(),
            profile: safeUser,
            studySessions: sessions,
            xpHistory,
            forumPosts: posts,
            forumReplies: replies,
        };
    }

    // --- Helper methods ---

    private async calculateStreak(userId: string): Promise<number> {
        const sessions = await this.prisma.studySession.findMany({
            where: { userId, status: 'ENDED' },
            select: { startedAt: true },
            orderBy: { startedAt: 'desc' },
        });

        if (sessions.length === 0) return 0;

        const uniqueDays = new Set<string>();
        for (const s of sessions) {
            uniqueDays.add(s.startedAt.toISOString().split('T')[0]);
        }

        const sortedDays = Array.from(uniqueDays).sort().reverse();
        const today = new Date().toISOString().split('T')[0];

        // Streak must include today or yesterday
        if (sortedDays[0] !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (sortedDays[0] !== yesterday) return 0;
        }

        let streak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
            const prev = new Date(sortedDays[i - 1]);
            const curr = new Date(sortedDays[i]);
            const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
            if (Math.round(diffDays) === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    private async getGlobalRank(userId: string): Promise<number> {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
        if (!user) return 0;

        const rank = await this.prisma.user.count({
            where: { xp: { gt: user.xp } },
        });

        return rank + 1;
    }

    private async getSubjectStats(userId: string) {
        const sessions = await this.prisma.studySession.findMany({
            where: { userId, status: 'ENDED' },
            select: { subject: true, duration: true, xpGained: true },
        });

        const map = new Map<string, { hours: number; xp: number; sessions: number }>();
        for (const s of sessions) {
            const curr = map.get(s.subject) || { hours: 0, xp: 0, sessions: 0 };
            curr.hours += (s.duration || 0) / 60;
            curr.xp += s.xpGained;
            curr.sessions += 1;
            map.set(s.subject, curr);
        }

        return Array.from(map.entries())
            .map(([subject, data]) => ({
                subject,
                hours: Math.round(data.hours * 10) / 10,
                xp: data.xp,
                sessions: data.sessions,
            }))
            .sort((a, b) => b.hours - a.hours);
    }
}
