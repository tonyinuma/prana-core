import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';

import type { ProcessCountryAppointment } from '../../application/use-cases/ProcessCountryAppointment';
import { parseAppointmentRequest } from './parseAppointmentRequest';

type CountryAppointmentProcessor = Pick<ProcessCountryAppointment, 'execute'>;

export type CountryAppointmentSqsHandler = (event: SQSEvent) => Promise<SQSBatchResponse>;

export function createCountryAppointmentSqsHandler(
    processor: CountryAppointmentProcessor,
): CountryAppointmentSqsHandler {
    return async (event) => {
        const batchItemFailures: SQSBatchResponse['batchItemFailures'] = [];

        for (const record of event.Records) {
            try {
                await processor.execute(parseAppointmentRequest(record.body));
            } catch (error) {
                console.error('Failed to process country appointment message', {
                    messageId: record.messageId,
                    error: getErrorMessage(error),
                });
                batchItemFailures.push({ itemIdentifier: record.messageId });
            }
        }

        return { batchItemFailures };
    };
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
