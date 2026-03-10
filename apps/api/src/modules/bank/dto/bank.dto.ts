import { IsString, IsNotEmpty, Length, IsOptional, Max, Min, IsInt, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadBankItemDto {
    @IsString()
    @IsNotEmpty()
    @Length(10, 150)
    title: string;

    @IsString()
    @IsNotEmpty()
    type: string; // EXAM | EXERCISE | ANSWER

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsOptional()
    institutionId?: string;

    @IsString()
    @IsOptional()
    courseId?: string;

    @IsString()
    @IsOptional()
    @Length(2, 100)
    professor?: string;

    @IsString()
    @IsOptional()
    @Matches(/^[0-9]{4}\.[1-2]$/, { message: 'Period must be in format YYYY.S (e.g. 2024.1)' })
    period?: string;

    @IsString()
    @IsOptional()
    @Length(0, 500)
    description?: string;
}

export class CreateBankCommentDto {
    @IsString()
    @IsNotEmpty()
    @Length(5, 2000)
    body: string;

    @IsString()
    @IsOptional()
    fileUrl?: string; // Optional R2 URL if they attach something to the comment
}

export class CreateBankRatingDto {
    @IsInt()
    @Min(1)
    @Max(5)
    @Transform(({ value }) => parseInt(value, 10))
    score: number;
}
