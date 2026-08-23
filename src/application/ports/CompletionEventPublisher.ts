import type { CountryISO } from '../../domain/enums/CountryISO';

export interface AppointmentCompletedEvent {
    appointmentId: string;
    insuredId: string;
    countryISO: CountryISO;
}

export interface CompletionEventPublisher {
    publish(event: AppointmentCompletedEvent): Promise<void>;
}
