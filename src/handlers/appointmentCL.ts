import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';

import { CountryISO } from '../domain/enums/CountryISO';
import type { CountryAppointmentSqsHandler } from './country/createCountryAppointmentSqsHandler';
import { configureCountryAppointmentHandler } from './country/configureCountryAppointmentHandler';

let configuredHandler: CountryAppointmentSqsHandler | undefined;

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
    configuredHandler ??= configureCountryAppointmentHandler(CountryISO.CL);

    return configuredHandler(event);
}
