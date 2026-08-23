import { Appointment } from '../../../../src/domain/entities/Appointment';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { DomainError } from '../../../../src/domain/errors/DomainError';

const validProps = {
    appointmentId: '550e8400-e29b-41d4-a716-446655440000',
    insuredId: '00123',
    scheduleId: 100,
    countryISO: CountryISO.PE,
};

describe('Appointment', () => {
    test('creates a valid appointment', () => {
        const appointment = new Appointment(validProps);

        expect(appointment.appointmentId).toBe(validProps.appointmentId);
        expect(appointment.insuredId).toBe(validProps.insuredId);
        expect(appointment.scheduleId).toBe(validProps.scheduleId);
        expect(appointment.countryISO).toBe(validProps.countryISO);
        expect(appointment.createdAt).toBeInstanceOf(Date);
        expect(appointment.updatedAt).toBeInstanceOf(Date);
    });

    test.each(['1234', '123456', '12A45', ' 0123'])('rejects invalid insuredId %p', (insuredId) => {
        expect(() => new Appointment({ ...validProps, insuredId })).toThrow(DomainError);
        expect(() => new Appointment({ ...validProps, insuredId })).toThrow(
            'insuredId must contain exactly 5 digits',
        );
    });

    test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
        'rejects invalid scheduleId %p',
        (scheduleId) => {
            expect(() => new Appointment({ ...validProps, scheduleId })).toThrow(DomainError);
            expect(() => new Appointment({ ...validProps, scheduleId })).toThrow(
                'scheduleId must be a positive integer',
            );
        },
    );

    test('rejects an unsupported country', () => {
        const countryISO = 'BR' as CountryISO;

        expect(() => new Appointment({ ...validProps, countryISO })).toThrow(DomainError);
        expect(() => new Appointment({ ...validProps, countryISO })).toThrow(
            'countryISO must be PE or CL',
        );
    });

    test('starts pending with matching creation and update timestamps', () => {
        const appointment = new Appointment(validProps);

        expect(appointment.status).toBe(AppointmentStatus.Pending);
        expect(appointment.updatedAt).toEqual(appointment.createdAt);
    });
});
