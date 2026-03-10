import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class DailyUploadLimitGuard implements CanActivate {
    // Assuming a generic Redis injection. Depending on the exact Redis module used in the project,
    // this might need adjustment. The user relies on BullMQ which uses ioredis.
    // We'll use a direct Redis connection from env for simplicity if an injection token is missing,
    // but let's assume they have a standard Redis setup or we'll inject it.

    private redis: Redis;

    constructor() {
        // Basic fallback to process.env if @InjectRedis isn't setup globally
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user || !user.id) {
            // If no user is attached, we can't limit by userId.
            // Pass it through or block it. Let's pass it and let JwtAuthGuard block if needed.
            return true;
        }

        const today = new Date().toISOString().split('T')[0];
        const key = `upload_count:${user.id}:${today}`;

        const currentCount = await this.redis.get(key);

        if (currentCount && parseInt(currentCount, 10) >= 10) {
            throw new HttpException('Limite diário de uploads atingido (10 max)', HttpStatus.TOO_MANY_REQUESTS);
        }

        // Increment and set expiry to end of day if it's new
        const multi = this.redis.multi();
        multi.incr(key);

        if (!currentCount) {
            // Calculate seconds until midnight
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);
            multi.expire(key, ttl);
        }

        await multi.exec();

        return true;
    }
}
