import { IsString, IsOptional } from 'class-validator';

export class EndSessionDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
