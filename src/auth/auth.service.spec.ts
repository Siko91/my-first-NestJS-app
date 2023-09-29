import { AuthService } from './auth.service';
import {  getControllerOrService } from '../utils/test/testingFunctions';
import { User } from '../users/user.entity';
import { AuthModule } from './auth.module';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    service = await getControllerOrService(AuthModule, AuthService, [User]);
  }, 30000);

  it('should be defined', async () => {
    expect(service).toBeDefined();
  }, 30000);
});
