import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class LoginThrottleGuard implements CanActivate {
    private redis: Redis;

    constructor() {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
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
            multi.expire(key, 900); // 15 minutos = 900s
        }

        await multi.exec();

        // The successful login should ideally clear this key, but standard throttlers
        // often just let it expire. We will let it expire or it can be cleared manually in AuthService.
        return true;
    }
}
