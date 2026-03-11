import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class NotBannedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Checks payload explicitly to see if the user has been banned
        if (user && user.role === Role.BANNED) {
            throw new ForbiddenException(
                'Sua conta foi suspensa permanentemente. Contate suporte@studyquest.com.br para contestar.'
            );
        }

        // Default pass-through, doesn't interfere if not banned
        return true;
    }
}
