import { cleanEnv, num, port, str } from 'envalid';

import * as dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  dotenv.configDotenv({ path: '.env.dev' });
}

/**
 * TODO: Consider looking for a way for the environment to be treated like a dependency injection, instead of like the Singleton that it currently is.
 *       Doing so would allow the running of multiple concurrent servers inside the same process.
 *       While that would be pretty pointless for the application itself, it would allow for Integration level test automation to run in parallel (without using virtualization or containers)
 *       As this is written currently, this Singleton is a Test Automation bottleneck.
 *       Right now he only way to achieve concurrent integration tests is via running separate processes in separate isolated environments (which is resource intensive and slow).
 */
export const parseEnv = (rawEnv: any) => {
  const env = cleanEnv(rawEnv, {
    NODE_ENV: str(),
    PORT: port(),
    SQLITE_DB_NAME: str({ default: 'dev.sqlite' }),
    JWT_SECRET: str(),
    PASSWORD_SALT_ROUNDS: num({ default: 11 }),
  });

  return env;
};

console.log(`[↗] Loading configuration`);
export default parseEnv({
  ...process.env,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
});
console.log('[✓] Configuration loaded');
