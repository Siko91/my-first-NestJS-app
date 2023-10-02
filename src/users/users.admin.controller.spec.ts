import { initTestApi, randomUserDto } from '../utils/test/testingFunctions';

describe('UsersController', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.authController).toBeDefined();
    expect(api.usersAdminController).toBeDefined();
  }, 30000);

  it('Admin can get user', async () => {
    const api = await initTestApi();

    const u = await api.authController.register(randomUserDto());

    const res = await api.usersAdminController.listUsers();
    expect(res).toHaveLength(1);

    const uRes = await api.usersAdminController.getOne(u.id);
    expect(uRes.username).toBe(u.username);
  }, 30000);

  it('Admin can list users', async () => {
    const api = await initTestApi();

    const u1_req = randomUserDto();
    const u2_req = randomUserDto();
    const u3_req = randomUserDto();

    const u1 = await api.authController.register(u1_req);
    const u2 = await api.authController.register(u2_req);
    const u3 = await api.authController.register(u3_req);

    const res = await api.usersAdminController.listUsers();
    expect(res).toHaveLength(3);
    expect(
      res
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([u1.id, u2.id, u3.id].sort().join());
  }, 30000);

  it('Admin can search users', async () => {
    const api = await initTestApi();

    const u1_req = { ...randomUserDto(), fullName: 'some name' };
    const u2_req = { ...randomUserDto(), username: 'username-test' };
    const u3_req = { ...randomUserDto(), address: 'test-address' };
    const u4_req = { ...randomUserDto(), email: 'my-test-email@example.com' };
    const u5_req = { ...randomUserDto(), phone: 'some phone' };

    await api.authController.register(u1_req);
    const u2 = await api.authController.register(u2_req);
    const u3 = await api.authController.register(u3_req);
    const u4 = await api.authController.register(u4_req);
    await api.authController.register(u5_req);

    const res = await api.usersAdminController.listUsers('test');
    expect(res).toHaveLength(3);
    expect(
      res
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([u2.id, u3.id, u4.id].sort().join());
  }, 30000);

  it('Admin can register users', async () => {
    const api = await initTestApi();

    const u = await api.usersAdminController.addUser(randomUserDto());
    const uRes = await api.usersAdminController.getOne(u.id);
    expect(uRes.username).toBe(u.username);
  }, 30000);

  it('Admin can modify users', async () => {
    const api = await initTestApi();

    const u = await api.authController.register(randomUserDto());
    await api.usersAdminController.updateUser(
      { user: { ...u, isAdmin: true } },
      u.id,
      { isAdmin: true, fullName: 'John' },
    );

    const uRes = await api.usersAdminController.getOne(u.id);
    expect(uRes.isAdmin).toBe(true);
    expect(uRes.fullName).toBe('John');
  }, 30000);

  it('Admin can delete users', async () => {
    const api = await initTestApi();

    const u = await api.authController.register(randomUserDto());
    await api.usersAdminController.deleteUser(
      { user: { ...u, isAdmin: true } },
      u.id,
    );

    const list = await api.usersAdminController.listUsers();
    expect(list).toHaveLength(0);
  }, 30000);
});
