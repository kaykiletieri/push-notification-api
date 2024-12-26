import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Logger } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (isPublic) {
        return true;
      }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('Token is missing or invalid');
      throw new UnauthorizedException('Token is missing or invalid');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      this.logger.log(
        `Token validated successfully for user: ${payload.clientId}`,
      );
    } catch (err) {
      this.logger.error('Token validation failed', err.stack);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      this.logger.warn('Authorization header is missing or malformed');
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      this.logger.warn('Authorization header does not contain a Bearer token');
      return null;
    }

    return token;
  }
}
