import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    private readonly logger = new Logger(CustomThrottlerGuard.name);

    protected async getTracker(req: Record<string, any>): Promise<string> {
        const xForwardedFor = req.headers['x-forwarded-for'];
        if (xForwardedFor) {
            if (typeof xForwardedFor === 'string') {
                return xForwardedFor.split(',')[0].trim();
            }
            return xForwardedFor[0];
        }
        return req.ip;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            return await super.canActivate(context);
        } catch (error) {
            // If Redis is down, fail-open: allow the request through
            if (error instanceof Error && (
                error.message.includes('ECONNRESET') ||
                error.message.includes('ECONNREFUSED') ||
                error.message.includes('ETIMEDOUT') ||
                error.message.includes('MaxRetriesPerRequestError') ||
                error.message.includes('Connection is closed')
            )) {
                this.logger.warn('Redis unavailable for throttling, allowing request');
                return true;
            }
            // Re-throw actual throttling errors (429 Too Many Requests)
            throw error;
        }
    }
}
