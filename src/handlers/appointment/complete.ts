import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';

import type { CompleteAppointment } from '../../application/use-cases/CompleteAppointment';
import { parseAppointmentCompletedEvent } from './parseAppointmentCompletedEvent';

type AppointmentCompleter = Pick<CompleteAppointment, 'execute'>;

export type CompleteAppointmentSqsHandler = (event: SQSEvent) => Promise<SQSBatchResponse>;

export function createCompleteAppointmentSqsHandler(
    completeAppointment: AppointmentCompleter,
): CompleteAppointmentSqsHandler {
    return async (event) => {
        const batchItemFailures: SQSBatchResponse['batchItemFailures'] = [];

        for (const record of event.Records) {
            try {
                await completeAppointment.execute(parseAppointmentCompletedEvent(record.body));
            } catch (error) {
                console.error('Failed to complete appointment', {
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
