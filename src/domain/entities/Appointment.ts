import { AppointmentStatus } from '../enums/AppointmentStatus';
import { CountryISO } from '../enums/CountryISO';
import { DomainError } from '../errors/DomainError';
import { validateInsuredId } from '../validators/validateInsuredId';

export interface AppointmentProps {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: CountryISO;
}

export class Appointment {
    public readonly appointmentId: string;
    public readonly insuredId: string;
    public readonly scheduleId: number;
    public readonly countryISO: CountryISO;
    public readonly status: AppointmentStatus;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(props: AppointmentProps) {
        validateInsuredId(props.insuredId);
        Appointment.validateScheduleId(props.scheduleId);
        Appointment.validateCountryISO(props.countryISO);

        const now = new Date();

        this.appointmentId = props.appointmentId;
        this.insuredId = props.insuredId;
        this.scheduleId = props.scheduleId;
        this.countryISO = props.countryISO;
        this.status = AppointmentStatus.Pending;
        this.createdAt = now;
        this.updatedAt = now;
    }

    private static validateScheduleId(scheduleId: number): void {
        if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
            throw new DomainError('scheduleId must be a positive integer');
        }
    }

    private static validateCountryISO(countryISO: CountryISO): void {
        if (!Object.values(CountryISO).includes(countryISO)) {
            throw new DomainError('countryISO must be PE or CL');
        }
    }
}
