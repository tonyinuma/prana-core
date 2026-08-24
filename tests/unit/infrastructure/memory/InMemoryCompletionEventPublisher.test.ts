import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { InMemoryCompletionEventPublisher } from '../../../../src/infrastructure/memory/InMemoryCompletionEventPublisher';

describe('InMemoryCompletionEventPublisher', () => {
    test('keeps published completion events in memory', async () => {
        const publisher = new InMemoryCompletionEventPublisher();
        const event = {
            appointmentId: 'appointment-1',
            insuredId: '00123',
            countryISO: CountryISO.PE,
        };

        await publisher.publish(event);

        expect(publisher.getPublishedEvents()).toEqual([event]);
    });
});
