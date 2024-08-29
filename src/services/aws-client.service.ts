import crypto from 'node:crypto';

import { UploadFileInputDto } from '@/dtos';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

interface BuildUploadCommandInput {
  key: string;
  file: UploadFileInputDto['file'];
}

export const AwsClientService = {
  generateRandomFileName(): string {
    const bytes = 16;

    const randomName = crypto.randomBytes(bytes).toString('hex');

    return randomName;
  },

  generateKey(input: UploadFileInputDto): string {
    const fileName = this.generateRandomFileName();
    const folder = input.folder ? `${input.folder}/` : '';
    const key = `${folder}${fileName}.${input.file.extension}`;

    return key;
  },

  buildUploadCommand(input: BuildUploadCommandInput): PutObjectCommand {
    return new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: input.key,
      Body: input.file.buffer,
      ContentType: input.file.mimetype,
      CacheControl: 'max-age=31536000',
    });
  },

  s3Client: new S3Client({
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
  }),

  generateUrl(key: string): string {
    if (process.env.AWS_BUCKET_CDN_URL) {
      return `${process.env.AWS_BUCKET_CDN_URL}/${key}`;
    }

    return `${process.env.AWS_BUCKET_URL!}/${key}`;
  },

  inputFile(content: Buffer): UploadFileInputDto {
    const inputFile: UploadFileInputDto = {
      file: {
        buffer: content,
        extension: 'webp',
        mimetype: 'image/webp',
      },
      folder: 'images',
    };
    return inputFile;
  },
};
