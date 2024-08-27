import { Router } from 'express';

import { container } from 'tsyringe';

import { CreateReadingController } from '@/controllers';

import { createReadingBodySchema } from '@/validations';

import { validateRequest } from '@/middleware';

const router = Router();

const createReadingController = container.resolve(CreateReadingController);

router.post(
  '/upload',
  validateRequest({
    body: createReadingBodySchema,
  }),
  createReadingController.handle.bind(createReadingController),
);

export default router;
