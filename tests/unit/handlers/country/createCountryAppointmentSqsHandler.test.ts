import type { SQSEvent, SQSRecord } from 'aws-lambda';

import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { createCountryAppointmentSqsHandler } from '../../../../src/handlers/country/createCountryAppointmentSqsHandler';
import { createMockLogger } from '../../../doubles/logger/createMockLogger';

describe('createCountryAppointmentSqsHandler', () => {
    test('processes valid records and reports only failed message identifiers', async () => {
        const execute = jest.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce('failure');
        const logger = createMockLogger();
        const handler = createCountryAppointmentSqsHandler({ execute }, logger);
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
        expect(logger.error).toHaveBeenCalledTimes(2);
        expect(logger.error).toHaveBeenNthCalledWith(
            1,
            'appointment.country.processing.failed',
            expect.any(Error),
            { messageId: 'message-2' },
        );
        expect(logger.error).toHaveBeenNthCalledWith(
            2,
            'appointment.country.processing.failed',
            'failure',
            {
                messageId: 'message-3',
                appointmentId: 'appointment-1',
                insuredId: '00123',
                countryISO: CountryISO.PE,
            },
        );
    });
});

function createSnsRecordBody(message: unknown): string {
    return JSON.stringify({ Message: JSON.stringify(message) });
}

function createSqsRecord(messageId: string, body: string): SQSRecord {
    return { messageId, body } as SQSRecord;
}
