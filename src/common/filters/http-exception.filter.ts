import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-error-response.interface';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiErrorResponse;

    console.error('Exception caught by filter:', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as
        | { message: string | string[]; error?: string }
        | string;

      errorResponse = {
        status,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse.message || 'An error occurred',
        error:
          typeof exceptionResponse === 'string'
            ? 'Error'
            : (exceptionResponse.error ?? 'Unknown Error'),
      };
    } else if (exception instanceof QueryFailedError) {
      // Handle TypeORM query errors
      status = HttpStatus.BAD_REQUEST;
      errorResponse = {
        status,
        message: (exception as Error).message,
        error: 'QueryFailedError',
      };
    } else {
      // Fallback for unknown errors
      errorResponse = {
        status,
        message: 'Internal server error',
        error: (exception as Error)?.name || 'UnknownError',
      };
    }

    response.status(status).json(errorResponse);
  }
}
