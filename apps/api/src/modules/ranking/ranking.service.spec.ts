import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('RankingService', () => {
    let service: RankingService;
    let prisma: PrismaService;
    let mockRedisService: any;

    beforeEach(async () => {
        mockRedisService = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
        };

        const mockPrisma = {
            user: {
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RankingService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: RedisService, useValue: mockRedisService },
            ],
        }).compile();

        service = module.get<RankingService>(RankingService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('getGlobalRanking', () => {
        it('deve ler do Redis quando cache disponível (não chamar PrismaService)', async () => {
            const cachedRanking = [
                { id: 'user-1', xp: 5000 },
                { id: 'user-2', xp: 4000 }
            ];
            // RedisService.get returns a JSON string
            mockRedisService.get.mockResolvedValue(JSON.stringify(cachedRanking));

            const result = await service.getGlobalRanking('user-2', 'weekly');

            expect(mockRedisService.get).toHaveBeenCalledWith('ranking:global:weekly');
            expect(prisma.user.findMany).not.toHaveBeenCalled();

            expect(result.top3).toHaveLength(2);
            expect(result.userPosition).toBe(2);
        });

        it('deve fazer fallback para PostgreSQL quando Redis retorna null', async () => {
            mockRedisService.get.mockResolvedValue(null);
            const dbRanking = [
                { id: 'user-3', xp: 1000 }
            ];
            jest.spyOn(prisma.user, 'findMany').mockResolvedValue(dbRanking as any);

            const result = await service.getGlobalRanking('user-3', 'alltime');

            expect(mockRedisService.get).toHaveBeenCalled();
            expect(prisma.user.findMany).toHaveBeenCalled();
            expect(result.top3[0].id).toBe('user-3');
        });

        it('deve sempre incluir a posição do usuário autenticado na resposta mesmo se fora do top 100', async () => {
            const largeRanking = Array.from({ length: 150 }).map((_, i) => ({ id: `u-${i + 1}`, xp: 1000 - i }));
            largeRanking[119] = { id: 'target-user', xp: 800 };

            mockRedisService.get.mockResolvedValue(JSON.stringify(largeRanking));

            const result = await service.getGlobalRanking('target-user', 'weekly');

            expect(result.userPosition).toBe(120);
            expect(result.top3).toHaveLength(3);
            expect(result.list).toHaveLength(97);
            expect(result.list.find((u: any) => u.id === 'target-user')).toBeUndefined();
            expect(result.totalLimit).toBe(150);
        });

        it('deve excluir usuários inativos há mais de 90 dias do ranking semanal', async () => {
            mockRedisService.get.mockResolvedValue(null);
            jest.spyOn(prisma.user, 'findMany').mockResolvedValue([] as any);

            await service.getGlobalRanking('user-x', 'weekly');

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        xpHistory: expect.objectContaining({
                            some: expect.objectContaining({
                                createdAt: expect.objectContaining({
                                    gte: expect.any(Date)
                                })
                            })
                        })
                    })
                })
            );
        });
    });
});
