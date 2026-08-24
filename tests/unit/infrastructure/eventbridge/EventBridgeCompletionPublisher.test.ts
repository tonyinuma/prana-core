import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';

import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { EventBridgeCompletionPublisher } from '../../../../src/infrastructure/eventbridge/EventBridgeCompletionPublisher';

const eventBridgeClientMock = mockClient(EventBridgeClient);
const eventBusArn = 'arn:aws:events:us-east-1:123456789012:event-bus/prana-appointment-events';

describe('EventBridgeCompletionPublisher', () => {
    beforeEach(() => {
        eventBridgeClientMock.reset();
    });

    afterAll(() => {
        eventBridgeClientMock.restore();
    });

    test('publishes AppointmentCompleted with the required identifiers', async () => {
        eventBridgeClientMock.on(PutEventsCommand).resolves({
            FailedEntryCount: 0,
            Entries: [{ EventId: 'event-1' }],
        });
        const publisher = new EventBridgeCompletionPublisher(
            new EventBridgeClient({}),
            eventBusArn,
        );
        const event = {
            appointmentId: 'appointment-1',
            insuredId: '00123',
            countryISO: CountryISO.PE,
        };

        await publisher.publish(event);

        expect(eventBridgeClientMock.commandCalls(PutEventsCommand)[0]?.args[0].input).toEqual({
            Entries: [
                {
                    EventBusName: eventBusArn,
                    Source: 'prana.appointments',
                    DetailType: 'AppointmentCompleted',
                    Detail: JSON.stringify(event),
                },
            ],
        });
    });

    test('accepts a successful response without an explicit failed entry count', async () => {
        eventBridgeClientMock.on(PutEventsCommand).resolves({});
        const publisher = new EventBridgeCompletionPublisher(
            new EventBridgeClient({}),
            eventBusArn,
        );

        await expect(
            publisher.publish({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                countryISO: CountryISO.PE,
            }),
        ).resolves.toBeUndefined();
    });

    test('throws when EventBridge rejects the event entry', async () => {
        eventBridgeClientMock.on(PutEventsCommand).resolves({
            FailedEntryCount: 1,
            Entries: [
                {
                    ErrorCode: 'InternalFailure',
                    ErrorMessage: 'Internal service failure',
                },
            ],
        });
        const publisher = new EventBridgeCompletionPublisher(
            new EventBridgeClient({}),
            eventBusArn,
        );

        await expect(
            publisher.publish({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                countryISO: CountryISO.CL,
            }),
        ).rejects.toThrow(
            'EventBridge failed to publish AppointmentCompleted: Internal service failure',
        );
    });

    test.each([
        [
            'the error code when the message is missing',
            [{ ErrorCode: 'InternalFailure' }],
            'InternalFailure',
        ],
        ['an unknown error when entries are missing', undefined, 'unknown error'],
    ])('reports %s', async (_scenario, entries, expectedReason) => {
        eventBridgeClientMock.on(PutEventsCommand).resolves({
            FailedEntryCount: 1,
            Entries: entries,
        });
        const publisher = new EventBridgeCompletionPublisher(
            new EventBridgeClient({}),
            eventBusArn,
        );

        await expect(
            publisher.publish({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                countryISO: CountryISO.CL,
            }),
        ).rejects.toThrow(`EventBridge failed to publish AppointmentCompleted: ${expectedReason}`);
    });
});
