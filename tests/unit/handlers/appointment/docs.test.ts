import {
    handleOpenApiDocument,
    handleSwaggerDocs,
} from '../../../../src/handlers/appointment/docs';

describe('appointment API documentation handlers', () => {
    test('serves Swagger UI configured to load the local OpenAPI endpoint', () => {
        const response = handleSwaggerDocs();

        expect(response.statusCode).toBe(200);
        expect(response.headers).toEqual(
            expect.objectContaining({
                'content-type': 'text/html; charset=utf-8',
                'x-content-type-options': 'nosniff',
            }),
        );
        expect(response.body).toContain('Prana Core API Docs');
        expect(response.body).toContain('swagger-ui-dist@5.32.11/swagger-ui-bundle.js');
        expect(response.body).toContain("url: 'openapi.json'");
        expect(response.body).toContain('tryItOutEnabled: true');
        expect(response.body).not.toContain('Scalar');
    });

    test('serves and reuses the YAML source as an OpenAPI JSON document', () => {
        const firstResponse = handleOpenApiDocument();
        const secondResponse = handleOpenApiDocument();
        const document = JSON.parse(firstResponse.body ?? '') as {
            openapi: string;
            servers: Array<{ url: string }>;
            paths: Record<string, unknown>;
        };

        expect(firstResponse.statusCode).toBe(200);
        expect(firstResponse.headers).toEqual({ 'content-type': 'application/json' });
        expect(secondResponse.body).toBe(firstResponse.body);
        expect(document.openapi).toBe('3.0.3');
        expect(document.servers).toEqual([
            expect.objectContaining({
                url: '.',
            }),
        ]);
        expect(document.paths).toEqual(
            expect.objectContaining({
                '/appointments': expect.any(Object),
                '/appointments/{insuredId}': expect.any(Object),
            }),
        );
    });
});
