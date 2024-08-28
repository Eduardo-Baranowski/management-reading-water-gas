import { Request, Response } from 'express';

import { injectable } from 'tsyringe';

import { ListReadingsUseCase } from '@/use-cases/upload';

import { ReadingsFoundError, TypeNotWaterOrGasError } from '@/errors';

@injectable()
export class ListReadingsController {
  constructor(private readonly listReading: ListReadingsUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const input = {
      customer_code: request.params.customerCode,
      measure_type: request.params.measureType,
    };
    try {
      const readings = await this.listReading.execute(input);

      return response.json(readings).end();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      switch (error.constructor) {
        case ReadingsFoundError:
          return response
            .status(404)
            .json({
              error_code: 'MEASURES_NOT_FOUND',
              error_description: 'Nenhuma leitura encontrada',
            })
            .end();
        case TypeNotWaterOrGasError:
          return response
            .status(400)
            .json({
              error_code: 'INVALID_TYPE',
              error_description: 'Tipo de medição não permitida',
            })
            .end();
        default:
          throw error;
      }
    }
  }
}
