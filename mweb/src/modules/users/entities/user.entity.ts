import { User as PrismaUser } from '@prisma/client';

export class User implements PrismaUser {
  id: number;
  nickname: string;
  password: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  toPublicProfile() {
    const { password, ...publicProfile } = this;
    return publicProfile;
  }

  isValidNickname(): boolean {
    return this.nickname.length >= 3 && this.nickname.length <= 50;
  }

  hasValidPassword(): boolean {
    return this.password.length > 0;
  }
}