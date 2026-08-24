import {
    PutCommand,
    QueryCommand,
    UpdateCommand,
    type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';

import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentStatus } from '../../domain/enums/AppointmentStatus';
import { CountryISO } from '../../domain/enums/CountryISO';
import type {
    AppointmentRepository,
    UpdateAppointmentStatusInput,
} from '../../domain/repositories/AppointmentRepository';

interface AppointmentItem {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: CountryISO;
    status: AppointmentStatus;
    createdAt: string;
    updatedAt: string;
}

export class DynamoAppointmentRepository implements AppointmentRepository {
    constructor(
        private readonly documentClient: DynamoDBDocumentClient,
        private readonly tableName: string,
    ) {}

    async save(appointment: Appointment): Promise<void> {
        await this.documentClient.send(
            new PutCommand({
                TableName: this.tableName,
                Item: this.toItem(appointment),
            }),
        );
    }

    async findByInsuredId(insuredId: string): Promise<Appointment[]> {
        const result = await this.documentClient.send(
            new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: '#insuredId = :insuredId',
                ExpressionAttributeNames: {
                    '#insuredId': 'insuredId',
                },
                ExpressionAttributeValues: {
                    ':insuredId': insuredId,
                },
            }),
        );

        return (result.Items ?? []).map((item) => this.toDomain(item as AppointmentItem));
    }

    async updateStatus(input: UpdateAppointmentStatusInput): Promise<void> {
        await this.documentClient.send(
            new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    insuredId: input.insuredId,
                    appointmentId: input.appointmentId,
                },
                UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
                ConditionExpression:
                    'attribute_exists(#insuredId) AND attribute_exists(#appointmentId)',
                ExpressionAttributeNames: {
                    '#insuredId': 'insuredId',
                    '#appointmentId': 'appointmentId',
                    '#status': 'status',
                    '#updatedAt': 'updatedAt',
                },
                ExpressionAttributeValues: {
                    ':status': input.status,
                    ':updatedAt': input.updatedAt.toISOString(),
                },
            }),
        );
    }

    private toItem(appointment: Appointment): AppointmentItem {
        return {
            appointmentId: appointment.appointmentId,
            insuredId: appointment.insuredId,
            scheduleId: appointment.scheduleId,
            countryISO: appointment.countryISO,
            status: appointment.status,
            createdAt: appointment.createdAt.toISOString(),
            updatedAt: appointment.updatedAt.toISOString(),
        };
    }

    private toDomain(item: AppointmentItem): Appointment {
        return new Appointment({
            appointmentId: item.appointmentId,
            insuredId: item.insuredId,
            scheduleId: item.scheduleId,
            countryISO: item.countryISO,
            status: item.status,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
        });
    }
}
