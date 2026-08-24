import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';

import { CreateAppointment } from '../../application/use-cases/CreateAppointment';
import { GetAppointmentsByInsured } from '../../application/use-cases/GetAppointmentsByInsured';
import type { AppointmentPublisher } from '../../application/ports/AppointmentPublisher';
import type { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import {
    getAppointmentsTableName,
    getAppointmentTopicArn,
} from '../../infrastructure/config/environment';
import { DynamoAppointmentRepository } from '../../infrastructure/dynamodb/DynamoAppointmentRepository';
import { InMemoryAppointmentPublisher } from '../../infrastructure/memory/InMemoryAppointmentPublisher';
import { InMemoryAppointmentRepository } from '../../infrastructure/memory/InMemoryAppointmentRepository';
import { SnsAppointmentPublisher } from '../../infrastructure/sns/SnsAppointmentPublisher';
import { jsonResponse } from '../http/response';
import { handleCreateAppointment } from './create';
import { handleGetAppointmentsByInsured } from './getByInsured';

type AppointmentHttpHandler = (
    event: APIGatewayProxyEventV2,
) => Promise<APIGatewayProxyStructuredResultV2>;

export function createAppointmentHttpHandler(
    appointmentRepository: AppointmentRepository,
    appointmentPublisher: AppointmentPublisher,
): AppointmentHttpHandler {
    const createAppointment = new CreateAppointment(appointmentRepository, appointmentPublisher);
    const getAppointmentsByInsured = new GetAppointmentsByInsured(appointmentRepository);

    return async (event) => {
        switch (event.routeKey) {
            case 'POST /appointments':
                return handleCreateAppointment(event, createAppointment);
            case 'GET /appointments/{insuredId}':
                return handleGetAppointmentsByInsured(event, getAppointmentsByInsured);
            default:
                return jsonResponse(404, { message: 'Route not found' });
        }
    };
}

export function createAppointmentRepository(): AppointmentRepository {
    if (process.env.IS_OFFLINE === 'true') {
        return new InMemoryAppointmentRepository();
    }

    const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

    return new DynamoAppointmentRepository(documentClient, getAppointmentsTableName());
}

export function createAppointmentPublisher(): AppointmentPublisher {
    if (process.env.IS_OFFLINE === 'true') {
        return new InMemoryAppointmentPublisher();
    }

    return new SnsAppointmentPublisher(new SNSClient({}), getAppointmentTopicArn());
}

let configuredHandler: AppointmentHttpHandler | undefined;

export async function handler(
    event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
    configuredHandler ??= createAppointmentHttpHandler(
        createAppointmentRepository(),
        createAppointmentPublisher(),
    );

    return configuredHandler(event);
}
