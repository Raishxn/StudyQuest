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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    XpModule,
    ScheduleModule.forRoot(),
    StudyModule,
    InstitutionsModule,
    ForumModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
