import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import type { GetAppointmentsByInsured } from '../../application/use-cases/GetAppointmentsByInsured';
import { DomainError } from '../../domain/errors/DomainError';
import { errorResponse } from '../http/errorResponse';
import { jsonResponse } from '../http/response';

type GetAppointmentsByInsuredExecutor = Pick<GetAppointmentsByInsured, 'execute'>;

export async function handleGetAppointmentsByInsured(
    event: APIGatewayProxyEventV2,
    getAppointmentsByInsured: GetAppointmentsByInsuredExecutor,
): Promise<APIGatewayProxyStructuredResultV2> {
    try {
        const insuredId = event.pathParameters?.insuredId;

        if (insuredId === undefined) {
            throw new DomainError('insuredId path parameter is required');
        }

        const response = await getAppointmentsByInsured.execute(insuredId);

        return jsonResponse(200, response);
    } catch (error) {
        return errorResponse(error);
    }
}
