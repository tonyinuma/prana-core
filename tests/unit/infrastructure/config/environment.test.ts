import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import {
    getAppointmentsTableName,
    getAppointmentEventBusArn,
    getAppointmentTopicArn,
    getMySqlConnectionConfig,
} from '../../../../src/infrastructure/config/environment';

describe('infrastructure environment configuration', () => {
    const originalTableName = process.env.APPOINTMENTS_TABLE_NAME;
    const originalTopicArn = process.env.APPOINTMENT_TOPIC_ARN;
    const originalEventBusArn = process.env.APPOINTMENT_EVENT_BUS_ARN;
    const originalMySqlHost = process.env.MYSQL_HOST;
    const originalMySqlPort = process.env.MYSQL_PORT;
    const originalMySqlUser = process.env.MYSQL_USER;
    const originalMySqlPassword = process.env.MYSQL_PASSWORD;
    const originalMySqlDatabasePe = process.env.MYSQL_DATABASE_PE;
    const originalMySqlDatabaseCl = process.env.MYSQL_DATABASE_CL;

    afterEach(() => {
        restoreEnvironmentVariable('APPOINTMENTS_TABLE_NAME', originalTableName);
        restoreEnvironmentVariable('APPOINTMENT_TOPIC_ARN', originalTopicArn);
        restoreEnvironmentVariable('APPOINTMENT_EVENT_BUS_ARN', originalEventBusArn);
        restoreEnvironmentVariable('MYSQL_HOST', originalMySqlHost);
        restoreEnvironmentVariable('MYSQL_PORT', originalMySqlPort);
        restoreEnvironmentVariable('MYSQL_USER', originalMySqlUser);
        restoreEnvironmentVariable('MYSQL_PASSWORD', originalMySqlPassword);
        restoreEnvironmentVariable('MYSQL_DATABASE_PE', originalMySqlDatabasePe);
        restoreEnvironmentVariable('MYSQL_DATABASE_CL', originalMySqlDatabaseCl);
    });

    test('returns the configured table name', () => {
        process.env.APPOINTMENTS_TABLE_NAME = 'prana-core-test-appointments';

        expect(getAppointmentsTableName()).toBe('prana-core-test-appointments');
    });

    test.each([undefined, ''])('rejects a missing table name: %p', (tableName) => {
        if (tableName === undefined) {
            delete process.env.APPOINTMENTS_TABLE_NAME;
        } else {
            process.env.APPOINTMENTS_TABLE_NAME = tableName;
        }

        expect(() => getAppointmentsTableName()).toThrow(
            'APPOINTMENTS_TABLE_NAME environment variable is required',
        );
    });

    test('returns the configured topic ARN', () => {
        process.env.APPOINTMENT_TOPIC_ARN =
            'arn:aws:sns:us-east-1:123456789012:prana-core-test-appointment-topic';

        expect(getAppointmentTopicArn()).toBe(
            'arn:aws:sns:us-east-1:123456789012:prana-core-test-appointment-topic',
        );
    });

    test.each([undefined, ''])('rejects a missing topic ARN: %p', (topicArn) => {
        if (topicArn === undefined) {
            delete process.env.APPOINTMENT_TOPIC_ARN;
        } else {
            process.env.APPOINTMENT_TOPIC_ARN = topicArn;
        }

        expect(() => getAppointmentTopicArn()).toThrow(
            'APPOINTMENT_TOPIC_ARN environment variable is required',
        );
    });

    test('returns the configured appointment event bus ARN', () => {
        process.env.APPOINTMENT_EVENT_BUS_ARN =
            'arn:aws:events:us-east-1:123456789012:event-bus/prana-appointment-events';

        expect(getAppointmentEventBusArn()).toBe(
            'arn:aws:events:us-east-1:123456789012:event-bus/prana-appointment-events',
        );
    });

    test.each([undefined, ''])('rejects a missing event bus ARN: %p', (eventBusArn) => {
        if (eventBusArn === undefined) {
            delete process.env.APPOINTMENT_EVENT_BUS_ARN;
        } else {
            process.env.APPOINTMENT_EVENT_BUS_ARN = eventBusArn;
        }

        expect(() => getAppointmentEventBusArn()).toThrow(
            'APPOINTMENT_EVENT_BUS_ARN environment variable is required',
        );
    });

    test.each([
        [CountryISO.PE, 'prana_pe'],
        [CountryISO.CL, 'prana_cl'],
    ])('returns the MySQL configuration for %s', (countryISO, expectedDatabase) => {
        setValidMySqlEnvironment();

        expect(getMySqlConnectionConfig(countryISO)).toEqual({
            host: '127.0.0.1',
            port: 3306,
            user: 'prana',
            password: 'local-password',
            database: expectedDatabase,
        });
    });

    test.each(['not-a-number', '3.5', '0', '65536'])(
        'rejects an invalid MySQL port: %s',
        (port) => {
            setValidMySqlEnvironment();
            process.env.MYSQL_PORT = port;

            expect(() => getMySqlConnectionConfig(CountryISO.PE)).toThrow(
                'MYSQL_PORT environment variable must be an integer between 1 and 65535',
            );
        },
    );

    test('rejects a missing country database', () => {
        setValidMySqlEnvironment();
        delete process.env.MYSQL_DATABASE_PE;

        expect(() => getMySqlConnectionConfig(CountryISO.PE)).toThrow(
            'MYSQL_DATABASE_PE environment variable is required',
        );
    });
});

function setValidMySqlEnvironment(): void {
    process.env.MYSQL_HOST = '127.0.0.1';
    process.env.MYSQL_PORT = '3306';
    process.env.MYSQL_USER = 'prana';
    process.env.MYSQL_PASSWORD = 'local-password';
    process.env.MYSQL_DATABASE_PE = 'prana_pe';
    process.env.MYSQL_DATABASE_CL = 'prana_cl';
}

function restoreEnvironmentVariable(name: string, value: string | undefined): void {
    if (value === undefined) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
}
