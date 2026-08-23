import type { Appointment } from '../entities/Appointment';

export interface CountryAppointmentRepository {
    save(appointment: Appointment): Promise<void>;
}
