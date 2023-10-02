import { cleanEnv, num, port, str } from 'envalid';

import * as dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  dotenv.configDotenv({ path: '.env.dev' });
}

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
