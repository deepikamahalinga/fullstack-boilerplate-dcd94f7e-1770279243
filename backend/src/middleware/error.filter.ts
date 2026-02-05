// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

// Error response interface
interface IErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errorName?: string;
  errors?: any[];
  stack?: string;
}

// Custom error types
export class ValidationException extends HttpException {
  constructor(public validationErrors: any[]) {
    super('Validation failed', HttpStatus.BAD_REQUEST);
  }
}

export class BusinessLogicException extends HttpException {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Prepare error response
    const errorResponse: IErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Internal server error',
    };

    // Handle different types of errors
    if (exception instanceof HttpException) {
      errorResponse.statusCode = exception.getStatus();
      errorResponse.message = exception.message;
      errorResponse.errorName = exception.name;
    }

    // Handle validation errors
    if (exception instanceof ValidationException) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.message = 'Validation failed';
      errorResponse.errors = exception.validationErrors;
    }

    // Handle business logic errors
    if (exception instanceof BusinessLogicException) {
      errorResponse.statusCode = exception.getStatus();
      errorResponse.message = exception.message;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = exception instanceof Error ? exception.stack : undefined;
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
      'AllExceptionsFilter',
    );

    // Send response
    httpAdapter.reply(response, errorResponse, errorResponse.statusCode);
  }
}

// src/common/interceptors/error-interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }
        
        // Convert unknown errors to HttpException
        return throwError(
          () =>
            new HttpException(
              'Internal server error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}

// Usage in main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ErrorInterceptor } from './common/interceptors/error-interceptor';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply global error handling
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new ErrorInterceptor());

  await app.listen(3000);
}
bootstrap();