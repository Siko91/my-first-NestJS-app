import { AuthController } from './auth.controller';
import {
  randomUserDto,
  getControllerOrService,
} from '../utils/test/testingFunctions';
import { AuthModule } from './auth.module';
import { User } from '../users/user.entity';
import CustomAssert from '../utils/test/customAssert';
import { JwtModule, JwtService } from '@nestjs/jwt';
import env from '../env';
import { AdminAuthGuard, AuthGuard } from './auth.guard';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

describe('AuthController', () => {
  let jwtService: JwtService;
  let usersService: UsersService;
  let controller: AuthController;

  beforeEach(async () => {
    jwtService = await getControllerOrService(JwtModule, JwtService, [User]);
    usersService = await getControllerOrService(UsersModule, UsersService, [
      User,
    ]);
    controller = await getControllerOrService(AuthModule, AuthController, [
      User,
    ]);
  }, 30000);

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  }, 30000);

  it('Should be able to register a user', async () => {
    const u1_req = randomUserDto();
    const u1 = await controller.register(u1_req);
    expect(u1.id).toBe(1);
    expect(u1.email).toBe(u1_req.email);
    expect(u1.username).toBe(u1_req.username);
  }, 30000);

  it('Should not be able to register a user with username or email that is already taken', async () => {
    const u1_req = randomUserDto();
    await controller.register(u1_req);

    const u2_req = randomUserDto();
    u2_req.username = u1_req.username;
    const e2 = await CustomAssert.throwsAsync(() =>
      controller.register(u2_req),
    );
    expect(e2.message).toBe(
      'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username',
    );

    const u3_req = randomUserDto();
    u3_req.email = u1_req.email;
    const e3 = await CustomAssert.throwsAsync(() =>
      controller.register(u3_req),
    );
    expect(e3.message).toBe(
      'SQLITE_CONSTRAINT: UNIQUE constraint failed: user.email',
    );
  }, 30000);

  it('Should not be able to specify "id", "passwordHash", "isAdmin" and "latestAuthId" when registering', async () => {
    const fields = {
      id: 999999,
      isAdmin: true,
      passwordHash: 'a-string',
      latestAuthId: 'a-string',
    };

    const u_req = { ...randomUserDto(), ...fields };
    const u = await controller.register(u_req);
    expect(u.id).not.toBe(fields.id);
    expect(u.isAdmin).not.toBe(fields.isAdmin);
    expect(u.passwordHash).not.toBe(fields.passwordHash);
    expect(u.latestAuthId).not.toBe(fields.latestAuthId);
  }, 30000);

  it('Should be able to sign in with existing user', async () => {
    const u_req = randomUserDto();
    await controller.register(u_req);

    const signInRes = await controller.signIn({
      username: u_req.username,
      password: u_req.password,
    });

    expect(signInRes).toHaveProperty('access_token');
  }, 30000);

  it('Should not be able to sign in with non-existing user', async () => {
    const u_req = randomUserDto();

    await CustomAssert.throwsAsync(() =>
      controller.signIn({
        username: u_req.username,
        password: u_req.password,
      }),
    );
  }, 30000);

  it('Should not be able to sign in with wrong password', async () => {
    const u_req = randomUserDto();
    await controller.register(u_req);

    await CustomAssert.throwsAsync(() =>
      controller.signIn({
        username: u_req.username,
        password: 'wrong-password',
      }),
    );
  }, 30000);

  it('JSON Web Tokens should contain some User Information', async () => {
    const u_req = randomUserDto();
    await controller.register(u_req);

    const { access_token } = await controller.signIn({
      username: u_req.username,
      password: u_req.password,
    });

    const u = await new AuthGuard(jwtService, usersService).parseToken(
      access_token,
    );
    expect(u).toHaveProperty('id');
    expect(u).toHaveProperty('latestAuthId');
    expect(u).toHaveProperty('timestamp');
    expect(u).toHaveProperty('username');
  }, 30000);

  it('Should be able to sign in with multiple tokens (presumably multiple devices)', async () => {
    const u_req = randomUserDto();
    await controller.register(u_req);

    const res1 = await controller.signIn({
      username: u_req.username,
      password: u_req.password,
    });

    const res2 = await controller.signIn({
      username: u_req.username,
      password: u_req.password,
    });

    expect(res1.access_token).not.toBe(res2.access_token);
  }, 30000);

  it('Should be able to invalidate all tokens at the same time', async () => {
    const u_req = randomUserDto();
    const u = await controller.register(u_req);

    const res1 = await controller.signIn(u_req);
    const res2 = await controller.signIn(u_req);

    const authGuard = new AuthGuard(jwtService, usersService);
    expect((await authGuard.validateToken(res1.access_token)).id).toBe(u.id);
    expect((await authGuard.validateToken(res2.access_token)).id).toBe(u.id);

    controller.invalidateAllExistingTokens({ user: u });

    await CustomAssert.throwsAsync(() =>
      authGuard.validateToken(res1.access_token),
    );
    await CustomAssert.throwsAsync(() =>
      authGuard.validateToken(res2.access_token),
    );
  }, 30000);

  it('Only an admin should be able to pass the Admin Auth Middleware', async () => {
    const u_req = randomUserDto();
    const u = await controller.register(u_req);

    const { access_token } = await controller.signIn(u_req);

    const authGuard = new AuthGuard(jwtService, usersService);
    const adminAuthGuard = new AdminAuthGuard(jwtService, usersService);

    expect((await authGuard.validateToken(access_token)).id).toBe(u.id);
    await CustomAssert.throwsAsync(() =>
      adminAuthGuard.validateToken(access_token),
    );

    await usersService.updateUser({ ...u, isAdmin: true }, u.id, {
      isAdmin: true,
    });

    expect((await authGuard.validateToken(access_token)).id).toBe(u.id);
    expect((await adminAuthGuard.validateToken(access_token)).id).toBe(u.id);
  }, 30000);
});
