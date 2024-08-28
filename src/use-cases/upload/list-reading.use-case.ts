import { injectable } from 'tsyringe';

import { PrismaReadingRepository } from '@/repositories';

import { FindAllReadingsInputDto, FindAllReadingsOutputWitchCustomerDto } from '@/dtos';

@injectable()
export class ListReadingsUseCase {
  constructor(private readonly readingRepository: PrismaReadingRepository) {}

  async execute(input: FindAllReadingsInputDto): Promise<FindAllReadingsOutputWitchCustomerDto> {
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
