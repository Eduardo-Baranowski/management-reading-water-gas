import { Request, Response } from 'express';

import { injectable } from 'tsyringe';
import { z } from 'zod';

import { createReadingBodySchema } from '@/validations';

import { CreateReadingUseCase } from '@/use-cases/upload';

import { ImageIsNotBase64Error, ReadingAlreadyExistsError } from '@/errors';

type Body = z.infer<typeof createReadingBodySchema>;

@injectable()
export class CreateReadingController {
  constructor(private readonly createReading: CreateReadingUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const reading = await this.createReading.execute(request.body as Body);

      return response.status(201).json(reading).end();
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      switch (error.constructor) {
        case ImageIsNotBase64Error:
          return response
            .status(404)
            .json({
              error_code: 'INVALID_DATA',
              error_description: error.message,
            })
            .end();

        case ReadingAlreadyExistsError:
          return response
            .status(409)
            .json({
              error_code: 'DOUBLE_REPORT',
              error_description: 'Leitura do mês já realizada',
            })
            .end();
        default:
          throw error;
      }
    }
  }
}
