import { registerAs } from '@nestjs/config';
import { env } from '../utils/env';

export default registerAs('TOKEN', () => {
  return {
    ACCESS_TOKEN_SECRET: env('ACCESS_TOKEN_SECRET'),
    REFRESH_TOKEN_SECRET: env('REFRESH_TOKEN_SECRET'),
    ACCESS_TOKEN_EXPIRY: env('ACCESS_TOKEN_EXPIRY'),
    REFRESH_TOKEN_EXPIRY: env('REFRESH_TOKEN_EXPIRY'),
  };
});
