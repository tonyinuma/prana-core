import { Appointment } from '../../../../src/domain/entities/Appointment';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { InMemoryAppointmentRepository } from '../../../../src/infrastructure/memory/InMemoryAppointmentRepository';

describe('InMemoryAppointmentRepository', () => {
    test('updates the status while preserving the creation date', async () => {
        const repository = new InMemoryAppointmentRepository();
        const appointment = new Appointment({
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });
        await repository.save(appointment);
        const updatedAt = new Date(appointment.updatedAt.getTime() + 1000);

        await repository.updateStatus({
            insuredId: appointment.insuredId,
            appointmentId: appointment.appointmentId,
            status: AppointmentStatus.Completed,
            updatedAt,
        });

        const [updatedAppointment] = await repository.findByInsuredId(appointment.insuredId);
        expect(updatedAppointment).toEqual(
            expect.objectContaining({
                status: AppointmentStatus.Completed,
                createdAt: appointment.createdAt,
                updatedAt,
            }),
        );
    });

    test('rejects updating an appointment that does not exist', async () => {
        const repository = new InMemoryAppointmentRepository();

        await expect(
            repository.updateStatus({
                insuredId: '00123',
                appointmentId: 'missing',
                status: AppointmentStatus.Completed,
                updatedAt: new Date(),
            }),
        ).rejects.toThrow('Appointment not found');
    });
});
