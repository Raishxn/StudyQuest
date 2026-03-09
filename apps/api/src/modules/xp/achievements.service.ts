import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventSource, XpService } from './xp.service';
import { StreakService } from './streak.service';

export enum AchievementEvent {
  SESSION_ENDED = 'SESSION_ENDED',
  UPLOAD_APPROVED = 'UPLOAD_APPROVED',
  REPLY_ACCEPTED = 'REPLY_ACCEPTED',
  FRIENDSHIP_ACCEPTED = 'FRIENDSHIP_ACCEPTED',
  RANKING_CALCULATED = 'RANKING_CALCULATED',
}

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    private prisma: PrismaService,
    private xpService: XpService,
    private streakService: StreakService,
  ) {}

  async checkAndUnlock(userId: string, event: string, context: any) {
    const unlocked = [];

    switch (event) {
      case AchievementEvent.SESSION_ENDED:
        unlocked.push(...(await this.checkSessionAchievements(userId, context)));
        break;
      case AchievementEvent.UPLOAD_APPROVED:
        unlocked.push(...(await this.checkUploadAchievements(userId)));
        break;
      case AchievementEvent.REPLY_ACCEPTED:
        unlocked.push(...(await this.checkReplyAchievements(userId)));
        break;
      case AchievementEvent.FRIENDSHIP_ACCEPTED:
        unlocked.push(...(await this.checkFriendshipAchievements(userId)));
        break;
    }

    // Process unlocks
    for (const key of unlocked) {
      await this.unlockAchievement(userId, key);
    }

    return unlocked;
  }

  private async unlockAchievement(userId: string, achievementKey: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { key: achievementKey },
    });

    if (!achievement) return;

    try {
      // Idempotente via compound unique index
      const created = await this.prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      if (created) {
        this.logger.log(`User ${userId} unlocked achievement: ${achievementKey}`);
        await this.xpService.addXP(
          userId,
          achievement.xpReward,
          EventSource.ACHIEVEMENT,
          achievement.id,
        );
      }
    } catch (e) {
      // P2002 Unique constraint failed = Já possuía
    }
  }

  private async checkSessionAchievements(userId: string, context: any) {
    const keys = [];
    
    // Aggregações
    const aggregates = await this.prisma.studySession.aggregate({
      where: { userId },
      _sum: { duration: true, pomodorosCompleted: true },
    });
    
    const totalMinutes = Math.floor((aggregates._sum.duration || 0) / 60);
    const totalPomodoros = aggregates._sum.pomodorosCompleted || 0;

    if (totalMinutes >= 60) keys.push('study_1h');
    if (totalMinutes >= 600) keys.push('study_10h');
    if (totalMinutes >= 3000) keys.push('study_50h');
    if (totalMinutes >= 6000) keys.push('study_100h');
    if (totalMinutes >= 30000) keys.push('study_500h');

    if (totalPomodoros >= 10) keys.push('pomodoro_10');
    if (totalPomodoros >= 100) keys.push('pomodoro_100');

    // Context da sessão atual para maratonas
    if (context?.duration >= 480 * 60) keys.push('marathon');

    // Assumir o uso do StreakService para keys de Streak
    const streak = await this.streakService.getStreak(userId);
    if (streak >= 3) keys.push('streak_3');
    if (streak >= 7) {
      keys.push('streak_7');
      // Bônus streak
      await this.xpService.addXP(userId, 100, EventSource.STREAK);
    }
    if (streak >= 30) {
      keys.push('streak_30');
      // Bônus streak
      await this.xpService.addXP(userId, 500, EventSource.STREAK);
    }
    if (streak >= 100) keys.push('streak_100');

    return keys;
  }

  private async checkUploadAchievements(userId: string) {
    const count = await this.prisma.bankItem.count({ where: { uploadedBy: userId } });
    const keys = [];
    if (count >= 1) keys.push('first_upload');
    if (count >= 10) keys.push('upload_10');
    if (count >= 50) keys.push('upload_50');
    return keys;
  }

  private async checkReplyAchievements(userId: string) {
    const count = await this.prisma.forumReply.count({ 
      where: { authorId: userId, isAccepted: true } 
    });
    const totalCount = await this.prisma.forumReply.count({ 
      where: { authorId: userId } 
    });
    const keys = [];
    if (totalCount >= 1) keys.push('first_reply');
    if (count >= 5) keys.push('accepted_5');
    if (count >= 50) keys.push('accepted_50');
    return keys;
  }

  private async checkFriendshipAchievements(userId: string) {
    const count = await this.prisma.friendship.count({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
        status: 'ACCEPTED',
      },
    });
    const keys = [];
    if (count >= 1) keys.push('friends_1');
    if (count >= 10) keys.push('friends_10');
    return keys;
  }
}
