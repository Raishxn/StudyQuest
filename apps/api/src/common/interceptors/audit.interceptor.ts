import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);
    private auditFilePath = path.join(process.cwd(), 'audit.json');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();

        // Only log POST, PUT, PATCH, DELETE or specific sensitive paths
        const isSensitiveMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
        const isAdminRoute = req.originalUrl.includes('/admin/');

        if (!isSensitiveMethod && !isAdminRoute) {
            return next.handle();
        }

        const { user, method, originalUrl, body, ip } = req;
        const actorId = user ? user.id : 'anonymous';
        const timestamp = new Date().toISOString();

        return next.handle().pipe(
            tap(() => {
                // Prepare the audit log entry
                const logEntry = {
                    timestamp,
                    actorId,
                    method,
                    url: originalUrl,
                    ip,
                    body: body ? JSON.stringify(body) : null, // Be careful not to log passwords!
                };

                // Redact passwords from logs
                if (logEntry.body && logEntry.body.includes('password')) {
                    logEntry.body = '[REDACTED]';
                }

                // Print to console
                this.logger.warn(`[AUDIT] Action by User ${actorId} - ${method} ${originalUrl}`);

                // Write to audit.json safely
                try {
                    if (!fs.existsSync(this.auditFilePath)) {
                        fs.writeFileSync(this.auditFilePath, '[]');
                    }
                    const currentData = JSON.parse(fs.readFileSync(this.auditFilePath, 'utf-8'));
                    currentData.push(logEntry);
                    fs.writeFileSync(this.auditFilePath, JSON.stringify(currentData, null, 2));
                } catch (err) {
                    this.logger.error('Failed to write to audit log file.', err);
                }
            }),
        );
    }
}
