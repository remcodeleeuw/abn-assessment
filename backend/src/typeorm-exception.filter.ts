import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const driverError = (exception.driverError || {}) as any;
    const code = driverError.code || (exception as any).code;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    const isUniqueViolation =
      code === '23505' ||
      code === '1062' ||
      code === 'ER_DUP_ENTRY' ||
      code === 'SQLITE_CONSTRAINT' ||
      code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      exception.message.includes('unique constraint') ||
      exception.message.includes('UNIQUE constraint failed');

    if (isUniqueViolation) {
      status = HttpStatus.CONFLICT;
      const title = (request.body as any)?.title;
      message = title
        ? `Cocktail with title "${title}" already exists.`
        : 'A cocktail with this title already exists.';
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: isUniqueViolation ? 'Conflict' : 'Internal Server Error',
    });
  }
}
