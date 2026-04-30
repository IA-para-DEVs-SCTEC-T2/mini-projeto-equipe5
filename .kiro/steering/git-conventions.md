# Git and Version Control Guidelines

## 1. Branching Strategy (Gitflow)
- **Main branches:** `main` (produção) e `develop` (integração). NUNCA faça commits diretos nessas branches.
- **Features:** Toda nova funcionalidade deve ser criada a partir de `develop`.
  - Padrão de nomenclatura: `feature/<escopo>-<descricao-curta-com-hifens>` (ex: `feature/auth-oauth2-pkce`, `feature/crm-dashboard-kanban`).
- **Hotfixes:** Criados a partir da `main` para correções críticas.
  - Padrão: `hotfix/<descricao>`

## 2. Commit Messages
- Use estritamente o padrão **Conventional Commits**.
- O idioma dos commits deve ser o [Inglês / Português].
- **Tipos permitidos:**
  - `feat:` (novas funcionalidades).
  - `fix:` (correção de bugs).
  - `chore:` (atualização de dependências, setup de ambiente).
  - `refactor:` (mudanças no código que não alteram comportamento).
  - `test:` (adição ou correção de testes).
- **Exemplo válido:** `feat(crm): add lead management board`.

## 3. Workflow da IA
- Ao iniciar uma nova Spec de funcionalidade, certifique-se de criar e mudar para a branch `feature/` correspondente a partir de `develop` antes de escrever código.
- Faça commits atômicos ao final de cada tarefa (Task) da Spec, não espere o design inteiro terminar.