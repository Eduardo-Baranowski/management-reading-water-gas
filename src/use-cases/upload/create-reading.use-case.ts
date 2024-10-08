import { injectable } from 'tsyringe';

import { PrismaReadingRepository } from '@/repositories';

import { CreateReadingInputDto, ReadingOutputDto } from '@/dtos';

import { ImageIsNotBase64Error, ReadingAlreadyExistsError } from '@/errors';

@injectable()
export class CreateReadingUseCase {
  constructor(private readonly readingRepository: PrismaReadingRepository) {}

  async execute(input: CreateReadingInputDto): Promise<ReadingOutputDto> {
    const readingExists = await this.readingRepository.exists({
      measureDatetime: input.measure_datetime,
    });
    if (readingExists) {
      throw new ReadingAlreadyExistsError();
    }

    const imageIsBase64 = await this.readingRepository.isBase64Image({ image: input.image });

    if (imageIsBase64 === false) {
      throw new ImageIsNotBase64Error();
    }

    const reading = await this.readingRepository.create(input);

    return reading;
  }
}
