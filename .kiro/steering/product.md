---
inclusion: always
---

# Produto: Gamificação para Controle de Tarefas

Aplicação de gerenciamento de tarefas com mecânicas de RPG retrô. Cada tarefa concluída gera XP, avança o personagem no mapa e desbloqueia conquistas, tornando a produtividade engajante.

## Pilares de Gamificação

| Pilar | Descrição |
|---|---|
| XP | Pontos acumulados ao concluir tarefas |
| Níveis | Progresso do usuário; desbloqueiam recursos |
| Conquistas | Badges/medalhas por marcos atingidos |
| Leaderboard | Ranking entre usuários para competição saudável |

## Personagem RPG

- Cada usuário tem um personagem que avança no mapa conforme tarefas são concluídas.
- Visual pixel-art / RPG clássico retrô.
- Progresso deve ser visualmente imediato após cada ação.

## Funcionalidades Principais

- Criação, edição e conclusão de tarefas com atribuição automática de XP.
- Histórico de atividades e métricas de produtividade individual e em equipe.
- Sistema de conquistas desbloqueáveis e leaderboard global.
- Visualização do personagem e mapa RPG em tempo real.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Spring Boot 3.x (Java 21) |
| Frontend | React 18 + TypeScript 5 (Vite) |
| Game/Animação | Phaser 3 ou PixiJS (TypeScript) |
| Banco | PostgreSQL (Flyway migrations) |

## Regras Críticas para a IA

### Separação de responsabilidades
- **Toda lógica de negócio** (cálculo de XP, progressão de nível, desbloqueio de conquistas) reside **exclusivamente no backend**.
- O frontend apenas consome APIs REST e renderiza dados — nunca calcula XP ou níveis.
- A camada `game/` é estritamente de apresentação/animação: sem chamadas de API diretas, sem lógica de negócio.

### Ordem de implementação
- Novos recursos de gamificação: modelar entidades e lógica no backend primeiro, depois expor via API, depois consumir no frontend.

### Endpoints
- Todos os endpoints sob `/api/v1/...`.
- Respostas sempre via DTOs (`record` Java) — nunca expor entidades JPA.

### Frontend
- Tokens de autenticação em `HttpOnly` cookies — nunca em `localStorage`.
- Tipos TypeScript do frontend alinhados com os DTOs do backend.
- Cliente Axios centralizado em `shared/services/` com interceptors de auth e erro.
