import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.s3 = new S3Client({
      endpoint: (process.env.S3_ENDPOINT ?? 'https://storage.yandexcloud.net').replace(/\/+$/, ''),
      region: process.env.S3_REGION ?? 'ru-central1',
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });

    this.bucket = process.env.S3_BUCKET!;
  }

  /**
   * Загрузить файл в S3
   * @param buffer - буфер файла
   * @param key - путь/имя файла в бакете (например, 'memes/uuid.jpg')
   * @param mime - MIME тип (например, 'image/jpeg')
   * @returns ключ файла
   */
  async upload(buffer: Buffer, key: string, mime: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
      }),
    );
    return key;
  }

  /**
   * Удалить файл из S3
   * @param key - ключ файла для удаления
   */
  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  /**
   * Получить публичный URL файла
   * @param key - ключ файла
   * @returns публичный URL или null
   */
  publicUrl(key: string): string | null {
    const base = process.env.S3_PUBLIC_URL;
    return base ? `${base}/${key}` : null;
  }
}