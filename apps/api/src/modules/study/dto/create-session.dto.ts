import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  subject: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsEnum(['POMODORO', 'FREE'])
  mode: 'POMODORO' | 'FREE';

  @IsInt()
  @Min(5)
  @Max(90)
  @IsOptional()
  cycleMinutes?: number = 25;

  @IsInt()
  @IsOptional()
  breakMinutes?: number = 5;

  @IsString()
  @IsOptional()
  notes?: string;
}
