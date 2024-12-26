import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '../decorators/scopes.decorator';
import { Request } from 'express';

@Injectable()
export class ScopesGuard implements CanActivate {
  private readonly logger = new Logger(ScopesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { scopes: string[] } }>();
    const user = request.user;

    if (!user || !user.scopes || !Array.isArray(user.scopes)) {
      this.logger.warn('User does not have the required scopes');
      throw new ForbiddenException('User does not have required permissions');
    }

    const missingScopes = requiredScopes.filter(
      (scope) => !user.scopes.includes(scope),
    );

    if (missingScopes.length > 0) {
      this.logger.warn(
        `User lacks required scopes: [${missingScopes.join(', ')}]`,
      );
      throw new ForbiddenException('User does not have required permissions');
    }

    this.logger.log(
      `Access granted for user with scopes: [${user.scopes.join(', ')}]`,
    );
    return true;
  }
}
