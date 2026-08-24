import { PutEventsCommand, type EventBridgeClient } from '@aws-sdk/client-eventbridge';

import type {
    AppointmentCompletedEvent,
    CompletionEventPublisher,
} from '../../application/ports/CompletionEventPublisher';

const APPOINTMENT_EVENT_SOURCE = 'prana.appointments';
const APPOINTMENT_COMPLETED_DETAIL_TYPE = 'AppointmentCompleted';

export class EventBridgeCompletionPublisher implements CompletionEventPublisher {
    constructor(
        private readonly eventBridgeClient: EventBridgeClient,
        private readonly eventBusArn: string,
    ) {}

    async publish(event: AppointmentCompletedEvent): Promise<void> {
        const response = await this.eventBridgeClient.send(
            new PutEventsCommand({
                Entries: [
                    {
                        EventBusName: this.eventBusArn,
                        Source: APPOINTMENT_EVENT_SOURCE,
                        DetailType: APPOINTMENT_COMPLETED_DETAIL_TYPE,
                        Detail: JSON.stringify(event),
                    },
                ],
            }),
        );

        if ((response.FailedEntryCount ?? 0) > 0) {
            const failedEntry = response.Entries?.find((entry) => entry.ErrorCode !== undefined);
            const failureReason =
                failedEntry?.ErrorMessage ?? failedEntry?.ErrorCode ?? 'unknown error';

            throw new Error(`EventBridge failed to publish AppointmentCompleted: ${failureReason}`);
        }
    }
}
