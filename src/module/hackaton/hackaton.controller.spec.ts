import { Test, TestingModule } from '@nestjs/testing';
import { HackatonController } from './hackaton.controller';
import { HackatonService } from './hackaton.service';

jest.mock('@thallesp/nestjs-better-auth', () => ({
  AuthGuard: jest.fn(),
  Session: () => () => undefined,
}));

describe('HackatonController', () => {
  let controller: HackatonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackatonController],
      providers: [
        {
          provide: HackatonService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
            findParticipants: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HackatonController>(HackatonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
