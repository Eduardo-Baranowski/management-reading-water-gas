import crypto from 'node:crypto';

import { UploadFileInputDto, UploadMultipleFilesInputDto, UploadedFileDto } from '@/dtos';

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

interface BuildUploadCommandInput {
  key: string;
  file: UploadFileInputDto['file'];
}

export class AwsFileStorageService {
  private s3Client: S3Client;

  private bucketName: string = process.env.AWS_BUCKET_NAME;

  constructor() {
    this.s3Client = new S3Client({
      region: String(process.env.AWS_REGION),
      endpoint: process.env.NODE_ENV === 'development' ? process.env.AWS_ENDPOINT : undefined,
      forcePathStyle: process.env.NODE_ENV === 'development',
      credentials:
        process.env.NODE_ENV === 'development'
          ? {
              accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
              secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
            }
          : undefined,
    });
  }

  async upload(input: UploadFileInputDto): Promise<UploadedFileDto> {
    const key = this.generateKey(input);

    const command = this.buildUploadCommand({ key, file: input.file });

    await this.s3Client.send(command);

    return {
      key,
      url: AwsFileStorageService.generateUrl(key),
    };
  }

  async uploadMultiple(input: UploadMultipleFilesInputDto): Promise<UploadedFileDto[]> {
    const keys = input.files.map(file =>
      this.generateKey({
        file,
        folder: input.folder,
      }),
    );

    const commands = input.files.map((file, index) =>
      this.buildUploadCommand({ key: keys[index], file }),
    );

    await Promise.all(commands.map(command => this.s3Client.send(command)));

    return keys.map(key => ({
      key,
      url: AwsFileStorageService.generateUrl(key),
    }));
  }

  private generateKey(input: UploadFileInputDto): string {
    const fileName = this.generateRandomFileName();
    const folder = input.folder ? `${input.folder}/` : '';
    const key = `${folder}${fileName}.${input.file.extension}`;

    return key;
  }

  private generateRandomFileName(): string {
    const bytes = 16;

    const randomName = crypto.randomBytes(bytes).toString('hex');

    return randomName;
  }

  private buildUploadCommand(input: BuildUploadCommandInput): PutObjectCommand {
    return new PutObjectCommand({
      Bucket: this.bucketName,
      Key: input.key,
      Body: input.file.buffer,
      ContentType: input.file.mimetype,
      CacheControl: 'max-age=31536000',
    });
  }

  async delete(key: string): Promise<void> {
    await this.s3Client.send(this.buildDeleteCommand(key));
  }

  private buildDeleteCommand(key: string): DeleteObjectCommand {
    return new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
  }

  static generateUrl(key: string): string {
    if (process.env.AWS_BUCKET_CDN_URL) {
      return `${process.env.AWS_BUCKET_CDN_URL}/${key}`;
    }

    return `${process.env.AWS_BUCKET_URL!}/${key}`;
  }
}
