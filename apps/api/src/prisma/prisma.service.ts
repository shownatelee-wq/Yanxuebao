import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  isAvailable = false;

  async onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl || databaseUrl.includes('username:password@hostname')) {
      return;
    }

    await this.$connect();
    this.isAvailable = true;
  }
}
