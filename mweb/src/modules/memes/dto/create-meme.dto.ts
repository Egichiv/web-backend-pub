import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateMemeDto {
  @ApiProperty({
    description: 'Ссылка на мем',
    example: 'https://i.imgur.com/example1.jpg'
  })
  @IsString()
  @IsNotEmpty({ message: 'Ссылка на мем не может быть пустой' })
  @IsUrl({}, { message: 'Некорректный формат URL' })
  link: string;

  @ApiProperty({
    description: 'Nickname загрузившего мем пользователя',
    example: 'mememaster',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nickname должен быть не менее 2 символов' })
  @MaxLength(50, { message: 'Nickname не может быть длиннее 50 символов' })
  uploader?: string;
}