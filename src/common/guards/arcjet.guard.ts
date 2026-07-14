import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { ArcjetService } from '../../lib/arcjet/arcjet.service';

@Injectable()
export class ArcjetGuard implements CanActivate {
  constructor(private readonly arcjetService: ArcjetService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const decision = await this.arcjetService.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpException(
          'Too many requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (decision.reason.isBot()) {
        throw new HttpException('No bots allowed', HttpStatus.FORBIDDEN);
      }
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
