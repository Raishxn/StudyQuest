import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum Shift {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  FULL = 'FULL',
}

export class AcademicProfileDto {
  @IsOptional()
  @IsString()
  institutionId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(14)
  semester?: number;

  @IsOptional()
  @IsEnum(Shift)
  shift?: string;
}
