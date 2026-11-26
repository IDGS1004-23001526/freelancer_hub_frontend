# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Pruebas E2E (Playwright) y Disponibilidad

Las pruebas end-to-end verifican la disponibilidad y funcionalidad completa de los flujos de usuario en navegador real, generando logs estructurados (`[TIMESTAMP] [LEVEL] [CONTEXT] [ACTION] (STATUS)`) y reportes HTML/trazas en `playwright-report/`.

### Suites automatizadas

| Suite | Archivo | Qué valida |
| :--- | :--- | :--- |
| Autenticación | `e2e/auth-flow.spec.ts` | Registro, inicio de sesión, validaciones y redirección |
| Convocatorias | `e2e/convocatoria-flow.spec.ts` | Creación, listado y validación de proyectos |
| Flujo central | `e2e/core-business-flow.spec.ts` | Ciclo completo: publicar proyecto, postular, comparar candidatos y contratar |
| Postulaciones | `e2e/submit-proposal.spec.ts` | Envío de propuesta económica y desglose por hitos |
| Sistema completo | `e2e/full-system-test.spec.ts` | Integración general entre módulos principales y chat |

### Ejecución

```bash
# Instalar navegadores (solo la primera vez)
pnpm exec playwright install chromium

# Ejecutar toda la suite E2E
pnpm exec playwright test

# Ejecutar solo el flujo principal de negocio
pnpm exec playwright test e2e/core-business-flow.spec.ts
```

Para verificar la disponibilidad y latencia de los endpoints en producción/local con salida en `logs/availability.log`, ejecuta desde `freelancer_hub_backend`:

```bash
pnpm run test:availability
```
