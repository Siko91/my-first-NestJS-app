import { UsersService } from './users.service';
import { User } from './user.entity';
import { getControllerOrService } from '../utils/test/testingFunctions';
import { UsersModule } from './users.module';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    service = await getControllerOrService(UsersModule, UsersService, [User]);
  }, 30000);

  it('should be defined', async () => {
    expect(service).toBeDefined();
  }, 30000);

  it('Can create users', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Can find users by username or ID', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Can update fields of a user', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it("Cannot update User's isAdmin field, unless user is Admin", async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Does not store plaintext passwords in the DataBase', async () => {
    throw new Error('Not Implemented');
  }, 30000);
});
