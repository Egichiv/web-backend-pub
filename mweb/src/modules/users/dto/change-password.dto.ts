import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Текущий пароль',
    example: 'oldPassword123'
  })
  @IsString()
  @IsNotEmpty({ message: 'Текущий пароль не может быть пустым' })
  currentPassword: string;

  @ApiProperty({
    description: 'Новый пароль',
    example: 'newPassword456',
    minLength: 6,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty({ message: 'Новый пароль не может быть пустым' })
  @MinLength(6, { message: 'Новый пароль должен содержать не менее 6 символов' })
  @MaxLength(100, { message: 'Новый пароль не может быть длиннее 100 символов' })
  newPassword: string;
}