import { Module } from '@nestjs/common';
import { HackatonService } from './hackaton.service';
import { HackatonController } from './hackaton.controller';

@Module({
  controllers: [HackatonController],
  providers: [HackatonService],
})
export class HackatonModule {}
