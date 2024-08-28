import { Router } from 'express';

import { container } from 'tsyringe';

import { CreateReadingController } from '@/controllers';
import { ListReadingsController } from '@/controllers/upload/list-reading.controller';
import { UpdateReadingController } from '@/controllers/upload/update-reading.controller';

import { createReadingBodySchema, updateReadingBodySchema } from '@/validations';

import { validateRequest } from '@/middleware';

const router = Router();

const createReadingController = container.resolve(CreateReadingController);
const updateReadingController = container.resolve(UpdateReadingController);
const listReadingController = container.resolve(ListReadingsController);

router.post(
  '/upload',
  validateRequest({
    body: createReadingBodySchema,
  }),
  createReadingController.handle.bind(createReadingController),
);

router.patch(
  '/confirm',
  validateRequest({
    body: updateReadingBodySchema,
  }),
  updateReadingController.handle.bind(updateReadingController),
);

router.get(
  '/:customerCode/list/:measureType',
  listReadingController.handle.bind(listReadingController),
);

export default router;
