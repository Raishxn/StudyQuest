import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadModule } from '../upload/upload.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [UploadModule, RedisModule],
    controllers: [UsersController],
    providers: [UsersService, PrismaService],
    exports: [UsersService],
})
export class UsersModule { }
