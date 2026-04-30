# 🎮 NomeProjeto

> Transforme sua produtividade em uma aventura. Gerencie tarefas, metas e objetivos num ambiente interativo e gamificado.

---

## 📖 Sobre o Projeto

O **NomeProjeto** é uma plataforma de organização pessoal e em equipe que combina o poder do gerenciamento visual de tarefas com a imersão de um ambiente gamificado em pixel art.

Em vez de listas frias e quadros estáticos, você navega por um mundo interativo onde cada tarefa concluída representa progresso real — tanto no seu trabalho quanto na sua jornada dentro do jogo.

A ideia central é simples: **organização não precisa ser chata**. Ao unir metas diárias e mensais com um ambiente visual envolvente, o NomeProjeto torna o hábito de se organizar algo que você realmente quer fazer.

---

## ✨ Funcionalidades

- 🗺️ **Mundo interativo** — Navegue por um ambiente 2D em pixel art com seu avatar personalizado
- 📋 **Quadros de tarefas** — Crie e gerencie tarefas em colunas estilo kanban dentro do próprio mundo
- 🎯 **Metas diárias e mensais** — Defina objetivos com prazos e acompanhe seu progresso visualmente
- 🏆 **Sistema de conquistas** — Ganhe recompensas e desbloqueie itens ao completar tarefas e bater metas
- 👥 **Espaços colaborativos** — Trabalhe em equipe em salas compartilhadas dentro do ambiente
- 📊 **Dashboard de progresso** — Visualize seu desempenho ao longo do tempo com gráficos e estatísticas
- 🎨 **Personalização** — Customize seu avatar, seu espaço e o tema visual do seu ambiente

---

## 🛠️ Tecnologias

> *A definir conforme o stack escolhido pela equipe.*

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React |
| Backend | Spring Boot (Java) |
| Banco de Dados | PostgreSQL |
| Autenticação | Spring Security + JWT |
| Tempo Real | WebSocket (Spring) |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Java 21+
- Node.js >= 18
- Maven
- PostgreSQL
- Git

### Instalação

```bash
# Clone o repositório
git clone https://github.com/IA-para-DEVs-SCTEC-T2/mini-projeto-equipe5.git
cd mini-projeto-equipe5
```

**Backend (Spring Boot)**

```bash
cd backend

# Configure as variáveis de ambiente
cp .env.example .env

# Rode as migrations e suba o servidor
./mvnw spring-boot:run
```

O servidor estará disponível em `http://localhost:8080`.

**Frontend (React)**

```bash
cd frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no seu navegador.

---

## 📁 Estrutura do Projeto

O projeto segue o padrão arquitetural **MVC (Model-View-Controller)**, com a responsabilidade de cada camada bem definida:

- **Model** — Entidades JPA e repositórios (backend). Representam os dados e regras de negócio.
- **View** — Interface React (frontend). Responsável pela apresentação e interação com o usuário.
- **Controller** — Endpoints REST no Spring Boot. Recebem as requisições, acionam os serviços e retornam as respostas.

```
questboard/
├── backend/                        # Spring Boot (Model + Controller)
│   ├── src/main/java/
│   │   ├── controllers/            # [Controller] Endpoints REST
│   │   ├── services/               # Regras de negócio
│   │   ├── models/                 # [Model] Entidades JPA
│   │   └── repositories/           # [Model] Acesso ao banco
│   └── pom.xml
├── frontend/                       # React (View)
│   ├── src/
│   │   ├── components/             # [View] Componentes reutilizáveis
│   │   ├── pages/                  # [View] Páginas da aplicação
│   │   ├── game/                   # Lógica do ambiente interativo
│   │   ├── store/                  # Gerenciamento de estado
│   │   └── services/               # Chamadas à API (Controller bridge)
│   └── package.json
└── docs/                           # Documentação adicional
```

---

## 🤝 Contribuindo

### Estratégia de Branches

O projeto usa o fluxo **Gitflow**, com três níveis de branches:

```
main        ← código estável em produção. Nunca recebe commits diretos.
develop     ← branch de integração. É aqui que o trabalho do time se junta.
feature/*   ← onde cada funcionalidade é desenvolvida de forma isolada.
```

### Nomenclatura de Branches

Toda branch deve seguir o padrão abaixo para manter consistência no repositório:

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Nova funcionalidade | `feature/<escopo>-<descricao>` | `feature/auth-login-jwt` |
| Correção de bug | `fix/<descricao>` | `fix/task-card-overflow` |
| Correção crítica em produção | `hotfix/<descricao>` | `hotfix/crash-on-login` |

Regras:
- Use sempre **letras minúsculas**
- Separe as palavras com **hífens** (`-`), nunca espaços ou underscores
- Seja descritivo mas conciso — o nome deve deixar claro o que está sendo feito
- Nunca trabalhe diretamente nas branches `main` ou `develop`

### Fluxo de trabalho

**1. Parta sempre da `develop`**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-funcionalidade
```

**2. Desenvolva e faça commits na sua branch**
```bash
git add .
git commit -m "feat(escopo): descrição do que foi feito"
```

**3. Suba sua branch para o repositório remoto**
```bash
git push origin feature/nome-da-funcionalidade
```

**4. Abra um Pull Request no GitHub**
- De: `feature/nome-da-funcionalidade`
- Para: `develop`
- Aguarde a revisão e aprovação de pelo menos um membro do time

**5. Após aprovação**, o merge é feito na `develop`. Sua funcionalidade está integrada.

> A `main` só recebe código quando a `develop` estiver estável e o time decidir fazer um release.

---

### Padrão de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Quando usar |
|------|-------------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `chore:` | Configuração, dependências |
| `refactor:` | Melhoria de código sem mudar comportamento |
| `test:` | Adição ou correção de testes |

Exemplo: `feat(auth): add login with JWT`

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

<p align="center">Feito com ☕ e muita vontade de tornar a organização divertida.</p>
