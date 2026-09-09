# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- La pantalla de dispositivos deja de llamar a siscom-api desde el navegador (ese origen no está en `ALLOWED_ORIGINS` y el preflight se rechazaba). Las comunicaciones van same-origin por `/api/public`; el Node de producción las reenvía. El resto de GAC no cambia.
- El panel de asignación ya no escribe `'preparado'` por el `PATCH` plano: usa `PATCH /devices/{id}/status`. Si el equipo ya tiene dueño, muestra titular y estado; si está montado en una unidad, hay que liberarlo antes de reasignar.
- El mapa no se marca listo hasta que Google Maps termina de cargar. Si falla, se muestra el error y no se reintenta en bucle.

### Changed

- Lockfile de CI: `npm audit fix` y Vitest 4.1.11 para cerrar los high/OSV que tumbaban `quality` y `security` (el código del corte no tocaba esas dependencias).

### Added

- Engineering foundation: `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.editorconfig`, `.nvmrc`
- Release discipline: `CHANGELOG.md`, `docs/RELEASE.md`, `scripts/setup.sh`, Husky hooks (commitlint, lint-staged, pre-push)
- CI guardrails: `ci.yml` (lint, type-check, build, audit) + Gitleaks and Semgrep in `security` job
- Separate `deploy.yml` for tag-based EC2 deployments (`v*.*.*` only)
- `scripts/gitleaks-scan.sh` and `npm run scan:secrets` (free CLI; no Gitleaks Action license required)
- Pull request template with base-branch and validate checklist
- Dev container (`.devcontainer/`) with post-create setup from `.env.example`
- Vitest unit tests for `roles`, `apiErrors`, `nexusStatus`, `commercialClient` utils
- Playwright smoke e2e (`e2e/smoke.spec.js`) — login redirect and sign-in UI
- ADRs (`docs/adr/0001`–`0003`) and `docs/security/threat-model.md`
- GitHub issue templates (bug, feature, security contact link)
- CI job `e2e` (informational, `continue-on-error: true`)
- Phase 3 quality gates: coverage thresholds (90% lines/statements/functions on `src/lib/**`), blocking e2e and audit CI jobs
- Expanded unit tests for `api.js`, `auth.js`, stores, and service modules
- `scripts/osv-scan.sh`, `npm run scan:osv`, OSV-Scanner in CI `security` job
- `.github/CODEOWNERS`, `docs/GOVERNANCE.md`, `.github/dependabot.yml`
- CI uploads coverage artifact from `test:coverage`

### Changed

- Split monolithic GitHub Actions workflow into `ci.yml` (quality gates) and `deploy.yml` (releases)
- `npm run validate` shortcut: lint + check + test:coverage + build
- Node.js 22 as target runtime in CI, `.nvmrc`, and `Dockerfile` base image
- Minor type fixes in `Input.svelte`, `billing.js`, and shipments detail page so `svelte-check` passes in CI
- CI: inject `PUBLIC_*` env vars before `svelte-check` (with localhost fallbacks)
- CI `quality` job runs unit tests after `svelte-check`

## [1.7.3] - 2026-08-10

### Added

- Botón **Regenerar acceso** en la ficha de la demo: libera una cuenta que quedó a medias y emite un código nuevo sin salir de la consola, para cuando el cliente se registró pero no consigue iniciar sesión

## [1.7.2] - 2026-08-10

### Fixed

- Los botones de copiar fallaban en la consola servida por HTTP: `navigator.clipboard` solo existe en contextos seguros. Se añade respaldo con `document.execCommand`, que es el único que funciona ahí
- El diálogo del código decía que el entorno se estaba creando. No es cierto: lo crea el invite-gate cuando el cliente canjea el código, porque necesita datos que nacen de ese registro

## [1.7.1] - 2026-08-10

### Fixed

- El alta de demo ofrecía un escenario inexistente (`alertas`). Los válidos son `commercial`, `normal` y `alerts`, resueltos por el entorno de demo; elegir uno inventado fallaba al aprovisionar, después de entregar el código al cliente
- Faltaba el escenario `commercial` (`Presentación comercial Querétaro`), el diseñado para esta pantalla. Pasa a ser el valor por defecto
- La ficha de detalle mostraba dos formatos de fecha distintos según de dónde viniera el dato

## [1.7.0] - 2026-08-10

### Added

- Accesos de demo de Nexus en `/sales/demos` (listado, alta y detalle) para que un vendedor genere y administre demostraciones a prospectos
- Sección `sales` en el Sidebar, con acceso para los roles `admin` y `vendedor`
- `demoStatus.js` (estado y vigencia derivados del reloj) y `clipboard.js` (copiado anunciado y mensaje listo para el cliente), con cobertura completa
- `DemoAccessReveal.svelte`: entrega del código de un solo uso, no descartable por accidente
- Prop opcional `confirmPhrase` en `ConfirmDialog` para las acciones irreversibles
