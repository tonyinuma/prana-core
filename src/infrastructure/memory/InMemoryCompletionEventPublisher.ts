import type {
    AppointmentCompletedEvent,
    CompletionEventPublisher,
} from '../../application/ports/CompletionEventPublisher';

export class InMemoryCompletionEventPublisher implements CompletionEventPublisher {
    private readonly events: AppointmentCompletedEvent[] = [];

    async publish(event: AppointmentCompletedEvent): Promise<void> {
        this.events.push(event);
    }

    getPublishedEvents(): readonly AppointmentCompletedEvent[] {
        return [...this.events];
    }
}
