# PROJECT.md

## 1. Resumen

**TicketCita** es una aplicación web de reserva de citas médicas para el **Policlínico Infantil
"Nuestra Señora del Sagrado Corazón"** (Ate, Lima, Perú).

- **Problema que resuelve:** permite a los pacientes reservar citas médicas en línea sin llamar o
  acercarse físicamente al policlínico, y da a Recepción y a los médicos herramientas para
  gestionar la agenda del día.
- **Objetivo principal:** ofrecer un flujo completo de reserva (especialidad → médico → fecha/hora
  → registro → pago) más un panel de recepción y una vista de agenda para el médico, todo
  funcionando **sin backend ni base de datos** (los datos viven en `localStorage` del navegador).
- **Estado del proyecto:** demo/MVP funcional, mantenido como proyecto TanStack Start estándar
  (sin dependencia de ninguna plataforma externa). Pensado para evolucionar hacia una versión con
  backend real (base de datos + pasarela de pago) más adelante — ver sección 14.

## 2. Tecnologías

- **Lenguaje:** TypeScript
- **Framework:** [TanStack Start](https://tanstack.com/start) (SSR) + [TanStack Router](https://tanstack.com/router)
  (file-based routing) + [TanStack Query](https://tanstack.com/query)
- **UI:** React 19, Tailwind CSS v4, componentes [shadcn/ui](https://ui.shadcn.com) (estilo
  "new-york") sobre Radix UI, iconos `lucide-react`
- **Build:** Vite 8 con `vite.config.ts` propio (plugins de TanStack Start + Nitro configurados
  directamente, sin wrapper externo), target de despliegue por defecto: Cloudflare (`nitro` preset
  `cloudflare-module`)
- **Persistencia de datos:** ninguna base de datos — **`window.localStorage`** en el navegador
  (ver `src/lib/ticketcita.ts`)
- **Gestor de paquetes:** `npm` (único lockfile, `package-lock.json`, regenerado en cada
  `npm install`).

## 3. Estructura del proyecto

```text
ticketcita/
├── PROJECT.md                 # Este documento
├── INSTRUCCIONES.md           # Guía en español para el usuario final (cómo ejecutar la app)
├── README.md                  # README del proyecto
├── package.json                # Scripts y dependencias (npm)
├── package-lock.json
├── vite.config.ts             # Config de build propia (TanStack Start + Nitro + Tailwind + React)
├── tsconfig.json
├── eslint.config.js / .prettierrc / .prettierignore
├── components.json            # Config de shadcn/ui (alias, estilo, etc.)
├── public/                    # Estáticos servidos tal cual (favicon, robots.txt)
└── src/
    ├── start.ts                # Instancia de TanStack Start: middlewares (errores, CSRF)
    ├── server.ts                # Entry point del servidor (Cloudflare Worker `fetch`), envuelve
    │                             # el handler de TanStack Start con manejo de errores SSR
    ├── router.tsx                # Crea el router de TanStack Router + QueryClient
    ├── routeTree.gen.ts          # ⚠️ AUTOGENERADO por TanStack Router — no editar a mano
    ├── styles.css                 # Tailwind v4 + variables de tema (colores del policlínico)
    ├── components/
    │   ├── Layout.tsx             # Header, nav, footer, wrapper `<Layout>` y `<Seccion>`
    │   └── ui/                    # Componentes shadcn/ui (button, dialog, calendar, etc.)
    ├── hooks/
    │   └── use-mobile.tsx          # Hook de detección de viewport móvil (shadcn/ui)
    ├── lib/
    │   ├── ticketcita.ts           # ⭐ Núcleo del dominio: tipos, datos base, estado global,
    │   │                            # reglas de negocio (ver sección 4 y 6)
    │   ├── utils.ts                # Helper `cn()` (clsx + tailwind-merge)
    │   ├── error-capture.ts        # Captura errores fuera de banda para recuperarlos en server.ts
    │   └── error-page.ts           # HTML de página de error 500 (fallback sin React)
    ├── assets/                    # Imágenes (logo, hero, ilustraciones, ícono de Yape)
    └── routes/                    # Una ruta por archivo (file-based routing de TanStack Router)
        ├── __root.tsx              # Shell HTML, <head>, error/404 boundaries, QueryClientProvider
        ├── index.tsx                # `/` — landing: especialidades, precios, cómo funciona
        ├── horarios.tsx             # `/horarios` — ver horarios por especialidad/médico
        ├── reservar.tsx             # `/reservar` — flujo completo de reserva de cita
        ├── mis-citas.tsx            # `/mis-citas` — estado y cancelación de citas del paciente
        ├── ingresar.tsx             # `/ingresar` — login de paciente + accesos demo (recepción/médico)
        ├── panel.tsx                 # `/panel` — panel de recepción (agenda, pagos, KPIs, admin)
        ├── medico.tsx                # `/medico` — agenda del médico, solo lectura
        ├── ubicacion.tsx             # `/ubicacion` — dirección, horario, mapa
        └── README.md                 # Convenciones de file-based routing de TanStack Router
```

## 4. Arquitectura

La app es un **SPA con SSR** (TanStack Start) pero **sin backend de datos propio**:

- **Servidor (SSR):** `src/server.ts` es el punto de entrada del Worker. Delega en el handler
  generado por TanStack Start (`@tanstack/react-start/server-entry`) y envuelve la respuesta para
  detectar el caso en que `h3` (el servidor HTTP interno) "traga" un error no controlado y lo
  convierte en un 500 JSON genérico; en ese caso renderiza una página de error legible
  (`error-page.ts`) usando el último error capturado por `error-capture.ts`.
- **Middlewares (`src/start.ts`):** un middleware de errores (atrapa excepciones de rutas/server
  functions y devuelve la página de error) y el middleware CSRF de TanStack Start (reactivado
  explícitamente porque definir `src/start.ts` desactiva el que se instala por defecto).
- **Enrutamiento:** `src/router.tsx` crea el router con `routeTree.gen.ts` (autogenerado a partir
  de los archivos en `src/routes/`). `src/routes/__root.tsx` es el layout raíz: define `<head>`,
  envuelve todo en `QueryClientProvider`, y define los componentes de error/404.
- **Estado y "backend" de datos (`src/lib/ticketcita.ts`):** todo el dominio (especialidades,
  médicos, pacientes, citas, sesión) vive en un **store en memoria + `localStorage`**, implementado
  a mano con `useSyncExternalStore`:
  - `estado` es una variable de módulo (fuente de verdad en el cliente).
  - `cargar()` hidrata `estado` desde `localStorage` (clave `ticketcita:v3`) la primera vez que se
    usa en el navegador.
  - `set(mut)` aplica una mutación inmutable sobre `estado`, notifica a los listeners y persiste en
    `localStorage`.
  - `useEstado()` es el hook que consumen los componentes para leer el estado reactivo; en el
    servidor devuelve un snapshot inicial (`servidor`) para que el SSR no reviente por falta de
    `window`.
  - No hay API HTTP ni base de datos: todas las "escrituras" son llamadas a `set(...)` desde los
    componentes de ruta.
- **UI:** componentes de página en `src/routes/*.tsx`, compuestos con primitivas shadcn/ui en
  `src/components/ui/` y el layout compartido en `src/components/Layout.tsx`.

## 5. Flujo de ejecución

1. El navegador pide una URL → `src/server.ts` (`fetch`) delega en el handler de TanStack Start,
   que resuelve la ruta correspondiente usando `routeTree.gen.ts` / `src/router.tsx` y hace SSR del
   árbol de componentes, empezando por `__root.tsx` → el componente de la ruta.
2. En el cliente, React hidrata la página. Los componentes de ruta llaman a `useEstado()`
   (`src/lib/ticketcita.ts`), que en el primer render en el navegador dispara `cargar()` y lee el
   estado guardado en `localStorage` (o usa `estadoInicial()` si no hay nada guardado).
3. **Flujo típico de reserva (`/reservar`):** el usuario elige especialidad → médico → fecha/hora
   disponibles (calculadas con `horasOcupadas` / `diasDeMedico` sobre la `agenda` del médico y las
   citas ya creadas) → se registra o inicia sesión como paciente → elige método de pago (Yape,
   tarjeta o efectivo en caja) → `crearCita()` construye la cita (código `TC-XXXXX`, estado
   `pagada` o `pendiente_pago` si es efectivo, con `llegadaLimite` = hora de la cita + 15 min) →
   `set()` la agrega a `citas` y persiste.
4. **Regla de los 15 minutos:** `liberarVencidas()` recorre las citas en `pendiente_pago` (pago en
   efectivo) y marca como `liberada` las que superaron su `llegadaLimite`. Se invoca al abrir
   `/panel` y cada 30 segundos mientras el panel está abierto (ver `panel.tsx`).
5. Cualquier error no controlado en el servidor (loader, server function, o el propio render SSR)
   pasa por el middleware de `start.ts` o por el wrapper de `server.ts`, que registran el error y
   devuelven la página HTML de `error-page.ts` en vez de un 500 crudo. En el cliente, los errores de
   render los captura `ErrorComponent` en `__root.tsx`, que los registra con `console.error`.

## 6. Archivos importantes

| Ruta | Propósito | De qué depende / quién depende de él | Precauciones para una IA |
| --- | --- | --- | --- |
| `src/lib/ticketcita.ts` | Dominio completo: tipos, datos base (especialidades, médicos), store de estado (`localStorage`), reglas de negocio (crear cita, liberar vencidas, formateo de fechas/horas/precios). | Lo importan **todas** las rutas y `Layout.tsx`. | Es el archivo más crítico. Cambiar la forma de `Estado`/`Cita` rompe todas las pantallas. `KEY = "ticketcita:v3"` es la versión de esquema en `localStorage`; si cambias la forma de los datos, sube esta versión o migra datos existentes, porque los usuarios con datos guardados con el esquema viejo se mezclarán con `estadoInicial()` (spread superficial en `cargar()`). El tipo `Especialidad` incluye el campo **`atiende`** (string, requerido): texto breve de qué condiciones trata esa especialidad, mostrado en las tarjetas de la sección "Nuestras especialidades" de Inicio. Si se agrega una especialidad nueva (a mano en `especialidadesBase` o desde el panel de recepción en `panel.tsx`), hay que incluir `atiende` o TypeScript falla la compilación (`exactOptionalPropertyTypes`). |
| `src/routes/index.tsx` | Página de Inicio (`/`): hero, sección "Nuestras especialidades" (tarjetas con ícono, descripción y "Atiende: ..." por especialidad), cómo funciona, ubicación/horario/contacto. | Depende de `ticketcita.ts` (especialidades, constantes de contacto/ubicación). | La cuadrícula de especialidades usa `especialidades.slice(0, ESPECIALIDADES_VISIBLES_INICIAL)` y expande con el botón "Ver todas"; cada tarjeta es un `<Link>` a `/reservar` con `esp` precargado. Si se agrega un ícono nuevo a `esp.icono`, hay que añadirlo también al mapa `iconos` local **y** a los de `horarios.tsx` y `reservar.tsx` (cada ruta define su propio mapa). |
| `src/routes/reservar.tsx` | Flujo de reserva completo (el más largo y con más estado local). | Depende de `ticketcita.ts` (casi todos sus exports) y de componentes `ui/`. | Archivo grande (833 líneas); antes de tocarlo, entender bien las etapas del wizard (especialidad → médico → fecha/hora → datos → pago → comprobante). |
| `src/routes/panel.tsx` | Panel de recepción: agenda del día, confirmar pago en caja, reprogramar/cancelar, KPIs, administrar especialidades/médicos. Ejecuta `liberarVencidas()` en un intervalo de 30s. | Depende de `ticketcita.ts`. | Si se elimina o cambia el `setInterval` de `liberarVencidas`, se rompe la regla de negocio de los 15 minutos documentada en `INSTRUCCIONES.md`. |
| `src/routes/__root.tsx` | Layout raíz, `<head>`, boundaries de error/404. | Todas las rutas cuelgan de aquí vía `<Outlet />`. | No quitar `<Outlet />` (comentario explícito en el código: rompe todas las rutas hijas). |
| `src/router.tsx` | Crea el router y el `QueryClient`. | Usado por el entry point de TanStack Start (fuera de `src/`, generado por el framework). | No renombrar sin actualizar la config de TanStack Start. |
| `src/server.ts` | Entry point SSR/Worker; normaliza errores 500 "tragados" por `h3`. | Referenciado desde `vite.config.ts` (`tanstackStart.server.entry: "server"`). | Lógica delicada de manejo de errores; no simplificar el try/catch sin entender el comentario sobre `h3`. |
| `src/start.ts` | Middlewares globales (errores + CSRF). | TanStack Start lo detecta automáticamente por convención de nombre/ubicación. | Si se borra el archivo, TanStack Start instala su propio CSRF middleware por defecto (ver comentario en el código), pero se pierde el middleware de errores. |
| `src/routeTree.gen.ts` | Árbol de rutas autogenerado. | Generado a partir de `src/routes/*.tsx` por el plugin de TanStack Router (configurado en `vite.config.ts`). | **No editar a mano.** Se regenera automáticamente al correr `dev`/`build`. |
| `vite.config.ts` | Config de build propia: registra directamente los plugins de Tailwind, `vite-tsconfig-paths`, TanStack Start, Nitro (solo en `build`) y React. | Todo el build depende de este archivo. | Si se agrega un plugin nuevo, verificar que no duplique uno ya registrado aquí. |

## 7. Instalación y ejecución

Requisitos: **Node.js 20+**.

```bash
npm install
npm run dev
```

Luego abrir `http://localhost:8080` (puerto configurado en `vite.config.ts`).

Producción:

```bash
npm run build     # genera .output/ (Nitro, preset cloudflare-module)
npm run preview   # sirve la build de producción localmente
```

Otros scripts (`package.json`):

- `npm run lint` — ESLint (incluye reglas de Prettier).
- `npm run format` — Prettier (`prettier --write .`).
- `npm run build:dev` — build en modo desarrollo.

> El proyecto también trae `bun.lock` y `bunfig.toml`. Si se usa `bun` en vez de `npm`, los
> comandos equivalentes son `bun install`, `bun run dev`, etc. Ver sección 13 sobre por qué
> conviven ambos lockfiles.

## 8. Variables de entorno

**No se detectó ningún archivo `.env` en el proyecto.** La aplicación no usa variables de entorno
propias: no hay backend, API keys ni credenciales — todos los datos se generan en el navegador y se
guardan en `localStorage`.

Si en el futuro se conecta un backend real (ver sección 14), un `.env` típico podría verse así
(ejemplo, sin valores reales):

```env
DATABASE_URL=...
PAYMENT_GATEWAY_API_KEY=...
```

## 9. Dependencias

Principales (ver `package.json` para versiones exactas):

- **`@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/router-plugin`** — framework SSR
  y enrutamiento file-based.
- **`@tanstack/react-query`** — `QueryClient` está provisto en el árbol, aunque el dominio actual
  no hace fetch remoto (se deja preparado para cuando haya backend).
- **`nitro`** (devDependency) — build/deploy plugin usado en `vite.config.ts` solo durante
  `build`, preset `cloudflare-module`.
- **`react`, `react-dom`** (v19) — UI.
- **Radix UI (`@radix-ui/react-*`) + shadcn/ui** — primitivas de componentes accesibles usadas en
  `src/components/ui/`.
- **`tailwindcss` v4, `tw-animate-css`** — estilos.
- **`date-fns`, `react-day-picker`** — manejo de fechas y el calendario del flujo de reserva.
- **`react-hook-form`, `@hookform/resolvers`, `zod`** — formularios y validación.
- **`lucide-react`** — íconos.
- **`sonner`** — notificaciones toast.
- **`clsx`, `tailwind-merge`** — utilidades de clases CSS (`cn()` en `lib/utils.ts`).
- **`nitro`** (devDependency) — motor de build/servidor detrás de TanStack Start (preset Cloudflare
  por defecto).

## 10. Tests

**No se encontró ningún framework ni archivo de pruebas automatizadas** (no hay `*.test.ts`,
`*.spec.ts`, ni dependencias de testing como Vitest/Jest en `package.json`). La verificación actual
del proyecto se limita a:

- `npm run lint` (ESLint + Prettier)
- `npm run build` (compilación TypeScript + build de Vite/Nitro)

No hay cobertura de pruebas que documentar. Se recomienda añadir tests si el proyecto crece (ver
sección 14).

## 11. Convenciones

- **Idioma:** UI y datos de dominio en **español** (Perú); nombres de tipos/funciones en
  `src/lib/ticketcita.ts` también en español (`Cita`, `Medico`, `crearCita`, `soles`, etc.). El
  código de infraestructura (`server.ts`, `start.ts`, componentes `ui/` de shadcn) está en inglés.
- **Rutas:** una ruta por archivo en `src/routes/`, con `createFileRoute("/ruta")({...})`. Ver
  `src/routes/README.md` para la tabla de convenciones de nombres de archivo → URL. No crear
  `src/pages/` ni estructuras de Next.js/Remix.
- **Componentes UI:** los de `src/components/ui/` son generados por shadcn/ui (estilo "new-york",
  alias definidos en `components.json`); se tratan como código de librería, no de dominio.
- **Estilos:** Tailwind v4 con variables CSS de tema en `src/styles.css`; helper `cn()` para
  combinar clases condicionalmente.
- **Formato:** Prettier (`printWidth: 100`, comillas dobles, `;` obligatorio, trailing commas) vía
  `eslint-plugin-prettier`. Ejecutar `npm run format` antes de commitear cambios grandes.
- **Fechas:** siempre se construyen con componentes locales (`new Date(y, m, d)` o
  `new Date(`${iso}T12:00:00`)`), nunca con `toISOString()`, para evitar que el desfase UTC corra
  la fecha un día en la zona horaria de Perú (comentario explícito en `ticketcita.ts`).

## 12. Seguridad

- No se encontraron archivos `.env`, claves de API, tokens, contraseñas reales, certificados ni
  información personal identificable real en el código fuente.
- Las "contraseñas" que aparecen en `src/lib/ticketcita.ts` (`password: "123456"`) y en
  `INSTRUCCIONES.md` son **datos de demostración** documentados intencionalmente por el propio
  proyecto para pruebas locales (paciente de prueba DNI `70123456`); no son credenciales de un
  sistema real.
- Como no hay backend ni base de datos, no hay superficie de credenciales que proteger en este
  repositorio. Si se añade un backend real más adelante, cualquier secreto debe ir en variables de
  entorno fuera del control de versiones (ver sección 8) y nunca en `PROJECT.md` ni en el código.

## 13. Problemas conocidos

- **Sin pruebas automatizadas:** no hay tests (ver sección 10).
- **Persistencia solo local:** al vivir en `localStorage`, los datos no se comparten entre
  dispositivos/navegadores ni entre paciente, recepción y médico si abren la app en máquinas
  distintas — cada quien ve su propia copia del estado. Esto es una limitación conocida y
  documentada por el propio proyecto en `INSTRUCCIONES.md` ("Nota técnica").

## 14. Mejoras recomendadas

**Prioridad alta**

- Añadir un `.gitignore`-safe `.env.example` y preparar la migración a un backend real (base de
  datos + pasarela de pago) antes de usar la app con pacientes reales, tal como ya anticipa la
  "Nota técnica" de `INSTRUCCIONES.md`.

**Prioridad media**

- Corregir los errores de formato de Prettier (`npm run format`) y revisar los warnings de
  `react-refresh/only-export-components`.
- Añadir tests (unitarios para `src/lib/ticketcita.ts`, al menos para `crearCita` y
  `liberarVencidas`, que son la lógica de negocio más sensible).
- Versionar una migración de esquema para `localStorage` (actualmente `KEY = "ticketcita:v3"` se
  mezcla por spread superficial con `estadoInicial()`; documentar o automatizar qué pasa cuando
  cambie la forma de `Estado`).

**Prioridad baja**

- Extraer los datos base (`especialidadesBase`, `medicosBase`) de `ticketcita.ts` a un archivo de
  datos separado (p. ej. `src/lib/data/`) para reducir el tamaño del archivo principal (1095
  líneas).
- Revisar accesibilidad (`aria-*`) en los formularios largos de `reservar.tsx`.

*No se implementó ninguna de estas mejoras durante esta limpieza, tal como se solicitó.*

## 15. Estado actual

- **Funcionando:** la app instala (`npm install`), pasa el build de producción
  (`npm run build`, incluye compilación client + SSR + Nitro/Cloudflare) sin errores, y el flujo de
  negocio completo (especialidades, médicos, reserva, pago, panel de recepción, agenda del médico)
  está implementado en `src/lib/ticketcita.ts` y las rutas correspondientes.
- **Qué se limpió en la primera pasada:**
  - `.git` — puntero de *worktree* roto e inutilizable fuera de su entorno de origen.
  - `.wrangler/` — caché de configuración de despliegue de Cloudflare Wrangler, regenerada
    automáticamente en cada `build` (ya estaba en `.gitignore`).
  - `.workspace/` — carpeta vacía sin contenido.
  - No se eliminó, movió ni renombró ningún archivo de código fuente ni configuración funcional.
- **Migración fuera de Lovable (esta pasada):** se quitó toda dependencia de la plataforma
  Lovable para que el proyecto funcione como un proyecto TanStack Start estándar:
  - `vite.config.ts` reescrito sin el paquete `@lovable.dev/vite-tanstack-config`; ahora configura
    directamente los plugins de Tailwind, `vite-tsconfig-paths`, TanStack Start, Nitro
    (`cloudflare-module`) y React.
  - Se quitó `@lovable.dev/vite-tanstack-config` de `package.json` y se eliminó
    `src/lib/lovable-error-reporting.ts` junto con su uso en `src/routes/__root.tsx`.
  - Se eliminaron `.lovable/`, `AGENTS.md` (aviso específico de Lovable), `bun.lock` y el bloque de
    `minimumReleaseAgeExcludes` de paquetes `@lovable.dev/*` en `bunfig.toml`.
  - Se reescribió `README.md` sin branding de Lovable.
  - Se regeneró `package-lock.json` como único lockfile (npm).
- **Cambio de producto (posterior a la limpieza):** la sección "Nuestras especialidades" de Inicio
  (`src/routes/index.tsx`) se rediseñó para mostrar, directamente en cada tarjeta, una descripción
  breve y una línea "Atiende: ..." con las condiciones que trata esa especialidad, en vez de
  agrupar por categoría en filas con scroll horizontal. Esto añadió el campo **`atiende`** (string,
  requerido) al tipo `Especialidad` en `ticketcita.ts`, con contenido para las 26 especialidades
  reales del policlínico. También se afinaron 3 íconos (`eye` para Oftalmología, `ear` para
  Otorrinolaringología, `wind` para Neumología) — hay que mantenerlos sincronizados en los tres
  mapas `iconos` (`index.tsx`, `horarios.tsx`, `reservar.tsx`).
- **Verificado tras cada cambio:** `npm install`, `npx tsc --noEmit`, `npm run build` (✓ exitosos) y
  `npm run lint` (✓ corre; quedan ~15 errores de formato preexistentes de Prettier no relacionados
  con estos cambios — ver sección 13).
- **Pendiente:** ver sección 14 (mejoras recomendadas). Ninguna se implementó automáticamente.
