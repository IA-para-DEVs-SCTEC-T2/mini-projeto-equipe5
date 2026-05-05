---
inclusion: always
---

# Estrutura do Repositório

O projeto segue o padrão **MVC** com separação clara entre backend (Model + Controller) e frontend (View + Game).

```
questboard/
├── backend/                          # Spring Boot — Model + Controller
│   └── src/main/java/com/company/questboard/
│       ├── <feature>/
│       │   ├── api/                  # Controllers REST
│       │   ├── application/          # Services / Use Cases
│       │   ├── domain/               # Entidades, Value Objects, regras de domínio
│       │   └── infrastructure/       # Repositories, adapters
│       ├── config/                   # Security, OpenAPI, beans globais
│       └── common/                   # Exceptions, utils, response models
│   └── pom.xml
│
├── frontend/                         # React + TypeScript — View + Game
│   └── src/
│       ├── app/                      # Bootstrap, providers, roteamento
│       ├── features/                 # Módulos por funcionalidade
│       │   ├── tasks/                # Gestão de tarefas (Kanban, criação, conclusão)
│       │   ├── gamification/         # XP, níveis, conquistas, leaderboard
│       │   ├── auth/                 # Login, registro, guards de rota
│       │   └── dashboard/            # Métricas e progresso
│       ├── game/                     # Ambiente interativo (Phaser/PixiJS)
│       │   ├── scenes/               # Cenas do mundo RPG
│       │   ├── entities/             # Personagem, NPCs, objetos do mapa
│       │   └── assets/               # Sprites, tilemaps, sons
│       ├── shared/
│       │   ├── components/           # UI reutilizável
│       │   ├── hooks/                # Hooks genéricos
│       │   ├── services/             # API client centralizado
│       │   ├── types/                # Contratos TypeScript (alinhados com DTOs)
│       │   └── utils/                # Helpers puros
│       └── store/                    # Estado global
│   └── package.json
│
└── docs/                             # Documentação adicional, diagramas, ADRs
```

## Regras de Organização

### Backend
- Cada feature é um pacote isolado com suas próprias camadas (`api`, `application`, `domain`, `infrastructure`).
- Entidades JPA ficam em `domain/` — nunca expostas diretamente pela API.
- Toda lógica de gamificação (XP, níveis, conquistas) é uma feature própria no backend.

### Frontend
- Cada feature em `src/features/<feature>/` contém seus próprios `components/`, `hooks/`, `services/` e `types/`.
- A pasta `src/game/` é exclusiva para a camada de animação/RPG — não importar lógica de negócio aqui.
- Tipos em `src/shared/types/` devem espelhar os DTOs do backend para garantir consistência de contrato.

### Geral
- Não criar arquivos fora das pastas definidas sem justificativa documentada.
- Novos módulos de gamificação seguem o fluxo: entidade no backend → DTO → endpoint → consumo no frontend.
- Documentação técnica e ADRs vão em `docs/`.
