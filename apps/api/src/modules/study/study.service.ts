import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService, EventSource } from '../xp/xp.service';
import { StreakService } from '../xp/streak.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { EndSessionDto } from './dto/end-session.dto';

@Injectable()
export class StudyService {
  private readonly logger = new Logger(StudyService.name);

  constructor(
    private prisma: PrismaService,
    private xpService: XpService,
    private streakService: StreakService,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    // End any existing active sessions dynamically
    const openSessions = await this.prisma.studySession.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
    });

    for (const session of openSessions) {
      await this.endSession(session.id, userId, { notes: 'Auto-ended due to new session' });
    }

    // Ensure StartedAt is server-defined
    const newSession = await this.prisma.studySession.create({
      data: {
        userId,
        subject: dto.subject,
        topic: dto.topic,
        mode: dto.mode,
        startedAt: new Date(),
        lastHeartbeat: new Date(),
        status: 'ACTIVE',
      },
    });

    return newSession;
  }

  async getSessionHistory(userId: string, query: any) {
    const { subject, mode, dateFrom, dateTo, skip = 0, take = 20 } = query;

    const where: any = { userId };
    if (subject) where.subject = subject;
    if (mode) where.mode = mode;
    if (dateFrom || dateTo) {
      where.startedAt = {};
      if (dateFrom) where.startedAt.gte = new Date(dateFrom);
      if (dateTo) where.startedAt.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.studySession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
      }),
      this.prisma.studySession.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async getActiveSession(userId: string) {
    return this.prisma.studySession.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'PAUSED'] } },
    });
  }

  async getStats(userId: string) {
    const stats = await this.prisma.studySession.groupBy({
      by: ['subject'],
      where: { userId, status: { in: ['ENDED', 'AUTO_ENDED', 'ABANDONED'] } },
      _sum: { duration: true, xpGained: true },
      _count: { id: true },
    });

    return stats.map((stat) => ({
      subject: stat.subject,
      totalMinutes: Math.floor((stat._sum.duration || 0) / 60),
      totalXP: stat._sum.xpGained || 0,
      totalSessions: stat._count.id,
    }));
  }

  async getById(sessionId: string, userId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async heartbeat(sessionId: string, userId: string) {
    const session = await this.getById(sessionId, userId);
    
    if (!['ACTIVE', 'PAUSED'].includes(session.status)) {
       throw new ConflictException(`Cannot heartbeat a ${session.status} session`);
    }

    return this.prisma.studySession.update({
      where: { id: sessionId },
      data: { lastHeartbeat: new Date() },
    });
  }

  async pause(sessionId: string, userId: string) {
    const session = await this.getById(sessionId, userId);
    if (session.status !== 'ACTIVE') {
      throw new ConflictException('Only ACTIVE sessions can be paused');
    }

    // Since our schema doesn't have a lastPausedAt, 
    // we use lastHeartbeat as a rough proxy for when the pause started for now
    return this.prisma.studySession.update({
      where: { id: sessionId },
      data: { 
        status: 'PAUSED',
        lastHeartbeat: new Date()
      },
    });
  }

  async resume(sessionId: string, userId: string) {
    const session = await this.getById(sessionId, userId);
    if (session.status !== 'PAUSED') {
      throw new ConflictException('Only PAUSED sessions can be resumed');
    }

    const now = new Date();
    const pauseDurationSeconds = Math.floor((now.getTime() - new Date(session.lastHeartbeat || session.startedAt).getTime()) / 1000);

    return this.prisma.studySession.update({
      where: { id: sessionId },
      data: { 
        status: 'ACTIVE',
        lastHeartbeat: now,
        pausedDuration: session.pausedDuration + pauseDurationSeconds
      },
    });
  }

  async pomodoroComplete(sessionId: string, userId: string) {
    const session = await this.getById(sessionId, userId);
    
    // Add bonus XP (e.g. 5 XP per pomodoro)
    const bonusXp = 5;
    const { leveledUp, newLevel } = await this.xpService.addXP(userId, bonusXp, EventSource.POMODORO_BONUS, sessionId);
    
    return this.prisma.studySession.update({
      where: { id: sessionId },
      data: { 
        pomodorosCompleted: { increment: 1 },
        xpGained: { increment: bonusXp }
      },
    });
  }

  async endSession(sessionId: string, userId: string, dto?: EndSessionDto) {
    const session = await this.getById(sessionId, userId);

    if (['ENDED', 'AUTO_ENDED', 'ABANDONED'].includes(session.status)) {
      return session; // Already ended
    }

    const now = new Date();
    
    // If it was paused, we don't count the time since last heartbeat
    let pauseDurationSeconds = session.pausedDuration;
    if (session.status === 'PAUSED') {
       pauseDurationSeconds += Math.floor((now.getTime() - new Date(session.lastHeartbeat || session.startedAt).getTime()) / 1000);
    }

    const totalDurationSeconds = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
    const effectiveDurationSeconds = Math.max(0, totalDurationSeconds - pauseDurationSeconds);
    const effectiveDurationMinutes = Math.floor(effectiveDurationSeconds / 60);

    let xpGained = 0;
    let leveledUp = false;
    let newLevel = 0;

    // Minimum 1 minute for XP
    if (effectiveDurationMinutes >= 1) {
       // Base XP: e.g., 2 XP per minute
       let calculatedXp = effectiveDurationMinutes * 2;
       
       // Cap at 600
       calculatedXp = Math.min(calculatedXp, 600 - session.xpGained); // account for pomodoro bonuses
       
       if (calculatedXp > 0) {
         const xpResult = await this.xpService.addXP(userId, calculatedXp, EventSource.SESSION, session.id);
         leveledUp = xpResult.leveledUp;
         newLevel = xpResult.newLevel;
         xpGained = calculatedXp;
       }
    }

    const updatedSession = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endedAt: now,
        duration: effectiveDurationSeconds,
        pausedDuration: pauseDurationSeconds,
        xpGained: { increment: xpGained },
      },
    });

    await this.streakService.checkAndUpdateStreak(userId);

    return {
      session: updatedSession,
      summary: {
        durationSeconds: effectiveDurationSeconds,
        durationMinutes: effectiveDurationMinutes,
        pomodorosCompleted: updatedSession.pomodorosCompleted,
        xpGained: updatedSession.xpGained,
        leveledUp,
        newLevel
      }
    };
  }

  // Used by Cron Job
  async autoEndAbandonedSessions() {
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const abandonedSessions = await this.prisma.studySession.findMany({
      where: {
        status: { in: ['ACTIVE', 'PAUSED'] },
        lastHeartbeat: { lt: fiveMinutesAgo },
      },
    });

    let count = 0;

    for (const session of abandonedSessions) {
      // Calculate active time until the LAST HEARTBEAT, not 'now'
      const endAt = session.lastHeartbeat || session.startedAt;
      const totalDurationSeconds = Math.floor((endAt.getTime() - session.startedAt.getTime()) / 1000);
      const effectiveDurationSeconds = Math.max(0, totalDurationSeconds - session.pausedDuration);
      const effectiveDurationMinutes = Math.floor(effectiveDurationSeconds / 60);

      let xpGained = 0;
      if (effectiveDurationMinutes >= 1) {
        let calculatedXp = effectiveDurationMinutes * 2;
        calculatedXp = Math.min(calculatedXp, 600 - session.xpGained);
        
        if (calculatedXp > 0) {
           await this.xpService.addXP(session.userId, calculatedXp, EventSource.SESSION, session.id);
           xpGained = calculatedXp;
        }
      }

      await this.prisma.studySession.update({
        where: { id: session.id },
        data: {
          status: 'ABANDONED',
          endedAt: endAt,
          duration: effectiveDurationSeconds,
          xpGained: { increment: xpGained },
        },
      });

      count++;
    }

    if (count > 0) {
      this.logger.log(`Marked ${count} sessions as ABANDONED`);
    }
  }
}
