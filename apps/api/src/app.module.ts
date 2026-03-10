import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { XpModule } from './modules/xp/xp.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { StudyModule } from './modules/study/study.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { ForumModule } from './modules/forum/forum.module';
import { BankModule } from './modules/bank/bank.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { UsersModule } from './modules/users/users.module';
import { FriendsModule } from './modules/friends/friends.module';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        const config: any = {
          throttlers: [{ limit: 100, ttl: 60 }],
        };
        // Only use Redis storage if REDIS_URL is available
        if (redisUrl) {
          try {
            config.storage = new ThrottlerStorageRedisService(redisUrl);
          } catch (err) {
            console.warn('[Throttler] Failed to init Redis storage, using in-memory:', err);
          }
        }
        return config;
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get('REDIS_URL');
        if (!url) {
          return {
            connection: {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
            },
          };
        }
        const Redis = require('ioredis');
        const connection = new Redis(url, {
          maxRetriesPerRequest: null, // BullMQ requires null
          enableOfflineQueue: false,
          lazyConnect: true,
          connectTimeout: 5000,
          retryStrategy: (times: number) => {
            if (times > 5) return null;
            return Math.min(times * 500, 3000);
          },
        });
        connection.on('error', (err: Error) => {
          console.warn('[BullMQ Redis] Error:', err.message);
        });
        connection.connect().catch((err: Error) => {
          console.warn('[BullMQ Redis] Initial connect failed:', err.message);
        });
        return { connection };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    XpModule,
    ScheduleModule.forRoot(),
    StudyModule,
    InstitutionsModule,
    ForumModule,
    BankModule,
    RankingModule,
    UsersModule,
    FriendsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule { }
