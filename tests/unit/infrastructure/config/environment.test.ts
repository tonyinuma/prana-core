import {
    getAppointmentsTableName,
    getAppointmentTopicArn,
} from '../../../../src/infrastructure/config/environment';

describe('AWS resource environment configuration', () => {
    const originalTableName = process.env.APPOINTMENTS_TABLE_NAME;
    const originalTopicArn = process.env.APPOINTMENT_TOPIC_ARN;

    afterEach(() => {
        restoreEnvironmentVariable('APPOINTMENTS_TABLE_NAME', originalTableName);
        restoreEnvironmentVariable('APPOINTMENT_TOPIC_ARN', originalTopicArn);
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
});

function restoreEnvironmentVariable(name: string, value: string | undefined): void {
    if (value === undefined) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
}
