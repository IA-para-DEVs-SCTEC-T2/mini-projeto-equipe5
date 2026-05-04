---
inclusion: always
---

# Stack Tecnológica

## Backend — Spring Boot (Java 21)

| Tecnologia | Versão | Uso |
|---|---|---|
| Java | 21 (LTS) | Linguagem principal |
| Spring Boot | 3.x | Framework base |
| Spring Web | - | Controllers REST |
| Spring Data JPA | - | Acesso a dados |
| Spring Security | - | Autenticação e autorização (JWT stateless) |
| Jakarta Validation | - | Validação de payloads |
| Flyway | - | Migrations de banco |
| springdoc-openapi | - | Documentação OpenAPI/Swagger |
| JUnit + Mockito | - | Testes unitários |
| Testcontainers | - | Testes de integração |

### Regras obrigatórias

- **DTOs:** usar `record` do Java para DTOs imutáveis; nunca expor entidades JPA nas respostas da API.
- **Validação:** anotar DTOs de request com `@NotNull`, `@NotBlank`, etc.
- **Erros:** handler global com `@RestControllerAdvice`; respostas de erro padronizadas.
- **Auth:** JWT stateless via Spring Security; senhas com hash BCrypt.
- **Logs:** SLF4J + Logback; JSON estruturado em produção.
- **Endpoints:** versionados em `/api/v1/...`.
- **Arquitetura por feature:** pacotes `.api` (controllers), `.application` (services/casos de uso), `.domain` (entidades), `.infrastructure` (repositórios JPA). Lógica de negócio reside exclusivamente em `.application` e `.domain`.

---

## Banco de Dados

| Tecnologia | Uso |
|---|---|
| PostgreSQL | Banco principal (produção e dev) |
| H2 (opcional) | Testes unitários rápidos |
| Flyway | Versionamento de schema |

### Regras obrigatórias

- Migrations nomeadas como `V{numero}__{descricao}.sql` em `resources/db/migration/`.
- Nunca alterar migrations já aplicadas — sempre criar nova migration.
- Indexar colunas usadas em filtros e joins frequentes.

---

## Frontend — React + TypeScript

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18+ | Framework UI |
| TypeScript | 5+ (strict) | Linguagem principal |
| Vite | - | Build tool |
| React Router | 6+ | Roteamento |
| Axios | - | Cliente HTTP |
| React Hook Form | - | Formulários |
| Zod | - | Validação de schema |
| Context API + hooks | - | Estado global (padrão) |
| Redux Toolkit | - | Estado global (apenas se necessário) |

### Regras obrigatórias

- TypeScript em modo `strict`; sem `any` implícito.
- Apenas componentes funcionais com hooks — sem class components.
- Tipos de request/response alinhados com os DTOs do backend.
- Cliente Axios centralizado em `shared/services/` com interceptors para auth e erros.
- Nunca armazenar tokens em `localStorage` — usar `HttpOnly` cookies.
- ESLint + Prettier obrigatórios; merge bloqueado com erros de lint.
- Lógica de negócio (XP, níveis, conquistas) nunca no frontend — apenas no backend.

---

## Camada de Game/Animação

| Tecnologia | Uso |
|---|---|
| Phaser 3 ou PixiJS | Renderização do personagem RPG e mapa |
| TypeScript | Linguagem da camada de game |

### Regras obrigatórias

- Código isolado em `frontend/src/game/`; assets em `frontend/src/game/assets/`.
- Sem chamadas de API diretas — recebe dados via props ou contexto React.
- Sem lógica de negócio — apenas apresentação e animação.

---

## DevOps e Infraestrutura

| Tecnologia | Uso |
|---|---|
| Docker + Docker Compose | Ambiente local e containerização |
| GitHub Actions | CI/CD |
| Nginx | Hospedagem do frontend / proxy reverso |
| Micrometer + Prometheus | Métricas |
| Grafana | Dashboards de monitoramento |

### Pipeline CI (ordem obrigatória)

1. Lint e formatação (frontend)
2. Testes unitários (backend e frontend)
3. Testes de integração (backend com Testcontainers)
4. Build dos artefatos
5. Build das imagens Docker
6. Publicação (apenas em branches protegidas)

---

## Ambientes

| Perfil | Descrição |
|---|---|
| `local` | Desenvolvimento local com Docker Compose |
| `dev` | Ambiente de desenvolvimento compartilhado |
| `staging` | Homologação antes de produção |
| `prod` | Produção |

- Secrets e credenciais **nunca** no repositório — usar variáveis de ambiente ou secret manager.
- Cada ambiente tem seu próprio banco e conjunto de secrets.
