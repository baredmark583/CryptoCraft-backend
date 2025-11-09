"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
dotenv.config({ path: process.cwd() + '/.env' });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
}
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    url: databaseUrl,
    synchronize: false,
    entities: ['dist/**/*.entity.{js,ts}'],
    migrations: ['dist/migrations/*.{js,ts}'],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});
//# sourceMappingURL=data-source.js.map