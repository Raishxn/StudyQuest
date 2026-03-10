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
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            limit: 100,
            ttl: 60,
          },
        ],
        storage: new ThrottlerStorageRedisService(
          (configService.get('REDIS_URL') as string) || `redis://${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}`
        ),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get('REDIS_URL');
        return url
          ? {
            connection: new (require('ioredis'))(url, {
              maxRetriesPerRequest: null,
            })
          }
          : {
            connection: {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
            },
          };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get('REDIS_URL');
        return url ? {
          store: redisStore,
          url: url,
          ttl: 600,
        } : {
          store: redisStore,
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          ttl: 600,
        };
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
