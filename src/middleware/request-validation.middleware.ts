import { RequestHandler } from 'express';

import { z, ZodTypeAny } from 'zod';

type RequestSchemaKey = 'body' | 'query' | 'params';

export type RequestSchema = {
  [key in RequestSchemaKey]?: ZodTypeAny;
};

export type ValidateRequestInput = RequestSchema;

export const validateRequest =
  (input: ValidateRequestInput): RequestHandler =>
  async (request, response, next) => {
    try {
      const schema = z.object(input);

      const { body, params, query } = await schema.parseAsync({
        body: request.body as Record<string, unknown>,
        query: request.query,
        params: request.params,
      });

      if (body) Object.assign(request, { body });
      if (params) Object.assign(request, { params });
      if (query) Object.assign(request, { query });

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorResponse = {
          error_code: 'INVALID_DATA',
          error_description: error.errors[0].message,
        };
        return response.status(400).json(errorResponse);
      }

      throw error;
    }
  };
