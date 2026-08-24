import { BadRequestException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function mockHost(exceptionCatch: { body?: unknown; status?: number }) {
  const response = {
    status(code: number) {
      exceptionCatch.status = code;
      return this;
    },
    json(payload: unknown) {
      exceptionCatch.body = payload;
      return payload;
    },
  };
  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({ method: 'POST', url: '/api/public/inquiries' }),
    }),
  };
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('replaces class-validator message arrays with a generic form error', () => {
    const caught: { body?: { message?: string; statusCode?: number }; status?: number } =
      {};
    filter.catch(
      new BadRequestException([
        'name must be longer than or equal to 2 characters',
        'contact must be an email',
      ]),
      mockHost(caught) as never,
    );
    expect(caught.status).toBe(HttpStatus.BAD_REQUEST);
    expect(caught.body?.message).toBe('Please check the form and try again.');
    expect(JSON.stringify(caught.body)).not.toContain('must be longer');
  });

  it('keeps explicit HttpException strings such as 401 and 429', () => {
    const caught: { body?: { message?: string }; status?: number } = {};
    filter.catch(
      new UnauthorizedException('Invalid email or password'),
      mockHost(caught) as never,
    );
    expect(caught.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(caught.body?.message).toBe('Invalid email or password');
  });
});
