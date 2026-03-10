import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: (config: ConfigService) => {
                const redisUrl = config.get<string>('REDIS_URL');

                if (!redisUrl) {
                    console.warn('[Redis] REDIS_URL not set — using in-memory fallback');
                    // Return a null-like object so the app can still start without Redis
                    return null;
                }

                const client = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    enableOfflineQueue: false,
                    lazyConnect: true,
                    connectTimeout: 5000,
                    retryStrategy: (times) => {
                        if (times > 5) return null;
                        return Math.min(times * 500, 3000);
                    },
                    reconnectOnError: (err) => {
                        return err.message.includes('ECONNRESET') || err.message.includes('ETIMEDOUT');
                    },
                });

                client.on('error', (err: Error) => {
                    console.warn('[Redis] Connection error (non-critical):', err.message);
                });

                client.on('connect', () => {
                    console.log('[Redis] Connected successfully');
                });

                client.on('reconnecting', () => {
                    console.warn('[Redis] Reconnecting...');
                });

                client.connect().catch((err) => {
                    console.warn('[Redis] Initial connection failed:', err.message);
                });

                return client;
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }
