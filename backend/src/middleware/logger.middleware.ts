// request-logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  id: string;
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  
  use(req: RequestWithId, res: Response, next: NextFunction) {
    // Add request ID
    req.id = uuidv4();
    
    // Get timestamp when request starts
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    // Log the incoming request
    this.logRequest(req);

    // Override res.end to log the response
    const originalEnd = res.end;
    res.end = (...args: any[]) => {
      const responseTime = Date.now() - startTime;
      
      this.logResponse(req, res, responseTime);
      originalEnd.apply(res, args);
    };

    next();
  }

  private logRequest(req: RequestWithId): void {
    const message = `Incoming ${req.method} ${req.originalUrl}`;
    
    const meta = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(message, meta);
    } else {
      this.logger.log(message, meta);
    }
  }

  private logResponse(req: RequestWithId, res: Response, responseTime: number): void {
    const { statusCode } = res;
    const message = `${req.method} ${req.originalUrl} ${statusCode} ${responseTime}ms`;

    const meta = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= 400) {
      this.logger.error(message, meta);
    } else if (process.env.NODE_ENV === 'development') {
      this.logger.debug(message, meta);
    } else {
      this.logger.log(message, meta);
    }
  }
}

// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RequestLoggingMiddleware } from './request-logging.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes('*');
  }
}

// logging.config.ts
export const loggingConfig = {
  development: {
    level: 'debug',
    prettyPrint: true,
  },
  production: {
    level: 'info',
    prettyPrint: false,
  },
  test: {
    level: 'warn',
    prettyPrint: false,
  },
};

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Configure global logging
  const logger = new Logger();
  
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  await app.listen(3000);
}
bootstrap();