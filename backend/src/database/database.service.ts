import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      errorFormat: 'minimal',
      connectionLimit: 20,
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');

      // Enable soft delete middleware if needed
      this.$use(async (params, next) => {
        if (params.action === 'delete') {
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }
        return next(params);
      });

    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }

  // Transaction helper methods
  async executeInTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      try {
        return await fn(tx);
      } catch (error) {
        this.logger.error('Transaction failed', error);
        throw error;
      }
    }, {
      maxWait: 5000, // max time to wait for transaction to start
      timeout: 10000, // max time for entire transaction
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  }

  // Error handler wrapper for database operations
  async executeWithErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(`Database error: ${error.code}`, error.message);
        throw error;
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error('Validation error:', error.message);
        throw error;
      }
      if (error instanceof Prisma.PrismaClientInitializationError) {
        this.logger.error('Database initialization error:', error.message);
        throw error;
      }
      this.logger.error('Unexpected database error:', error);
      throw error;
    }
  }

  // Connection management helpers
  async reconnect(): Promise<void> {
    try {
      await this.$disconnect();
      await this.$connect();
      this.logger.log('Successfully reconnected to database');
    } catch (error) {
      this.logger.error('Failed to reconnect to database', error);
      throw error;
    }
  }

  // Query statistics for monitoring (if needed)
  async getQueryStats(): Promise<{ [key: string]: number }> {
    const stats = await this.$metrics.json();
    return {
      queryCount: stats.counters['query_total'],
      errorCount: stats.counters['query_error_total'],
      duration: stats.gauges['query_duration_ms'],
    };
  }
}