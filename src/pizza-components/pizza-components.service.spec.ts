import { PizzaComponentsService } from './pizza-components.service';
import { PizzaComponentsModule } from './pizza-components.module';
import { User } from '../users/user.entity';
import { PizzaComponentType } from './pizza-component-type.entity';
import { PizzaComponent } from './pizza-component.entity';
import { getControllerOrService } from '../utils/test/testingFunctions';

describe('PizzaComponentsService', () => {
  let service: PizzaComponentsService;

  beforeEach(async () => {
    service = await getControllerOrService(
      PizzaComponentsModule,
      PizzaComponentsService,
      [User, PizzaComponentType, PizzaComponent],
    );
  }, 30000);

  it('should be defined', () => {
    expect(service).toBeDefined();
  }, 30000);
});
