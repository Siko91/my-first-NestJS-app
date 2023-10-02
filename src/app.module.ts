import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import env from './env';
import { HealthModule } from './health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { PizzaComponentsModule } from './pizza-components/pizza-components.module';
import { OrdersModule } from './orders/orders.module';
import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UsersModule,
    HealthModule,
    PizzaComponentsModule,
    OrdersModule,
  ],
})
export class AppModule {}
