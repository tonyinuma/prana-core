import type {
    AppointmentCompletedEvent,
    CompletionEventPublisher,
} from '../../../src/application/ports/CompletionEventPublisher';

export class MockCompletionEventPublisher implements CompletionEventPublisher {
    private readonly events: AppointmentCompletedEvent[] = [];

    async publish(event: AppointmentCompletedEvent): Promise<void> {
        this.events.push(event);
    }

    getPublishedEvents(): readonly AppointmentCompletedEvent[] {
        return [...this.events];
    }
}
