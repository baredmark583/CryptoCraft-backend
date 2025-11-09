import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured');
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  synchronize: false,
  entities: ['dist/**/*.entity.{js,ts}'],
  migrations: ['dist/migrations/*.{js,ts}'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});


