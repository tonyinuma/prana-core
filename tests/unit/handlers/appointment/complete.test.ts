import type { SQSEvent, SQSRecord } from 'aws-lambda';

import { createCompleteAppointmentSqsHandler } from '../../../../src/handlers/appointment/complete';

describe('createCompleteAppointmentSqsHandler', () => {
    test('processes valid records and reports only failed message identifiers', async () => {
        const execute = jest.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce('failure');
        const handler = createCompleteAppointmentSqsHandler({ execute });
        const consoleError = jest.spyOn(console, 'error').mockImplementation();
        const validBody = createEventBridgeBody();
        const event = {
            Records: [
                createSqsRecord('message-1', validBody),
                createSqsRecord('message-2', 'invalid-json'),
                createSqsRecord('message-3', validBody),
            ],
        } as SQSEvent;

        const response = await handler(event);

        expect(execute).toHaveBeenCalledTimes(2);
        expect(response).toEqual({
            batchItemFailures: [{ itemIdentifier: 'message-2' }, { itemIdentifier: 'message-3' }],
        });
        expect(consoleError).toHaveBeenCalledTimes(2);
    });
});

function createEventBridgeBody(): string {
    return JSON.stringify({
        source: 'prana.appointments',
        'detail-type': 'AppointmentCompleted',
        time: '2026-08-24T18:00:00.000Z',
        detail: {
            appointmentId: 'appointment-1',
            insuredId: '00123',
            countryISO: 'PE',
        },
    });
}

function createSqsRecord(messageId: string, body: string): SQSRecord {
    return { messageId, body } as SQSRecord;
}
