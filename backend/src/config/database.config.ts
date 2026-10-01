import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'nexalab',
  password: process.env.DB_PASSWORD ?? 'nexalab_secret',
  database: process.env.DB_DATABASE ?? 'nexalab',
  synchronize: (process.env.DB_SYNC ?? 'true') === 'true',
  logging: (process.env.DB_LOGGING ?? 'false') === 'true',
}));
