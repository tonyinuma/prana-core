import type { Appointment } from '../../../src/domain/entities/Appointment';
import type { CountryAppointmentRepository } from '../../../src/domain/repositories/CountryAppointmentRepository';

export class InMemoryCountryAppointmentRepository implements CountryAppointmentRepository {
    private readonly appointments: Appointment[] = [];

    async save(appointment: Appointment): Promise<void> {
        this.appointments.push(appointment);
    }

    getAll(): readonly Appointment[] {
        return [...this.appointments];
    }
}
