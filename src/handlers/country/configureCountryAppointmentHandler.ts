import { EventBridgeClient } from '@aws-sdk/client-eventbridge';

import { ProcessCountryAppointment } from '../../application/use-cases/ProcessCountryAppointment';
import { CountryISO } from '../../domain/enums/CountryISO';
import {
    getAppointmentEventBusArn,
    getMySqlConnectionConfig,
} from '../../infrastructure/config/environment';
import { EventBridgeCompletionPublisher } from '../../infrastructure/eventbridge/EventBridgeCompletionPublisher';
import { createMySqlPool } from '../../infrastructure/mysql/createMySqlPool';
import { MySqlAppointmentRepository } from '../../infrastructure/mysql/MySqlAppointmentRepository';
import {
    createCountryAppointmentSqsHandler,
    type CountryAppointmentSqsHandler,
} from './createCountryAppointmentSqsHandler';

export function configureCountryAppointmentHandler(
    countryISO: CountryISO,
): CountryAppointmentSqsHandler {
    const pool = createMySqlPool(getMySqlConnectionConfig(countryISO));
    const repository = new MySqlAppointmentRepository(pool);
    const completionEventPublisher = new EventBridgeCompletionPublisher(
        new EventBridgeClient({}),
        getAppointmentEventBusArn(),
    );
    const processCountryAppointment = new ProcessCountryAppointment(
        repository,
        completionEventPublisher,
        countryISO,
    );

    return createCountryAppointmentSqsHandler(processCountryAppointment);
}
