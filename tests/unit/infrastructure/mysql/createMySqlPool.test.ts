import { createMySqlPool } from '../../../../src/infrastructure/mysql/createMySqlPool';

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
});
