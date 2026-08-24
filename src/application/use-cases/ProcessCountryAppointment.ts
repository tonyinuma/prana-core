import { Appointment } from '../../domain/entities/Appointment';
import { CountryISO } from '../../domain/enums/CountryISO';
import { DomainError } from '../../domain/errors/DomainError';
import type { CountryAppointmentRepository } from '../../domain/repositories/CountryAppointmentRepository';
import type { CompletionEventPublisher } from '../ports/CompletionEventPublisher';

export interface ProcessCountryAppointmentInput {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: CountryISO;
}

export class ProcessCountryAppointment {
    constructor(
        private readonly appointmentRepository: CountryAppointmentRepository,
        private readonly completionEventPublisher: CompletionEventPublisher,
        private readonly expectedCountryISO: CountryISO,
    ) {}

    async execute(input: ProcessCountryAppointmentInput): Promise<void> {
        if (input.countryISO !== this.expectedCountryISO) {
            throw new DomainError(`countryISO must be ${this.expectedCountryISO}`);
        }

        const appointment = new Appointment(input);

        await this.appointmentRepository.save(appointment);
        await this.completionEventPublisher.publish({
            appointmentId: appointment.appointmentId,
            insuredId: appointment.insuredId,
            countryISO: appointment.countryISO,
        });
    }
}
