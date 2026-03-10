import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadModule } from '../upload/upload.module';
import { XpModule } from '../xp/xp.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        UploadModule,
        XpModule,
        ThrottlerModule.forRoot([{
            ttl: 86400000, // 24 hours
            limit: 100, // Default base 
        }])
    ],
    controllers: [BankController],
    providers: [BankService, PrismaService],
})
export class BankModule { }
