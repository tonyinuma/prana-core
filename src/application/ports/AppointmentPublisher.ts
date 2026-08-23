import type { CountryISO } from '../../domain/enums/CountryISO';

export interface AppointmentRequestMessage {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: CountryISO;
}

export interface AppointmentPublisher {
    publish(message: AppointmentRequestMessage): Promise<void>;
}
