import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Никнейм пользователя (уникальный)',
    example: 'johnDoe',
    minLength: 3,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty({ message: 'Никнейм не может быть пустым' })
  @MinLength(3, { message: 'Никнейм должен содержать не менее 3 символов' })
  @MaxLength(50, { message: 'Никнейм не может быть длиннее 50 символов' })
  nickname: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'password123',
    minLength: 6,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
  @MaxLength(100, { message: 'Пароль не может быть длиннее 100 символов' })
  password: string;
}