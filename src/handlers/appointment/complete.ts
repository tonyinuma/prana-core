import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';

import type { CompleteAppointment } from '../../application/use-cases/CompleteAppointment';
import { logger as defaultLogger, type LogContext, type Logger } from '../../shared/logger/logger';
import { parseAppointmentCompletedEvent } from './parseAppointmentCompletedEvent';

type AppointmentCompleter = Pick<CompleteAppointment, 'execute'>;

export type CompleteAppointmentSqsHandler = (event: SQSEvent) => Promise<SQSBatchResponse>;

export function createCompleteAppointmentSqsHandler(
    completeAppointment: AppointmentCompleter,
    logger: Logger = defaultLogger,
): CompleteAppointmentSqsHandler {
    return async (event) => {
        const batchItemFailures: SQSBatchResponse['batchItemFailures'] = [];

        for (const record of event.Records) {
            let logContext: LogContext = { messageId: record.messageId };

            try {
                const input = parseAppointmentCompletedEvent(record.body);
                logContext = {
                    messageId: record.messageId,
                    appointmentId: input.appointmentId,
                    insuredId: input.insuredId,
                };

                await completeAppointment.execute(input);
            } catch (error) {
                logger.error('appointment.completion.failed', error, logContext);
                batchItemFailures.push({ itemIdentifier: record.messageId });
            }
        }

        return { batchItemFailures };
    };
}
