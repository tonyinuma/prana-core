import { readFileSync } from 'node:fs';

import { createPool, type Pool } from 'mysql2/promise';

import type { MySqlConnectionConfig } from '../config/environment';

export function createMySqlPool(config: MySqlConnectionConfig): Pool {
    return createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ...(config.tls === undefined
            ? {}
            : {
                  ssl: {
                      ca: readFileSync(config.tls.caFilePath, 'utf8'),
                      rejectUnauthorized: true,
                  },
              }),
        waitForConnections: true,
        connectionLimit: 2,
        queueLimit: 0,
    });
}
