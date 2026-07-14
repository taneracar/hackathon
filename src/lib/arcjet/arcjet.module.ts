import { Global, Module } from '@nestjs/common';
import {
  ArcjetModule as ArcjetSdkModule,
  detectBot,
  shield,
  tokenBucket,
} from '@arcjet/nest';
import { ArcjetService } from './arcjet.service';

const isLive = process.env.ARCJET_MODE === 'LIVE';

@Global()
@Module({
  imports: [
    ArcjetSdkModule.forRoot({
      key: process.env.ARCJET_KEY!,
      rules: [
        shield({ mode: isLive ? 'LIVE' : 'DRY_RUN' }),
        detectBot({
          mode: isLive ? 'LIVE' : 'DRY_RUN',
          allow: ['CATEGORY:SEARCH_ENGINE', 'POSTMAN'],
        }),
        tokenBucket({
          mode: isLive ? 'LIVE' : 'DRY_RUN',
          refillRate: 5,
          interval: 10,
          capacity: 10,
        }),
      ],
    }),
  ],
  providers: [ArcjetService],
  exports: [ArcjetService],
})
export class ArcjetModule {}
