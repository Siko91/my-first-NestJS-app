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
});
