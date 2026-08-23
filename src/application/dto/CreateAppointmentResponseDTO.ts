import type { AppointmentStatus } from '../../domain/enums/AppointmentStatus';

export interface CreateAppointmentResponseDTO {
    appointmentId: string;
    status: AppointmentStatus;
    message: string;
}
