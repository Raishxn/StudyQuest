import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;
    let jwt: JwtService;

    beforeEach(async () => {
        const mockPrisma = {
            user: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            refreshToken: {
                findUnique: jest.fn(),
                create: jest.fn(),
                delete: jest.fn(),
                deleteMany: jest.fn(),
            },
            passwordReset: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
            $transaction: jest.fn().mockImplementation((args) => {
                if (Array.isArray(args)) return Promise.all(args);
                return args;
            }),
        };

        const mockJwt = {
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
        };

        const mockConfig = {
            get: jest.fn().mockReturnValue('mock-secret'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: JwtService, useValue: mockJwt },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwt = module.get<JwtService>(JwtService);
    });

    describe('login', () => {
        it('deve lançar UnauthorizedException com mensagem genérica para e-mail inexistente', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await expect(service.login({ email: 'x@x.com', password: '123' }))
                .rejects.toThrow('E-mail ou senha inválidos');
        });

        it('deve lançar UnauthorizedException com a MESMA mensagem genérica para senha errada', async () => {
            const user = { id: 'u1', email: 'x@x.com', passwordHash: 'hash' };
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Wrong password

            await expect(service.login({ email: 'x@x.com', password: '123' }))
                .rejects.toThrow('E-mail ou senha inválidos');
        });

        it('deve retornar access token e criar refresh token no banco para credenciais corretas', async () => {
            const user = { id: 'u1', email: 'x@x.com', passwordHash: 'hash', role: 'USER' };
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Password correct

            const result = await service.login({ email: 'x@x.com', password: '123' });

            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.refreshToken).toBeDefined();
            expect(prisma.refreshToken.create).toHaveBeenCalled(); // Generates refresh token logic
        });
    });

    describe('refresh', () => {
        it('deve rotacionar refresh token (deletar antigo, criar novo) em uso válido', async () => {
            const storedToken = { userId: 'u1', tokenHash: 'thash', expiresAt: new Date(Date.now() + 10000) };
            jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue(storedToken as any);
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'u1', role: 'USER' } as any);

            const result = await service.refreshToken('u1', 'incoming-token-xyz');

            expect(prisma.refreshToken.delete).toHaveBeenCalled(); // Rotates old
            expect(prisma.refreshToken.create).toHaveBeenCalled(); // Creates new
            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.refreshToken).toBeDefined();
        });

        it('deve lançar UnauthorizedException para token expirado', async () => {
            const storedToken = { userId: 'u1', tokenHash: 'thash', expiresAt: new Date(Date.now() - 10000) };
            jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue(storedToken as any);

            await expect(service.refreshToken('u1', 'incoming-token-xyz'))
                .rejects.toThrow('Token inválido ou expirado. Faça login novamente.');

            expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } }); // Comprometido: delete todos
        });

        it('deve lançar UnauthorizedException para token que não existe no banco', async () => {
            jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue(null);

            await expect(service.refreshToken('u1', 'incoming-token-xyz'))
                .rejects.toThrow('Token inválido ou expirado. Faça login novamente.');
        });
    });

    describe('resetPassword', () => {
        it('deve lançar BadRequestException para token expirado', async () => {
            const resetEntity = { userId: 'u1', expiresAt: new Date(Date.now() - 10000), usedAt: null };
            jest.spyOn(prisma.passwordReset, 'findUnique').mockResolvedValue(resetEntity as any);

            await expect(service.resetPassword('some-token', 'new-pass'))
                .rejects.toThrow('Token inválido ou expirado');
        });

        it('deve lançar BadRequestException para token já usado (usedAt preenchido)', async () => {
            const resetEntity = { userId: 'u1', expiresAt: new Date(Date.now() + 10000), usedAt: new Date() };
            jest.spyOn(prisma.passwordReset, 'findUnique').mockResolvedValue(resetEntity as any);

            await expect(service.resetPassword('some-token', 'new-pass'))
                .rejects.toThrow('Token inválido ou expirado');
        });

        it('deve invalidar TODOS os refresh tokens do usuário após reset', async () => {
            const resetEntity = { id: 'r1', userId: 'u1', expiresAt: new Date(Date.now() + 10000), usedAt: null };
            jest.spyOn(prisma.passwordReset, 'findUnique').mockResolvedValue(resetEntity as any);
            (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

            await service.resetPassword('some-token', 'new-pass');

            // Invalidar todos os relógios (sessions) ativos dele
            expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 'u1' } })
            );
        });
    });
});
