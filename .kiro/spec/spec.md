# Especificação Full-Stack: Gamificação para Controle de Tarefas

## 1) Objetivo

Definir a arquitetura técnica da aplicação de gamificação para controle de tarefas — um sistema que transforma tarefas do dia a dia em uma jornada visual estilo RPG retrô, com XP, níveis, conquistas e leaderboards.

Stack principal:

- **Frontend:** React (TypeScript) — interface de tarefas e cenário RPG
- **Backend:** Spring Boot (Java) — lógica de negócio, XP, níveis e conquistas
- **Game/Animação:** Bibliotecas TypeScript (Phaser ou PixiJS) — camada visual do personagem e mapa
- **Banco de dados:** PostgreSQL
- **Estilo de API:** REST (com documentação OpenAPI)

Esta especificação estabelece arquitetura, padrões de código, segurança, testes, deploy e boas práticas operacionais.

---

## 2) Escopo

### Incluso

- SPA React para funcionalidades de tarefas e interface de gamificação
- Camada de game/animação (personagem RPG, mapa, animações) em TypeScript
- API REST Spring Boot para lógica de negócio (tarefas, XP, níveis, conquistas, leaderboards)
- Autenticação e autorização
- Logging centralizado e monitoramento
- CI/CD e deploy containerizado
- Documentação e critérios de qualidade

### Não incluso

- Aplicativos mobile nativos
- Decomposição em microsserviços (inicialmente monolito)
- Arquitetura orientada a eventos (pode ser evolução futura)

---

## 3) Arquitetura de Alto Nível

### 3.1 Componentes do Sistema

- **Aplicação React**
  Responsável pela renderização da UI de tarefas, interface de gamificação, gerenciamento de estado e integração com a API.

- **Camada Game/Animação (Phaser ou PixiJS)**
  Renderiza o personagem RPG retrô, o mapa e as animações de progresso. Consome dados de progresso via API ou estado compartilhado com o React.

- **API Spring Boot**
  Implementa toda a lógica de negócio: tarefas, cálculo de XP, progressão de níveis, desbloqueio de conquistas, leaderboards, validação, segurança e persistência.

- **Banco de Dados PostgreSQL**
  Armazena dados relacionais com versionamento de schema via migrations.

- **Proxy Reverso / API Gateway (opcional inicialmente)**
  Roteamento de tráfego, terminação TLS, compressão de estáticos e headers de segurança.

### 3.2 Princípios Arquiteturais

- Monolito modular para manter a complexidade sob controle no início
- Separação clara de responsabilidades (UI, aplicação, domínio, infraestrutura)
- Design de API orientado a contrato
- Evolução de API com compatibilidade retroativa
- Configuração e deploy inspirados nos 12 fatores

---

## 4) Stack Tecnológica

### Frontend

- React 18+
- TypeScript
- Vite (preferido)
- React Router
- Gerenciamento de estado: Context + hooks inicialmente, migrar para Redux Toolkit apenas se necessário
- Cliente HTTP: Axios ou wrapper de Fetch
- Formulários: React Hook Form + validação por schema (Zod/Yup)
- UI: Biblioteca de componentes (MUI/AntD/Chakra) ou componentes de design system

### Game/Animação (Frontend)

- Phaser ou PixiJS para renderização do personagem RPG e mapa
- Integração com o estado React via contexto ou eventos
- Responsabilidade exclusiva de apresentação — sem lógica de negócio nessa camada

### Backend

- Java 21 (LTS) preferido
- Spring Boot 3+
- Spring Web
- Spring Data JPA
- Spring Security
- Bean Validation (Jakarta Validation)
- Flyway ou Liquibase para migrations de banco
- springdoc-openapi para documentação da API

### Plataforma/DevOps

- Docker + Docker Compose
- GitHub Actions ou GitLab CI
- Nginx ou similar para hospedagem do frontend/proxy reverso
- Observabilidade: Micrometer + Prometheus + Grafana (recomendado)

---

## 5) Especificação do Backend (Spring Boot)

### 5.1 Organização de Pacotes

Usar estrutura modular orientada a feature quando possível:

- `com.company.app.tasks` (CRUD de tarefas)
- `com.company.app.gamification` (XP, níveis, conquistas, leaderboards)
- `com.company.app.user` (perfil e autenticação)

Cada módulo segue a estrutura:

- `.api` (controllers)
- `.application` (casos de uso/serviços)
- `.domain` (entidades/value objects/lógica de domínio)
- `.infrastructure` (repositórios/adaptadores)

Pacotes compartilhados:

- `config` (segurança, openapi, configuração de beans)
- `common` (exceções, utilitários, modelos de resposta)

### 5.2 Padrões de Design de API

- Nomenclatura RESTful de recursos (substantivos no plural)
- Versionamento via `/api/v1/...`
- Usar DTOs para request/response (nunca expor entidades diretamente)
- Formato de erro padronizado:
  - timestamp
  - status
  - código de erro
  - mensagem
  - path
  - traceId (se disponível)
- Paginação com contrato consistente:
  - `page`, `size`, `sort`
- Usar idempotência onde necessário (semântica PUT/PATCH)

### 5.3 Validação e Tratamento de Erros

- Validar todos os payloads recebidos com anotações Bean Validation
- Handler global de exceções usando `@RestControllerAdvice`
- Exceções de domínio mapeadas para status codes amigáveis ao negócio
- Nunca vazar stack traces internos nas respostas da API

### 5.4 Segurança

- Usar Spring Security com JWT (stateless) ou autenticação por sessão (se ferramenta interna)
- Senhas com hash BCrypt/Argon2
- Controle de acesso baseado em roles/authorities nos endpoints
- CORS restrito a domínios de frontend conhecidos
- Proteções CSRF se autenticação por cookies/sessão
- Padrões seguros:
  - desabilitar endpoints desnecessários
  - headers estritos (HSTS, X-Content-Type-Options, etc.)
  - segredos via variáveis de ambiente/secret manager (nunca no repositório)

### 5.5 Acesso a Dados

- Usar repositórios Spring Data JPA
- Evitar problemas de N+1 via estratégias de fetch/projections
- Manter transações explícitas e mínimas
- Migrations gerenciadas exclusivamente via Flyway/Liquibase
- Indexar colunas críticas para consultas

### 5.6 Logging e Observabilidade

- Logging estruturado (JSON preferido em produção)
- Propagação de correlation/trace ID
- Logging de request/response com mascaramento de dados sensíveis
- Endpoints de health e métricas via Actuator (protegidos)

### 5.7 Estratégia de Testes (Backend)

- Testes unitários: serviços/lógica de domínio (JUnit + Mockito)
- Testes de integração: repositórios/controllers (Testcontainers preferido)
- Testes de contrato para compatibilidade de API (opcional, mas recomendado)
- Thresholds de cobertura:
  - lógica de negócio >= 80%
  - fluxos críticos devem ter testes de integração

---

## 6) Especificação do Frontend (React)

### 6.1 Estrutura do Projeto

Usar estrutura de pastas clara e escalável:

- `src/app` (bootstrap da aplicação, providers, roteamento)
- `src/features/<feature>` (módulos de feature)
- `src/shared/components` (UI reutilizável)
- `src/shared/hooks` (hooks reutilizáveis)
- `src/shared/services` (clientes de API)
- `src/shared/types` (tipos/contratos TypeScript)
- `src/shared/utils` (helpers puros)

### 6.2 Boas Práticas de UI e Estado

- Manter componentes pequenos e focados
- Preferir composição em vez de herança
- Separar lógica de apresentação e de container quando útil
- Manter estado de servidor distinto do estado de UI
- Minimizar estado global; derivar estado quando possível

### 6.3 Integração com a API

- Cliente de API centralizado com:
  - URL base
  - timeout
  - tratamento de token de autenticação
  - mapeamento padronizado de erros
- Modelos de request/response tipados alinhados com os DTOs do backend
- Tratamento de erros amigável ao usuário e estratégia de retry para falhas transitórias

### 6.4 Formulários e Validação

- Usar validação client-side baseada em schema
- Espelhar regras de validação do backend quando prático
- Exibir mensagens de validação acessíveis
- Prevenir submissões duplicadas

### 6.5 Segurança (Frontend)

- Nunca armazenar segredos no código frontend
- Preferir cookies HttpOnly para tokens sensíveis quando viável
- Evitar localStorage para contextos de autenticação de alto risco
- Sanitizar inputs HTML não confiáveis
- Configurar CSP estrita onde possível

### 6.6 Acessibilidade e UX

- Práticas mínimas WCAG 2.1 AA
- Suporte a navegação por teclado
- Aria labels adequados e HTML semântico
- Estados de carregamento, estado vazio e estado de erro para todas as telas assíncronas

### 6.7 Estratégia de Testes (Frontend)

- Testes unitários/de componente: React Testing Library + Vitest/Jest
- Testes E2E: Playwright ou Cypress para jornadas críticas do usuário
- Testes de snapshot apenas para primitivos visuais estáveis
- Testes obrigatórios para autenticação, guards de roteamento e fluxos CRUD principais

---

## 7) Contrato de API e Colaboração

- Manter a spec OpenAPI como fonte da verdade
- Gerar/atualizar docs da API no CI
- Compartilhar contratos e exemplos de DTOs entre times
- Definir política explícita de depreciação:
  - marcar endpoints depreciados
  - fornecer prazo de migração
  - remover apenas em versão maior da API

---

## 8) Configuração e Ambientes

### 8.1 Perfis de Ambiente

- `local`
- `dev`
- `staging`
- `prod`

### 8.2 Regras de Configuração

- Sem credenciais hardcoded
- Configurações orientadas a variáveis de ambiente
- Valores distintos de banco e segredos por ambiente
- Feature flags para releases arriscados

---

## 9) Fluxo de Desenvolvimento e Critérios de Qualidade

### 9.1 Fluxo Git

- Trunk-based com branches de curta duração ou GitFlow (escolha do time)
- Mensagens de commit Conventional Commits recomendadas
- Code reviews obrigatórios em PRs (mínimo 1 aprovador)

### 9.2 Análise Estática e Formatação

- Backend: Checkstyle/SpotBugs/Sonar (ou equivalente)
- Frontend: ESLint + Prettier + TypeScript em modo strict
- Bloquear merge em falhas de lint/tipo/teste

### 9.3 Pipeline de CI Mínimo

1. Instalar dependências
2. Verificação de lint e formatação
3. Executar testes unitários
4. Executar testes de integração (backend)
5. Build dos artefatos de frontend e backend
6. Build das imagens Docker
7. Publicar artefatos/imagens (se em branch protegida)

---

## 10) Deploy e Operações

### 10.1 Containers

- Builds Docker multi-stage
- Imagens de runtime enxutas
- Usuário não-root no container
- Probes de readiness/liveness

### 10.2 Runtime

- Suporte a escalonamento horizontal
- Estratégia de deploy sem downtime (rolling/blue-green)
- Procedimentos de backup e restore documentados e testados

### 10.3 Monitoramento e Alertas

- Monitorar latência de API, taxas de erro, saturação e throughput
- Alertar em violações de SLO
- Agregação de logs com dashboards pesquisáveis

---

## 11) Requisitos Não-Funcionais

- **Performance:** P95 de resposta da API < 500ms nos endpoints principais (baseline alvo)
- **Disponibilidade:** Mínimo de 99,5% (adaptar às necessidades do negócio)
- **Segurança:** Mitigações do OWASP Top 10 aplicadas
- **Manutenibilidade:** Padrões de código limpo e regras de arquitetura aplicados
- **Escalabilidade:** Deve suportar ao menos 10x a carga esperada atual com escalonamento horizontal

---

## 12) Definição de Pronto (DoD)

Uma feature está pronta somente quando:

- Requisitos de negócio implementados e aceitos
- Testes unitários e de integração/componente adicionados e passando
- Documentação da API atualizada (se o contrato mudou)
- Verificações de segurança aprovadas
- Lint e análise estática limpos
- Hooks de observabilidade implementados (logs/métricas)
- PR aprovado e mergeado pelo pipeline de CI

---

## 13) Marcos Iniciais

### Marco 1 - Fundação

- Estrutura do repositório estabelecida
- Pipeline de CI funcionando
- App base Spring Boot + app base React
- Autenticação, endpoints de health e layout principal

### Marco 2 - Domínio Principal

- CRUD de tarefas (frontend + backend + banco)
- Lógica de XP e níveis no backend
- Validação, tratamento de erros e testes
- Documentação OpenAPI publicada

### Marco 3 - Gamificação Visual

- Integração da camada de game/animação (personagem RPG no mapa)
- Conquistas e leaderboards
- Tracking de progresso em tempo real

### Marco 4 - Hardening

- Hardening de segurança
- Testes de baseline de performance
- Dashboards de monitoramento e alertas
- Deploy em staging e revisão de prontidão para produção

---

## 14) Checklist de Aceite

- [ ] Backend segue arquitetura em camadas/modular
- [ ] Frontend segue estrutura baseada em features com contratos tipados
- [ ] Autenticação e autorização implementadas de forma segura
- [ ] Migrations de banco versionadas e reproduzíveis
- [ ] Contrato de API documentado e consistente
- [ ] Cobertura de testes e critérios de qualidade aplicados no CI
- [ ] Deploy containerizado e monitoramento operacional configurados
