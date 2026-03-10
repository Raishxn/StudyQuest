import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis | null) { }

    async get(key: string): Promise<string | null> {
        if (!this.redis) return null;
        try {
            return await this.redis.get(key);
        } catch (err: any) {
            this.logger.warn(`get('${key}') failed: ${err.message}`);
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (!this.redis) return;
        try {
            if (ttlSeconds) {
                await this.redis.set(key, value, 'EX', ttlSeconds);
            } else {
                await this.redis.set(key, value);
            }
        } catch (err: any) {
            this.logger.warn(`set('${key}') failed: ${err.message}`);
        }
    }

    async del(key: string): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.del(key);
        } catch (err: any) {
            this.logger.warn(`del('${key}') failed: ${err.message}`);
        }
    }

    async incr(key: string): Promise<number | null> {
        if (!this.redis) return null;
        try {
            return await this.redis.incr(key);
        } catch (err: any) {
            this.logger.warn(`incr('${key}') failed: ${err.message}`);
            return null;
        }
    }

    async expire(key: string, ttlSeconds: number): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.expire(key, ttlSeconds);
        } catch (err: any) {
            this.logger.warn(`expire('${key}') failed: ${err.message}`);
        }
    }

    async isHealthy(): Promise<boolean> {
        if (!this.redis) return false;
        try {
            await this.redis.ping();
            return true;
        } catch {
            return false;
        }
    }
}
