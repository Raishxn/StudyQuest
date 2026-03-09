import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 6000, 12000, 25000];

export enum EventSource {
  SESSION = 'SESSION',
  UPLOAD = 'UPLOAD',
  REPLY = 'REPLY',
  STREAK = 'STREAK',
  ACHIEVEMENT = 'ACHIEVEMENT',
  LOGIN = 'LOGIN',
  GOAL = 'GOAL',
  POMODORO_BONUS = 'POMODORO_BONUS',
}

@Injectable()
export class XpService {
  private readonly logger = new Logger(XpService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('xp-events') private xpQueue: Queue,
  ) {}

  async addXP(
    userId: string,
    amount: number,
    source: EventSource | string,
    refId?: string,
  ): Promise<{ leveledUp: boolean; newLevel: number }> {
    if (amount <= 0) return { leveledUp: false, newLevel: 0 };

    const dailyXp = await this.getDailyXpTotal(userId);
    if (dailyXp + amount > 1200) {
      this.logger.debug(`User ${userId} atingiu cap diário (tentou +${amount}, cap 1200)`);
      return { leveledUp: false, newLevel: 0 }; // Silent ignore cap
    }

    if (source === EventSource.SESSION) {
      const sessionXp = await this.getSessionXpTotal(refId);
      if (sessionXp + amount > 600) {
        this.logger.debug(`Sessão ${refId} atingiu cap de sessão (tentou +${amount}, cap 600)`);
        return { leveledUp: false, newLevel: 0 }; // Silent ignore cap
      }
    }

    // Append-only XPTransaction
    await this.prisma.xPTransaction.create({
      data: {
        userId,
        amount,
        source,
        refId,
      },
    });

    // Update user totals and apply leveling
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { leveledUp: false, newLevel: 0 };

    const newXpTotal = user.xp + amount;
    const currentLevel = user.level;
    const newLevel = this.calculateLevel(newXpTotal);
    
    let leveledUp = false;
    let newTitle = user.title;

    if (newLevel > currentLevel) {
      leveledUp = true;
      newTitle = this.getLevelTitle(newLevel);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXpTotal,
        level: newLevel,
        title: newTitle,
      },
    });

    // Delegar verificação de achievements assincronamente (ex: level up)
    if (leveledUp) {
      await this.xpQueue.add('check-achievements', {
        userId,
        event: 'LEVEL_UP',
        context: { newLevel },
      });
    }

    return { leveledUp, newLevel };
  }

  calculateLevel(totalXp: number): number {
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (totalXp >= LEVEL_THRESHOLDS[i]) {
        level = i + 1; // 1-indexed
      } else {
        break;
      }
    }
    return Math.min(level, 7); // Cap no L7 de acordo com as regras
  }

  getLevelTitle(level: number): string {
    const titles = {
      1: 'Calouro',
      2: 'Estudante Focado',
      3: 'Veterano',
      4: 'Mestre',
      5: 'Lenda Viva',
      6: 'Semideus',
      7: 'Divindade Acadêmica',
    };
    return titles[level] || 'Calouro';
  }

  async getDailyXpTotal(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const transactions = await this.prisma.xPTransaction.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
      _sum: { amount: true },
    });

    return transactions._sum.amount || 0;
  }

  async getSessionXpTotal(sessionId: string): Promise<number> {
    if (!sessionId) return 0;
    
    const transactions = await this.prisma.xPTransaction.aggregate({
      where: {
        refId: sessionId,
        source: EventSource.SESSION,
      },
      _sum: { amount: true },
    });

    return transactions._sum.amount || 0;
  }
}
