import { AppointmentStatus } from '../../domain/enums/AppointmentStatus';
import { DomainError } from '../../domain/errors/DomainError';
import type { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { validateInsuredId } from '../../domain/validators/validateInsuredId';

export interface CompleteAppointmentInput {
    insuredId: string;
    appointmentId: string;
    completedAt: Date;
}

export class CompleteAppointment {
    constructor(private readonly appointmentRepository: AppointmentRepository) {}

    async execute(input: CompleteAppointmentInput): Promise<void> {
        validateInsuredId(input.insuredId);
        this.validateAppointmentId(input.appointmentId);
        this.validateCompletedAt(input.completedAt);

        await this.appointmentRepository.updateStatus({
            insuredId: input.insuredId,
            appointmentId: input.appointmentId,
            status: AppointmentStatus.Completed,
            updatedAt: input.completedAt,
        });
    }

    private validateAppointmentId(appointmentId: string): void {
        if (typeof appointmentId !== 'string' || appointmentId.length === 0) {
            throw new DomainError('appointmentId is required');
        }
    }

    private validateCompletedAt(completedAt: Date): void {
        if (!(completedAt instanceof Date) || Number.isNaN(completedAt.getTime())) {
            throw new DomainError('completedAt must be a valid date');
        }
    }
}
