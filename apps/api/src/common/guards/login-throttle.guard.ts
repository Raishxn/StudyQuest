import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class LoginThrottleGuard implements CanActivate {
    private redis: Redis | null = null;

    constructor() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            const useTls = redisUrl.startsWith('rediss://');
            this.redis = new Redis(redisUrl, {
                maxRetriesPerRequest: 1,
                connectTimeout: 3000,
                lazyConnect: true,
                ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
            });
            this.redis.connect().catch(() => {
                console.warn('[LoginThrottleGuard] Redis unavailable — throttling disabled');
                this.redis = null;
            });
        } catch {
            console.warn('[LoginThrottleGuard] Redis init failed — throttling disabled');
            this.redis = null;
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Fail-open: if Redis is unavailable, allow the request
        if (!this.redis) return true;

        try {
            const req = context.switchToHttp().getRequest();

            let ip = req.ip;
            const xForwardedFor = req.headers['x-forwarded-for'];
            if (xForwardedFor) {
                ip = typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0].trim() : xForwardedFor[0];
            }

            const key = `login_attempts:${ip}`;
            const attempts = await this.redis.get(key);

            if (attempts && parseInt(attempts, 10) >= 5) {
                throw new HttpException('Muitas tentativas. Tente novamente em 15 minutos.', HttpStatus.TOO_MANY_REQUESTS);
            }

            const multi = this.redis.multi();
            multi.incr(key);

            if (!attempts) {
                multi.expire(key, 900); // 15 min
            }

            await multi.exec();
            return true;
        } catch (error) {
            // Re-throw if it's our own HttpException (too many requests)
            if (error instanceof HttpException) throw error;
            // For any other error (Redis down mid-request), fail-open
            console.warn('[LoginThrottleGuard] Redis error, allowing request:', (error instanceof Error ? error.message : error));
            return true;
        }
    }
}
