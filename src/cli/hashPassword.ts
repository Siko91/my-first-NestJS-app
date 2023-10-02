import env from '../env';
import * as bcrypt from 'bcrypt';

(async () => {
  const saltRounds = env.PASSWORD_SALT_ROUNDS;
  const passwordHash = await bcrypt.hash('password', saltRounds);

  console.log(passwordHash);
})();
