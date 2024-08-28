import { converBase64ToImage } from 'convert-base64-to-image';
import isBase64 from 'is-base64';
import path from 'path';
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateReadingInputDto,
  ImageIsNoteBase64InputDto,
  ReadingDto,
  ReadingExistsInputDto,
} from '@/dtos';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { Reading as PrismaReading } from '@prisma/client';

import { BaseRepository } from './base-repository';

@injectable()
export class PrismaReadingRepository extends BaseRepository {
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

  async create(input: CreateReadingInputDto): Promise<ReadingDto> {
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

    const reading = await this.client.reading.create({
      data: {
        customerCode,
        measureDatetime,
        measureValue,
        measureUUID: uuidv4(),
        measureType,
      },
      select: {
        id: true,
        customerCode: true,
        measureValue: true,
        measureDatetime: true,
        measureType: true,
        measureUUID: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return PrismaReadingRepository.mapToDto(reading);
  }

  static mapToDto(reading: PrismaReading): ReadingDto {
    return {
      measure_uuid: reading.measureUUID,
      measure_value: reading.measureValue,
    };
  }
}
