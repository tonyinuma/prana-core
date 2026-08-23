import type { Appointment } from '../entities/Appointment';

export interface AppointmentRepository {
    save(appointment: Appointment): Promise<void>;
    findByInsuredId(insuredId: string): Promise<Appointment[]>;
}
