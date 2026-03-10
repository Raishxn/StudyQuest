import { IsString, IsNotEmpty, Length, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @Length(10, 200)
    title: string;

    @IsString()
    @IsNotEmpty()
    @Length(30, 10000)
    body: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    fileUrl?: string;
}

export class UpdatePostDto {
    @IsString()
    @IsOptional()
    @Length(10, 200)
    title?: string;

    @IsString()
    @IsOptional()
    @Length(30, 10000)
    body?: string;

    @IsString()
    @IsOptional()
    subject?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    fileUrl?: string;

    @IsBoolean()
    @IsOptional()
    solved?: boolean;
}

export class CreateReplyDto {
    @IsString()
    @IsNotEmpty()
    @Length(20, 5000)
    body: string;

    @IsString()
    @IsOptional()
    fileUrl?: string;
}

export class UpdateReplyDto {
    @IsString()
    @IsOptional()
    @Length(20, 5000)
    body?: string;

    @IsString()
    @IsOptional()
    fileUrl?: string;
}
