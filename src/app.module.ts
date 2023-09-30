import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import env from './env';
import { HealthModule } from './health/health.module';
import { User } from './users/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PizzaComponentsModule } from './pizza-components/pizza-components.module';
import { PizzaComponentType } from './pizza-components/pizza-component-type.entity';
import { PizzaComponent } from './pizza-components/pizza-component.entity';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: env.SQLITE_DB_NAME,
      entities: [User, PizzaComponentType, PizzaComponent],
    }),
    AuthModule,
    UsersModule,
    HealthModule,
    PizzaComponentsModule,
    OrdersModule,
  ],
})
export class AppModule {}
