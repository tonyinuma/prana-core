import { ProcessCountryAppointment } from '../../../../src/application/use-cases/ProcessCountryAppointment';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { DomainError } from '../../../../src/domain/errors/DomainError';
import type { Logger } from '../../../../src/shared/logger/logger';
import { createMockLogger } from '../../../doubles/logger/createMockLogger';
import { MockCompletionEventPublisher } from '../../../doubles/publishers/MockCompletionEventPublisher';
import { InMemoryCountryAppointmentRepository } from '../../../doubles/repositories/InMemoryCountryAppointmentRepository';

describe('ProcessCountryAppointment', () => {
    let appointmentRepository: InMemoryCountryAppointmentRepository;
    let completionEventPublisher: MockCompletionEventPublisher;
    let logger: jest.Mocked<Logger>;
    let processCountryAppointment: ProcessCountryAppointment;

    beforeEach(() => {
        appointmentRepository = new InMemoryCountryAppointmentRepository();
        completionEventPublisher = new MockCompletionEventPublisher();
        logger = createMockLogger();
        processCountryAppointment = new ProcessCountryAppointment(
            appointmentRepository,
            completionEventPublisher,
            CountryISO.PE,
            logger,
        );
    });

    test('persists a Peru appointment and publishes its completion', async () => {
        await processCountryAppointment.execute({
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });

        expect(appointmentRepository.getAll()).toEqual([
            expect.objectContaining({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                scheduleId: 100,
                countryISO: CountryISO.PE,
            }),
        ]);
        expect(completionEventPublisher.getPublishedEvents()).toEqual([
            {
                appointmentId: 'appointment-1',
                insuredId: '00123',
                countryISO: CountryISO.PE,
            },
        ]);
        expect(logger.info.mock.calls).toEqual([
            [
                'appointment.country.processing',
                {
                    appointmentId: 'appointment-1',
                    insuredId: '00123',
                    countryISO: CountryISO.PE,
                },
            ],
            [
                'appointment.country.persisted',
                {
                    appointmentId: 'appointment-1',
                    insuredId: '00123',
                    countryISO: CountryISO.PE,
                },
            ],
            [
                'appointment.completed.published',
                {
                    appointmentId: 'appointment-1',
                    insuredId: '00123',
                    countryISO: CountryISO.PE,
                },
            ],
        ]);
    });

    test('persists before publishing the completion', async () => {
        const save = jest.spyOn(appointmentRepository, 'save');
        const publish = jest.spyOn(completionEventPublisher, 'publish');

        await processCountryAppointment.execute({
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });

        expect(save.mock.invocationCallOrder[0]).toBeLessThan(publish.mock.invocationCallOrder[0]);
    });

    test('does not publish a completion when country persistence fails', async () => {
        const persistenceError = new Error('MySQL unavailable');
        jest.spyOn(appointmentRepository, 'save').mockRejectedValue(persistenceError);
        const publish = jest.spyOn(completionEventPublisher, 'publish');

        await expect(
            processCountryAppointment.execute({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                scheduleId: 100,
                countryISO: CountryISO.PE,
            }),
        ).rejects.toBe(persistenceError);

        expect(publish).not.toHaveBeenCalled();
        expect(logger.info.mock.calls.map(([event]) => event)).toEqual([
            'appointment.country.processing',
        ]);
    });

    test('keeps the persisted country appointment when completion publication fails', async () => {
        const publicationError = new Error('EventBridge unavailable');
        jest.spyOn(completionEventPublisher, 'publish').mockRejectedValue(publicationError);

        await expect(
            processCountryAppointment.execute({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                scheduleId: 100,
                countryISO: CountryISO.PE,
            }),
        ).rejects.toBe(publicationError);

        expect(appointmentRepository.getAll()).toHaveLength(1);
        expect(logger.info.mock.calls.map(([event]) => event)).toEqual([
            'appointment.country.processing',
            'appointment.country.persisted',
        ]);
    });

    test('rejects an appointment for a different country', async () => {
        await expect(
            processCountryAppointment.execute({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                scheduleId: 100,
                countryISO: CountryISO.CL,
            }),
        ).rejects.toThrow(new DomainError('countryISO must be PE'));

        expect(appointmentRepository.getAll()).toEqual([]);
        expect(completionEventPublisher.getPublishedEvents()).toEqual([]);
        expect(logger.info).not.toHaveBeenCalled();
    });

    test('processes a Chile appointment when configured for Chile', async () => {
        processCountryAppointment = new ProcessCountryAppointment(
            appointmentRepository,
            completionEventPublisher,
            CountryISO.CL,
            logger,
        );

        await processCountryAppointment.execute({
            appointmentId: 'appointment-cl-1',
            insuredId: '00124',
            scheduleId: 200,
            countryISO: CountryISO.CL,
        });

        expect(appointmentRepository.getAll()).toEqual([
            expect.objectContaining({
                appointmentId: 'appointment-cl-1',
                countryISO: CountryISO.CL,
            }),
        ]);
        expect(completionEventPublisher.getPublishedEvents()).toEqual([
            {
                appointmentId: 'appointment-cl-1',
                insuredId: '00124',
                countryISO: CountryISO.CL,
            },
        ]);
    });
});
