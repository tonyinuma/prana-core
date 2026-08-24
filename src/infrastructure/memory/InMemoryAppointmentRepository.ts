import type { Appointment } from '../../domain/entities/Appointment';
import type { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';

export class InMemoryAppointmentRepository implements AppointmentRepository {
    private readonly appointments = new Map<string, Appointment>();

    async save(appointment: Appointment): Promise<void> {
        this.appointments.set(this.keyOf(appointment), appointment);
    }

    async findByInsuredId(insuredId: string): Promise<Appointment[]> {
        return [...this.appointments.values()].filter(
            (appointment) => appointment.insuredId === insuredId,
        );
    }

    private keyOf(appointment: Appointment): string {
        return `${appointment.insuredId}:${appointment.appointmentId}`;
    }
}
