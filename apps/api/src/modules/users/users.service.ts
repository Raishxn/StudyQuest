import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
        private configService: ConfigService,
        private redisService: RedisService
    ) { }

    async getFullProfile(userId: string) {
        const cacheKey = `profile:full:${userId}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            try { return JSON.parse(cached); } catch { }
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                institution: true,
                course: true,
                achievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' } },
            },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');

        const [statsData, globalRank, allAchievements] = await Promise.all([
            this.getUserStats(userId),
            this.getGlobalRank(userId),
            this.prisma.achievement.findMany({ orderBy: { category: 'asc' } })
        ]);

        const unlockedIds = new Set(user.achievements.map(ua => ua.achievementId));
        const achievementsWithStatus = allAchievements.map(ach => ({
            ...ach,
            unlocked: unlockedIds.has(ach.id),
            unlockedAt: user.achievements.find(ua => ua.achievementId === ach.id)?.unlockedAt || null,
        }));

        const { passwordHash, refreshTokens, ...safeUser } = user as any;

        const result = {
            ...safeUser,
            achievements: achievementsWithStatus,
            subjectStats: statsData.subjectStats,
            stats: {
                totalStudyHours: statsData.totalStudyHours,
                totalSessions: statsData.totalSessions,
                achievementsUnlocked: unlockedIds.size,
                totalAchievements: allAchievements.length,
                streak: statsData.streak,
                globalRank,
            },
        };

        await this.redisService.set(cacheKey, JSON.stringify(result), 300); // 5m TTL
        return result;
    }

    async getPublicProfile(username: string) {
        const cacheKey = `profile:public:${username}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            try { return JSON.parse(cached); } catch { }
        }

        const user = await this.prisma.user.findUnique({
            where: { username },
            include: {
                institution: true,
                course: true,
                achievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' } },
            },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');

        const prefs = (user.preferences as any) || {};
        if (prefs.publicProfile === false) {
            throw new NotFoundException('Perfil privado');
        }

        const [statsData, allAchievements] = await Promise.all([
            this.getUserStats(user.id),
            this.prisma.achievement.findMany({ orderBy: { category: 'asc' } })
        ]);

        const unlockedIds = new Set(user.achievements.map(ua => ua.achievementId));
        const achievementsWithStatus = allAchievements.map(ach => ({
            ...ach,
            unlocked: unlockedIds.has(ach.id),
            unlockedAt: user.achievements.find(ua => ua.achievementId === ach.id)?.unlockedAt || null,
        }));

        const result = {
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
            subjectStats: statsData.subjectStats,
            stats: {
                totalStudyHours: statsData.totalStudyHours,
                totalSessions: statsData.totalSessions,
                achievementsUnlocked: unlockedIds.size,
                totalAchievements: allAchievements.length,
            },
        };

        await this.redisService.set(cacheKey, JSON.stringify(result), 300); // 5m TTL
        return result;
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
        if (dto.bannerUrl !== undefined) data.bannerUrl = dto.bannerUrl;
        if (dto.institutionId !== undefined) data.institutionId = dto.institutionId;
        if (dto.courseId !== undefined) data.courseId = dto.courseId;
        if (dto.semester !== undefined) data.semester = dto.semester;
        if (dto.shift !== undefined) data.shift = dto.shift;
        if (dto.unidade !== undefined) data.unidade = dto.unidade;
        if (dto.preferences !== undefined) data.preferences = dto.preferences;

        const result = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, username: true, email: true, avatarUrl: true, level: true, xp: true, title: true },
        });

        await this.redisService.del(`profile:full:${userId}`);
        if (dto.username !== undefined) {
            await this.redisService.del(`profile:public:${dto.username}`);
        } else {
            const current = await this.prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
            if (current) await this.redisService.del(`profile:public:${current.username}`);
        }

        return result;
    }

    async checkUsername(username: string) {
        if (!username || username.length < 3) {
            return { available: false, reason: 'Username deve ter pelo menos 3 caracteres' };
        }
        const existing = await this.prisma.user.findUnique({ where: { username } });
        return { available: !existing };
    }

    async uploadAvatar(userId: string, file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Arquivo é obrigatório');

        const ext = file.mimetype.split('/')[1] || 'jpeg';
        const key = `avatars/${userId}/${Date.now()}_${uuidv4().substring(0, 8)}.${ext}`;

        await this.uploadService.upload(file.buffer, key, file.mimetype);

        const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
        const bucket = this.configService.get<string>('SUPABASE_BUCKET_NAME', 'studyquest');
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`;

        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
        if (user?.avatarUrl && user.avatarUrl.includes(bucket)) {
            const oldKey = user.avatarUrl.split(`/public/${bucket}/`)[1];
            if (oldKey) {
                await this.uploadService.delete(oldKey).catch(err => this.logger.warn(`Failed to delete old avatar ${oldKey}: ${err.message}`));
            }
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: publicUrl }
        });

        return { avatarUrl: publicUrl };
    }

    async uploadBanner(userId: string, file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Arquivo é obrigatório');

        const ext = file.mimetype.split('/')[1] || 'jpeg';
        const key = `banners/${userId}/${Date.now()}_${uuidv4().substring(0, 8)}.${ext}`;

        await this.uploadService.upload(file.buffer, key, file.mimetype);

        const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
        const bucket = this.configService.get<string>('SUPABASE_BUCKET_NAME', 'studyquest');
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`;

        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { bannerUrl: true } });
        if (user?.bannerUrl && user.bannerUrl.includes(bucket)) {
            const oldKey = user.bannerUrl.split(`/public/${bucket}/`)[1];
            if (oldKey) {
                await this.uploadService.delete(oldKey).catch(err => this.logger.warn(`Failed to delete old banner ${oldKey}: ${err.message}`));
            }
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { bannerUrl: publicUrl }
        });

        return { bannerUrl: publicUrl };
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

    private async getUserStats(userId: string) {
        const sessions = await this.prisma.studySession.findMany({
            where: { userId, status: 'ENDED' },
            select: { startedAt: true, subject: true, duration: true, xpGained: true },
            orderBy: { startedAt: 'desc' },
        });

        let totalDuration = 0;
        let totalSessions = sessions.length;
        const subjectMap = new Map<string, { hours: number; xp: number; sessions: number }>();
        const uniqueDays = new Set<string>();

        for (const s of sessions) {
            totalDuration += s.duration || 0;
            uniqueDays.add(s.startedAt.toISOString().split('T')[0]);

            const curr = subjectMap.get(s.subject) || { hours: 0, xp: 0, sessions: 0 };
            curr.hours += (s.duration || 0) / 3600;
            curr.xp += s.xpGained;
            curr.sessions += 1;
            subjectMap.set(s.subject, curr);
        }

        const sortedDays = Array.from(uniqueDays).sort().reverse();
        const today = new Date().toISOString().split('T')[0];

        let streak = 0;
        if (sortedDays.length > 0) {
            streak = 1;
            if (sortedDays[0] !== today) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                if (sortedDays[0] !== yesterday) streak = 0;
            }
            if (streak > 0) {
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
            }
        }

        const subjectStats = Array.from(subjectMap.entries())
            .map(([subject, data]) => ({
                subject,
                hours: Math.round(data.hours * 10) / 10,
                xp: data.xp,
                sessions: data.sessions,
            }))
            .sort((a, b) => b.hours - a.hours);

        return {
            totalStudyHours: Math.round((totalDuration / 3600) * 10) / 10,
            totalSessions,
            streak,
            subjectStats,
        };
    }

    async updateWeeklyGoal(userId: string, minutes: number) {
        if (!minutes || minutes < 60) {
            throw new Error('A meta semanal deve ser de pelo menos 1 hora (60 minutos)');
        }

        const res = await this.prisma.user.update({
            where: { id: userId },
            data: { weeklyGoalMinutes: minutes },
            select: { id: true, weeklyGoalMinutes: true } // Removed Select error issue by minimizing typings problem
        });

        await this.redisService.del(`profile:${userId}`);
        return res;
    }

    private async getGlobalRank(userId: string): Promise<number> {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
        if (!user) return 0;

        const rank = await this.prisma.user.count({
            where: { xp: { gt: user.xp } },
        });

        return rank + 1;
    }
}
