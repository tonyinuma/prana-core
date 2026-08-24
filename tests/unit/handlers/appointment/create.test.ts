import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import type { CreateAppointmentResponseDTO } from '../../../../src/application/dto/CreateAppointmentResponseDTO';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { DomainError } from '../../../../src/domain/errors/DomainError';
import { handleCreateAppointment } from '../../../../src/handlers/appointment/create';

describe('handleCreateAppointment', () => {
    const successfulResponse: CreateAppointmentResponseDTO = {
        appointmentId: 'appointment-1',
        status: AppointmentStatus.Pending,
        message: 'Appointment scheduling is in process',
    };

    test('returns 202 and the use case response for a valid request', async () => {
        const createAppointment = {
            execute: jest.fn().mockResolvedValue(successfulResponse),
        };
        const event = eventWithBody({
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });

        const response = await handleCreateAppointment(event, createAppointment);

        expect(response.statusCode).toBe(202);
        expect(response.headers).toEqual({ 'content-type': 'application/json' });
        expect(JSON.parse(response.body ?? '')).toEqual(successfulResponse);
        expect(createAppointment.execute).toHaveBeenCalledWith({
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });
    });

    test('returns 400 when the request has no body', async () => {
        const createAppointment = { execute: jest.fn() };

        const response = await handleCreateAppointment(
            {} as APIGatewayProxyEventV2,
            createAppointment,
        );

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body ?? '')).toEqual({ message: 'Request body is required' });
        expect(createAppointment.execute).not.toHaveBeenCalled();
    });

    test('returns 400 when the body is not valid JSON', async () => {
        const createAppointment = { execute: jest.fn() };

        const response = await handleCreateAppointment(
            { body: '{invalid' } as APIGatewayProxyEventV2,
            createAppointment,
        );

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body ?? '')).toEqual({
            message: 'Request body must contain valid JSON',
        });
        expect(createAppointment.execute).not.toHaveBeenCalled();
    });

    test.each(['text', null, []])(
        'returns 400 when the JSON body is not an object: %p',
        async (body) => {
            const createAppointment = { execute: jest.fn() };

            const response = await handleCreateAppointment(eventWithBody(body), createAppointment);

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.body ?? '')).toEqual({
                message: 'Request body must be a JSON object',
            });
            expect(createAppointment.execute).not.toHaveBeenCalled();
        },
    );

    test('translates a domain error to 400', async () => {
        const createAppointment = {
            execute: jest.fn().mockRejectedValue(new DomainError('countryISO must be PE or CL')),
        };

        const response = await handleCreateAppointment(
            eventWithBody({ insuredId: '00123', scheduleId: 100, countryISO: 'AR' }),
            createAppointment,
        );

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body ?? '')).toEqual({ message: 'countryISO must be PE or CL' });
    });

    test('hides unexpected error details and returns 500', async () => {
        const unexpectedError = new Error('database password must not be exposed');
        const createAppointment = {
            execute: jest.fn().mockRejectedValue(unexpectedError),
        };
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        const response = await handleCreateAppointment(
            eventWithBody({ insuredId: '00123', scheduleId: 100, countryISO: 'PE' }),
            createAppointment,
        );

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body ?? '')).toEqual({ message: 'Internal server error' });
        expect(consoleError).toHaveBeenCalledWith(
            'Unexpected error while processing HTTP request',
            unexpectedError,
        );
    });
});

function eventWithBody(body: unknown): APIGatewayProxyEventV2 {
    return {
        body: JSON.stringify(body),
    } as APIGatewayProxyEventV2;
}
