import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import env from './env';
import { HealthModule } from './health/health.module';
import { User } from './users/user.entity';
import { JwtModule } from '@nestjs/jwt';

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
      entities: [User],
    }),
    AuthModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
