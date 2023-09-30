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
} from 'src/pizza-components/pizza-components.types';

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
        dropSchema: true, // ONLY FOR TESTING
        synchronize: true, // ONLY FOR TESTING - use "migrations" for production
      }),
      ModuleType,
    ],
  }).compile();

  const result = module.get(ControllerType);
  return result;
}
