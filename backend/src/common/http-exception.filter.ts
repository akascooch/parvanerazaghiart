import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

const GENERIC_VALIDATION = 'Please check the form and try again.';
const GENERIC_SERVER = 'Something went wrong. Please try again later.';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const raw =
        typeof body === 'string'
          ? body
          : body && typeof body === 'object'
            ? (body as { message?: unknown }).message
            : undefined;

      const message = Array.isArray(raw)
        ? GENERIC_VALIDATION
        : typeof raw === 'string' && raw.trim()
          ? raw
          : GENERIC_VALIDATION;

      return response.status(status).json({
        statusCode: status,
        message,
      });
    }

    this.logger.error(
      `Unhandled error on ${request.method} ${request.url}: ${
        exception instanceof Error ? exception.name : 'unknown'
      }`,
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: GENERIC_SERVER,
    });
  }
}
