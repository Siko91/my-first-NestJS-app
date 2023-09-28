import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import env from './env';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: env.SQLITE_DB_NAME,
    }),
    AuthModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
