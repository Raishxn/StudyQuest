import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');

process.env.REDIS_URL = ''; // Disable Redis to use in-memory fallbacks

import { AppModule } from '../app.module';
import helmet from 'helmet';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { SanitizationInterceptor } from '../common/interceptors/sanitization.interceptor';
import { ResponseSanitizationInterceptor } from '../common/interceptors/response-sanitization.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UploadService } from '../modules/upload/upload.service';
import { XpService } from '../modules/xp/xp.service';
import { getQueueToken } from '@nestjs/bullmq';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
class DummyAdminController {
    @Roles('ADMIN')
    @Get()
    getAdminData() { return "Secret"; }
}

global.mockRedisStore = new Map();
jest.mock('ioredis', () => {
    const mockClient = {
        connect: jest.fn().mockResolvedValue(true),
        get: jest.fn(async (key) => global.mockRedisStore.get(key)),
        multi: jest.fn(() => ({
            incr: jest.fn((key) => {
                const current = parseInt(global.mockRedisStore.get(key) || '0', 10);
                global.mockRedisStore.set(key, (current + 1).toString());
                return mockClient; // chain
            }),
            expire: jest.fn(() => mockClient),
            exec: jest.fn().mockResolvedValue(true),
        })),
        on: jest.fn(),
    };
    const mockConstructor = jest.fn().mockImplementation(() => mockClient);
    return {
        __esModule: true,
        default: mockConstructor,
        Redis: mockConstructor,
    };
});
jest.mock('file-type', () => ({
    fileTypeFromBuffer: jest.fn().mockImplementation(async (buf) => {
        if (buf && buf.toString().includes('MZ')) return { mime: 'application/x-msdownload', ext: 'exe' };
        return { mime: 'application/pdf', ext: 'pdf' };
    }),
}), { virtual: true });
jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('1234-5678-91011'),
}), { virtual: true });

import { ConfigService } from '@nestjs/config';

describe('Security and Hardening Tests (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwtService: JwtService;

    // Test Users
    let userA: any;
    let userB: any;
    let userAToken: string;
    let userBToken: string;

    const mockPrisma = {
        user: {
            findUnique: jest.fn().mockImplementation(async ({ where }) => {
                if (where.email === 'sec_usera@tests.com' || where.id === 'userA-id') return { id: 'userA-id', email: 'sec_usera@tests.com', role: 'USER', passwordHash: await bcrypt.hash('SecPwd123!', 10) };
                if (where.email === 'sec_userb@tests.com' || where.id === 'userB-id') return { id: 'userB-id', email: 'sec_userb@tests.com', role: 'USER', passwordHash: await bcrypt.hash('SecPwd123!', 10) };
                return null;
            }),
            create: jest.fn().mockResolvedValue({ id: 'mock-id' }),
            deleteMany: jest.fn(),
            update: jest.fn(),
        },
        bankItem: { findUnique: jest.fn(), create: jest.fn() },
        forumPost: { create: jest.fn().mockResolvedValue({ id: 'fp-123' }) }
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            controllers: [DummyAdminController],
        })
            .overrideProvider(ConfigService)
            .useValue({
                get: jest.fn((key) => {
                    if (key === 'REDIS_URL') return '';
                    if (key === 'JWT_SECRET') return 'secret';
                    return process.env[key];
                })
            })
            .overrideProvider(PrismaService)
            .useValue(mockPrisma)
            .overrideProvider(UploadService)
            .useValue({ upload: jest.fn().mockResolvedValue(true), getSignedUrl: jest.fn() })
            .overrideProvider(XpService)
            .useValue({ addXP: jest.fn().mockResolvedValue(true) })
            .overrideProvider(getQueueToken('document'))
            .useValue({ add: jest.fn().mockResolvedValue(true) })
            .compile();

        app = moduleFixture.createNestApplication();

        // 1. Helmet Security Headers
        app.use(helmet());

        // 2. Global Validation Pipe
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        // 3. Global Exception Filter
        app.useGlobalFilters(new HttpExceptionFilter());

        // 4. Global Interceptors
        app.useGlobalInterceptors(
            new SanitizationInterceptor(),
            new ResponseSanitizationInterceptor()
        );

        await app.init();

        prisma = app.get<PrismaService>(PrismaService);
        jwtService = app.get<JwtService>(JwtService);

        userA = { id: 'userA-id', email: 'sec_usera@tests.com', role: 'USER' };
        userB = { id: 'userB-id', email: 'sec_userb@tests.com', role: 'USER' };

        userAToken = await jwtService.signAsync({ sub: userA.id, email: userA.email, role: userA.role }, { expiresIn: '15m' });
        userBToken = await jwtService.signAsync({ sub: userB.id, email: userB.email, role: userB.role }, { expiresIn: '15m' });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('1. Authentication Tests', () => {

        it('should return 401 when accessing protected route without token', () => {
            return request(app.getHttpServer())
                .get('/auth/me')
                .expect(401);
        });

        it('should return 401 when accessing protected route with an expired token', async () => {
            // Sign a token that expired 1 hour ago
            const expiredToken = await jwtService.signAsync(
                { sub: userA.id, email: userA.email, role: userA.role },
                { expiresIn: '-1h' }
            );

            return request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${expiredToken}`)
                // In generic JwtAuthGuard we mapped TokenExpiredError to a 401 with standard message
                .expect(401);
        });

        it('should return 401 when token has an invalid signature (tampered)', async () => {
            // Take a valid token and tamper with the payload part
            const [header, payload, signature] = userAToken.split('.');
            const tamperedPayload = Buffer.from(JSON.stringify({ sub: userA.id, role: 'ADMIN' })).toString('base64').replace(/=/g, '');
            const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

            return request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${tamperedToken}`)
                .expect(401);
        });

        it('should return 401 if refresh token is reused or invalid', async () => {
            // Attempt to refresh with a made up token
            return request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Authorization', `Bearer ${userAToken}`)
                .send({ refreshToken: 'made-up-token-value' })
                .expect(401);
        });

        it('should return 429 Too Many Requests after 5 failed login attempts', async () => {
            for (let i = 0; i < 5; i++) {
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: userA.email, password: 'wrongpassword' })
                    .expect(401);
            }

            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: userA.email, password: 'wrongpassword' })
                .expect(429);
        });
    });

    describe('2. Authorization Tests', () => {

        it('should protect /users/me from horizontal escalation', async () => {
            // Since /users/me reads from JWT and accepts no params in the URL for target user,
            // we attempt to send a body payload with { id: 'other-user' }
            const spy = jest.spyOn(prisma.user, 'update').mockResolvedValue(userA);

            await request(app.getHttpServer())
                .patch('/users/me')
                .set('Authorization', `Bearer ${userAToken}`)
                .send({ id: 'admin-id', name: 'Hacker Name' })
                .expect(400); // 400 Bad Request because ValidationPipe strips 'id' due to forbidNonWhitelisted

            // If we send a valid update object, it MUST use userA.id and ignore id in body
            await request(app.getHttpServer())
                .patch('/users/me')
                .set('Authorization', `Bearer ${userAToken}`)
                .send({ name: 'Hacker Name' })
                .expect(200);

            // Verify the server ALWAYS used the JWT sub/identifier.
            expect(spy).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: userA.id },
            }));
        });

        it('should forbid reading an unauthorized chat', async () => {
            // Assume user A and B exist but we want to read chat that C is in.
            // Using ID "private-chat-1" which our mock Prisma says UserA isn't member of
            return request(app.getHttpServer())
                .get('/chat/private-chat-1/messages')
                .set('Authorization', `Bearer ${userAToken}`)
                .expect(404); // Or 403, depending on Prisma not returning the chat
        });

        it('should deny basic USER from accessing ADMIN routes', async () => {
            return request(app.getHttpServer())
                .get('/admin')
                .set('Authorization', `Bearer ${userAToken}`)
                .expect(403);
        });

    });

    describe('3. Injection & App Logic Tests', () => {

        it('should sanitize XSS payloads automatically before processing', async () => {
            // Using the global SanitizationInterceptor implemented earlier
            const postSpy = jest.spyOn(prisma.forumPost, 'create').mockResolvedValue({ id: 'p1' } as any);

            await request(app.getHttpServer())
                .post('/forum/posts')
                .set('Authorization', `Bearer ${userAToken}`)
                .send({
                    title: 'Normal Title for Test',
                    body: 'Hello <script>alert(1)</script> World! This body must be at least 30 characters long to pass the validation pipe constraints...',
                    subject: 'Math'
                })
                .expect(201);

            expect(postSpy).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    body: 'Hello  World! This body must be at least 30 characters long to pass the validation pipe constraints...' // tag stripped
                })
            }));
        });

        it('should reject uploads lacking valid Auth headers', () => {
            return request(app.getHttpServer())
                .post('/bank/upload')
                // No token
                .expect(401);
        });

    });

    describe('4. Uploads & Rate Limits Tests', () => {

        it('should reject files exceeding 20MB limit', async () => {
            // Send exactly 21MB Fake Payload
            const largeBuffer = Buffer.alloc(21 * 1024 * 1024, 'A');
            return request(app.getHttpServer())
                .post('/bank/upload')
                .set('Authorization', `Bearer ${userAToken}`)
                .attach('file', largeBuffer, 'huge.pdf')
                .field('title', 'Huge PDF')
                .field('subject', 'Math')
                .field('type', 'EXAM')
                .expect(400); // 400 Bad Request triggered by UploadValidationPipe
        });

        it('should reject .exe spoofed as .pdf via Magic Bytes validation', async () => {
            // MZ is DOS executable magic byte format
            const spoofedExeBuffer = Buffer.from('MZ spoofed as PDF');
            return request(app.getHttpServer())
                .post('/bank/upload')
                .set('Authorization', `Bearer ${userAToken}`)
                // Spoofed MIME type in HTTP form-data 
                .attach('file', spoofedExeBuffer, { filename: 'malware.pdf', contentType: 'application/pdf' })
                .field('title', 'Malware')
                .field('subject', 'Math')
                .field('type', 'EXAM')
                .expect(400); // Bad Request (Format not allowed)
        });

    });

});
