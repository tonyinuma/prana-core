import { createPool, type Pool } from 'mysql2/promise';

import type { MySqlConnectionConfig } from '../config/environment';

export function createMySqlPool(config: MySqlConnectionConfig): Pool {
    return createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 2,
        queueLimit: 0,
    });
}
