import { parseAppointmentCompletedEvent } from '../../../../src/handlers/appointment/parseAppointmentCompletedEvent';

describe('parseAppointmentCompletedEvent', () => {
    test('extracts the DynamoDB key and completion time from an EventBridge event', () => {
        expect(parseAppointmentCompletedEvent(validEventBody())).toEqual({
            appointmentId: 'appointment-1',
            insuredId: '00123',
            completedAt: new Date('2026-08-24T18:00:00.000Z'),
        });
    });

    test('rejects malformed JSON', () => {
        expect(() => parseAppointmentCompletedEvent('invalid-json')).toThrow(SyntaxError);
    });

    test.each([
        ['a primitive event', 'invalid-event'],
        ['a null event', null],
        ['an unexpected source', { ...validEvent(), source: 'another.source' }],
        ['an unexpected detail type', { ...validEvent(), 'detail-type': 'AppointmentCreated' }],
        ['a missing detail', { ...validEvent(), detail: undefined }],
        ['a null detail', { ...validEvent(), detail: null }],
        [
            'a non-string appointmentId',
            { ...validEvent(), detail: { appointmentId: 1, insuredId: '00123' } },
        ],
        [
            'a non-string insuredId',
            { ...validEvent(), detail: { appointmentId: 'appointment-1', insuredId: 123 } },
        ],
        ['a non-string time', { ...validEvent(), time: 123 }],
        ['an invalid time', { ...validEvent(), time: 'invalid-date' }],
    ])('rejects %s', (_scenario, event) => {
        expect(() => parseAppointmentCompletedEvent(JSON.stringify(event))).toThrow(
            'Invalid AppointmentCompleted event',
        );
    });
});

function validEventBody(): string {
    return JSON.stringify(validEvent());
}

function validEvent(): Record<string, unknown> {
    return {
        version: '0',
        id: 'event-1',
        source: 'prana.appointments',
        'detail-type': 'AppointmentCompleted',
        time: '2026-08-24T18:00:00.000Z',
        detail: {
            appointmentId: 'appointment-1',
            insuredId: '00123',
            countryISO: 'PE',
        },
    };
}
