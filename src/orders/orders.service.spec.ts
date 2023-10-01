import { OrdersService } from './orders.service';
import { OrdersModule } from './orders.module';
import { User } from '../users/user.entity';
import { PizzaComponentType } from '../pizza-components/pizza-component-type.entity';
import { PizzaComponent } from '../pizza-components/pizza-component.entity';
import { OrderedPizzaComponent } from './ordered-pizza-component.entity';
import { OrderedPizza } from './ordered-pizza.entity';
import { Order } from './order.entity';
import { getControllerOrService } from '../utils/test/testingFunctions';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    service = await getControllerOrService(OrdersModule, OrdersService, [
      User,
      PizzaComponentType,
      PizzaComponent,
      OrderedPizzaComponent,
      OrderedPizza,
      Order,
    ]);
  }, 30000);

  it('should be defined', () => {
    expect(service).toBeDefined();
  }, 30000);
});
