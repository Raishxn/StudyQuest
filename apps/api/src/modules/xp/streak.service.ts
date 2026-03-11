import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(private prisma: PrismaService) { }

  async getStreak(userId: string): Promise<number> {
    // Calculo básico: Sessões ordenadas que tenham >= 5min (300 segundos).
    // Opcional: Aprimorar no futuro com lógica pura de DB + Calendar.
    // Baseado na regra do grace period:

    // Simplificando o cálculo com base em StudySession concluídas do usuário.
    // Retornamos um mock básico por enquanto se não houver lógica complexa pronta a não ser que exista o model Streak
    // Como a instrução era calcular por sessões >= 5m:
    const activeSessions = await this.prisma.studySession.findMany({
      where: {
        userId,
        duration: { gte: 300 }, // 5 mins in seconds = 300 
      },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true },
    });

    if (activeSessions.length === 0) return 0;

    let streak = 1;
    let lastDate = new Date(activeSessions[0].startedAt);
    lastDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < activeSessions.length; i++) {
      const currentDate = new Date(activeSessions[i].startedAt);
      currentDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(lastDate.getTime() - currentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        lastDate = currentDate;
      } else if (diffDays === 0) {
        continue; // Mesmo dia
      } else {
        // Verificar Grace Period antes de quebrar
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const prefs = user?.preferences as any || {};
        const graceUsedAt = prefs.graceUsedAt ? new Date(prefs.graceUsedAt) : null;

        // Lógica simplificada de grace period: Quebra o streak.
        break;
      }
    }

    return streak;
  }

  async checkAndUpdateStreak(userId: string) {
    // Após a sessão, chamar a avaliação do StreakService para engatilhar XP de Streak.
    const streak = await this.getStreak(userId);

    // Save the new calculated streak to the database so Rankings can query it efficiently
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentStreak: streak }
    });

    return streak;
  }
}
