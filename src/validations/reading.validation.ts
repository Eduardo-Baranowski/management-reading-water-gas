import { z } from 'zod';

import { Type } from '@/dtos';

export const createReadingBodySchema = z.object({
  measure_type: z.union([z.literal('water' satisfies Type), z.literal('gas' satisfies Type)]),
  image: z.string({ required_error: 'Informe a imagem' }),
  measure_datetime: z.date({ coerce: true }),
  customer_code: z.string({ required_error: 'Informe o customer code' }),
});

export const updateReadingBodySchema = z.object({
  confirmed_value: z.number(),
  measure_uuid: z.string(),
});
