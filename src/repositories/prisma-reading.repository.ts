import isBase64 from 'is-base64';
import { injectable } from 'tsyringe';

import {
  CreateReadingInputDto,
  ImageIsNoteBase64InputDto,
  ReadingDto,
  ReadingExistsInputDto,
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

  async create(input: CreateReadingInputDto): Promise<ReadingDto> {
    const { customerCode, measureDatetime, measureType } = input;

    const reading = await this.client.reading.create({
      data: {
        customerCode,
        measureDatetime,
        measureType,
      },
      select: {
        id: true,
        customerCode: true,
        measureDatetime: true,
        measureType: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return PrismaReadingRepository.mapToDto(reading);
  }

  static mapToDto(reading: PrismaReading): ReadingDto {
    return {
      id: reading.id,
      customerCode: reading.customerCode,
      measureDatetime: reading.measureDatetime,
      measureType: reading.measureType,
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt,
    };
  }
}
