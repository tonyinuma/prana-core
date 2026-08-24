import { CountryISO } from '../../domain/enums/CountryISO';

export interface MySqlConnectionConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export function getAppointmentsTableName(): string {
    return getRequiredEnvironmentVariable('APPOINTMENTS_TABLE_NAME');
}

export function getAppointmentTopicArn(): string {
    return getRequiredEnvironmentVariable('APPOINTMENT_TOPIC_ARN');
}

export function getAppointmentEventBusArn(): string {
    return getRequiredEnvironmentVariable('APPOINTMENT_EVENT_BUS_ARN');
}

export function getMySqlConnectionConfig(countryISO: CountryISO): MySqlConnectionConfig {
    const databaseVariable =
        countryISO === CountryISO.PE ? 'MYSQL_DATABASE_PE' : 'MYSQL_DATABASE_CL';

    return {
        host: getRequiredEnvironmentVariable('MYSQL_HOST'),
        port: getMySqlPort(),
        user: getRequiredEnvironmentVariable('MYSQL_USER'),
        password: getRequiredEnvironmentVariable('MYSQL_PASSWORD'),
        database: getRequiredEnvironmentVariable(databaseVariable),
    };
}

function getMySqlPort(): number {
    const port = Number(getRequiredEnvironmentVariable('MYSQL_PORT'));

    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
        throw new Error('MYSQL_PORT environment variable must be an integer between 1 and 65535');
    }

    return port;
}

function getRequiredEnvironmentVariable(name: string): string {
    const value = process.env[name];

    if (value === undefined || value.length === 0) {
        throw new Error(`${name} environment variable is required`);
    }

    return value;
}
