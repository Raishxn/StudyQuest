import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;

        if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
            if (req.body && typeof req.body === 'object') {
                req.body = this.sanitizeObject(req.body);
            }
        }

        return next.handle();
    }

    private sanitizeObject(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        } else if (obj !== null && typeof obj === 'object') {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = this.sanitizeObject(value);
            }
            return sanitized;
        } else if (typeof obj === 'string') {
            return DOMPurify.sanitize(obj, { ALLOWED_TAGS: ['b', 'i', 'code', 'pre', 'a'] });
        }
        return obj;
    }
}
