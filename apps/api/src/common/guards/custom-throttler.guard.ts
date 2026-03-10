import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        // Extract real IP from x-forwarded-for if behind a proxy like Render
        const xForwardedFor = req.headers['x-forwarded-for'];
        if (xForwardedFor) {
            if (typeof xForwardedFor === 'string') {
                return xForwardedFor.split(',')[0].trim();
            }
            return xForwardedFor[0];
        }
        return req.ip; // Fallback to direct connection IP
    }
}
