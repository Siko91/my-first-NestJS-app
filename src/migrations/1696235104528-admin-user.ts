import { User } from '../users/user.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class AdminUserMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert(User, {
      username: 'admin',
      passwordHash:
        process.env.ADMIN_PASS_HASH ??
        '$2b$11$oxt6VrH9TnvDVWwP228K7eYp8BWB3725vvUGkIDR/1/M6R7WJS/7K', // admin
      email: 'admin@example.com',
      latestAuthId: uuidv4(),
      isAdmin: true,
      fullName: 'Admin',
      phone: 'N/A',
      address: 'N/A',
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(User, { username: 'admin' });
  }
}
