import env from './env';

describe('Env', () => {
  beforeEach(async () => {
    // nothing
  }, 30000);

  it('NODE_ENV should be "test"', async () => {
    expect(env.NODE_ENV).toBe('test');
  }, 30000);
});
