import type { AppointmentStatus } from '../../domain/enums/AppointmentStatus';

export interface AppointmentResponseDTO {
    appointmentId: string;
    status: AppointmentStatus;
    message: string;
}
