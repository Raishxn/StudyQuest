import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let type = 'about:blank';
        let title = 'Internal Server Error';
        let detail = 'Ocorreu um erro inesperado no servidor.';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                if ('error' in exceptionResponse) {
                    title = (exceptionResponse as any).error;
                }
                if ('message' in exceptionResponse) {
                    const msg = (exceptionResponse as any).message;
                    detail = Array.isArray(msg) ? msg.join(', ') : msg;
                }
            } else {
                detail = exception.message;
            }
        } else {
            // Non-HTTP errors (Prisma, Redis, TypeError, etc.) — log full error, return generic 500
            const err = exception instanceof Error ? exception : new Error(String(exception));
            console.error('[UnhandledException]', err.message, err.stack);
        }

        const problemDetails: any = {
            type,
            title,
            status,
            detail,
            instance: ctx.getRequest().url,
        };

        // Include stack trace only in development
        if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
            problemDetails.stack = exception.stack;
        }

        response
            .status(status)
            .json(problemDetails);
    }
}
