import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Никнейм пользователя', example: 'johnDoe' })
  nickname: string;

  @ApiProperty({ description: 'Является ли nickname валидным', example: true })
  isValidNickname: boolean;

  constructor(user: any) {
    this.id = user.id;
    this.nickname = user.nickname;

    // Валидация nickname
    this.isValidNickname = user.nickname &&
      user.nickname.length >= 3 &&
      user.nickname.length <= 50;
  }
}
