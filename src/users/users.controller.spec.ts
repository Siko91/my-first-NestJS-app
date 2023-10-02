import { randomUserDto, initTestApi } from '../utils/test/testingFunctions';
import CustomAssert from '../utils/test/customAssert';

describe('UsersController', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.authController).toBeDefined();
    expect(api.usersController).toBeDefined();
  }, 30000);

  it('Can update fields of a user', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    const user = await api.authController.register(u_req);

    expect(user.isAdmin).toBe(false);

    const u2_req = randomUserDto();
    await api.usersController.updateProfile({ user }, user.id, {
      address: u2_req.address,
      email: u2_req.email,
      fullName: u2_req.fullName,
      phone: u2_req.phone,
      username: u2_req.username,
    });

    const userAfter = await api.usersController.getUser(
      { user: { ...user, isAdmin: true } },
      user.id,
    );

    expect(userAfter.email).toBe(u2_req.email);
    expect(userAfter.phone).toBe(u2_req.phone);
    expect(userAfter.address).toBe(u2_req.address);
    expect(userAfter.fullName).toBe(u2_req.fullName);
    expect(userAfter.username).toBe(u2_req.username);

    expect(userAfter.isAdmin).toBe(false);
  }, 30000);

  it("Cannot update own's isAdmin field, unless user is Admin", async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    const user = await api.authController.register(u_req);

    const err = await CustomAssert.throwsAsync(() =>
      api.usersController.updateProfile(
        { user: { ...user, isAdmin: false } },
        user.id,
        { isAdmin: true }, // this should be ignored
      ),
    );
    expect(err.message).toBe(
      'Only Admin can change the isAdmin property of a user',
    );
    const userAfter1 = await api.usersController.getUser(
      { user: { ...user, isAdmin: true } },
      user.id,
    );

    expect(userAfter1.isAdmin).toBe(false);

    await api.usersController.updateProfile(
      { user: { ...user, isAdmin: true } },
      user.id,
      { isAdmin: true }, // this should NOT be ignored
    );
    const userAfter2 = await api.usersController.getUser(
      { user: { ...user, isAdmin: true } },
      user.id,
    );

    expect(userAfter2.isAdmin).toBe(true);
  }, 30000);

  it('Does not store plaintext passwords in the DataBase', async () => {
    const api = await initTestApi();

    const u_req = randomUserDto();
    const user = await api.authController.register(u_req);

    expect(user).not.toHaveProperty('password');
    expect(user).toHaveProperty('passwordHash');
    expect(user.passwordHash).not.toBe(u_req.password);

    const userAfter = await api.usersController.getUser(
      { user: { ...user, isAdmin: true } },
      user.id,
    );

    expect(userAfter).not.toHaveProperty('password');
    expect(userAfter).toHaveProperty('passwordHash');
    expect(userAfter.passwordHash).not.toBe(u_req.password);
  }, 30000);
});
