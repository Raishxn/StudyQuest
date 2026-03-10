import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 900,
      limit: 5,
    }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default_secret_for_development_only',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    PrismaService,
  ],
})
export class AuthModule { }
