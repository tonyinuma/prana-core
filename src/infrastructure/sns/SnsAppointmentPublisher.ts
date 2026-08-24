import { PublishCommand, type SNSClient } from '@aws-sdk/client-sns';

import type {
    AppointmentPublisher,
    AppointmentRequestMessage,
} from '../../application/ports/AppointmentPublisher';

export class SnsAppointmentPublisher implements AppointmentPublisher {
    constructor(
        private readonly snsClient: SNSClient,
        private readonly topicArn: string,
    ) {}

    async publish(message: AppointmentRequestMessage): Promise<void> {
        await this.snsClient.send(
            new PublishCommand({
                TopicArn: this.topicArn,
                Message: JSON.stringify(message),
                MessageAttributes: {
                    countryISO: {
                        DataType: 'String',
                        StringValue: message.countryISO,
                    },
                },
            }),
        );
    }
}
