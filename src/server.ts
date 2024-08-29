import 'dotenv/config';
import 'reflect-metadata';
import './config/module-alias';

import { execSync } from 'node:child_process';

import { logger } from './config/logger';
import { prisma } from './database';

const main = async (): Promise<void> => {
  try {
    execSync('npx prisma migrate deploy');
    await prisma.$connect();
    const app = (await import('./app')).default;

    const server = app.listen(+process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT} :)`);
    });

    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, async (): Promise<void> => {
        await prisma.$disconnect();
        server.close();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

main().catch(error => logger.error(error));
