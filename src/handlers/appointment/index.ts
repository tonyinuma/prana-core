import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import { CreateAppointment } from '../../application/use-cases/CreateAppointment';
import { GetAppointmentsByInsured } from '../../application/use-cases/GetAppointmentsByInsured';
import { InMemoryAppointmentPublisher } from '../../infrastructure/memory/InMemoryAppointmentPublisher';
import { InMemoryAppointmentRepository } from '../../infrastructure/memory/InMemoryAppointmentRepository';
import { jsonResponse } from '../http/response';
import { handleCreateAppointment } from './create';
import { handleGetAppointmentsByInsured } from './getByInsured';

const appointmentRepository = new InMemoryAppointmentRepository();
const appointmentPublisher = new InMemoryAppointmentPublisher();
const createAppointment = new CreateAppointment(appointmentRepository, appointmentPublisher);
const getAppointmentsByInsured = new GetAppointmentsByInsured(appointmentRepository);

export async function handler(
    event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
    switch (event.routeKey) {
        case 'POST /appointments':
            return handleCreateAppointment(event, createAppointment);
        case 'GET /appointments/{insuredId}':
            return handleGetAppointmentsByInsured(event, getAppointmentsByInsured);
        default:
            return jsonResponse(404, { message: 'Route not found' });
    }
}
