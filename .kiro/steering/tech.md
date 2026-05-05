---
inclusion: always
---

# Stack Tecnológica

## Visão Geral

| Camada | Tecnologia | Versão Mínima |
|--------|-----------|---------------|
| Backend | Spring Boot (Java) | 3.x / Java 21 LTS |
| Frontend | React (TypeScript) | 18+ |
| Game/Animação | Phaser ou PixiJS (TypeScript) | — |
| Banco de Dados | PostgreSQL | 15+ |
| Autenticação | Spring Security + JWT | — |
| Tempo Real | WebSocket (Spring) | — |
| Build Frontend | Vite | — |
| Migrations | Flyway ou Liquibase | — |
| API Docs | springdoc-openapi (OpenAPI 3) | — |
| Containers | Docker + Docker Compose | — |

---

## Backend (Spring Boot)

### Organização de Pacotes

Estrutura feature-first:

```
com.company.questboard.<feature>.api           # Controllers REST
com.company.questboard.<feature>.application   # Use cases / Services
com.company.questboard.<feature>.domain        # Entidades, Value Objects, regras de domínio
com.company.questboard.<feature>.infrastructure # Repositories, adapters externos
```

Pacotes compartilhados:
- `config` — Security, OpenAPI, beans globais
- `common` — Exceptions, utils, response models padronizados

### Padrões de API

- RESTful com substantivos no plural: `/api/v1/tasks`, `/api/v1/users`
- Versionamento via path: `/api/v1/...`
- **Nunca expor entidades JPA diretamente** — sempre usar DTOs
- Formato de erro padronizado: `timestamp`, `status`, `errorCode`, `message`, `path`, `traceId`
- Paginação: parâmetros `page`, `size`, `sort`

### Segurança

- JWT stateless via Spring Security
- Senhas com BCrypt/Argon2
- CORS restrito aos domínios do frontend
- Secrets via variáveis de ambiente — **nunca no repositório**
- Headers de segurança: HSTS, X-Content-Type-Options, etc.

### Qualidade e Testes

- Validação de payloads com Bean Validation (`@Valid`)
- `@RestControllerAdvice` para tratamento global de exceções
- Testes unitários: JUnit 5 + Mockito (cobertura ≥ 80% na lógica de negócio)
- Testes de integração: Testcontainers (obrigatório para fluxos críticos)
- Logging estruturado (JSON em produção) com mascaramento de dados sensíveis

---

## Frontend (React + TypeScript)

### Estrutura de Pastas

```
src/
├── app/              # Bootstrap, providers, roteamento
├── features/         # Módulos por funcionalidade (tasks, gamification, auth...)
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── game/             # Lógica do ambiente interativo (Phaser/PixiJS)
├── shared/
│   ├── components/   # UI reutilizável
│   ├── hooks/        # Hooks genéricos
│   ├── services/     # API client centralizado
│   ├── types/        # Contratos TypeScript alinhados com DTOs do backend
│   └── utils/        # Helpers puros
└── store/            # Estado global (Context + hooks; Redux Toolkit só se necessário)
```

### Padrões de Código

- TypeScript strict mode habilitado
- Componentes pequenos e focados; preferir composição
- Estado de servidor separado do estado de UI
- Cliente HTTP centralizado com: base URL, timeout, injeção de token, mapeamento de erros
- Modelos de request/response tipados e alinhados com os DTOs do backend
- Validação de formulários: React Hook Form + Zod
- Acessibilidade mínima: WCAG 2.1 AA, navegação por teclado, aria labels

### Camada de Game/Animação

- Responsabilidade exclusiva do frontend em TypeScript
- Usar Phaser ou PixiJS para renderização do mundo interativo
- Isolar toda lógica de game em `src/game/` — não misturar com lógica de negócio
- Comunicar com o backend apenas via API REST (nunca calcular XP/níveis no frontend)

### Qualidade e Testes

- ESLint + Prettier obrigatórios
- Testes de componente: React Testing Library + Vitest
- E2E: Playwright ou Cypress para fluxos críticos (auth, criação de tarefa, conclusão)
- Bloquear merge em falhas de lint, type-check ou testes

---

## DevOps e Infraestrutura

- Multi-stage Docker builds com imagens mínimas e usuário não-root
- CI/CD: GitHub Actions (lint → test → build → Docker image)
- Observabilidade: Micrometer + Prometheus + Grafana
- Ambientes: `local`, `dev`, `staging`, `prod` — configs via variáveis de ambiente
- Zero-downtime deployment (rolling ou blue-green)
