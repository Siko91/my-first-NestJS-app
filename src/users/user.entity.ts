import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ unique: true })
  email: string;

  /**
   * This field is stored in each JSON Web Token and is verified with the current value in the database on each request.
   * The purpose is to enable a User to Log Out from all of their sessions at the same time, by updating this value from any of the active sessions.
   *
   * - The value is first set in [auth.service.ts] when registering new users
   * - The value is updated when a user calls the Log Out endpoint (also in [auth.service.ts])
   * - The value is verified in the [auth.guard.ts] middleware
   *
   * An example use case for this is the security concern that an authentication token might have been stolen - the legitimate user can just make that token invalid.
   *
   * This feature isn't all that useful in a Pizza ordering app.
   * But it's probably going to be a bit more useful at an Access Control company (just an example).
   */
  @Column()
  latestAuthId: string;

  @Column()
  isAdmin?: boolean;

  @Column()
  fullName?: string;

  @Column()
  phone?: string;

  @Column()
  address?: string;
}
