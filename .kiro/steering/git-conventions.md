---
inclusion: always
---

# Convenções de Git e Versionamento

## 1. Estratégia de Branches (Gitflow)

| Branch | Propósito | Regra |
|--------|-----------|-------|
| `main` | Código estável em produção | Nunca recebe commits diretos |
| `develop` | Branch de integração do time | Nunca recebe commits diretos |
| `feature/*` | Novas funcionalidades | Criada a partir de `develop` |
| `fix/*` | Correção de bugs | Criada a partir de `develop` |
| `hotfix/*` | Correções críticas em produção | Criada a partir de `main` |
| `chore/*` | Setup, dependências, refatorações de infra | Criada a partir de `develop` |

### Nomenclatura de Branches

```
feature/<escopo>-<descricao-curta-com-hifens>
fix/<escopo>-<descricao-curta>
hotfix/<descricao-curta>
chore/<descricao-curta>
```

Exemplos:
- `feature/auth-login-jwt`
- `feature/gamification-xp-system`
- `fix/task-card-overflow`
- `hotfix/crash-on-login`
- `chore/refactor-steering-files`

Regras:
- Sempre **letras minúsculas** com **hífens** (sem espaços ou underscores)
- Nome deve deixar claro o que está sendo feito
- Nunca trabalhar diretamente em `main` ou `develop`

---

## 2. Mensagens de Commit (Conventional Commits)

Formato: `<tipo>(<escopo>): <descrição em inglês>`

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Configuração, dependências, setup de ambiente |
| `refactor` | Melhoria de código sem alterar comportamento |
| `test` | Adição ou correção de testes |
| `docs` | Atualização de documentação |

Exemplos válidos:
```
feat(gamification): add XP calculation on task completion
fix(auth): correct JWT expiration handling
chore(steering): refactor steering files for AI context
refactor(tasks): extract task status logic to domain layer
test(gamification): add unit tests for level-up service
```

Regras:
- Descrição em **inglês**, imperativo, sem ponto final
- Escopo em letras minúsculas, referenciando a feature ou módulo
- Commits atômicos — um commit por mudança lógica

---

## 3. Workflow da IA

- Ao iniciar uma nova Spec, criar e mudar para a branch `feature/` correspondente a partir de `develop` **antes de escrever qualquer código**.
- Fazer commits atômicos ao final de cada **Task** da Spec — não acumular tudo no final.
- Pull Requests sempre de `feature/*` → `develop`; nunca direto para `main`.
- Aguardar aprovação de pelo menos 1 revisor antes do merge.
- A `main` só recebe código via merge de `develop` em releases planejados.
