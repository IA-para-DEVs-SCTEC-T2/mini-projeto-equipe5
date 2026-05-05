---
inclusion: always
---

# Produto: QuestBoard — Gamificação para Controle de Tarefas

O QuestBoard transforma o gerenciamento de tarefas em uma experiência de RPG retrô. Cada tarefa concluída gera progresso visível: XP, níveis, conquistas e avanço do personagem no mapa.

## Objetivo

Aumentar engajamento e consistência ao combinar produtividade com mecânicas de jogo, tornando a rotina mais leve e motivadora.

## Pilares de Gamificação

| Pilar | Descrição |
|-------|-----------|
| **XP (Pontos)** | Acumulados ao concluir tarefas; motivam a produtividade diária |
| **Níveis** | Representam o progresso do usuário e desbloqueiam novos recursos |
| **Conquistas** | Badges e medalhas que celebram marcos importantes |
| **Leaderboard** | Ranking entre usuários para competição saudável |

## Personagem RPG Retrô

- Cada usuário possui um personagem que avança no mapa a cada tarefa concluída.
- O visual remete a jogos de RPG clássicos (pixel art).
- O progresso deve ser visualmente imediato — o usuário precisa sentir o avanço.

## Funcionalidades Principais

### Gestão de Tarefas
- Criação, edição e conclusão de tarefas com suporte a prazos e prioridades.
- Quadros estilo Kanban dentro do ambiente interativo.
- Metas diárias e mensais com acompanhamento visual.

### Tracking de Progresso
- Visualização em tempo real do status das tarefas.
- Histórico completo de atividades do usuário.
- Dashboard com métricas de produtividade individual e em equipe.

### Sistema de Recompensas
- XP por tarefa concluída (regras de cálculo residem no backend).
- Badges e conquistas desbloqueáveis por marcos.
- Leaderboard global e por equipe.
- Níveis de progressão com desbloqueio de recursos.

### Ambiente Interativo
- Mundo 2D em pixel art navegável com avatar personalizado.
- Espaços colaborativos (salas compartilhadas por equipe).
- Personalização de avatar e tema visual.

## Regras de Negócio Críticas para a IA

- Toda lógica de XP, níveis e conquistas **reside exclusivamente no backend** (Spring Boot).
- O frontend **nunca calcula XP** — apenas exibe o que a API retorna.
- Novos recursos de gamificação devem ser modelados como entidades no backend antes de qualquer implementação no frontend.
- A camada de animação/game (Phaser/PixiJS) é responsabilidade exclusiva do frontend TypeScript.
- Mantenha separação rígida: lógica de negócio no backend, apresentação/animação no frontend.
