import { readFileSync } from 'node:fs';

import { createMySqlPool } from '../../../../src/infrastructure/mysql/createMySqlPool';

jest.mock('node:fs', () => ({
    readFileSync: jest.fn(),
}));

const mockReadFileSync = jest.mocked(readFileSync);

describe('createMySqlPool', () => {
    test('creates a lazy promise-based connection pool', async () => {
        const pool = createMySqlPool({
            host: '127.0.0.1',
            port: 3306,
            user: 'prana',
            password: 'local-password',
            database: 'prana_pe',
        });

        expect(pool.execute).toEqual(expect.any(Function));
        expect(pool.query).toEqual(expect.any(Function));

        await pool.end();
    });

    test('creates a pool that verifies the configured TLS certificate', async () => {
        mockReadFileSync.mockReturnValue('test-ca-certificate');

        const pool = createMySqlPool({
            host: 'mysql.example.com',
            port: 3306,
            user: 'prana',
            password: 'external-password',
            database: 'prana_pe',
            tls: {
                caFilePath: 'certificates/aiven-ca.pem',
            },
        });

        expect(pool.execute).toEqual(expect.any(Function));
        expect(mockReadFileSync).toHaveBeenCalledWith('certificates/aiven-ca.pem', 'utf8');

        await pool.end();
    });
});
