import type { AppointmentStatus } from '../../domain/enums/AppointmentStatus';
import type { CountryISO } from '../../domain/enums/CountryISO';

export interface LogContext {
    appointmentId?: string;
    insuredId?: string;
    countryISO?: CountryISO;
    status?: AppointmentStatus;
    messageId?: string;
}

export interface Logger {
    info(event: string, context?: LogContext): void;
    error(event: string, error: unknown, context?: LogContext): void;
}

class JsonConsoleLogger implements Logger {
    info(event: string, context: LogContext = {}): void {
        console.log(
            JSON.stringify({
                ...context,
                timestamp: new Date().toISOString(),
                level: 'INFO',
                event,
            }),
        );
    }

    error(event: string, error: unknown, context: LogContext = {}): void {
        console.error(
            JSON.stringify({
                ...context,
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                event,
                errorType: getErrorType(error),
            }),
        );
    }
}

function getErrorType(error: unknown): string {
    return error instanceof Error ? error.name : 'UnknownError';
}

export const logger: Logger = new JsonConsoleLogger();
