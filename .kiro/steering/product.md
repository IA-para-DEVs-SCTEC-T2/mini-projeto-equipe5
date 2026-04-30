---
inclusion: always
---

# Produto: Gamificação para Controle de Tarefas

Este produto transforma o gerenciamento de tarefas em uma experiência engajante com elementos de RPG retrô. Cada tarefa concluída gera progresso visível para o usuário dentro do sistema.

## Objetivo

Aumentar engajamento, consistência e sensação de conquista ao combinar produtividade com mecânicas de jogo, tornando a rotina mais leve e motivadora.

## Pilares de Gamificação

- **Pontos (XP):** acumulados ao concluir tarefas, motivando a produtividade diária.
- **Níveis:** representam o progresso do usuário e desbloqueiam novos recursos.
- **Conquistas:** badges e medalhas celebram marcos importantes.
- **Recompensas:** benefícios tangíveis que incentivam o engajamento contínuo.

## Personagem RPG Retrô

- Um personagem representa o usuário e avança no mapa a cada tarefa concluída.
- O visual remete a jogos de RPG clássicos, trazendo nostalgia e identidade forte ao produto.
- O progresso diário deve ser visualmente claro e imediato.

## Funcionalidades Principais

### Tracking de Progresso
- Visualização em tempo real do status das tarefas.
- Histórico completo de atividades do usuário.
- Métricas de produtividade individual e em equipe.

### Sistema de Recompensas
- XP por tarefa concluída.
- Badges e conquistas desbloqueáveis.
- Leaderboards para competição saudável entre usuários.
- Níveis de progressão motivacionais.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Spring Boot (Java) |
| Frontend | React (TypeScript) |
| Game/Animação | Bibliotecas de games em TypeScript (ex: Phaser, PixiJS) |

## Convenções para a IA

- O backend expõe APIs REST via Spring Boot; toda lógica de negócio (XP, níveis, conquistas) reside no backend.
- O frontend React consome essas APIs e renderiza a interface de tarefas e o cenário RPG.
- A camada de game/animação é responsabilidade exclusiva do frontend em TypeScript.
- Novos recursos de gamificação devem ser modelados como entidades no backend antes de serem expostos ao frontend.
- Mantenha separação clara entre lógica de negócio (backend) e lógica de apresentação/animação (frontend).
