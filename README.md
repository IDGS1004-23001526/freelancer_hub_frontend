# FreelancerHub — Frontend

Aplicación web progresiva (PWA) para la plataforma **FreelancerHub**, construida con **React 19**, **Vite 7**, **Tailwind CSS 4**, **Zustand** y **Socket.IO Client**. Permite a clientes y freelancers gestionar convocatorias, postulaciones, comparación de candidatos (MCDA), contratos por hitos con custodia Escrow, chat en tiempo real y perfiles profesionales.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework UI** | React 19 + React Router DOM 7 |
| **Build & Dev** | Vite 7 + `vite-plugin-pwa` (Workbox) |
| **Estilos** | Tailwind CSS 4 + Lucide React + React Icons |
| **Estado Global** | Zustand 5 |
| **HTTP & Tiempo Real** | Axios + Socket.IO Client 4 |
| **Autenticación** | JWT + `@react-oauth/google` |
| **Pruebas E2E** | Playwright Test |

---

## 📁 Estructura del Proyecto

```text
freelancer_hub_frontend/
├── e2e/                        # Suites de pruebas end-to-end (Playwright)
├── public/                     # Assets estáticos y manifiesto PWA
├── src/
│   ├── api/                    # Clientes HTTP (auth, project, candidate, chat, etc.)
│   ├── components/             # Componentes compartidos y layout del dashboard
│   ├── features/               # Módulos por dominio (projects, candidates, contracts)
│   ├── hooks/                  # Hooks personalizados
│   ├── interfaces/             # Tipos e interfaces TypeScript
│   ├── pages/                  # Vistas principales (Dashboard, Proyectos, Perfil, Chat, etc.)
│   ├── routes/                 # Configuración de rutas protegidas y públicas
│   ├── stores/                 # Stores de Zustand (auth, project, chat, etc.)
│   └── utils/                  # Utilidades (cálculo MCDA, formateadores)
├── Dockerfile                  # Build multi-stage (Node 22 + Nginx Alpine)
├── deploy.sh                   # Script de despliegue en servidor de producción
└── package.json
```

---

## 🚀 Instalación y Ejecución Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno (.env)
# VITE_API_URL=http://localhost:4000/api
# VITE_GOOGLE_CLIENT_ID=<tu_client_id>

# 3. Iniciar servidor de desarrollo (http://localhost:5173)
pnpm run dev

# 4. Compilar para producción
pnpm run build
```

### Scripts disponibles

| Script | Descripción |
| :--- | :--- |
| `pnpm run dev` | Inicia el servidor de desarrollo Vite con HMR |
| `pnpm run build` | Genera el bundle de producción en `dist/` y el Service Worker PWA |
| `pnpm run lint` | Ejecuta ESLint sobre el proyecto |
| `pnpm run test:e2e` | Ejecuta las pruebas end-to-end con Playwright |
| `pnpm run preview` | Sirve localmente el build de producción |

---

## 🧪 Pruebas E2E (Playwright) y Disponibilidad

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
pnpm run test:e2e

# Ejecutar solo el flujo principal de negocio
pnpm exec playwright test e2e/core-business-flow.spec.ts
```

Para verificar la disponibilidad y latencia de los endpoints en producción/local con salida en `logs/availability.log`, ejecuta desde `freelancer_hub_backend`:

```bash
pnpm run test:availability
```

---

## 📄 Licencia

Proyecto académico / plataforma **FreelancerHub**.
