import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseSanitizationInterceptor implements NestInterceptor {
    private readonly SENSITIVE_FIELDS = ['passwordHash', 'tokenHash', 'refreshToken'];

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => this.sanitizeResponse(data))
        );
    }

    private sanitizeResponse(obj: any): any {
        if (obj === null || obj === undefined) return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeResponse(item));
        } else if (typeof obj === 'object') {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                if (!this.SENSITIVE_FIELDS.includes(key)) {
                    sanitized[key] = this.sanitizeResponse(value);
                }
            }
            return sanitized;
        }
        return obj;
    }
}
