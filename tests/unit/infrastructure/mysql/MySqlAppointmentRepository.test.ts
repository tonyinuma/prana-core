import type { Pool } from 'mysql2/promise';

import { Appointment } from '../../../../src/domain/entities/Appointment';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { MySqlAppointmentRepository } from '../../../../src/infrastructure/mysql/MySqlAppointmentRepository';

describe('MySqlAppointmentRepository', () => {
    test('inserts an appointment with a parameterized statement', async () => {
        const execute = jest.fn().mockResolvedValue([{}, []]);
        const executor = { execute } as unknown as Pick<Pool, 'execute'>;
        const repository = new MySqlAppointmentRepository(executor);
        const appointment = new Appointment({
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });

        await repository.save(appointment);

        expect(execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO appointments'), [
            'appointment-1',
            '00123',
            100,
            CountryISO.PE,
        ]);
        expect(execute.mock.calls[0]?.[0]).toContain('VALUES (?, ?, ?, ?)');
        expect(execute.mock.calls[0]?.[0]).not.toContain(appointment.appointmentId);
    });

    test('treats a duplicate appointment as an idempotent success', async () => {
        const execute = jest.fn().mockRejectedValue({ code: 'ER_DUP_ENTRY' });
        const repository = createRepository(execute);

        await expect(repository.save(createAppointment())).resolves.toBeUndefined();
    });

    test.each(['database unavailable', null, {}, { code: 'ER_LOCK_WAIT_TIMEOUT' }])(
        'propagates a non-duplicate database error: %p',
        async (databaseError) => {
            const execute = jest.fn().mockRejectedValue(databaseError);
            const repository = createRepository(execute);

            await expect(repository.save(createAppointment())).rejects.toBe(databaseError);
        },
    );
});

function createRepository(execute: jest.Mock): MySqlAppointmentRepository {
    const executor = { execute } as unknown as Pick<Pool, 'execute'>;
    return new MySqlAppointmentRepository(executor);
}

function createAppointment(): Appointment {
    return new Appointment({
        appointmentId: 'appointment-1',
        insuredId: '00123',
        scheduleId: 100,
        countryISO: CountryISO.PE,
    });
}
