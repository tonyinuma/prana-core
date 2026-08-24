import type { Pool } from 'mysql2/promise';

import type { Appointment } from '../../domain/entities/Appointment';
import type { CountryAppointmentRepository } from '../../domain/repositories/CountryAppointmentRepository';

type MySqlExecutor = Pick<Pool, 'execute'>;

export class MySqlAppointmentRepository implements CountryAppointmentRepository {
    constructor(private readonly executor: MySqlExecutor) {}

    async save(appointment: Appointment): Promise<void> {
        await this.executor.execute(
            `INSERT INTO appointments (
                appointment_id,
                insured_id,
                schedule_id,
                country_iso
            ) VALUES (?, ?, ?, ?)`,
            [
                appointment.appointmentId,
                appointment.insuredId,
                appointment.scheduleId,
                appointment.countryISO,
            ],
        );
    }
}
