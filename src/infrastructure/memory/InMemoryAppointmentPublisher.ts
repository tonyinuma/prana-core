import type {
    AppointmentPublisher,
    AppointmentRequestMessage,
} from '../../application/ports/AppointmentPublisher';

export class InMemoryAppointmentPublisher implements AppointmentPublisher {
    private readonly messages: AppointmentRequestMessage[] = [];

    async publish(message: AppointmentRequestMessage): Promise<void> {
        this.messages.push(message);
    }
}
