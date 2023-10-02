import { randomUserDto, initTestApi } from '../utils/test/testingFunctions';
import CustomAssert from '../utils/test/customAssert';
import { AdminAuthGuard, AuthGuard } from './auth.guard';

describe('AuthController', () => {
  it('should be defined', async () => {
    const api = await initTestApi();
    expect(api.authController).toBeDefined();
  }, 30000);

  it('Should be able to register a user', async () => {
    const api = await initTestApi();

    const u1_req = randomUserDto();
    const u1 = await api.authController.register(u1_req);
    expect(u1.id).toBe(1);
    expect(u1.email).toBe(u1_req.email);
    expect(u1.username).toBe(u1_req.username);
  }, 30000);

  it('Should not be able to register a user with username or email that is already taken', async () => {
    const api = await initTestApi();

    const u1_req = randomUserDto();
    await api.authController.register(u1_req);

    const u2_req = randomUserDto();
    u2_req.username = u1_req.username;
    const e2 = await CustomAssert.throwsAsync(() =>
      api.authController.register(u2_req),
    );
    expect(e2.message).toBe(
      'SqliteError: UNIQUE constraint failed: user.username',
    );

    const u3_req = randomUserDto();
    u3_req.email = u1_req.email;
    const e3 = await CustomAssert.throwsAsync(() =>
      api.authController.register(u3_req),
    );
    expect(e3.message).toBe(
      'SqliteError: UNIQUE constraint failed: user.email',
    );
  }, 30000);

  it('Should not be able to specify "id", "passwordHash", "isAdmin" and "latestAuthId" when registering', async () => {
    const api = await initTestApi();

    const fields = {
      id: 999999,
      isAdmin: true,
      passwordHash: 'a-string',
      latestAuthId: 'a-string',
    };

    const u_req = { ...randomUserDto(), ...fields };
    const u = await api.authController.register(u_req);
    expect(u.id).not.toBe(fields.id);
    expect(u.isAdmin).not.toBe(fields.isAdmin);
    expect(u.passwordHash).not.toBe(fields.passwordHash);
    expect(u.latestAuthId).not.toBe(fields.latestAuthId);
  }, 30000);

  it('Should be able to sign in with existing user', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    await api.authController.register(u_req);

    const signInRes = await api.authController.signIn({
      username: u_req.username,
      password: u_req.password,
    });

    expect(signInRes).toHaveProperty('access_token');
  }, 30000);

  it('Should not be able to sign in with non-existing user', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();

    await CustomAssert.throwsAsync(() =>
      api.authController.signIn({
        username: u_req.username,
        password: u_req.password,
      }),
    );
  }, 30000);

  it('Should not be able to sign in with wrong password', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    await api.authController.register(u_req);

    await CustomAssert.throwsAsync(() =>
      api.authController.signIn({
        username: u_req.username,
        password: 'wrong-password',
      }),
    );
  }, 30000);

  it('JSON Web Tokens should contain some User Information', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    await api.authController.register(u_req);

    const { access_token } = await api.authController.signIn({
      username: u_req.username,
      password: u_req.password,
    });

    const u = await new AuthGuard(api.jwtService, api.usersService).parseToken(
      access_token,
    );
    expect(u).toHaveProperty('id');
    expect(u).toHaveProperty('latestAuthId');
    expect(u).toHaveProperty('timestamp');
    expect(u).toHaveProperty('username');
  }, 30000);

  it('Should be able to sign in with multiple tokens (presumably multiple devices)', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    await api.authController.register(u_req);

    const res1 = await api.authController.signIn({
      username: u_req.username,
      password: u_req.password,
    });

    const res2 = await api.authController.signIn({
      username: u_req.username,
      password: u_req.password,
    });

    expect(res1.access_token).not.toBe(res2.access_token);
  }, 30000);

  it('Should be able to invalidate all tokens at the same time', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    const u = await api.authController.register(u_req);

    const res1 = await api.authController.signIn(u_req);
    const res2 = await api.authController.signIn(u_req);

    const authGuard = new AuthGuard(api.jwtService, api.usersService);
    expect((await authGuard.validateToken(res1.access_token)).id).toBe(u.id);
    expect((await authGuard.validateToken(res2.access_token)).id).toBe(u.id);

    await api.authController.invalidateAllExistingTokens({ user: u });

    await CustomAssert.throwsAsync(() =>
      authGuard.validateToken(res1.access_token),
    );
    await CustomAssert.throwsAsync(() =>
      authGuard.validateToken(res2.access_token),
    );
  }, 30000);

  it('Only an admin should be able to pass the Admin Auth Middleware', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    const u = await api.authController.register(u_req);

    const { access_token } = await api.authController.signIn(u_req);

    const authGuard = new AuthGuard(api.jwtService, api.usersService);
    const adminAuthGuard = new AdminAuthGuard(api.jwtService, api.usersService);

    expect((await authGuard.validateToken(access_token)).id).toBe(u.id);
    await CustomAssert.throwsAsync(() =>
      adminAuthGuard.validateToken(access_token),
    );

    await api.usersService.updateUser({ ...u, isAdmin: true }, u.id, {
      isAdmin: true,
    });

    expect((await authGuard.validateToken(access_token)).id).toBe(u.id);
    expect((await adminAuthGuard.validateToken(access_token)).id).toBe(u.id);
  }, 30000);
});
