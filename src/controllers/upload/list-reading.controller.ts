import { Request, Response } from 'express';

import { injectable } from 'tsyringe';

import { ListReadingsUseCase } from '@/use-cases/upload';

@injectable()
export class ListReadingsController {
  constructor(private readonly listReading: ListReadingsUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const input = {
      customer_code: request.params.customerCode,
      measure_type: request.params.measureType,
    };
    const readings = await this.listReading.execute(input);

    return response.json(readings).end();
  }
}
