import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

import { Appointment } from '../../../../src/domain/entities/Appointment';
import { AppointmentStatus } from '../../../../src/domain/enums/AppointmentStatus';
import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { DynamoAppointmentRepository } from '../../../../src/infrastructure/dynamodb/DynamoAppointmentRepository';

const documentClientMock = mockClient(DynamoDBDocumentClient);
const tableName = 'prana-core-test-appointments';

describe('DynamoAppointmentRepository', () => {
    let repository: DynamoAppointmentRepository;

    beforeEach(() => {
        documentClientMock.reset();
        const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
        repository = new DynamoAppointmentRepository(documentClient, tableName);
    });

    afterAll(() => {
        documentClientMock.restore();
    });

    test('saves an appointment with PutCommand and ISO dates', async () => {
        documentClientMock.on(PutCommand).resolves({});
        const appointment = new Appointment({
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        });

        await repository.save(appointment);

        expect(documentClientMock.commandCalls(PutCommand)[0]?.args[0].input).toEqual({
            TableName: tableName,
            Item: {
                appointmentId: appointment.appointmentId,
                insuredId: appointment.insuredId,
                scheduleId: appointment.scheduleId,
                countryISO: appointment.countryISO,
                status: AppointmentStatus.Pending,
                createdAt: appointment.createdAt.toISOString(),
                updatedAt: appointment.updatedAt.toISOString(),
            },
        });
    });

    test('queries by partition key and rehydrates appointments', async () => {
        const createdAt = '2026-08-23T18:00:00.000Z';
        const updatedAt = '2026-08-23T18:00:05.000Z';
        documentClientMock.on(QueryCommand).resolves({
            Items: [
                {
                    appointmentId: 'appointment-1',
                    insuredId: '00123',
                    scheduleId: 100,
                    countryISO: CountryISO.CL,
                    status: AppointmentStatus.Completed,
                    createdAt,
                    updatedAt,
                },
            ],
        });

        const appointments = await repository.findByInsuredId('00123');

        expect(documentClientMock.commandCalls(QueryCommand)[0]?.args[0].input).toEqual({
            TableName: tableName,
            KeyConditionExpression: '#insuredId = :insuredId',
            ExpressionAttributeNames: {
                '#insuredId': 'insuredId',
            },
            ExpressionAttributeValues: {
                ':insuredId': '00123',
            },
        });
        expect(appointments).toHaveLength(1);
        expect(appointments[0]).toEqual(
            expect.objectContaining({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                scheduleId: 100,
                countryISO: CountryISO.CL,
                status: AppointmentStatus.Completed,
                createdAt: new Date(createdAt),
                updatedAt: new Date(updatedAt),
            }),
        );
    });

    test('returns an empty list when QueryCommand has no items', async () => {
        documentClientMock.on(QueryCommand).resolves({});

        const appointments = await repository.findByInsuredId('00123');

        expect(appointments).toEqual([]);
    });

    test('updates only status and updatedAt with the complete key', async () => {
        documentClientMock.on(UpdateCommand).resolves({});
        const updatedAt = new Date('2026-08-23T18:00:05.000Z');

        await repository.updateStatus({
            insuredId: '00123',
            appointmentId: 'appointment-1',
            status: AppointmentStatus.Completed,
            updatedAt,
        });

        expect(documentClientMock.commandCalls(UpdateCommand)[0]?.args[0].input).toEqual({
            TableName: tableName,
            Key: {
                insuredId: '00123',
                appointmentId: 'appointment-1',
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
                ':status': AppointmentStatus.Completed,
                ':updatedAt': updatedAt.toISOString(),
            },
        });
    });
});
