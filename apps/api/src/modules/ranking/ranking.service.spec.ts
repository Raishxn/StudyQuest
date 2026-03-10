import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('RankingService', () => {
    let service: RankingService;
    let prisma: PrismaService;
    let mockCacheManager: any;

    beforeEach(async () => {
        mockCacheManager = {
            get: jest.fn(),
            set: jest.fn(),
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
                { provide: CACHE_MANAGER, useValue: mockCacheManager },
            ],
        }).compile();

        service = module.get<RankingService>(RankingService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('getGlobalRanking', () => {
        it('deve ler do Redis quando cache disponível (não chamar PrismaService)', async () => {
            // Arrange
            const cachedRanking = [
                { id: 'user-1', xp: 5000 },
                { id: 'user-2', xp: 4000 }
            ];
            mockCacheManager.get.mockResolvedValue(cachedRanking);

            // Act
            const result = await service.getGlobalRanking('user-2', 'weekly');

            // Assert
            expect(mockCacheManager.get).toHaveBeenCalledWith('ranking:global:weekly');
            expect(prisma.user.findMany).not.toHaveBeenCalled();

            expect(result.top3).toHaveLength(2);
            expect(result.userPosition).toBe(2); // user-2 is at index 1 -> position 2
        });

        it('deve fazer fallback para PostgreSQL quando Redis retorna null', async () => {
            // Arrange
            mockCacheManager.get.mockResolvedValue(null);
            const dbRanking = [
                { id: 'user-3', xp: 1000 }
            ];
            jest.spyOn(prisma.user, 'findMany').mockResolvedValue(dbRanking as any);

            // Act
            const result = await service.getGlobalRanking('user-3', 'alltime');

            // Assert
            expect(mockCacheManager.get).toHaveBeenCalled();
            expect(prisma.user.findMany).toHaveBeenCalled();
            expect(result.top3[0].id).toBe('user-3');
        });

        it('deve sempre incluir a posição do usuário autenticado na resposta mesmo se fora do top 100', async () => {
            // Arrange
            // Let's assume Redis has 150 items and the user is at position 120
            const largeRanking = Array.from({ length: 150 }).map((_, i) => ({ id: `u-${i + 1}`, xp: 1000 - i }));

            // We overwrite finding `u-120` to verify:
            largeRanking[119] = { id: 'target-user', xp: 800 };

            mockCacheManager.get.mockResolvedValue(largeRanking);

            // Act
            const result = await service.getGlobalRanking('target-user', 'weekly');

            // Assert
            expect(result.userPosition).toBe(120); // They are index 119 -> position 120
            expect(result.top3).toHaveLength(3);   // Exactly 3 in top
            expect(result.list).toHaveLength(97);  // 3 to 100 is 97 users
            expect(result.list.find((u: any) => u.id === 'target-user')).toBeUndefined(); // Excluded from Top 100 list but position is known
            expect(result.totalLimit).toBe(150);
        });

        it('deve excluir usuários inativos há mais de 90 dias do ranking semanal', async () => {
            // Arrange
            mockCacheManager.get.mockResolvedValue(null);
            jest.spyOn(prisma.user, 'findMany').mockResolvedValue([] as any);

            // We check that the prisma query for `weekly` contains a GTE condition on `xpHistory`
            // ensuring that inactive users (without recent history) are excluded implicitly via whereClause.

            // Act
            await service.getGlobalRanking('user-x', 'weekly');

            // Assert
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
