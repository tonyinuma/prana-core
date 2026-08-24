import { getAppointmentsTableName } from '../../../../src/infrastructure/config/environment';

describe('getAppointmentsTableName', () => {
    const originalTableName = process.env.APPOINTMENTS_TABLE_NAME;

    afterEach(() => {
        if (originalTableName === undefined) {
            delete process.env.APPOINTMENTS_TABLE_NAME;
        } else {
            process.env.APPOINTMENTS_TABLE_NAME = originalTableName;
        }
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
});
