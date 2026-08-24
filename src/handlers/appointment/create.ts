import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import type { CreateAppointmentDTO } from '../../application/dto/CreateAppointmentDTO';
import type { CreateAppointment } from '../../application/use-cases/CreateAppointment';
import { CountryISO } from '../../domain/enums/CountryISO';
import { DomainError } from '../../domain/errors/DomainError';
import { errorResponse } from '../http/errorResponse';
import { jsonResponse } from '../http/response';

type CreateAppointmentExecutor = Pick<CreateAppointment, 'execute'>;

export async function handleCreateAppointment(
    event: APIGatewayProxyEventV2,
    createAppointment: CreateAppointmentExecutor,
): Promise<APIGatewayProxyStructuredResultV2> {
    try {
        const input = parseRequestBody(event.body);
        const response = await createAppointment.execute(input);

        return jsonResponse(202, response);
    } catch (error) {
        return errorResponse(error);
    }
}

function parseRequestBody(body: string | undefined): CreateAppointmentDTO {
    if (body === undefined) {
        throw new DomainError('Request body is required');
    }

    let parsedBody: unknown;

    try {
        parsedBody = JSON.parse(body);
    } catch {
        throw new DomainError('Request body must contain valid JSON');
    }

    if (!isRecord(parsedBody)) {
        throw new DomainError('Request body must be a JSON object');
    }

    return {
        insuredId: parsedBody.insuredId as string,
        scheduleId: parsedBody.scheduleId as number,
        countryISO: parsedBody.countryISO as CountryISO,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
