# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**wire_copy** is an industrial SCADA (Supervisory Control and Data Acquisition) system with a multi-service architecture: a React frontend, a central Django backend, and distributed edge services (Python PLC gateway + local Django). Data flows from PLCs → MQTT → Redis → Django Channels → WebSocket → Browser.

## Development Commands

### Docker (primary workflow)

```bash
make up        # Start all containers
make down      # Stop containers (keep volumes)
make build     # Rebuild images
make clean     # Stop and remove orphans
make prune     # Clean Docker images and cache
```

### Frontend (inside `frontend/`)

```bash
npm run dev      # Vite dev server on :5173
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Django API (inside `django-api/`)

```bash
python manage.py runserver         # Dev server
python manage.py makemigrations
python manage.py migrate
```

## Architecture

### Services (docker-compose.yml)

| Service | Port | Description |
|---|---|---|
| `frontend` | 5173 | React + Vite |
| `django-api` | 8000 | Django REST API (Gunicorn) |
| `django-ws` | 8002 | Django WebSocket (Daphne) |
| `postgres` | 5433 | PostgreSQL (`industry4_v2`) |
| `redis-central` | — | Redis (pub/sub, cache, Channels layer) |

Frontend dev proxy: all `/api/*` requests are proxied to `http://django-api:8000`.

### Data Flow (Realtime)

1. Edge PLC Gateway polls PLCs via Snap7 / OPC UA / Modbus TCP
2. Gateway publishes readings to MQTT: `scada/{Site}/{Area}/{Line}/{Cell}/{Equipment}/{Variable}`
3. Central `redis_stream_consumer` subscribes from MQTT → pushes to Redis streams
4. Django Channels consumer broadcasts stream data → WebSocket clients
5. Frontend `RealtimeProvider` receives live updates and re-renders widgets

### Key Backend Apps (`django-api/`)

| App | URL prefix | Purpose |
|---|---|---|
| `auth_manager` | `/api/auth/` | JWT login/refresh (cookies + tokens) |
| `industrial_config_manager` | `/api/config/` | ISA-95 hierarchy, PLC, Tag models |
| `edge_config` | `/api/edge/` | Gateway config export; tag/PLC listing |
| `scada_manager` | `/api/scada/` | SCADA canvas layouts |
| `map_manager` | `/api/map/` | Geographic map data |
| `powerbi_manager` | `/api/powerbi/` | Power BI embed |
| `realtime` | `/api/realtime/` + WS | Channels consumers + Redis stream consumer |
| `core.favorites` | `/api/favorites/` | Favorite dashboards |

`edge_config` uses **Edge API Key** auth for gateway-to-central calls; all user-facing endpoints use **JWT**.

### Key Frontend Structure (`frontend/src/`)

- **`context/RealtimeProvider.jsx`** — WebSocket context; provides live tag values app-wide.
- **`context/ScadaConfigProvider.jsx`** — Loads flat tag list from `/api/edge/gateway/tags/` on startup; indexes tags for the canvas.
- **`modules/organizarScada/`** — Main SCADA canvas designer (drag-drop widgets, tag binding, property sidebar).
- **`modules/scada/pages/Communications.jsx`** — Device/PLC configuration (SNAP7, OPC UA, Modbus TCP).
- **`modules/hmi/`**, **`modules/maps/`**, **`modules/powerBI/`** — Other dashboard types.
- **`store/`** — Zustand stores: `useAuthStore`, `useLayoutStore`, `useFavoriteStore`, `usePowerBiStore`.
- **`services/scadaService.js`** — Axios API wrappers.

Alias `@` maps to `frontend/src/`.

### ISA-95 Hierarchy

Industrial data is organized as: **Site → Area → Line → Cell → Equipment → Tags**. This hierarchy appears in the DB models (`industrial_config_manager/models.py`), YAML gateway configs, MQTT topics, and the frontend tag selector.

### Edge Services (`edge/`)

- **`edge/gateway/`** — Async Python; reads PLCs, publishes to MQTT; configured via YAML files in `/opt/suite/config/plc/`.
- **`edge/core_backend/`** — Django + Daphne; local config storage, MQTT bridge, WebSocket relay.
- **`customers/clienteA/`** — Per-customer Docker Compose and env overrides.

## Multi-Tenancy

Each tenant (customer) is isolated by MQTT credentials and a separate Docker Compose in `customers/<name>/`. The `.env` sets `TENANTS=customerA,customerB`. Frontend scopes realtime connections and tag loading to the authenticated user's `client.id`.

## Auth

- JWT access tokens (60 min) + refresh tokens (7 days) via `djangorestframework-simplejwt`.
- Tokens stored in HTTP-only cookies.
- Edge gateway uses a separate API key header (`EdgeApiKeyPermission`).
