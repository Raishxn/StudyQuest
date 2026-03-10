import { IsOptional, IsString, IsNumber, IsObject, MinLength, MaxLength, Min, Max, Matches } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(60)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username deve conter apenas letras, números e _' })
    username?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    institutionId?: string;

    @IsOptional()
    @IsString()
    courseId?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(14)
    semester?: number;

    @IsOptional()
    @IsString()
    shift?: string;

    @IsOptional()
    @IsString()
    unidade?: string;

    @IsOptional()
    @IsObject()
    preferences?: Record<string, any>;
}
