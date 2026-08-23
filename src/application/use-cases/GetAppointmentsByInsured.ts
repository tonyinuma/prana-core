import type { AppointmentResponseDTO } from '../dto/AppointmentResponseDTO';
import type { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { validateInsuredId } from '../../domain/validators/validateInsuredId';

export class GetAppointmentsByInsured {
    constructor(private readonly appointmentRepository: AppointmentRepository) {}

    async execute(insuredId: string): Promise<AppointmentResponseDTO[]> {
        validateInsuredId(insuredId);

        const appointments = await this.appointmentRepository.findByInsuredId(insuredId);

        return appointments.map((appointment) => ({
            appointmentId: appointment.appointmentId,
            insuredId: appointment.insuredId,
            scheduleId: appointment.scheduleId,
            countryISO: appointment.countryISO,
            status: appointment.status,
            createdAt: appointment.createdAt.toISOString(),
            updatedAt: appointment.updatedAt.toISOString(),
        }));
    }
}
