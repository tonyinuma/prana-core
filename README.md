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
