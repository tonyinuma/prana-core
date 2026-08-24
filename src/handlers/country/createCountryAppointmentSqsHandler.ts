import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';

import type { ProcessCountryAppointment } from '../../application/use-cases/ProcessCountryAppointment';
import { logger as defaultLogger, type LogContext, type Logger } from '../../shared/logger/logger';
import { parseAppointmentRequest } from './parseAppointmentRequest';

type CountryAppointmentProcessor = Pick<ProcessCountryAppointment, 'execute'>;

export type CountryAppointmentSqsHandler = (event: SQSEvent) => Promise<SQSBatchResponse>;

export function createCountryAppointmentSqsHandler(
    processor: CountryAppointmentProcessor,
    logger: Logger = defaultLogger,
): CountryAppointmentSqsHandler {
    return async (event) => {
        const batchItemFailures: SQSBatchResponse['batchItemFailures'] = [];

        for (const record of event.Records) {
            let logContext: LogContext = { messageId: record.messageId };

            try {
                const input = parseAppointmentRequest(record.body);
                logContext = {
                    messageId: record.messageId,
                    appointmentId: input.appointmentId,
                    insuredId: input.insuredId,
                    countryISO: input.countryISO,
                };

                await processor.execute(input);
            } catch (error) {
                logger.error('appointment.country.processing.failed', error, logContext);
                batchItemFailures.push({ itemIdentifier: record.messageId });
            }
        }

        return { batchItemFailures };
    };
}
