import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'E-mail ou username é obrigatório' })
  @IsString()
  @MinLength(3, { message: 'E-mail ou username deve ter ao menos 3 caracteres' })
  emailOrUsername: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  password: string;
}
