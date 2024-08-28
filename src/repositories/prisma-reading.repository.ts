import { converBase64ToImage } from 'convert-base64-to-image';
import fs from 'fs';
import isBase64 from 'is-base64';
import crypto from 'node:crypto';
import path from 'path';
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import { AwsFileStorageService } from '@/services';

import {
  CreateReadingInputDto,
  ImageIsNoteBase64InputDto,
  ReadingExistsInputDto,
  ReadingOutputDto,
  UploadFileInputDto,
} from '@/dtos';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { Reading as PrismaReading } from '@prisma/client';

import { BaseRepository } from './base-repository';

interface BuildUploadCommandInput {
  key: string;
  file: UploadFileInputDto['file'];
}

@injectable()
export class PrismaReadingRepository extends BaseRepository {
  s3Client = new S3Client({
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

  async exists(input: ReadingExistsInputDto): Promise<boolean> {
    const { measureDatetime } = input;

    const reading = await this.client.reading.findUnique({
      where: {
        measureDatetime,
      },
      select: {
        measureDatetime: true,
      },
    });

    return !!reading;
  }

  async isBase64Image(input: ImageIsNoteBase64InputDto): Promise<boolean> {
    if (isBase64(input.image, { allowMime: true }) === true) {
      return true;
    }

    return false;
  }

  async findById(id: number): Promise<ReadingOutputDto | undefined> {
    const reading = await this.client.reading.findUnique({
      where: {
        id,
      },
    });

    if (!reading) return undefined;

    return PrismaReadingRepository.mapToDto(reading);
  }

  private generateRandomFileName(): string {
    const bytes = 16;

    const randomName = crypto.randomBytes(bytes).toString('hex');

    return randomName;
  }

  private generateKey(input: UploadFileInputDto): string {
    const fileName = this.generateRandomFileName();
    const folder = input.folder ? `${input.folder}/` : '';
    const key = `${folder}${fileName}.${input.file.extension}`;

    return key;
  }

  private buildUploadCommand(input: BuildUploadCommandInput): PutObjectCommand {
    return new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: input.key,
      Body: input.file.buffer,
      ContentType: input.file.mimetype,
      CacheControl: 'max-age=31536000',
    });
  }

  async create(input: CreateReadingInputDto): Promise<ReadingOutputDto> {
    const { customerCode, measureDatetime, measureType, image } = input;

    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const pathToSaveImage = './tmp/image.png';
    converBase64ToImage(image, pathToSaveImage);

    const uploadResponse = await fileManager.uploadFile(
      path.resolve(__dirname, '../tmp/image.png'),
      {
        mimeType: 'image/jpeg',
        displayName: 'Jetpack drawing',
      },
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: 'Descreva o valor contido na imagem apenas com o número.' },
    ]);

    const measureValue = Number(result.response.text());

    const content = fs.readFileSync(path.resolve(__dirname, '../tmp/image.png'));

    const inputFile: UploadFileInputDto = {
      file: {
        buffer: content,
        extension: 'webp',
        mimetype: 'image/webp',
      },
      folder: 'images',
    };

    const key = this.generateKey(inputFile);

    const command = this.buildUploadCommand({ key, file: inputFile.file });

    await this.s3Client.send(command);

    const reading = await this.client.reading.create({
      data: {
        customerCode,
        measureDatetime,
        measureValue,
        imageUrl: AwsFileStorageService.generateUrl(key),
        measureUUID: uuidv4(),
        measureType,
      },
      select: {
        id: true,
        customerCode: true,
        measureValue: true,
        measureDatetime: true,
        imageUrl: true,
        measureType: true,
        measureUUID: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return PrismaReadingRepository.mapToDto(reading);
  }

  static mapToDto(reading: PrismaReading): ReadingOutputDto {
    return {
      image_url: reading.imageUrl ?? undefined,
      measure_uuid: reading.measureUUID,
      measure_value: reading.measureValue,
    };
  }
}
