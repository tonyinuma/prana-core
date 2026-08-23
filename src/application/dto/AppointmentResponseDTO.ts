import type { AppointmentStatus } from '../../domain/enums/AppointmentStatus';
import type { CountryISO } from '../../domain/enums/CountryISO';

export interface AppointmentResponseDTO {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: CountryISO;
    status: AppointmentStatus;
    createdAt: string;
    updatedAt: string;
}
