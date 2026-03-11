import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(`Auth failed: err=${err?.message || 'none'}, user=${!!user}, info=${info?.message || info || 'none'}`);

      let message = 'Acesso negado';
      if (info && info.name === 'TokenExpiredError') {
        message = 'Sessão expirada. Faça login novamente.';
      } else if (info && info.name === 'JsonWebTokenError') {
        message = 'Sessão inválida. Faça login novamente.';
      } else if (info && info.message === 'No auth token') {
        message = 'Você precisa estar logado para fazer isso.';
      }

      throw err || new UnauthorizedException(message);
    }
    return user;
  }
}
