import type {
    AppointmentPublisher,
    AppointmentRequestMessage,
} from '../../../src/application/ports/AppointmentPublisher';

export class MockAppointmentPublisher implements AppointmentPublisher {
    private readonly messages: AppointmentRequestMessage[] = [];

    async publish(message: AppointmentRequestMessage): Promise<void> {
        this.messages.push(message);
    }

    getPublishedMessages(): readonly AppointmentRequestMessage[] {
        return [...this.messages];
    }
}
