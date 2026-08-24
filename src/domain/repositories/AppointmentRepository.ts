import type { Appointment } from '../entities/Appointment';
import type { AppointmentStatus } from '../enums/AppointmentStatus';

export interface UpdateAppointmentStatusInput {
    insuredId: string;
    appointmentId: string;
    status: AppointmentStatus;
    updatedAt: Date;
}

export interface AppointmentRepository {
    save(appointment: Appointment): Promise<void>;
    findByInsuredId(insuredId: string): Promise<Appointment[]>;
    updateStatus(input: UpdateAppointmentStatusInput): Promise<void>;
}
