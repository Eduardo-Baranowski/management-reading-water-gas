import { Router } from 'express';

import readingRouter from './reading.routes';

const router = Router();
router.use(readingRouter);
export default router;
