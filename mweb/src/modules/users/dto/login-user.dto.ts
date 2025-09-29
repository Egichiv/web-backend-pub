import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Никнейм пользователя',
    example: 'johnDoe'
  })
  @IsString()
  @IsNotEmpty({ message: 'Никнейм не может быть пустым' })
  nickname: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  password: string;
}