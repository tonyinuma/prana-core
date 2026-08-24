import { CompleteAppointment } from '../../../../src/application/use-cases/CompleteAppointment';
import { Appointment } from '../../../../src/domain/entities/Appointment';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { InMemoryAppointmentRepository } from '../../../doubles/repositories/InMemoryAppointmentRepository';

describe('CompleteAppointment', () => {
    let appointmentRepository: InMemoryAppointmentRepository;
    let completeAppointment: CompleteAppointment;

    beforeEach(() => {
        appointmentRepository = new InMemoryAppointmentRepository();
        completeAppointment = new CompleteAppointment(appointmentRepository);
    });

    test('marks an existing appointment as completed using the event time', async () => {
        await appointmentRepository.save(
            new Appointment({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                scheduleId: 100,
                countryISO: CountryISO.PE,
            }),
        );
        const completedAt = new Date('2026-08-24T18:00:00.000Z');
        const input = {
            insuredId: '00123',
            appointmentId: 'appointment-1',
            completedAt,
        };

        await completeAppointment.execute(input);
        await completeAppointment.execute(input);

        expect(appointmentRepository.getAll()).toEqual([
            expect.objectContaining({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                status: AppointmentStatus.Completed,
                updatedAt: completedAt,
            }),
        ]);
    });

    test.each([
        [
            'an invalid insuredId',
            { insuredId: '123', appointmentId: 'appointment-1', completedAt: new Date() },
            'insuredId must contain exactly 5 digits',
        ],
        [
            'a missing appointmentId',
            {
                insuredId: '00123',
                appointmentId: undefined as unknown as string,
                completedAt: new Date(),
            },
            'appointmentId is required',
        ],
        [
            'an empty appointmentId',
            { insuredId: '00123', appointmentId: '', completedAt: new Date() },
            'appointmentId is required',
        ],
        [
            'a non-Date completedAt',
            {
                insuredId: '00123',
                appointmentId: 'appointment-1',
                completedAt: '2026-08-24' as unknown as Date,
            },
            'completedAt must be a valid date',
        ],
        [
            'an invalid completedAt',
            {
                insuredId: '00123',
                appointmentId: 'appointment-1',
                completedAt: new Date('invalid'),
            },
            'completedAt must be a valid date',
        ],
    ])('rejects %s', async (_scenario, input, expectedMessage) => {
        await expect(completeAppointment.execute(input)).rejects.toThrow(expectedMessage);
    });
});
