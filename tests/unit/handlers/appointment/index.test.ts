import type { APIGatewayProxyEventV2, SQSEvent, SQSRecord } from 'aws-lambda';

import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import {
    createAppointmentPublisher,
    createAppointmentRepository,
    handler,
} from '../../../../src/handlers/appointment';
import { DynamoAppointmentRepository } from '../../../../src/infrastructure/dynamodb/DynamoAppointmentRepository';
import { InMemoryAppointmentPublisher } from '../../../../src/infrastructure/memory/InMemoryAppointmentPublisher';
import { InMemoryAppointmentRepository } from '../../../../src/infrastructure/memory/InMemoryAppointmentRepository';
import { SnsAppointmentPublisher } from '../../../../src/infrastructure/sns/SnsAppointmentPublisher';

describe('appointment HTTP handler', () => {
    const originalIsOffline = process.env.IS_OFFLINE;
    const originalTableName = process.env.APPOINTMENTS_TABLE_NAME;
    const originalTopicArn = process.env.APPOINTMENT_TOPIC_ARN;

    beforeAll(() => {
        process.env.IS_OFFLINE = 'true';
    });

    afterAll(() => {
        restoreEnvironmentVariable('IS_OFFLINE', originalIsOffline);
        restoreEnvironmentVariable('APPOINTMENTS_TABLE_NAME', originalTableName);
        restoreEnvironmentVariable('APPOINTMENT_TOPIC_ARN', originalTopicArn);
    });

    test('routes POST, completion SQS, and GET through shared local dependencies', async () => {
        const firstCreateResponse = await handler(
            httpEvent('POST /appointments', {
                body: JSON.stringify({
                    insuredId: '00701',
                    scheduleId: 100,
                    countryISO: CountryISO.PE,
                }),
            }),
        );
        await handler(
            httpEvent('POST /appointments', {
                body: JSON.stringify({
                    insuredId: '00702',
                    scheduleId: 200,
                    countryISO: CountryISO.CL,
                }),
            }),
        );
        const createdAppointment = JSON.parse(firstCreateResponse.body ?? '') as {
            appointmentId: string;
        };

        const completionResponse = await handler(
            completionSqsEvent('message-1', {
                appointmentId: createdAppointment.appointmentId,
                insuredId: '00701',
                countryISO: CountryISO.PE,
            }),
        );
        const reusedCompletionResponse = await handler({ Records: [] } as unknown as SQSEvent);

        const getResponse = await handler(
            httpEvent('GET /appointments/{insuredId}', {
                pathParameters: { insuredId: '00701' },
            }),
        );

        expect(firstCreateResponse.statusCode).toBe(202);
        expect(completionResponse).toEqual({ batchItemFailures: [] });
        expect(reusedCompletionResponse).toEqual({ batchItemFailures: [] });
        expect(getResponse.statusCode).toBe(200);
        expect(JSON.parse(getResponse.body ?? '')).toEqual([
            expect.objectContaining({
                insuredId: '00701',
                scheduleId: 100,
                countryISO: CountryISO.PE,
                status: AppointmentStatus.Completed,
                updatedAt: '2026-08-24T18:00:00.000Z',
            }),
        ]);
    });

    test('returns 404 for an unknown route', async () => {
        const response = await handler(httpEvent('DELETE /appointments'));

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body ?? '')).toEqual({ message: 'Route not found' });
    });

    test('selects AWS adapters or in-memory adapters according to the environment', () => {
        process.env.IS_OFFLINE = 'true';
        expect(createAppointmentRepository()).toBeInstanceOf(InMemoryAppointmentRepository);
        expect(createAppointmentPublisher()).toBeInstanceOf(InMemoryAppointmentPublisher);

        delete process.env.IS_OFFLINE;
        process.env.APPOINTMENTS_TABLE_NAME = 'prana-core-test-appointments';
        process.env.APPOINTMENT_TOPIC_ARN =
            'arn:aws:sns:us-east-1:123456789012:prana-core-test-appointment-topic';
        expect(createAppointmentRepository()).toBeInstanceOf(DynamoAppointmentRepository);
        expect(createAppointmentPublisher()).toBeInstanceOf(SnsAppointmentPublisher);
    });
});

function httpEvent(
    routeKey: string,
    overrides: Partial<APIGatewayProxyEventV2> = {},
): APIGatewayProxyEventV2 {
    return {
        routeKey,
        ...overrides,
    } as APIGatewayProxyEventV2;
}

function completionSqsEvent(
    messageId: string,
    detail: { appointmentId: string; insuredId: string; countryISO: CountryISO },
): SQSEvent {
    return {
        Records: [
            {
                messageId,
                body: JSON.stringify({
                    source: 'prana.appointments',
                    'detail-type': 'AppointmentCompleted',
                    time: '2026-08-24T18:00:00.000Z',
                    detail,
                }),
            } as SQSRecord,
        ],
    } as SQSEvent;
}

function restoreEnvironmentVariable(name: string, value: string | undefined): void {
    if (value === undefined) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
}
