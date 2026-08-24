import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import { CountryISO } from '../../../../src/domain/enums/CountryISO';
import { handler } from '../../../../src/handlers/appointment';

describe('appointment HTTP handler', () => {
    test('routes POST and GET through the configured local dependencies', async () => {
        const firstCreateResponse = await handler(
            httpEvent('POST /appointments', {
                body: JSON.stringify({
                    insuredId: '00701',
                    scheduleId: 100,
                    countryISO: CountryISO.PE,
                }),
            }),
        );
        await handler(
            httpEvent('POST /appointments', {
                body: JSON.stringify({
                    insuredId: '00702',
                    scheduleId: 200,
                    countryISO: CountryISO.CL,
                }),
            }),
        );

        const getResponse = await handler(
            httpEvent('GET /appointments/{insuredId}', {
                pathParameters: { insuredId: '00701' },
            }),
        );

        expect(firstCreateResponse.statusCode).toBe(202);
        expect(getResponse.statusCode).toBe(200);
        expect(JSON.parse(getResponse.body ?? '')).toEqual([
            expect.objectContaining({
                insuredId: '00701',
                scheduleId: 100,
                countryISO: CountryISO.PE,
            }),
        ]);
    });

    test('returns 404 for an unknown route', async () => {
        const response = await handler(httpEvent('DELETE /appointments'));

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body ?? '')).toEqual({ message: 'Route not found' });
    });
});

function httpEvent(
    routeKey: string,
    overrides: Partial<APIGatewayProxyEventV2> = {},
): APIGatewayProxyEventV2 {
    return {
        routeKey,
        ...overrides,
    } as APIGatewayProxyEventV2;
}
