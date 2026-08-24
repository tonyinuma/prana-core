import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';

import { ProcessCountryAppointment } from '../application/use-cases/ProcessCountryAppointment';
import { CountryISO } from '../domain/enums/CountryISO';
import { getMySqlConnectionConfig } from '../infrastructure/config/environment';
import { InMemoryCompletionEventPublisher } from '../infrastructure/memory/InMemoryCompletionEventPublisher';
import { createMySqlPool } from '../infrastructure/mysql/createMySqlPool';
import { MySqlAppointmentRepository } from '../infrastructure/mysql/MySqlAppointmentRepository';
import {
    createCountryAppointmentSqsHandler,
    type CountryAppointmentSqsHandler,
} from './country/createCountryAppointmentSqsHandler';

function configureAppointmentPeHandler(): CountryAppointmentSqsHandler {
    const pool = createMySqlPool(getMySqlConnectionConfig(CountryISO.PE));
    const repository = new MySqlAppointmentRepository(pool);
    const completionEventPublisher = new InMemoryCompletionEventPublisher();
    const processCountryAppointment = new ProcessCountryAppointment(
        repository,
        completionEventPublisher,
        CountryISO.PE,
    );

    return createCountryAppointmentSqsHandler(processCountryAppointment);
}

let configuredHandler: CountryAppointmentSqsHandler | undefined;

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
    configuredHandler ??= configureAppointmentPeHandler();

    return configuredHandler(event);
}
