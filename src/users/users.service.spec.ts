import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Can create users', () => {
    throw new Error('Not Implemented');
  });

  it('Can find users by username or ID', () => {
    throw new Error('Not Implemented');
  });

  it('Can update fields of a user', () => {
    throw new Error('Not Implemented');
  });

  it("Cannot update User's isAdmin field, unless user is Admin", () => {
    throw new Error('Not Implemented');
  });

  it('Does not store plaintext passwords in the DataBase', () => {
    throw new Error('Not Implemented');
  });
});
