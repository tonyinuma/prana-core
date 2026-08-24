import type { CompleteAppointmentInput } from '../../application/use-cases/CompleteAppointment';

const APPOINTMENT_EVENT_SOURCE = 'prana.appointments';
const APPOINTMENT_COMPLETED_DETAIL_TYPE = 'AppointmentCompleted';

export function parseAppointmentCompletedEvent(body: string): CompleteAppointmentInput {
    const event: unknown = JSON.parse(body);

    if (!isRecord(event)) {
        throw invalidEventError();
    }

    if (event.source !== APPOINTMENT_EVENT_SOURCE) {
        throw invalidEventError();
    }

    if (event['detail-type'] !== APPOINTMENT_COMPLETED_DETAIL_TYPE) {
        throw invalidEventError();
    }

    if (!isRecord(event.detail)) {
        throw invalidEventError();
    }

    if (
        typeof event.detail.appointmentId !== 'string' ||
        typeof event.detail.insuredId !== 'string'
    ) {
        throw invalidEventError();
    }

    if (typeof event.time !== 'string') {
        throw invalidEventError();
    }

    const completedAt = new Date(event.time);

    if (Number.isNaN(completedAt.getTime())) {
        throw invalidEventError();
    }

    return {
        appointmentId: event.detail.appointmentId,
        insuredId: event.detail.insuredId,
        completedAt,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function invalidEventError(): Error {
    return new Error('Invalid AppointmentCompleted event');
}
