import { Test, TestingModule } from '@nestjs/testing';
import { HackatonService } from './hackaton.service';
import { PrismaService } from '../../lib/database/prisma.service';

describe('HackatonService', () => {
  let service: HackatonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackatonService,
        {
          provide: PrismaService,
          useValue: {
            hackaton: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            hackatonParticipant: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HackatonService>(HackatonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
