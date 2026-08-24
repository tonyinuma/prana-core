import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';

import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { SnsAppointmentPublisher } from '../../../../src/infrastructure/sns/SnsAppointmentPublisher';

const snsClientMock = mockClient(SNSClient);
const topicArn = 'arn:aws:sns:us-east-1:123456789012:prana-core-test-appointment-topic';

describe('SnsAppointmentPublisher', () => {
    beforeEach(() => {
        snsClientMock.reset();
    });

    afterAll(() => {
        snsClientMock.restore();
    });

    test('publishes the request body and countryISO message attribute', async () => {
        snsClientMock.on(PublishCommand).resolves({ MessageId: 'message-1' });
        const publisher = new SnsAppointmentPublisher(new SNSClient({}), topicArn);
        const message = {
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        };

        await publisher.publish(message);

        expect(snsClientMock.commandCalls(PublishCommand)[0]?.args[0].input).toEqual({
            TopicArn: topicArn,
            Message: JSON.stringify(message),
            MessageAttributes: {
                countryISO: {
                    DataType: 'String',
                    StringValue: CountryISO.PE,
                },
            },
        });
    });
});
