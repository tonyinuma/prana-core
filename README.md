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

Los recursos y la logica de negocio se incorporaran en los pasos posteriores del plan del proyecto.
