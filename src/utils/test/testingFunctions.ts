import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../../auth/auth.types';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type } from '../typescriptUtils';
import env from '../../env';
import { JwtModule } from '@nestjs/jwt';
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

export function getDbPath() {
  return path.join(__dirname, '..', '..', 'dbTest.sqlite');
}

export function dropDb() {
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) {
    return fs.unlinkSync(dbPath);
  }
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
  authController: AuthController,
  pizzaComponentsAdminController: PizzaComponentsAdminController,
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
    const user = await authController.register(req);
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
    const t = await pizzaComponentsAdminController.addComponentType(tReq);
    componentTypeRequests.push(tReq);
    componentTypes.push(t);

    componentRequests[i] = [];
    createdComponents[i] = [];

    for (let cpIndex = 0; cpIndex < components.length; cpIndex++) {
      let comp = components[cpIndex];
      comp = typeof comp === 'number' ? { price: comp } : { ...comp };
      const { price, name, description } = comp;
      const cReq = randomPizzaComponent(price, name, description);
      const c = await pizzaComponentsAdminController.addComponent(t.id, cReq);
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

export async function getControllerOrService<TModule, TControllerOrService>(
  ModuleType: Type<TModule>,
  ControllerType: Type<TControllerOrService>,
  TypeOrmEntities: Type<any>[],
): Promise<TControllerOrService> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        global: true,
        secret: env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: env.SQLITE_DB_NAME,
        entities: [...TypeOrmEntities],
        synchronize: true, // ONLY FOR TESTING - use "migrations" for production
        dropSchema: true, // ONLY FOR TESTING
      }),
      ModuleType,
    ],
  }).compile();

  const result = module.get(ControllerType);
  return result;
}
