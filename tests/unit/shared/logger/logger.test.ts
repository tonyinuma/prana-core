import { logger } from '../../../../src/shared/logger/logger';

describe('logger', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-08-24T20:00:00.000Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('writes an informational event as one JSON line', () => {
        const consoleLog = jest.spyOn(console, 'log').mockImplementation();

        logger.info('appointment.created', {
            appointmentId: 'appointment-1',
            insuredId: '00123',
        });

        expect(consoleLog).toHaveBeenCalledWith(
            JSON.stringify({
                appointmentId: 'appointment-1',
                insuredId: '00123',
                timestamp: '2026-08-24T20:00:00.000Z',
                level: 'INFO',
                event: 'appointment.created',
            }),
        );
    });

    test('writes only the error type and does not expose its message or stack', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation();
        const error = new Error('password=do-not-log-this');

        logger.error('appointment.http.request.failed', error, {
            appointmentId: 'appointment-1',
        });

        const output = consoleError.mock.calls[0][0] as string;

        expect(JSON.parse(output)).toEqual({
            appointmentId: 'appointment-1',
            timestamp: '2026-08-24T20:00:00.000Z',
            level: 'ERROR',
            event: 'appointment.http.request.failed',
            errorType: 'Error',
        });
        expect(output).not.toContain(error.message);
        expect(output).not.toContain('do-not-log-this');
    });

    test('uses a safe error type for non-Error values', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation();

        logger.error('appointment.completion.failed', 'secret value');

        expect(JSON.parse(consoleError.mock.calls[0][0] as string)).toMatchObject({
            level: 'ERROR',
            event: 'appointment.completion.failed',
            errorType: 'UnknownError',
        });
        expect(consoleError.mock.calls[0][0]).not.toContain('secret value');
    });
});
