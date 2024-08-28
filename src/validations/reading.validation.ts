import { z } from 'zod';

import { Type } from '@/dtos';

export const createReadingBodySchema = z.object({
  measureType: z.union([z.literal('water' satisfies Type), z.literal('gas' satisfies Type)]),
  image: z.string({ required_error: 'Informe a imagem' }),
  measureDatetime: z.date({ coerce: true }),
  customerCode: z.string({ required_error: 'Informe o customer code' }),
});

export const updateReadingBodySchema = z.object({
  confirmed_value: z.number(),
  measure_uuid: z.string(),
});
