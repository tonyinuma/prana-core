import type { SQSEvent, SQSRecord } from 'aws-lambda';

import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { createCountryAppointmentSqsHandler } from '../../../../src/handlers/country/createCountryAppointmentSqsHandler';

describe('createCountryAppointmentSqsHandler', () => {
    test('processes valid records and reports only failed message identifiers', async () => {
        const execute = jest.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce('failure');
        const handler = createCountryAppointmentSqsHandler({ execute });
        const consoleError = jest.spyOn(console, 'error').mockImplementation();
        const validBody = createSnsRecordBody({
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });
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

function createSnsRecordBody(message: unknown): string {
    return JSON.stringify({ Message: JSON.stringify(message) });
}

function createSqsRecord(messageId: string, body: string): SQSRecord {
    return { messageId, body } as SQSRecord;
}
