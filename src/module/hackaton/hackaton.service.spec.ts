import { Test, TestingModule } from '@nestjs/testing';
import { HackatonService } from './hackaton.service';

describe('HackatonService', () => {
  let service: HackatonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HackatonService],
    }).compile();

    service = module.get<HackatonService>(HackatonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
