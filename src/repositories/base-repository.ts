import { prisma } from '@/database';

import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository {
  protected client: PrismaClient;

  constructor(client?: PrismaClient) {
    this.client = client || prisma;
  }
}
