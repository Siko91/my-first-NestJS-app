import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../../auth/auth.types';
import { v4 as uuidv4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import env from '../../env';
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  PizzaComponentDto,
  PizzaComponentTypeDto,
} from '../../pizza-components/pizza-components.types';
import { OrderDto } from '../../orders/orders.types';
import { User } from '../../users/user.entity';
import { PizzaComponentType } from '../../pizza-components/pizza-component-type.entity';
import { PizzaComponent } from '../../pizza-components/pizza-component.entity';
import { AuthController } from '../../auth/auth.controller';
import { PizzaComponentsAdminController } from '../../pizza-components/pizza-components.admin.controller';
import { DataSource } from 'typeorm';
import { OrderedPizzaComponent } from '../../orders/ordered-pizza-component.entity';
import { OrderedPizza } from '../../orders/ordered-pizza.entity';
import { Order } from '../../orders/order.entity';
import { HealthModule } from '../../health/health.module';
import { PizzaComponentsModule } from '../../pizza-components/pizza-components.module';
import { PizzaComponentsController } from '../../pizza-components/pizza-components.controller';
import { AuthModule } from '../../auth/auth.module';
import { OrdersController } from '../../orders/orders.controller';
import { OrdersModule } from '../../orders/orders.module';
import { OrdersAdminController } from '../../orders/orders.admin.controller';
import { HealthController } from '../../health/health.controller';
import { UsersModule } from '../../users/users.module';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../../auth/auth.service';
import { OrdersService } from '../../orders/orders.service';
import { PizzaComponentsService } from '../../pizza-components/pizza-components.service';
import { UsersAdminController } from '../../users/users.admin.controller';
import { UsersController } from '../../users/users.controller';

export const TestDbEntities = [
  User,
  PizzaComponentType,
  PizzaComponent,
  OrderedPizzaComponent,
  OrderedPizza,
  Order,
];

export const TestDbModule = TypeOrmModule.forRoot({
  type: 'better-sqlite3',
  database: env.SQLITE_DB_NAME,
  entities: TestDbEntities,
  synchronize: true, // ONLY FOR TESTING - use "migrations" for production
  dropSchema: true, // ONLY FOR TESTING
});

export async function initTestApi() {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        global: true,
        secret: env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
      TestDbModule,
      HealthModule,
      AuthModule,
      OrdersModule,
      PizzaComponentsModule,
      UsersModule,
      JwtModule,
    ],
  }).compile();

  const api = {
    // controller
    healthController: module.get(HealthController),
    authController: module.get(AuthController),
    ordersController: module.get(OrdersController),
    ordersAdminController: module.get(OrdersAdminController),
    pizzaComponentsController: module.get(PizzaComponentsController),
    pizzaComponentsAdminController: module.get(PizzaComponentsAdminController),
    usersController: module.get(UsersController),
    usersAdminController: module.get(UsersAdminController),
    // service
    usersService: module.get(UsersService),
    authService: module.get(AuthService),
    ordersService: module.get(OrdersService),
    ordersAdminService: module.get(OrdersService),
    pizzaComponentsService: module.get(PizzaComponentsService),
    pizzaComponentsAdminService: module.get(PizzaComponentsService),
    // libs
    jwtService: module.get(JwtService),
    appDataSource: module.get(DataSource),
  };

  await dropDbTables(api.appDataSource);

  return api;
}

export async function dropDbTables(appDataSource: DataSource) {
  const logs: string[] = [];
  for (const Entity of TestDbEntities) {
    const repo = appDataSource.getRepository(Entity);
    await repo.find();
    try {
      const res = await repo.delete({});
      logs.push(`${res.affected} ${Entity.name} rows`);
    } catch (error) {}
  }
  console.log(`Deleted : ${logs.join(', ')}`);
}

export function randomUserDto(): CreateUserDto {
  return {
    username: `user-${uuidv4()}`,
    email: `email-${uuidv4()}@example.com`,
    password: `pass-${uuidv4()}`,

    fullName: `John ${uuidv4()}`,

    address: `address-${uuidv4()}`,
    phone: `phone-${uuidv4()}`,
  };
}

export function randomPizzaComponentType(
  mandatory: boolean,
  maximum: number,
): PizzaComponentTypeDto {
  return {
    maximum,
    mandatory,
    name: `component-type-${uuidv4()}`,
    description: `description-${uuidv4()}`,
  };
}

export function randomPizzaComponent(
  currentPrice: number,
  name?: string,
  description?: string,
): PizzaComponentDto {
  return {
    currentPrice,
    name: `${name ?? 'component'}-${uuidv4()}`,
    description: `${description ?? 'description'}-${uuidv4()}`,
  };
}

export type MakePizzaDtoParameterType =
  | PizzaComponent[]
  | { components: PizzaComponent[]; additionalRequests: string };

export function makeOrderDto(
  user: { address?: string },
  dto: Partial<OrderDto> | undefined | null,
  ...pizzas: MakePizzaDtoParameterType[]
): OrderDto {
  return {
    address: user.address ?? `address-${uuidv4()}`,
    desiredDeliveryTime: new Date(),
    pizzas: pizzas.map((i) => {
      if (Array.isArray(i)) {
        return {
          components: i.map((c) => {
            return { componentId: c.id };
          }),
          additionalRequests: `additionalRequests-${uuidv4()}`,
        };
      } else {
        return {
          components: (i as any).components.map((c) => {
            return { componentId: c.id };
          }),
          additionalRequests: (i as any).additionalRequests,
        };
      }
    }),
    ...(dto ?? {}),
  };
}

export async function setupTestData(
  api: {
    authController: AuthController;
    pizzaComponentsAdminController: PizzaComponentsAdminController;
  },
  options: {
    usersToCreate: number;
    componentTypes: {
      mandatory: boolean;
      maximum: number;
      components: (
        | number
        | { price: number; name?: string; description?: string }
      )[];
    }[];
  },
) {
  const userRequests: CreateUserDto[] = [];
  const users: User[] = [];

  for (let i = 0; i < options.usersToCreate; i++) {
    const req = randomUserDto();
    const user = await api.authController.register(req);
    userRequests.push(req);
    users.push(user);
  }

  const componentTypeRequests: PizzaComponentTypeDto[] = [];
  const componentTypes: PizzaComponentType[] = [];

  const componentRequests: PizzaComponentDto[][] = [];
  const createdComponents: PizzaComponent[][] = [];

  for (let i = 0; i < options.componentTypes.length; i++) {
    const { mandatory, maximum, components } = options.componentTypes[i];

    const tReq = randomPizzaComponentType(mandatory, maximum);
    const t = await api.pizzaComponentsAdminController.addComponentType(tReq);
    componentTypeRequests.push(tReq);
    componentTypes.push(t);

    componentRequests[i] = [];
    createdComponents[i] = [];

    for (let cpIndex = 0; cpIndex < components.length; cpIndex++) {
      let comp = components[cpIndex];
      comp = typeof comp === 'number' ? { price: comp } : { ...comp };
      const { price, name, description } = comp;
      const cReq = randomPizzaComponent(price, name, description);
      const c = await api.pizzaComponentsAdminController.addComponent(
        t.id,
        cReq,
      );
      componentRequests[i].push(cReq);
      createdComponents[i].push(c);
    }
  }

  return {
    users,
    componentTypes,
    components: createdComponents,
    //
    userRequests,
    componentTypeRequests,
    componentRequests,
  };
}
