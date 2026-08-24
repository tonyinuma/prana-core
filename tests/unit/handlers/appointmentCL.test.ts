import type { SQSEvent } from 'aws-lambda';

import { handler } from '../../../src/handlers/appointmentCL';

describe('appointmentCL handler composition', () => {
    const originalMySqlHost = process.env.MYSQL_HOST;
    const originalMySqlPort = process.env.MYSQL_PORT;
    const originalMySqlUser = process.env.MYSQL_USER;
    const originalMySqlPassword = process.env.MYSQL_PASSWORD;
    const originalMySqlDatabaseCl = process.env.MYSQL_DATABASE_CL;

    beforeAll(() => {
        process.env.MYSQL_HOST = '127.0.0.1';
        process.env.MYSQL_PORT = '3306';
        process.env.MYSQL_USER = 'prana';
        process.env.MYSQL_PASSWORD = 'local-password';
        process.env.MYSQL_DATABASE_CL = 'prana_cl';
    });

    afterAll(() => {
        restoreEnvironmentVariable('MYSQL_HOST', originalMySqlHost);
        restoreEnvironmentVariable('MYSQL_PORT', originalMySqlPort);
        restoreEnvironmentVariable('MYSQL_USER', originalMySqlUser);
        restoreEnvironmentVariable('MYSQL_PASSWORD', originalMySqlPassword);
        restoreEnvironmentVariable('MYSQL_DATABASE_CL', originalMySqlDatabaseCl);
    });

    test('configures and reuses the Chile handler', async () => {
        const emptyEvent = { Records: [] } as SQSEvent;

        await expect(handler(emptyEvent)).resolves.toEqual({ batchItemFailures: [] });
        await expect(handler(emptyEvent)).resolves.toEqual({ batchItemFailures: [] });
    });
});

function restoreEnvironmentVariable(name: string, value: string | undefined): void {
    if (value === undefined) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
}
