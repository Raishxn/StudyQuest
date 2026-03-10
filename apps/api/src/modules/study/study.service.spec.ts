import { Test, TestingModule } from '@nestjs/testing';
import { StudyService } from './study.service';
import { PrismaService } from '../../prisma/prisma.service';
import { XpService, EventSource } from '../xp/xp.service';
import { StreakService } from '../xp/streak.service';
import { ConflictException } from '@nestjs/common';

describe('StudyService', () => {
    let service: StudyService;
    let prisma: PrismaService;
    let xpService: XpService;
    let streakService: StreakService;

    beforeEach(async () => {
        const mockPrisma = {
            studySession: {
                findMany: jest.fn().mockResolvedValue([]),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
        };

        const mockXpService = {
            addXP: jest.fn().mockResolvedValue({ leveledUp: false, newLevel: 0 }),
        };

        const mockStreakService = {
            checkAndUpdateStreak: jest.fn().mockResolvedValue(true),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StudyService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: XpService, useValue: mockXpService },
                { provide: StreakService, useValue: mockStreakService },
            ],
        }).compile();

        service = module.get<StudyService>(StudyService);
        prisma = module.get<PrismaService>(PrismaService);
        xpService = module.get<XpService>(XpService);
        streakService = module.get<StreakService>(StreakService);

        // reset timers
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('createSession', () => {
        it('deve criar sessão com startedAt definido pelo servidor (ignorar qualquer startedAt do body)', async () => {
            // Arrange
            const now = new Date('2026-03-10T12:00:00Z');
            jest.setSystemTime(now);

            const payload = { subject: 'Math', topic: 'Algebra', mode: 'CLASSIC', startedAt: '2020-01-01' };
            const createdSession = { id: 'sess-1', ...payload, startedAt: now, status: 'ACTIVE' };
            jest.spyOn(prisma.studySession, 'create').mockResolvedValue(createdSession as any);

            // Act
            await service.createSession('user-1', payload as any);

            // Assert
            expect(prisma.studySession.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        userId: 'user-1',
                        startedAt: now, // Server time!
                        status: 'ACTIVE'
                    })
                })
            );
        });

        it('deve encerrar sessão ACTIVE anterior e criar a nova se usuário pede nova sessão', async () => {
            // Arrange
            const existingSession = { id: 'old-sess', status: 'ACTIVE' };
            jest.spyOn(prisma.studySession, 'findMany').mockResolvedValue([existingSession as any]);
            const endSessionSpy = jest.spyOn(service, 'endSession').mockResolvedValue(undefined as any);
            jest.spyOn(prisma.studySession, 'create').mockResolvedValue({ id: 'new-sess' } as any);

            // Act
            await service.createSession('user-1', { subject: 'Math', topic: 'Algebra', mode: 'CLASSIC' } as any);

            // Assert
            expect(prisma.studySession.findMany).toHaveBeenCalled();
            expect(endSessionSpy).toHaveBeenCalledWith('old-sess', 'user-1', { notes: 'Auto-ended due to new session' });
            expect(prisma.studySession.create).toHaveBeenCalled();
        });
    });

    describe('endSession', () => {
        it('deve avaliar a duration subtraindo limitados pausedDuration e chamar addXP corretamente', async () => {
            // Arrange
            const startedAt = new Date('2026-03-10T10:00:00Z');
            const now = new Date('2026-03-10T11:00:00Z'); // 1 hour difference (60 mins = 3600 sec)
            jest.setSystemTime(now);

            const session = {
                id: 'sess-1',
                status: 'ACTIVE',
                startedAt,
                pausedDuration: 600, // 10 minutes paused
                xpGained: 0
            };

            jest.spyOn(service, 'getById').mockResolvedValue(session as any);
            jest.spyOn(prisma.studySession, 'update').mockResolvedValue({} as any);

            // Act
            const result = await service.endSession('sess-1', 'user-1');

            // Assert
            const effectiveDurationSecs = 3600 - 600; // 3000 seconds = 50 mins
            const expectedXp = 50 * 2; // 2 xp per minute = 100 xp

            expect(xpService.addXP).toHaveBeenCalledWith('user-1', expectedXp, EventSource.SESSION, 'sess-1');
            expect(prisma.studySession.update).toHaveBeenCalledWith({
                where: { id: 'sess-1' },
                data: expect.objectContaining({
                    status: 'ENDED',
                    duration: effectiveDurationSecs,
                    xpGained: { increment: expectedXp }
                })
            });
            expect(streakService.checkAndUpdateStreak).toHaveBeenCalledWith('user-1');
        });

        it('deve retornar xpGained = 0 para sessões com duração < 1 minuto', async () => {
            // Arrange
            const startedAt = new Date('2026-03-10T10:00:00Z');
            const now = new Date('2026-03-10T10:00:45Z'); // 45 seconds
            jest.setSystemTime(now);

            const session = { id: 'sess-1', status: 'ACTIVE', startedAt, pausedDuration: 0, xpGained: 0 };

            jest.spyOn(service, 'getById').mockResolvedValue(session as any);
            jest.spyOn(prisma.studySession, 'update').mockResolvedValue({ xpGained: 0 } as any);

            // Act
            const result = await service.endSession('sess-1', 'user-1');

            // Assert
            expect(xpService.addXP).not.toHaveBeenCalled();
            expect(prisma.studySession.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ xpGained: { increment: 0 } })
                })
            );
        });
    });

    describe('markAbandoned (autoEndAbandonedSessions)', () => {
        it('deve marcar sessão como ABANDONED quando lastHeartbeat > 5min atrás e calcular XP até o lastHeartbeat', async () => {
            // Arrange
            const startedAt = new Date('2026-03-10T10:00:00Z');
            const lastHeartbeat = new Date('2026-03-10T10:30:00Z'); // 30 mins active
            const now = new Date('2026-03-10T11:00:00Z'); // now is 1 hour later (should trigger abandon)
            jest.setSystemTime(now);

            const abandonedSess = {
                id: 'sess-1',
                userId: 'user-1',
                status: 'ACTIVE',
                startedAt,
                lastHeartbeat,
                pausedDuration: 0,
                xpGained: 0
            };

            jest.spyOn(prisma.studySession, 'findMany').mockResolvedValue([abandonedSess as any]);
            jest.spyOn(prisma.studySession, 'update').mockResolvedValue({} as any);

            // Act
            await service.autoEndAbandonedSessions();

            // Assert
            // 30 mins * 2 = 60 XP
            expect(xpService.addXP).toHaveBeenCalledWith('user-1', 60, EventSource.SESSION, 'sess-1');
            expect(prisma.studySession.update).toHaveBeenCalledWith({
                where: { id: 'sess-1' },
                data: expect.objectContaining({
                    status: 'ABANDONED',
                    endedAt: lastHeartbeat, // Important: NOT `now`
                    duration: 1800 // 30 mins = 1800 secs
                })
            });
        });
    });
});
