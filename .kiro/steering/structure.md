---
inclusion: always
---

# Estrutura do Projeto

Este projeto é um monorepo com dois módulos principais: backend (Spring Boot) e frontend (React + TypeScript).

## Visão Geral

```
/
├── backend/                        # Spring Boot (Java 21)
├── frontend/                       # React + TypeScript + Vite
├── .kiro/                          # Configurações do Kiro (steering, specs)
├── .github/                        # CI/CD (GitHub Actions)
├── docker-compose.yml              # Ambiente local completo
└── README.md
```

---

## Backend (`/backend`)

Estrutura modular orientada a feature, com pacote raiz `com.company.app`.

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/company/app/
│   │   │   ├── TasksApplication.java       # Entry point
│   │   │   ├── config/                     # Segurança, OpenAPI, beans globais
│   │   │   ├── common/                     # Exceções, utils, modelos de resposta
│   │   │   ├── tasks/                      # Módulo de tarefas
│   │   │   │   ├── api/                    # Controllers REST
│   │   │   │   ├── application/            # Services / casos de uso
│   │   │   │   ├── domain/                 # Entidades, value objects
│   │   │   │   └── infrastructure/         # Repositórios JPA
│   │   │   ├── gamification/               # Módulo de gamificação (XP, níveis, conquistas)
│   │   │   │   ├── api/
│   │   │   │   ├── application/
│   │   │   │   ├── domain/
│   │   │   │   └── infrastructure/
│   │   │   └── user/                       # Módulo de usuário e autenticação
│   │   │       ├── api/
│   │   │       ├── application/
│   │   │       ├── domain/
│   │   │       └── infrastructure/
│   │   └── resources/
│   │       ├── application.yml             # Configuração base
│   │       ├── application-local.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/               # Scripts Flyway (V1__*, V2__*, ...)
│   └── test/
│       └── java/com/company/app/           # Testes unitários e de integração
└── pom.xml
```

### Convenções do Backend

- Controllers ficam em `.api`, nunca expõem entidades diretamente — sempre DTOs.
- Lógica de negócio (XP, níveis, conquistas) reside exclusivamente em `.application` e `.domain`.
- Migrations de banco nomeadas como `V{numero}__{descricao}.sql` em `resources/db/migration`.
- Endpoints versionados em `/api/v1/...`.

---

## Frontend (`/frontend`)

Estrutura baseada em features, com separação clara entre lógica de negócio, UI e camada de game.

```
frontend/
├── src/
│   ├── app/                        # Bootstrap, providers, roteamento global
│   ├── features/
│   │   ├── tasks/                  # CRUD de tarefas
│   │   ├── gamification/           # Leaderboard, conquistas, XP display
│   │   └── auth/                   # Login, registro, guards de rota
│   ├── game/                       # Camada de game/animação (Phaser ou PixiJS)
│   │   ├── scenes/                 # Cenas do RPG (mapa, personagem)
│   │   └── assets/                 # Sprites, tilesets, sons
│   ├── shared/
│   │   ├── components/             # Componentes UI reutilizáveis
│   │   ├── hooks/                  # Hooks reutilizáveis
│   │   ├── services/               # Clientes de API (Axios)
│   │   ├── types/                  # Tipos e contratos TypeScript
│   │   └── utils/                  # Helpers puros
│   └── main.tsx                    # Entry point
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Convenções do Frontend

- A pasta `game/` é exclusiva para renderização e animação — sem chamadas de API ou lógica de negócio.
- Cada feature em `features/` é autossuficiente: componentes, hooks e tipos próprios.
- Serviços de API ficam em `shared/services/`, tipados com os DTOs do backend.
- Componentes reutilizáveis entre features ficam em `shared/components/`.

---

## Regras Gerais

- Nunca colocar lógica de negócio no frontend — apenas no backend.
- Nunca expor entidades JPA diretamente nas respostas da API — usar DTOs.
- Variáveis de ambiente nunca hardcoded — usar `.env` (local) e variáveis de CI/CD (produção).
- Novos módulos de gamificação devem ser criados no backend antes de serem consumidos pelo frontend.
