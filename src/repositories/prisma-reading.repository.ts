import { converBase64ToImage } from 'convert-base64-to-image';
import fs from 'fs';
import isBase64 from 'is-base64';
import path from 'path';
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import { AwsClientService, GeminiClientService } from '@/services';

import {
  CreateReadingInputDto,
  FindAllReadingsInputDto,
  FindAllReadingsOutPutDto,
  ImageIsNoteBase64InputDto,
  ReadingExistsInputDto,
  ReadingOutputDto,
} from '@/dtos';

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

  async findById(id: number): Promise<ReadingOutputDto | undefined> {
    const reading = await this.client.reading.findUnique({
      where: {
        id,
      },
    });

    if (!reading) return undefined;

    return PrismaReadingRepository.mapToDto(reading);
  }

  async findByUUID(id: string): Promise<ReadingOutputDto | undefined> {
    const reading = await this.client.reading.findUnique({
      where: {
        measureUUID: id,
      },
    });

    if (!reading) return undefined;

    return PrismaReadingRepository.mapToDto(reading);
  }

  async findByCustomerCod(id: string, measureType: string): Promise<true | undefined> {
    const reading = await this.client.reading.findMany({
      where: {
        customerCode: id,
        measureType: measureType === 'gas' ? 'gas' : 'water',
      },
    });

    if (reading.length === 0) return undefined;

    return true;
  }

  async findByConfirmed(id: string): Promise<ReadingOutputDto | undefined> {
    const reading = await this.client.reading.findUnique({
      where: {
        measureUUID: id,
        hasConfirmed: true,
      },
    });

    if (!reading) return undefined;

    return PrismaReadingRepository.mapToDto(reading);
  }

  async create(input: CreateReadingInputDto): Promise<ReadingOutputDto> {
    const {
      customer_code: customerCode,
      measure_datetime: measureDatetime,
      measure_type: measureType,
      image,
    } = input;

    const pathToSaveImage = './tmp/image.png';
    converBase64ToImage(image, pathToSaveImage);

    const uploadResponse = await GeminiClientService.uploadResponse('../tmp/image.png');

    const result = await GeminiClientService.model(
      uploadResponse.file.mimeType,
      uploadResponse.file.uri,
    );

    const measureValue = Number(result.response.text());

    const content = fs.readFileSync(path.resolve(__dirname, '../tmp/image.png'));

    const inputFile = AwsClientService.inputFile(content);

    const key = AwsClientService.generateKey(inputFile);

    const command = AwsClientService.buildUploadCommand({ key, file: inputFile.file });

    await AwsClientService.s3Client.send(command);

    const reading = await this.client.reading.create({
      data: {
        customerCode,
        measureDatetime,
        measureValue,
        imageUrl: AwsClientService.generateUrl(key),
        measureUUID: uuidv4(),
        measureType,
      },
      select: {
        id: true,
        customerCode: true,
        measureValue: true,
        measureDatetime: true,
        imageUrl: true,
        hasConfirmed: true,
        measureType: true,
        measureUUID: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return PrismaReadingRepository.mapToDto(reading);
  }

  async update(input: ReadingOutputDto): Promise<ReadingOutputDto> {
    const reading = await this.client.reading.update({
      where: {
        measureUUID: input.measure_uuid,
        hasConfirmed: false,
      },
      data: {
        measureValue: input.measure_value,
        hasConfirmed: true,
      },
    });

    return PrismaReadingRepository.mapToDto(reading);
  }

  async findAll(input: FindAllReadingsInputDto): Promise<FindAllReadingsOutPutDto[]> {
    const readings = await this.client.reading.findMany({
      select: {
        measureUUID: true,
        measureDatetime: true,
        measureType: true,
        hasConfirmed: true,
        imageUrl: true,
        customerCode: true,
        measureValue: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        customerCode: input.customer_code,
        measureType: input.measure_type === 'gas' ? 'gas' : 'water',
      },
    });

    return readings.map(PrismaReadingRepository.mapToListDto);
  }

  static mapToDto(reading: PrismaReading): ReadingOutputDto {
    return {
      image_url: reading.imageUrl ?? undefined,
      measure_value: reading.measureValue,
      measure_uuid: reading.measureUUID,
    };
  }

  static mapToListDto(reading: PrismaReading): FindAllReadingsOutPutDto {
    return {
      measure_uuid: reading.measureUUID,
      measure_datetime: reading.measureDatetime,
      measure_type: reading.measureType,
      has_confirmed: reading.hasConfirmed,
      image_url: reading.imageUrl ?? undefined,
    };
  }
}
