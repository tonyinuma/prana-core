# Prana Core

Backend serverless para el agendamiento de citas medicas de asegurados en Peru y Chile.

## Decisiones tecnicas iniciales

- Runtime: Node.js 24 (`nodejs24.x` en AWS Lambda).
- Lenguaje: TypeScript con configuracion estricta.
- Gestor de paquetes: npm.
- Infraestructura como codigo: Serverless Framework v4.
- Region predeterminada: `us-east-1`.
- Stage predeterminado: `dev`.
- Convencion de nombres: `prana-core-${stage}-${component}`.
- Arquitectura: Clean Architecture.
- Persistencia: Repository Pattern.
- Inyeccion de dependencias: manual.
- Desarrollo local: Serverless Offline, repositorios in-memory y MySQL en Docker; sin LocalStack.

## MySQL local

MySQL se ejecuta como dependencia externa mediante Docker Compose. Para preparar el entorno:

```bash
cp -n .env.example .env
docker compose up -d
npm run db:check
```

El script de inicializacion crea las bases `prana_pe` y `prana_cl`, cada una con su tabla
`appointments`.

## API desplegada

Stage actual: `dev`

URL base:

```text
https://pjdlq904a2.execute-api.us-east-1.amazonaws.com
```

Esta URL corresponde al despliegue de demostracion actual y puede cambiar si se elimina el
stack y se crea uno nuevo.

### Rutas

| Metodo | Ruta                        | Descripcion                             |
| ------ | --------------------------- | --------------------------------------- |
| POST   | `/appointments`             | Registra una solicitud de agendamiento. |
| GET    | `/appointments/{insuredId}` | Consulta las citas de un asegurado.     |
| GET    | `/docs`                     | Muestra la documentacion interactiva.   |
| GET    | `/openapi.json`             | Devuelve el contrato OpenAPI como JSON. |

Documentacion desplegada:

```text
https://pjdlq904a2.execute-api.us-east-1.amazonaws.com/docs
```

### Crear una cita para Peru

```bash
curl --fail-with-body \
  --request POST \
  --url https://pjdlq904a2.execute-api.us-east-1.amazonaws.com/appointments \
  --header "Content-Type: application/json" \
  --data '{
    "insuredId": "00123",
    "scheduleId": 100,
    "countryISO": "PE"
  }'
```

### Crear una cita para Chile

```bash
curl --fail-with-body \
  --request POST \
  --url https://pjdlq904a2.execute-api.us-east-1.amazonaws.com/appointments \
  --header "Content-Type: application/json" \
  --data '{
    "insuredId": "00456",
    "scheduleId": 200,
    "countryISO": "CL"
  }'
```

El endpoint responde inmediatamente con HTTP `202` porque el procesamiento continua de forma
asincrona mediante SNS, SQS y EventBridge:

```json
{
    "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "message": "Appointment scheduling is in process"
}
```

Despues de unos segundos, la cita debe quedar con estado `completed`.

### Consultar las citas de un asegurado

El `insuredId` conserva los ceros a la izquierda y debe tener exactamente cinco digitos:

```bash
curl --fail-with-body \
  --request GET \
  --url https://pjdlq904a2.execute-api.us-east-1.amazonaws.com/appointments/00123
```

Respuesta de ejemplo:

```json
[
    {
        "appointmentId": "550e8400-e29b-41d4-a716-446655440000",
        "insuredId": "00123",
        "scheduleId": 100,
        "countryISO": "PE",
        "status": "completed",
        "createdAt": "2026-08-22T18:00:00.000Z",
        "updatedAt": "2026-08-22T18:00:05.000Z"
    }
]
```

Si el asegurado no tiene citas, la API devuelve un arreglo vacio:

```json
[]
```

### Reglas principales de entrada

- `insuredId`: string de exactamente cinco digitos, por ejemplo `"00123"`.
- `scheduleId`: numero entero positivo.
- `countryISO`: `"PE"` o `"CL"`.
