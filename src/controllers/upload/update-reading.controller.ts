import { Request, Response } from 'express';

import { injectable } from 'tsyringe';
import { z } from 'zod';

import { updateReadingBodySchema } from '@/validations';

import { UpdateReadingUseCase } from '@/use-cases/upload/update-reading.use-case';

import { ReadingConfirmedError, ReadingFoundError } from '@/errors';

type Body = z.infer<typeof updateReadingBodySchema>;

@injectable()
export class UpdateReadingController {
  constructor(private readonly updateReading: UpdateReadingUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      await this.updateReading.execute({
        ...(request.body as Body),
      });

      return response.status(200).json({
        succes: true,
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      switch (error.constructor) {
        case ReadingFoundError:
          return response
            .status(404)
            .json({
              error_code: 'MEASURE_NOT_FOUND',
              error_description: 'Leitura do mês já realizada',
            })
            .end();
        case ReadingConfirmedError:
          return response
            .status(409)
            .json({
              error_code: 'CONFIRMATION_DUPLICATE',
              error_description: 'Leitura do mês já realizada',
            })
            .end();
        default:
          throw error;
      }
    }
  }
}
