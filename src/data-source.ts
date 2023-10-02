import { DataSource, DataSourceOptions } from 'typeorm';

import { User } from './users/user.entity';
import { PizzaComponentType } from './pizza-components/pizza-component-type.entity';
import { PizzaComponent } from './pizza-components/pizza-component.entity';
import { OrderedPizzaComponent } from './orders/ordered-pizza-component.entity';
import { OrderedPizza } from './orders/ordered-pizza.entity';
import { Order } from './orders/order.entity';

import env from './env';

export const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: env.SQLITE_DB_NAME,
  entities: [
    User,
    PizzaComponentType,
    PizzaComponent,
    Order,
    OrderedPizza,
    OrderedPizzaComponent,
  ],
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  migrationsTransactionMode: 'each',
};

export const dataSource: DataSource = new DataSource(dataSourceOptions);
