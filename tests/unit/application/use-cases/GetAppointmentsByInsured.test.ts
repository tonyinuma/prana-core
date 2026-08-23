import { GetAppointmentsByInsured } from '../../../../src/application/use-cases/GetAppointmentsByInsured';
import { Appointment } from '../../../../src/domain/entities/Appointment';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { DomainError } from '../../../../src/domain/errors/DomainError';
import { InMemoryAppointmentRepository } from '../../../doubles/repositories/InMemoryAppointmentRepository';

describe('GetAppointmentsByInsured', () => {
    let appointmentRepository: InMemoryAppointmentRepository;
    let getAppointmentsByInsured: GetAppointmentsByInsured;

    beforeEach(() => {
        appointmentRepository = new InMemoryAppointmentRepository();
        getAppointmentsByInsured = new GetAppointmentsByInsured(appointmentRepository);
    });

    test('returns all appointments for the insured', async () => {
        const firstAppointment = new Appointment({
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });
        const secondAppointment = new Appointment({
            appointmentId: 'appointment-2',
            insuredId: '00123',
            scheduleId: 200,
            countryISO: CountryISO.CL,
        });
        const anotherInsuredAppointment = new Appointment({
            appointmentId: 'appointment-3',
            insuredId: '00456',
            scheduleId: 300,
            countryISO: CountryISO.PE,
        });
        await appointmentRepository.save(firstAppointment);
        await appointmentRepository.save(secondAppointment);
        await appointmentRepository.save(anotherInsuredAppointment);

        const response = await getAppointmentsByInsured.execute('00123');

        expect(response).toEqual([
            {
                appointmentId: firstAppointment.appointmentId,
                insuredId: firstAppointment.insuredId,
                scheduleId: firstAppointment.scheduleId,
                countryISO: firstAppointment.countryISO,
                status: AppointmentStatus.Pending,
                createdAt: firstAppointment.createdAt.toISOString(),
                updatedAt: firstAppointment.updatedAt.toISOString(),
            },
            {
                appointmentId: secondAppointment.appointmentId,
                insuredId: secondAppointment.insuredId,
                scheduleId: secondAppointment.scheduleId,
                countryISO: secondAppointment.countryISO,
                status: AppointmentStatus.Pending,
                createdAt: secondAppointment.createdAt.toISOString(),
                updatedAt: secondAppointment.updatedAt.toISOString(),
            },
        ]);
    });

    test('returns an empty list when the insured has no appointments', async () => {
        const response = await getAppointmentsByInsured.execute('00123');

        expect(response).toEqual([]);
    });

    test('rejects an invalid insuredId before consulting the repository', async () => {
        const findByInsuredId = jest.spyOn(appointmentRepository, 'findByInsuredId');

        await expect(getAppointmentsByInsured.execute('1234')).rejects.toThrow(DomainError);
        expect(findByInsuredId).not.toHaveBeenCalled();
    });
});
