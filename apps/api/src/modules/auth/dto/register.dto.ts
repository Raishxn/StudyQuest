import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsNotEmpty({ message: 'Username é obrigatório' })
  @IsString()
  @MinLength(3, { message: 'Username deve ter no mínimo 3 caracteres' })
  @MaxLength(20, { message: 'Username deve ter no máximo 20 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username deve conter apenas letras, números e underline' })
  username: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/(?=.*[a-z])/, { message: 'Senha deve conter pelo menos uma letra minúscula' })
  @Matches(/(?=.*[A-Z])/, { message: 'Senha deve conter pelo menos uma letra maiúscula' })
  @Matches(/(?=.*\d)/, { message: 'Senha deve conter pelo menos um número' })
  password: string;
}
