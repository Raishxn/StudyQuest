import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(/(?=.*[a-z])/, { message: 'A senha deve conter pelo menos uma letra minúscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'A senha deve conter pelo menos uma letra maiúscula' })
  @Matches(/(?=.*\d)/, { message: 'A senha deve conter pelo menos um número' })
  newPassword: string;
}
