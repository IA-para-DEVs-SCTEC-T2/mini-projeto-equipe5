---
inclusion: always
---

# Project Structure

Monorepo with two main modules: `backend/` (Spring Boot, Java 21) and `frontend/` (React + TypeScript + Vite).

```
/
├── backend/                  # Spring Boot (Java 21)
├── frontend/                 # React + TypeScript + Vite
├── .kiro/                    # Kiro config (steering, specs)
├── .github/                  # CI/CD (GitHub Actions)
├── docker-compose.yml        # Full local environment
└── README.md
```

---

## Backend (`/backend`)

Root package: `com.company.app`. Feature-oriented modular structure.

```
backend/src/main/java/com/company/app/
├── TasksApplication.java         # Entry point
├── config/                       # Security, OpenAPI, global beans
├── common/                       # Exceptions, utils, response models
├── tasks/                        # Tasks module
│   ├── api/                      # REST controllers
│   ├── application/              # Services / use cases
│   ├── domain/                   # Entities, value objects
│   └── infrastructure/           # JPA repositories
├── gamification/                 # XP, levels, achievements module
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
└── user/                         # User and auth module
    ├── api/
    ├── application/
    ├── domain/
    └── infrastructure/

backend/src/main/resources/
├── application.yml               # Base config
├── application-local.yml
├── application-dev.yml
├── application-prod.yml
└── db/migration/                 # Flyway scripts: V{n}__{description}.sql
```

### Backend Conventions

- **Layer responsibilities:** `.api` = controllers only; `.application` = all business logic; `.domain` = entities/value objects; `.infrastructure` = JPA repositories.
- **DTOs:** Always use Java `record` types for DTOs. Never expose JPA entities in API responses.
- **Endpoints:** All routes versioned under `/api/v1/...`.
- **Migrations:** Named `V{n}__{description}.sql` in `resources/db/migration/`. Never modify an already-applied migration — always create a new one.
- **New gamification features:** Model and implement in backend first, then expose to frontend.

---

## Frontend (`/frontend`)

Feature-based structure with strict separation between UI, business display, and game layer.

```
frontend/src/
├── app/                      # Bootstrap, providers, global routing
├── features/
│   ├── tasks/                # Task CRUD (components, hooks, types)
│   ├── gamification/         # Leaderboard, achievements, XP display
│   └── auth/                 # Login, registration, route guards
├── game/                     # Game/animation layer (Phaser or PixiJS)
│   ├── scenes/               # RPG scenes (map, character)
│   └── assets/               # Sprites, tilesets, sounds
├── shared/
│   ├── components/           # Reusable UI components (cross-feature)
│   ├── hooks/                # Reusable hooks
│   ├── services/             # Axios API clients (typed with backend DTOs)
│   ├── types/                # Shared TypeScript types and contracts
│   └── utils/                # Pure helper functions
└── main.tsx                  # Entry point
```

### Frontend Conventions

- **`game/`** is strictly for rendering and animation — no API calls, no business logic.
- **`features/`** each feature is self-contained: its own components, hooks, and types.
- **`shared/services/`** holds all Axios clients, typed to match backend DTOs.
- **`shared/components/`** for components reused across multiple features.
- Business logic (XP calculation, level-ups, achievements) lives exclusively in the backend.

---

## General Rules

- Business logic belongs in the backend only — never in the frontend.
- JPA entities must never be returned directly from API endpoints — always map to DTOs.
- No hardcoded environment variables — use `.env` locally and CI/CD secrets in production.
- New gamification modules must be built in the backend before being consumed by the frontend.
