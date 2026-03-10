import { Test, TestingModule } from '@nestjs/testing';
import { XpService, EventSource } from './xp.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('XpService', () => {
    let service: XpService;
    let prisma: PrismaService;
    let xpQueue: any;

    beforeEach(async () => {
        const mockPrismaService = {
            xPTransaction: {
                create: jest.fn(),
                aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
            },
            user: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };

        const mockXpQueue = {
            add: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                XpService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: getQueueToken('xp-events'), useValue: mockXpQueue },
            ],
        }).compile();

        service = module.get<XpService>(XpService);
        prisma = module.get<PrismaService>(PrismaService);
        xpQueue = module.get(getQueueToken('xp-events'));
    });

    describe('calculateLevel', () => {
        it('deve retornar nível 1 para XP = 0, 1, 499', () => {
            // Arrange, Act, Assert
            expect(service.calculateLevel(0)).toBe(1);
            expect(service.calculateLevel(1)).toBe(1);
            expect(service.calculateLevel(499)).toBe(1);
        });

        it('deve retornar nível 2 para XP = 500, 501, 1499', () => {
            expect(service.calculateLevel(500)).toBe(2);
            expect(service.calculateLevel(501)).toBe(2);
            expect(service.calculateLevel(1499)).toBe(2);
        });

        it('deve retornar nível 3 para XP = 1500, 2999', () => {
            expect(service.calculateLevel(1500)).toBe(3);
            expect(service.calculateLevel(2999)).toBe(3);
        });

        it('deve retornar nível 4 para XP = 3000, 5999', () => {
            expect(service.calculateLevel(3000)).toBe(4);
            expect(service.calculateLevel(5999)).toBe(4);
        });

        it('deve retornar nível 5 para XP = 6000, 11999', () => {
            expect(service.calculateLevel(6000)).toBe(5);
            expect(service.calculateLevel(11999)).toBe(5);
        });

        it('deve retornar nível 6 para XP = 12000, 24999', () => {
            expect(service.calculateLevel(12000)).toBe(6);
            expect(service.calculateLevel(24999)).toBe(6);
        });

        it('deve retornar nível 7 para XP = 25000, 999999', () => {
            expect(service.calculateLevel(25000)).toBe(7);
            expect(service.calculateLevel(999999)).toBe(7);
        });
    });

    describe('addXP', () => {
        it('deve adicionar XP corretamente e retornar leveledUp: false quando não sobe de nível', async () => {
            // Arrange
            const userId = 'user-1';
            const userState = { id: userId, xp: 100, level: 1, title: 'Calouro' };

            jest.spyOn(prisma.xPTransaction, 'aggregate').mockResolvedValue({ _sum: { amount: 0 } } as any);
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userState as any);

            // Act
            const result = await service.addXP(userId, 50, EventSource.SESSION, 'sess-1');

            // Assert
            expect(result).toEqual({ leveledUp: false, newLevel: 1 });
            expect(prisma.xPTransaction.create).toHaveBeenCalledWith({
                data: { userId, amount: 50, source: EventSource.SESSION, refId: 'sess-1' }
            });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { xp: 150, level: 1, title: 'Calouro' }
            });
            expect(xpQueue.add).not.toHaveBeenCalled();
        });

        it('deve retornar leveledUp: true e newLevel correto quando XP ultrapassa threshold', async () => {
            // Arrange
            const userId = 'user-1';
            const userState = { id: userId, xp: 480, level: 1, title: 'Calouro' };

            jest.spyOn(prisma.xPTransaction, 'aggregate').mockResolvedValue({ _sum: { amount: 0 } } as any);
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userState as any);

            // Act
            const result = await service.addXP(userId, 50, EventSource.SESSION, 'sess-1');

            // Assert
            expect(result).toEqual({ leveledUp: true, newLevel: 2 }); // 480 + 50 = 530 (L2)
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { xp: 530, level: 2, title: 'Estudante Focado' }  // title from getLevelTitle(2)
            });
            expect(xpQueue.add).toHaveBeenCalledWith('check-achievements', {
                userId,
                event: 'LEVEL_UP',
                context: { newLevel: 2 }
            });
        });

        it('deve respeitar cap de 600 XP por sessão (source: SESSION) e ignorar excedente silenciosamente', async () => {
            // Arrange
            const userId = 'user-1';
            jest.spyOn(prisma.xPTransaction, 'aggregate')
                .mockResolvedValueOnce({ _sum: { amount: 0 } } as any) // Daily
                .mockResolvedValueOnce({ _sum: { amount: 550 } } as any); // Session already has 550

            // Act
            const result = await service.addXP(userId, 100, EventSource.SESSION, 'sess-1'); // 550 + 100 = 650 > 600 cap

            // Assert
            expect(result).toEqual({ leveledUp: false, newLevel: 0 });
            expect(prisma.xPTransaction.create).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('deve respeitar cap diário de 1200 XP e ignorar silenciosamente sem notificar', async () => {
            // Arrange
            const userId = 'user-1';
            jest.spyOn(prisma.xPTransaction, 'aggregate')
                .mockResolvedValueOnce({ _sum: { amount: 1100 } } as any); // Daily already at 1100

            // Act
            const result = await service.addXP(userId, 200, EventSource.ACHIEVEMENT); // 1100 + 200 = 1300 > 1200 cap

            // Assert
            expect(result).toEqual({ leveledUp: false, newLevel: 0 });
            expect(prisma.xPTransaction.create).not.toHaveBeenCalled();
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('deve criar registro em XPTransaction sempre (quando não barrado pelos caps)', async () => {
            // Arrange
            const userId = 'user-1';
            const userState = { id: userId, xp: 100, level: 1, title: 'Calouro' };
            jest.spyOn(prisma.xPTransaction, 'aggregate').mockResolvedValue({ _sum: { amount: 0 } } as any);
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userState as any);

            // Act
            await service.addXP(userId, 10, EventSource.REPLY, 'post-1');
            await service.addXP(userId, 15, EventSource.UPLOAD, 'file-xyz');

            // Assert
            expect(prisma.xPTransaction.create).toHaveBeenCalledTimes(2);
            expect(prisma.xPTransaction.create).toHaveBeenNthCalledWith(1, {
                data: { userId, amount: 10, source: EventSource.REPLY, refId: 'post-1' }
            });
            expect(prisma.xPTransaction.create).toHaveBeenNthCalledWith(2, {
                data: { userId, amount: 15, source: EventSource.UPLOAD, refId: 'file-xyz' }
            });
        });
    });
});
