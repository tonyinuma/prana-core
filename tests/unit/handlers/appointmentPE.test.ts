import type { SQSEvent } from 'aws-lambda';

import { handler } from '../../../src/handlers/appointmentPE';

describe('appointmentPE handler composition', () => {
    const originalMySqlHost = process.env.MYSQL_HOST;
    const originalMySqlPort = process.env.MYSQL_PORT;
    const originalMySqlUser = process.env.MYSQL_USER;
    const originalMySqlPassword = process.env.MYSQL_PASSWORD;
    const originalMySqlDatabasePe = process.env.MYSQL_DATABASE_PE;
    const originalEventBusArn = process.env.APPOINTMENT_EVENT_BUS_ARN;

    beforeAll(() => {
        process.env.MYSQL_HOST = '127.0.0.1';
        process.env.MYSQL_PORT = '3306';
        process.env.MYSQL_USER = 'prana';
        process.env.MYSQL_PASSWORD = 'local-password';
        process.env.MYSQL_DATABASE_PE = 'prana_pe';
        process.env.APPOINTMENT_EVENT_BUS_ARN =
            'arn:aws:events:us-east-1:123456789012:event-bus/prana-appointment-events';
    });

    afterAll(() => {
        restoreEnvironmentVariable('MYSQL_HOST', originalMySqlHost);
        restoreEnvironmentVariable('MYSQL_PORT', originalMySqlPort);
        restoreEnvironmentVariable('MYSQL_USER', originalMySqlUser);
        restoreEnvironmentVariable('MYSQL_PASSWORD', originalMySqlPassword);
        restoreEnvironmentVariable('MYSQL_DATABASE_PE', originalMySqlDatabasePe);
        restoreEnvironmentVariable('APPOINTMENT_EVENT_BUS_ARN', originalEventBusArn);
    });

    test('configures and reuses the Peru handler', async () => {
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
