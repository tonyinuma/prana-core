import { Appointment } from '../../domain/entities/Appointment';
import type {
    AppointmentRepository,
    UpdateAppointmentStatusInput,
} from '../../domain/repositories/AppointmentRepository';

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

    async updateStatus(input: UpdateAppointmentStatusInput): Promise<void> {
        const key = this.keyOf(input);
        const appointment = this.appointments.get(key);

        if (appointment === undefined) {
            throw new Error('Appointment not found');
        }

        this.appointments.set(
            key,
            new Appointment({
                ...appointment,
                status: input.status,
                createdAt: appointment.createdAt,
                updatedAt: input.updatedAt,
            }),
        );
    }

    private keyOf(appointment: Pick<Appointment, 'insuredId' | 'appointmentId'>): string {
        return `${appointment.insuredId}:${appointment.appointmentId}`;
    }
}
