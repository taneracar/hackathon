import { Inject, Injectable } from '@nestjs/common';
import { ARCJET, type ArcjetDecision, type ArcjetNest } from '@arcjet/nest';
import type { Request } from 'express';

@Injectable()
export class ArcjetService {
  constructor(@Inject(ARCJET) private readonly arcjet: ArcjetNest) {}

  protect(
    req: Request,
    props?: Record<string, unknown>,
  ): Promise<ArcjetDecision> {
    return this.arcjet.protect(req, props);
  }
}
