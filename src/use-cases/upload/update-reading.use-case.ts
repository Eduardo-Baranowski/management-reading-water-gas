import { injectable } from 'tsyringe';

import { PrismaReadingRepository } from '@/repositories';

import { UpdateReadingInputDto, ReadingOutputDto } from '@/dtos';

import { ReadingConfirmedError, ReadingFoundError } from '@/errors';

@injectable()
export class UpdateReadingUseCase {
  constructor(private readonly readingRepository: PrismaReadingRepository) {}

  async execute(input: UpdateReadingInputDto): Promise<ReadingOutputDto> {
    const reading = await this.readingRepository.findByUUID(input.measure_uuid);
    if (!reading) {
      throw new ReadingFoundError();
    }

    const readingConfirmed = await this.readingRepository.findByConfirmed(input.measure_uuid);
    if (readingConfirmed) {
      throw new ReadingConfirmedError();
    }

    const updatedReading = await this.readingRepository.update({
      measure_uuid: reading.measure_uuid,
      measure_value: input.confirmed_value,
    });

    return updatedReading;
  }
}
