import { Test, TestingModule } from '@nestjs/testing';
import { PizzaComponentsService } from './pizza-components.service';

describe('PizzaComponentsService', () => {
  let service: PizzaComponentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PizzaComponentsService],
    }).compile();

    service = module.get<PizzaComponentsService>(PizzaComponentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
