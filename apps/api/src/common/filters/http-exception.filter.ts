import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // Determine type, title, detail
        const type = 'about:blank';
        let title = 'Error';
        let detail = exception.message;

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            if ('error' in exceptionResponse) {
                title = (exceptionResponse as any).error;
            }
            if ('message' in exceptionResponse) {
                const msg = (exceptionResponse as any).message;
                detail = Array.isArray(msg) ? msg.join(', ') : msg;
            }
        }

        const problemDetails: any = {
            type,
            title,
            status,
            detail,
            instance: ctx.getRequest().url,
        };

        // Include stack trace only in development
        if (process.env.NODE_ENV !== 'production') {
            problemDetails.stack = exception.stack;
        }

        response
            .status(status)
            .json(problemDetails);
    }
}
