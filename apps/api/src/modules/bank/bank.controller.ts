import { Controller, Post, Get, Param, Body, UseGuards, Req, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { BankService } from './bank.service';
import { UploadBankItemDto, CreateBankCommentDto, CreateBankRatingDto } from './dto/bank.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('bank')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class BankController {
    constructor(private readonly bankService: BankService) { }

    @Post('upload')
    @Throttle({ default: { limit: 10, ttl: 86400000 } }) // Max 10 uploads per day
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @Req() req: any,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadBankItemDto
    ) {
        return this.bankService.uploadItem(req.user.userId, file, dto);
    }

    @Get()
    async getItems(
        @Query('cursor') cursor?: string,
        @Query('take') take?: string,
        @Query('subject') subject?: string,
        @Query('professor') professor?: string,
        @Query('type') type?: string,
        @Query('period') period?: string,
        @Query('institutionId') institutionId?: string,
        @Query('courseId') courseId?: string,
        @Query('sort') sort?: 'recent' | 'rating' | 'comments'
    ) {
        return this.bankService.getItems(
            cursor,
            take ? parseInt(take, 10) : 20,
            { subject, professor, type, period, institutionId, courseId },
            sort
        );
    }

    @Get(':id')
    async getItemDetails(@Param('id') id: string) {
        return this.bankService.getItemById(id);
    }

    @Post(':id/comments')
    @Throttle({ default: { limit: 20, ttl: 86400000 } }) // Max 20 comments per day
    async addComment(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: CreateBankCommentDto
    ) {
        return this.bankService.addComment(req.user.userId, id, dto);
    }

    @Post(':id/rate')
    async rateItem(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: CreateBankRatingDto
    ) {
        return this.bankService.addRating(req.user.userId, id, dto);
    }
}
