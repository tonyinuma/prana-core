import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import { DomainError } from '../../domain/errors/DomainError';
import { logger } from '../../shared/logger/logger';
import { jsonResponse } from './response';

export function errorResponse(error: unknown): APIGatewayProxyStructuredResultV2 {
    if (error instanceof DomainError) {
        return jsonResponse(400, { message: error.message });
    }

    logger.error('appointment.http.request.failed', error);

    return jsonResponse(500, { message: 'Internal server error' });
}
