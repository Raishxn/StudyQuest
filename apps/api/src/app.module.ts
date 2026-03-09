import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { XpModule } from './modules/xp/xp.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
