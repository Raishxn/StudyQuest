import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
    constructor(private readonly redisService: RedisService) { }

    @Get()
    async check() {
        const redisOk = await this.redisService.isHealthy();
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                api: 'up',
                redis: redisOk ? 'up' : 'degraded',
            },
        };
    }
}
