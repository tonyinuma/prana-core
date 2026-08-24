import { randomUUID } from 'node:crypto';

import type { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { Appointment } from '../../domain/entities/Appointment';
import { logger as defaultLogger, type Logger } from '../../shared/logger/logger';
import type { CreateAppointmentDTO } from '../dto/CreateAppointmentDTO';
import type { CreateAppointmentResponseDTO } from '../dto/CreateAppointmentResponseDTO';
import type { AppointmentPublisher } from '../ports/AppointmentPublisher';

type AppointmentIdGenerator = () => string;

export class CreateAppointment {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly appointmentPublisher: AppointmentPublisher,
        private readonly generateAppointmentId: AppointmentIdGenerator = randomUUID,
        private readonly logger: Logger = defaultLogger,
    ) {}

    async execute(input: CreateAppointmentDTO): Promise<CreateAppointmentResponseDTO> {
        const appointment = new Appointment({
            appointmentId: this.generateAppointmentId(),
            insuredId: input.insuredId,
            scheduleId: input.scheduleId,
            countryISO: input.countryISO,
        });

        const logContext = {
            appointmentId: appointment.appointmentId,
            insuredId: appointment.insuredId,
            countryISO: appointment.countryISO,
            status: appointment.status,
        };

        this.logger.info('appointment.received', logContext);

        await this.appointmentRepository.save(appointment);
        this.logger.info('appointment.created', logContext);

        await this.appointmentPublisher.publish({
            appointmentId: appointment.appointmentId,
            insuredId: appointment.insuredId,
            scheduleId: appointment.scheduleId,
            countryISO: appointment.countryISO,
        });
        this.logger.info('appointment.published', logContext);

        return {
            appointmentId: appointment.appointmentId,
            status: appointment.status,
            message: 'Appointment scheduling is in process',
        };
    }
}
