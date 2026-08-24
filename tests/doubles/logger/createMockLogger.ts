import type { Logger } from '../../../src/shared/logger/logger';

export function createMockLogger(): jest.Mocked<Logger> {
    return {
        info: jest.fn(),
        error: jest.fn(),
    };
}
