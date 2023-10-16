import env from '../env';
import * as bcrypt from 'bcrypt';

const valueToHash = process.argv[2];
if (!valueToHash) {
  throw new Error(
    'Pass password value to hash like: node hashPassword.js <passwordValue>',
  );
}

const saltRounds = env.PASSWORD_SALT_ROUNDS;
if (!saltRounds) {
  throw new Error(
    'Environment variable PASSWORD_SALT_ROUNDS must be a positive integer',
  );
}

(async () => {
  const passwordHash = await bcrypt.hash(valueToHash, saltRounds);

  console.log(passwordHash);
})();
