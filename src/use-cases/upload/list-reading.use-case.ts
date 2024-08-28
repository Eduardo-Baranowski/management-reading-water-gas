import { injectable } from 'tsyringe';

import { PrismaReadingRepository } from '@/repositories';

import { FindAllReadingsInputDto, FindAllReadingsOutputWitchCustomerDto } from '@/dtos';

import { ReadingsFoundError, TypeNotWaterOrGasError } from '@/errors';

@injectable()
export class ListReadingsUseCase {
  constructor(private readonly readingRepository: PrismaReadingRepository) {}

  async execute(input: FindAllReadingsInputDto): Promise<FindAllReadingsOutputWitchCustomerDto> {
    if (input.measure_type !== 'water' && input.measure_type !== 'gas') {
      throw new TypeNotWaterOrGasError();
    }

    const readingNotExists = await this.readingRepository.findByCustomerCod(
      input.customer_code,
      input.measure_type,
    );
    if (readingNotExists === undefined) {
      throw new ReadingsFoundError();
    }

    const [readings] = await Promise.all([
      this.readingRepository.findAll({
        ...input,
      }),
    ]);

    return {
      custormer_code: input.customer_code,
      measures: readings,
    };
  }
}
