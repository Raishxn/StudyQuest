import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { RepliesController } from './replies.controller';
import { ForumService } from './forum.service';
import { PrismaService } from '../../prisma/prisma.service';
import { XpModule } from '../xp/xp.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        XpModule,
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }])
    ],
    controllers: [PostsController, RepliesController],
    providers: [ForumService, PrismaService],
})
export class ForumModule { }
