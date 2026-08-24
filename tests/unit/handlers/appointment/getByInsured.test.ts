import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import type { AppointmentResponseDTO } from '../../../../src/application/dto/AppointmentResponseDTO';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { DomainError } from '../../../../src/domain/errors/DomainError';
import { handleGetAppointmentsByInsured } from '../../../../src/handlers/appointment/getByInsured';

describe('handleGetAppointmentsByInsured', () => {
    test('returns 200 and the appointments from the use case', async () => {
        const appointments: AppointmentResponseDTO[] = [
            {
                appointmentId: 'appointment-1',
                insuredId: '00123',
                scheduleId: 100,
                countryISO: CountryISO.PE,
                status: AppointmentStatus.Pending,
                createdAt: '2026-08-23T18:00:00.000Z',
                updatedAt: '2026-08-23T18:00:00.000Z',
            },
        ];
        const getAppointmentsByInsured = {
            execute: jest.fn().mockResolvedValue(appointments),
        };
        const event = {
            pathParameters: { insuredId: '00123' },
        } as unknown as APIGatewayProxyEventV2;

        const response = await handleGetAppointmentsByInsured(event, getAppointmentsByInsured);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body ?? '')).toEqual(appointments);
        expect(getAppointmentsByInsured.execute).toHaveBeenCalledWith('00123');
    });

    test('returns 400 when the path parameter is missing', async () => {
        const getAppointmentsByInsured = { execute: jest.fn() };

        const response = await handleGetAppointmentsByInsured(
            {} as APIGatewayProxyEventV2,
            getAppointmentsByInsured,
        );

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body ?? '')).toEqual({
            message: 'insuredId path parameter is required',
        });
        expect(getAppointmentsByInsured.execute).not.toHaveBeenCalled();
    });

    test('translates an invalid insuredId domain error to 400', async () => {
        const getAppointmentsByInsured = {
            execute: jest
                .fn()
                .mockRejectedValue(new DomainError('insuredId must contain exactly 5 digits')),
        };
        const event = {
            pathParameters: { insuredId: '1234' },
        } as unknown as APIGatewayProxyEventV2;

        const response = await handleGetAppointmentsByInsured(event, getAppointmentsByInsured);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body ?? '')).toEqual({
            message: 'insuredId must contain exactly 5 digits',
        });
    });
});
