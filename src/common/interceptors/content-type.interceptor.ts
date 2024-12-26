import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ContentTypeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    const contentType = request.headers['content-type'];

    if (
      !contentType ||
      !contentType.includes('application/x-www-form-urlencoded')
    ) {
      throw new BadRequestException(
        'Content-Type must be application/x-www-form-urlencoded',
      );
    }

    return next.handle();
  }
}
