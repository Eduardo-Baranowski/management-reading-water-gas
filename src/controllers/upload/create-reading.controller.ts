import { Request, Response } from 'express';

import { injectable } from 'tsyringe';
import { z } from 'zod';

import { createReadingBodySchema } from '@/validations';

import { CreateReadingUseCase } from '@/use-cases/upload';

import { ReadingAlreadyExistsError } from '@/errors';

import { httpError } from '@/utils';

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
        case ReadingAlreadyExistsError:
          return response.status(409).json(httpError(error)).end();
        default:
          throw error;
      }
    }
  }
}
