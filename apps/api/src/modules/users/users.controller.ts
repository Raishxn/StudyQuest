import {
    Controller,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Res,
    Post,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadValidationPipe } from '../../common/pipes/upload-validation.pipe';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('check-username')
    async checkUsername(@Query('u') username: string) {
        return this.usersService.checkUsername(username);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@CurrentUser() user: any) {
        return this.usersService.getFullProfile(user.id);
    }

    @Post('me/avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@CurrentUser() user: any, @UploadedFile(UploadValidationPipe) file: Express.Multer.File) {
        return this.usersService.uploadAvatar(user.id, file);
    }

    @Post('me/banner')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadBanner(@CurrentUser() user: any, @UploadedFile(UploadValidationPipe) file: Express.Multer.File) {
        return this.usersService.uploadBanner(user.id, file);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    async updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateProfile(user.id, dto);
    }

    @Patch('me/password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
        return this.usersService.changePassword(user.id, dto);
    }

    @Get('me/data-export')
    @UseGuards(JwtAuthGuard)
    async exportData(@CurrentUser() user: any, @Res() res: Response) {
        const data = await this.usersService.exportUserData(user.id);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="studyquest_data_${user.id}.json"`);
        return res.json(data);
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteMe(@CurrentUser() user: any) {
        return this.usersService.deleteAccount(user.id);
    }

    @Get(':username')
    @UseGuards(JwtAuthGuard)
    async getPublicProfile(@Param('username') username: string) {
        return this.usersService.getPublicProfile(username);
    }
}
