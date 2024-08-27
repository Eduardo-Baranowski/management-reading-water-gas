import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';

import cors from 'cors';
import helmet from 'helmet';

import { logger } from './config/logger';
import routes from './routes';

const app = express();
app.use(express.json());
app.use(helmet());

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
  }),
);
app.use('/api/v1', routes);

app.use((error: Error, request: Request, response: Response, _next: NextFunction) => {
  logger.error(error);

  return response.status(500).json({
    message: 'Internal Server Error',
  });
});

export default app;
