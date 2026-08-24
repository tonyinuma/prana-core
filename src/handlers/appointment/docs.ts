import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { parse } from 'yaml';

import { jsonResponse } from '../http/response';

const SWAGGER_UI_VERSION = '5.32.11';
const OPENAPI_DOCUMENT_PATH = join(process.cwd(), 'docs', 'openapi.yaml');

const SWAGGER_UI_HTML = `<!doctype html>
<html lang="es">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Documentación interactiva de Prana Core" />
        <title>Prana Core API Docs</title>
        <link
            rel="stylesheet"
            href="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css"
        />
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script
            src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"
            crossorigin="anonymous"
        ></script>
        <script>
            window.onload = () => {
                window.ui = SwaggerUIBundle({
                    url: 'openapi.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    tryItOutEnabled: true,
                    validatorUrl: null,
                });
            };
        </script>
    </body>
</html>`;

let cachedOpenApiDocument: unknown;

export function handleSwaggerDocs(): APIGatewayProxyStructuredResultV2 {
    return {
        statusCode: 200,
        headers: {
            'content-type': 'text/html; charset=utf-8',
            'content-security-policy': [
                "default-src 'none'",
                "script-src 'unsafe-inline' https://unpkg.com",
                "style-src 'unsafe-inline' https://unpkg.com",
                'img-src data: https:',
                "connect-src 'self'",
            ].join('; '),
            'x-content-type-options': 'nosniff',
        },
        body: SWAGGER_UI_HTML,
    };
}

export function handleOpenApiDocument(): APIGatewayProxyStructuredResultV2 {
    cachedOpenApiDocument ??= parse(readFileSync(OPENAPI_DOCUMENT_PATH, 'utf8'));

    return jsonResponse(200, cachedOpenApiDocument);
}
