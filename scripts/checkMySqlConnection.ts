import { CountryISO } from '../src/domain/enums/CountryISO';
import { getMySqlConnectionConfig } from '../src/infrastructure/config/environment';
import { createMySqlPool } from '../src/infrastructure/mysql/createMySqlPool';

async function checkConnection(countryISO: CountryISO): Promise<void> {
    const config = getMySqlConnectionConfig(countryISO);
    const pool = createMySqlPool(config);

    try {
        await pool.query('SELECT 1');
        console.log(`MySQL connection succeeded for ${countryISO} (${config.database})`);
    } finally {
        await pool.end();
    }
}

async function main(): Promise<void> {
    await checkConnection(CountryISO.PE);
    await checkConnection(CountryISO.CL);
}

void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`MySQL connection failed: ${message}`);
    process.exitCode = 1;
});
