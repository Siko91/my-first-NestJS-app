import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should be able to register a user', () => {
    throw new Error('Not Implemented');
  });

  it('Should be able to sign in with existing user', () => {
    throw new Error('Not Implemented');
  });

  it('JSON Web Tokens should contain some User Information', () => {
    throw new Error('Not Implemented');
  });

  it('Should be able to sign in with multiple tokens (presumably multiple devices)', () => {
    throw new Error('Not Implemented');
  });

  it('Should be able to invalidate all tokens at the same time', () => {
    throw new Error('Not Implemented');
  });

  it('Only a logged in user should be able to pass the standard Auth Middleware', () => {
    throw new Error('Not Implemented');
  });

  it('Only an admin should be able to pass the Admin Auth Middleware', () => {
    throw new Error('Not Implemented');
  });
});
