import {
  dropDb,
  getControllerOrService,
  randomUserDto,
} from '../utils/test/testingFunctions';
import { User } from './user.entity';
import { AuthController } from '../auth/auth.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from './users.module';
import { UsersAdminController } from './users.admin.controller';

describe('UsersController', () => {
  let authController: AuthController;
  let usersAdminController: UsersAdminController;

  beforeEach(async () => {
    dropDb();

    authController = await getControllerOrService(AuthModule, AuthController, [
      User,
    ]);
    usersAdminController = await getControllerOrService(
      UsersModule,
      UsersAdminController,
      [User],
    );
  }, 30000);

  it('should be defined', async () => {
    expect(authController).toBeDefined();
    expect(usersAdminController).toBeDefined();
  }, 30000);

  it('Admin can get user', async () => {
    const u = await authController.register(randomUserDto());

    const res = await usersAdminController.listUsers();
    expect(res).toHaveLength(1);

    const uRes = await usersAdminController.getOne(u.id);
    expect(uRes.username).toBe(u.username);
  }, 30000);

  it('Admin can list users', async () => {
    const u1_req = randomUserDto();
    const u2_req = randomUserDto();
    const u3_req = randomUserDto();

    const u1 = await authController.register(u1_req);
    const u2 = await authController.register(u2_req);
    const u3 = await authController.register(u3_req);

    const res = await usersAdminController.listUsers();
    expect(res).toHaveLength(3);
    expect(
      res
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([u1.id, u2.id, u3.id].sort().join());
  }, 30000);

  it('Admin can search users', async () => {
    const u1_req = { ...randomUserDto(), fullName: 'some name' };
    const u2_req = { ...randomUserDto(), username: 'username-test' };
    const u3_req = { ...randomUserDto(), address: 'test-address' };
    const u4_req = { ...randomUserDto(), email: 'my-test-email@example.com' };
    const u5_req = { ...randomUserDto(), phone: 'some phone' };

    await authController.register(u1_req);
    const u2 = await authController.register(u2_req);
    const u3 = await authController.register(u3_req);
    const u4 = await authController.register(u4_req);
    await authController.register(u5_req);

    const res = await usersAdminController.listUsers('test');
    expect(res).toHaveLength(3);
    expect(
      res
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([u2.id, u3.id, u4.id].sort().join());
  }, 30000);

  it('Admin can register users', async () => {
    const u = await usersAdminController.addUser(randomUserDto());
    const uRes = await usersAdminController.getOne(u.id);
    expect(uRes.username).toBe(u.username);
  }, 30000);

  it('Admin can modify users', async () => {
    const u = await authController.register(randomUserDto());
    await usersAdminController.updateUser(
      { user: { ...u, isAdmin: true } },
      u.id,
      { isAdmin: true, fullName: 'John' },
    );

    const uRes = await usersAdminController.getOne(u.id);
    expect(uRes.isAdmin).toBe(true);
    expect(uRes.fullName).toBe('John');
  }, 30000);

  it('Admin can delete users', async () => {
    const u = await authController.register(randomUserDto());
    await usersAdminController.deleteUser(
      { user: { ...u, isAdmin: true } },
      u.id,
    );

    const list = await usersAdminController.listUsers();
    expect(list).toHaveLength(0);
  }, 30000);
});
