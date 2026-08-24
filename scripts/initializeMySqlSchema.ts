import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { CountryISO } from '../src/domain/enums/CountryISO';
import { getMySqlConnectionConfig } from '../src/infrastructure/config/environment';
import { createMySqlPool } from '../src/infrastructure/mysql/createMySqlPool';

async function initializeSchema(): Promise<void> {
    const schemaPath = resolve('docker/mysql/schema.sql');
    const schema = await readFile(schemaPath, 'utf8');
    const statements = schema
        .split(';')
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);
    const config = getMySqlConnectionConfig(CountryISO.PE);
    const pool = createMySqlPool(config);

    try {
        for (const statement of statements) {
            await pool.query(statement);
        }
    } finally {
        await pool.end();
    }

    console.log('MySQL schema initialized for PE and CL');
}

void initializeSchema().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`MySQL schema initialization failed: ${message}`);
    process.exitCode = 1;
});
