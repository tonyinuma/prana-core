import { CreateAppointment } from '../../../../src/application/use-cases/CreateAppointment';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { DomainError } from '../../../../src/domain/errors/DomainError';
import type { Logger } from '../../../../src/shared/logger/logger';
import { createMockLogger } from '../../../doubles/logger/createMockLogger';
import { MockAppointmentPublisher } from '../../../doubles/publishers/MockAppointmentPublisher';
import { InMemoryAppointmentRepository } from '../../../doubles/repositories/InMemoryAppointmentRepository';

const appointmentId = '550e8400-e29b-41d4-a716-446655440000';
const validInput = {
    insuredId: '00123',
    scheduleId: 100,
    countryISO: CountryISO.PE,
};

describe('CreateAppointment', () => {
    let appointmentRepository: InMemoryAppointmentRepository;
    let appointmentPublisher: MockAppointmentPublisher;
    let generateAppointmentId: jest.Mock<string>;
    let logger: jest.Mocked<Logger>;
    let createAppointment: CreateAppointment;

    beforeEach(() => {
        appointmentRepository = new InMemoryAppointmentRepository();
        appointmentPublisher = new MockAppointmentPublisher();
        generateAppointmentId = jest.fn(() => appointmentId);
        logger = createMockLogger();
        createAppointment = new CreateAppointment(
            appointmentRepository,
            appointmentPublisher,
            generateAppointmentId,
            logger,
        );
    });

    test('creates and returns a pending appointment', async () => {
        const response = await createAppointment.execute(validInput);

        expect(generateAppointmentId).toHaveBeenCalledTimes(1);
        expect(response).toEqual({
            appointmentId,
            status: AppointmentStatus.Pending,
            message: 'Appointment scheduling is in process',
        });
    });

    test('persists the appointment through the repository', async () => {
        await createAppointment.execute(validInput);

        const appointments = await appointmentRepository.findByInsuredId(validInput.insuredId);

        expect(appointments).toHaveLength(1);
        expect(appointments[0]).toMatchObject({
            appointmentId,
            insuredId: validInput.insuredId,
            scheduleId: validInput.scheduleId,
            countryISO: validInput.countryISO,
            status: AppointmentStatus.Pending,
        });
    });

    test('publishes the appointment request through the publisher', async () => {
        await createAppointment.execute(validInput);

        expect(appointmentPublisher.getPublishedMessages()).toEqual([
            {
                appointmentId,
                insuredId: validInput.insuredId,
                scheduleId: validInput.scheduleId,
                countryISO: validInput.countryISO,
            },
        ]);
    });

    test('persists the appointment before publishing it', async () => {
        const save = jest.spyOn(appointmentRepository, 'save');
        const publish = jest.spyOn(appointmentPublisher, 'publish');

        await createAppointment.execute(validInput);

        expect(save.mock.invocationCallOrder[0]).toBeLessThan(publish.mock.invocationCallOrder[0]);
    });

    test('logs the main events with the appointment correlation data', async () => {
        await createAppointment.execute(validInput);

        const context = {
            appointmentId,
            insuredId: validInput.insuredId,
            countryISO: validInput.countryISO,
            status: AppointmentStatus.Pending,
        };

        expect(logger.info.mock.calls).toEqual([
            ['appointment.received', context],
            ['appointment.created', context],
            ['appointment.published', context],
        ]);
    });

    test.each([
        { field: 'insuredId', input: { ...validInput, insuredId: '1234' } },
        { field: 'scheduleId', input: { ...validInput, scheduleId: 0 } },
        { field: 'countryISO', input: { ...validInput, countryISO: 'BR' as CountryISO } },
    ])('rejects an invalid $field without side effects', async ({ input }) => {
        await expect(createAppointment.execute(input)).rejects.toThrow(DomainError);

        expect(appointmentRepository.getAll()).toHaveLength(0);
        expect(appointmentPublisher.getPublishedMessages()).toHaveLength(0);
    });
});
