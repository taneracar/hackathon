import { Test, TestingModule } from '@nestjs/testing';
import { HackatonController } from './hackaton.controller';
import { HackatonService } from './hackaton.service';

describe('HackatonController', () => {
  let controller: HackatonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackatonController],
      providers: [HackatonService],
    }).compile();

    controller = module.get<HackatonController>(HackatonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
