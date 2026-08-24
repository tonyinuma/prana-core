import type { ProcessCountryAppointmentInput } from '../../application/use-cases/ProcessCountryAppointment';
import { CountryISO } from '../../domain/enums/CountryISO';

export function parseAppointmentRequest(recordBody: string): ProcessCountryAppointmentInput {
    const notification = parseJsonObject(recordBody, 'SQS record body');
    const messageValue = notification.Message;

    if (typeof messageValue !== 'string') {
        throw new Error('SNS notification Message must be a string');
    }

    const message = parseJsonObject(messageValue, 'SNS Message');

    return {
        appointmentId: getRequiredString(message, 'appointmentId'),
        insuredId: getRequiredString(message, 'insuredId'),
        scheduleId: getRequiredNumber(message, 'scheduleId'),
        countryISO: getCountryISO(message),
    };
}

function parseJsonObject(json: string, label: string): Record<string, unknown> {
    let value: unknown;

    try {
        value = JSON.parse(json);
    } catch {
        throw new Error(`${label} must be valid JSON`);
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(`${label} must contain a JSON object`);
    }

    return value as Record<string, unknown>;
}

function getRequiredString(message: Record<string, unknown>, field: string): string {
    const value = message[field];

    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`${field} must be a non-empty string`);
    }

    return value;
}

function getRequiredNumber(message: Record<string, unknown>, field: string): number {
    const value = message[field];

    if (typeof value !== 'number') {
        throw new Error(`${field} must be a number`);
    }

    return value;
}

function getCountryISO(message: Record<string, unknown>): CountryISO {
    const value = getRequiredString(message, 'countryISO');

    if (!Object.values(CountryISO).includes(value as CountryISO)) {
        throw new Error('countryISO must be PE or CL');
    }

    return value as CountryISO;
}
