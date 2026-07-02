import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { TypeOrmExceptionFilter } from './typeorm-exception.filter';

describe('TypeOrmExceptionFilter', () => {
  let filter: TypeOrmExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new TypeOrmExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/cocktails',
      body: {},
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle unique violation database error and return Conflict (409)', () => {
      const driverError = { code: '23505' };
      const queryFailedError = new QueryFailedError('SELECT *', [], new Error('duplicate key value violates unique constraint'));
      (queryFailedError as any).driverError = driverError;

      mockRequest.body = { title: 'Mojito' };

      filter.catch(queryFailedError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'Cocktail with title "Mojito" already exists.',
        error: 'Conflict',
      });
    });

    it('should handle unique violation database error without a title in request body', () => {
      const driverError = { code: '1062' };
      const queryFailedError = new QueryFailedError('SELECT *', [], new Error('duplicate entry'));
      (queryFailedError as any).driverError = driverError;

      mockRequest.body = {};

      filter.catch(queryFailedError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'A cocktail with this title already exists.',
        error: 'Conflict',
      });
    });

    it('should handle generic database error and return InternalServerError (500)', () => {
      const driverError = { code: 'some_other_code' };
      const queryFailedError = new QueryFailedError('SELECT *', [], new Error('Connection refused'));
      (queryFailedError as any).driverError = driverError;

      filter.catch(queryFailedError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Connection refused',
        error: 'Internal Server Error',
      });
    });

    it('should identify unique violation from error message content', () => {
      const queryFailedError = new QueryFailedError('SELECT *', [], new Error('UNIQUE constraint failed: cocktails.title'));

      filter.catch(queryFailedError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'A cocktail with this title already exists.',
        error: 'Conflict',
      });
    });
  });
});
