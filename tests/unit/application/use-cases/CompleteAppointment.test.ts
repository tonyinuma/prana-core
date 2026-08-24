import { CompleteAppointment } from '../../../../src/application/use-cases/CompleteAppointment';
import { Appointment } from '../../../../src/domain/entities/Appointment';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import type { Logger } from '../../../../src/shared/logger/logger';
import { createMockLogger } from '../../../doubles/logger/createMockLogger';
import { InMemoryAppointmentRepository } from '../../../doubles/repositories/InMemoryAppointmentRepository';

describe('CompleteAppointment', () => {
    let appointmentRepository: InMemoryAppointmentRepository;
    let logger: jest.Mocked<Logger>;
    let completeAppointment: CompleteAppointment;

    beforeEach(() => {
        appointmentRepository = new InMemoryAppointmentRepository();
        logger = createMockLogger();
        completeAppointment = new CompleteAppointment(appointmentRepository, logger);
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
        expect(logger.info).toHaveBeenCalledTimes(2);
        expect(logger.info).toHaveBeenLastCalledWith('appointment.completed', {
            appointmentId: 'appointment-1',
            insuredId: '00123',
            status: AppointmentStatus.Completed,
        });
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
        const updateStatus = jest.spyOn(appointmentRepository, 'updateStatus');

        await expect(completeAppointment.execute(input)).rejects.toThrow(expectedMessage);

        expect(updateStatus).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
    });
});
