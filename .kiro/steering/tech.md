---
inclusion: always
---

# Stack Tecnológica

## Backend (Spring Boot)

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Java | 21 (LTS) | Linguagem principal |
| Spring Boot | 3.x | Framework base |
| Spring Web | - | Controllers REST |
| Spring Data JPA | - | Acesso a dados |
| Spring Security | - | Autenticação e autorização |
| Jakarta Validation | - | Validação de payloads |
| Flyway | - | Migrations de banco |
| springdoc-openapi | - | Documentação OpenAPI/Swagger |
| JUnit + Mockito | - | Testes unitários |
| Testcontainers | - | Testes de integração |

### Convenções Backend

- Usar `record` do Java para DTOs imutáveis.
- Anotações de validação (`@NotNull`, `@NotBlank`, etc.) nos DTOs de request.
- Handler global de erros com `@RestControllerAdvice`.
- JWT stateless para autenticação (Spring Security).
- Senhas com hash BCrypt.
- Logs estruturados em JSON (produção); usar SLF4J + Logback.
- Nunca retornar entidades JPA diretamente — sempre mapear para DTOs.

---

## Banco de Dados

| Tecnologia | Uso |
|-----------|-----|
| PostgreSQL | Banco principal (produção e dev) |
| H2 (opcional) | Testes unitários rápidos |
| Flyway | Versionamento de schema |

### Convenções de Banco

- Scripts de migration nomeados como `V{numero}__{descricao}.sql`.
- Nunca alterar migrations já aplicadas — criar nova migration.
- Indexar colunas usadas em filtros e joins frequentes.

---

## Frontend (React)

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 18+ | Framework UI |
| TypeScript | 5+ | Linguagem principal |
| Vite | - | Build tool |
| React Router | 6+ | Roteamento |
| Axios | - | Cliente HTTP |
| React Hook Form | - | Gerenciamento de formulários |
| Zod | - | Validação de schema |
| Context API + hooks | - | Estado global (padrão inicial) |
| Redux Toolkit | - | Estado global (apenas se necessário) |

### Convenções Frontend

- TypeScript em modo `strict`.
- Componentes funcionais com hooks — sem class components.
- Tipos de request/response alinhados com os DTOs do backend.
- Cliente Axios centralizado em `shared/services/` com interceptors para auth e erros.
- Nunca armazenar tokens sensíveis em `localStorage` — preferir `HttpOnly` cookies.
- ESLint + Prettier obrigatórios; bloquear merge com erros de lint.

---

## Camada de Game/Animação

| Tecnologia | Uso |
|-----------|-----|
| Phaser 3 ou PixiJS | Renderização do personagem RPG e mapa |
| TypeScript | Linguagem da camada de game |

### Convenções Game

- A camada de game fica isolada em `frontend/src/game/`.
- Sem chamadas de API diretas nessa camada — recebe dados via props ou contexto React.
- Sem lógica de negócio (XP, níveis) — apenas apresentação e animação.
- Assets (sprites, tilesets) ficam em `frontend/src/game/assets/`.

---

## DevOps e Infraestrutura

| Tecnologia | Uso |
|-----------|-----|
| Docker + Docker Compose | Ambiente local e containerização |
| GitHub Actions | CI/CD |
| Nginx | Hospedagem do frontend / proxy reverso |
| Micrometer + Prometheus | Métricas |
| Grafana | Dashboards de monitoramento |

### Pipeline CI mínimo

1. Lint e formatação (frontend)
2. Testes unitários (backend e frontend)
3. Testes de integração (backend com Testcontainers)
4. Build dos artefatos
5. Build das imagens Docker
6. Publicação (apenas em branches protegidas)

---

## Ambientes

| Perfil | Descrição |
|--------|-----------|
| `local` | Desenvolvimento local com Docker Compose |
| `dev` | Ambiente de desenvolvimento compartilhado |
| `staging` | Homologação antes de produção |
| `prod` | Produção |

- Configurações sensíveis (senhas, secrets) **nunca** no repositório — usar variáveis de ambiente ou secret manager.
- Cada ambiente tem seu próprio banco e secrets.
