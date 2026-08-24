import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { parseAppointmentRequest } from '../../../../src/handlers/country/parseAppointmentRequest';

describe('parseAppointmentRequest', () => {
    test.each([CountryISO.PE, CountryISO.CL])('parses an SNS notification for %s', (countryISO) => {
        const request = {
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO,
        };

        expect(parseAppointmentRequest(createSnsRecordBody(request))).toEqual(request);
    });

    test.each([
        ['SQS record body', 'not-json'],
        ['SNS Message', JSON.stringify({ Message: 'not-json' })],
    ])('rejects invalid JSON in the %s', (label, body) => {
        expect(() => parseAppointmentRequest(body)).toThrow(`${label} must be valid JSON`);
    });

    test.each(['null', '[]', '"text"'])('rejects a non-object SQS body: %s', (body) => {
        expect(() => parseAppointmentRequest(body)).toThrow(
            'SQS record body must contain a JSON object',
        );
    });

    test('rejects a notification without a string Message', () => {
        expect(() => parseAppointmentRequest(JSON.stringify({ Message: 123 }))).toThrow(
            'SNS notification Message must be a string',
        );
    });

    test.each([null, [], 'message'])('rejects a non-object SNS Message: %p', (message) => {
        expect(() =>
            parseAppointmentRequest(JSON.stringify({ Message: JSON.stringify(message) })),
        ).toThrow('SNS Message must contain a JSON object');
    });

    test.each([
        ['appointmentId', undefined, 'appointmentId must be a non-empty string'],
        ['appointmentId', '', 'appointmentId must be a non-empty string'],
        ['insuredId', 123, 'insuredId must be a non-empty string'],
        ['scheduleId', '100', 'scheduleId must be a number'],
        ['countryISO', 'AR', 'countryISO must be PE or CL'],
    ])('rejects an invalid %s', (field, value, expectedError) => {
        const request: Record<string, unknown> = {
            appointmentId: 'appointment-1',
            insuredId: '00123',
            scheduleId: 100,
            countryISO: CountryISO.PE,
        };
        request[field] = value;

        expect(() => parseAppointmentRequest(createSnsRecordBody(request))).toThrow(expectedError);
    });
});

function createSnsRecordBody(message: unknown): string {
    return JSON.stringify({ Message: JSON.stringify(message) });
}
