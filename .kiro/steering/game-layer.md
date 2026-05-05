---
inclusion: always
---

# Camada de Jogo (Game Layer)

Este documento define como a camada de jogo funciona no QuestBoard. A engine escolhida é **Phaser 3**, por ter suporte nativo a tilemaps (Tiled JSON), sistema de cenas, spritesheet animations e ser a mais madura para RPGs 2D em TypeScript.

Todo o código de jogo vive em `src/game/` e é **completamente isolado** do React — sem acesso direto a hooks, Context ou estado React.

---

## 1. Integração React ↔ Phaser

### Montagem do Canvas

O Phaser roda dentro de um único componente React dedicado:

```tsx
// src/features/game/components/GameCanvas.tsx
import { useEffect, useRef } from 'react'
import { startGame, destroyGame } from '@/game/GameManager'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    startGame(containerRef.current)
    return () => destroyGame()
  }, [])

  return <div ref={containerRef} id="game-container" />
}
```

- `GameManager.ts` é o único ponto de entrada do Phaser — instancia o `Phaser.Game` e registra todas as cenas.
- O React **não gerencia estado interno do jogo** — apenas monta/desmonta o canvas.
- O componente `GameCanvas` não recebe props de estado de jogo; toda comunicação é via `GameEventBus`.

### Comunicação bidirecional via EventBus

A ponte entre React e Phaser é um EventBus singleton baseado em `Phaser.Events.EventEmitter`:

```ts
// src/game/GameEventBus.ts
import Phaser from 'phaser'

export const GameEventBus = new Phaser.Events.EventEmitter()

// Eventos que o React dispara para o jogo
export const GAME_EVENTS = {
  TASK_COMPLETED: 'task:completed',       // { taskId, xpGained, newTotal }
  LEVEL_UP: 'level:up',                   // { newLevel, previousLevel }
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked', // { achievementId, name }
  PLAYER_DATA_LOADED: 'player:data_loaded', // { level, xp, position }
  LEADERBOARD_UPDATED: 'leaderboard:updated', // { rankings[] }
} as const
```

**Fluxo de dados:**
```
API REST / WebSocket
      ↓
  React (feature/gamification)
      ↓  GameEventBus.emit(GAME_EVENTS.TASK_COMPLETED, payload)
  Phaser Scene
      ↓
  Animação / Feedback visual
```

**Regra:** O React nunca chama métodos de cenas Phaser diretamente. O Phaser nunca importa hooks ou Context do React. Toda comunicação passa pelo `GameEventBus`.

---

## 2. Estrutura de Cenas

```
src/game/
├── GameManager.ts          # Instância do Phaser.Game, registro de cenas
├── GameEventBus.ts         # EventEmitter singleton
├── scenes/
│   ├── BootScene.ts        # Preload de assets globais, splash screen
│   ├── WorldScene.ts       # Mapa principal navegável (cena principal)
│   └── UIScene.ts          # HUD sobreposto (roda em paralelo com WorldScene)
├── entities/
│   ├── Player.ts           # Sprite do personagem, animações, movimento
│   └── TaskMarker.ts       # Marcadores de tarefas no mapa
├── systems/
│   ├── FeedbackSystem.ts   # Partículas, floating text, efeitos visuais
│   └── CameraSystem.ts     # Controle de câmera e follow do player
├── config/
│   └── gameConfig.ts       # Configuração do Phaser.Game
└── assets/                 # Sprites, tilemaps, sons (referenciados por path)
    ├── tilemaps/
    ├── spritesheets/
    └── audio/
```

### BootScene
- Responsável pelo preload de **todos os assets globais** (tilemap, spritesheet do player, UI icons, sons).
- Exibe uma tela de loading com barra de progresso.
- Ao concluir, transita para `WorldScene` + `UIScene` em paralelo.
- Não contém lógica de negócio.

### WorldScene
- Cena principal: renderiza o mapa 2D, o personagem e os marcadores de tarefas.
- Carrega o tilemap no formato **Tiled JSON** (`assets/tilemaps/world.json`).
- Escuta `GameEventBus` para reagir a eventos de progresso.
- Gerencia o `Player` e os `TaskMarker`s.

### UIScene
- Roda **em paralelo** com `WorldScene` (chave `{ active: true }` no `scene.launch`).
- Renderiza o HUD: barra de XP, nível atual, notificações de conquista.
- Nunca acessa objetos da `WorldScene` diretamente — usa o `GameEventBus`.
- Fica sempre no topo da pilha de renderização.

```ts
// Exemplo de inicialização paralela em GameManager.ts
game.scene.start('BootScene')
// BootScene chama internamente:
// this.scene.start('WorldScene')
// this.scene.launch('UIScene')  ← roda em paralelo
```

---

## 3. Personagem e Animações

### Spritesheet
- Formato: spritesheet único com frames organizados por linha de animação.
- Convenção de nomenclatura: `player-<variante>.png` (ex: `player-default.png`).
- Frame size padrão: 32x32px (pixel art retrô).

### Estados de Animação

| Chave | Trigger | Descrição |
|-------|---------|-----------|
| `idle` | Estado padrão | Loop de respiração/idle |
| `walk-down` | Movimento ↓ | Caminhada para baixo |
| `walk-up` | Movimento ↑ | Caminhada para cima |
| `walk-left` | Movimento ← | Caminhada para esquerda |
| `walk-right` | Movimento → | Caminhada para direita |
| `celebrate` | `TASK_COMPLETED` | Animação de comemoração (one-shot) |
| `level-up` | `LEVEL_UP` | Animação especial de level-up (one-shot) |

```ts
// src/game/entities/Player.ts
// Após animação one-shot, retorna automaticamente para 'idle'
this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'celebrate', () => {
  this.play('idle')
})
```

### Trigger de Animação via Evento
```ts
// Dentro de WorldScene.create()
GameEventBus.on(GAME_EVENTS.TASK_COMPLETED, ({ xpGained }) => {
  this.player.play('celebrate')
  this.feedbackSystem.showFloatingText(this.player.x, this.player.y, `+${xpGained} XP`)
  this.feedbackSystem.emitParticles(this.player.x, this.player.y)
})

GameEventBus.on(GAME_EVENTS.LEVEL_UP, ({ newLevel }) => {
  this.player.play('level-up')
  this.feedbackSystem.showLevelUpEffect(newLevel)
})
```

---

## 4. Tilemap e Navegação

### Formato
- Tilemaps criados no **Tiled Map Editor**, exportados como JSON.
- Arquivo principal: `assets/tilemaps/world.json`
- Tilesets referenciados com caminhos relativos ao tilemap.

### Camadas do Mapa

| Camada Tiled | Tipo | Descrição |
|-------------|------|-----------|
| `ground` | Tile Layer | Chão base (grama, pedra, etc.) |
| `decoration` | Tile Layer | Decorações sem colisão |
| `obstacles` | Tile Layer | Tiles com colisão (árvores, paredes) |
| `task-markers` | Object Layer | Posições dos marcadores de tarefas |
| `spawn` | Object Layer | Ponto de spawn do player |

### Colisão e Câmera
```ts
// WorldScene.ts — padrão de setup
const map = this.make.tilemap({ key: 'world' })
const tileset = map.addTilesetImage('tileset', 'tileset-img')

const ground = map.createLayer('ground', tileset)
const obstacles = map.createLayer('obstacles', tileset)
obstacles.setCollisionByProperty({ collides: true })

this.physics.add.collider(this.player, obstacles)

// Câmera segue o player com bounds do mapa
this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
this.cameras.main.startFollow(this.player, true, 0.1, 0.1) // lerp suave
```

### Progressão no Mapa
- O mapa tem **zonas desbloqueáveis** por nível — tiles de obstáculo são removidos quando o backend retorna um nível suficiente.
- A posição do player no mapa é **persistida no backend** (`/api/v1/users/me/game-state`).
- Ao carregar, o player é posicionado na última posição salva (recebida via `PLAYER_DATA_LOADED`).

---

## 5. Feedback Visual (Juice)

Toda lógica de efeitos visuais fica em `src/game/systems/FeedbackSystem.ts`.

### Floating Text (XP ganho)
```ts
showFloatingText(x: number, y: number, text: string): void
// Cria texto "+50 XP" que sobe e desaparece com tween
// Cor: dourado (#FFD700) para XP, verde (#00FF88) para conquistas
```

### Partículas ao Concluir Tarefa
```ts
emitParticles(x: number, y: number): void
// Burst de partículas estilo estrelas/faíscas
// Usar Phaser.GameObjects.Particles com lifespan curto (~600ms)
```

### Efeito de Level-Up
```ts
showLevelUpEffect(newLevel: number): void
// 1. Flash branco na tela (câmera flash)
// 2. Texto "LEVEL UP! → Nível X" centralizado com tween de escala
// 3. Partículas douradas ao redor do player
// 4. Som de level-up
```

### Notificação de Conquista (UIScene)
```ts
showAchievementNotification(name: string): void
// Banner deslizante no canto superior direito
// Ícone + nome da conquista + "Conquista desbloqueada!"
// Auto-dismiss após 3 segundos com tween de saída
```

---

## 6. Sincronização com Backend

### Quando usar REST vs. WebSocket

| Situação | Mecanismo | Motivo |
|----------|-----------|--------|
| Carregar estado inicial do player | REST GET | One-time load na inicialização |
| Concluir tarefa e receber XP | REST POST + resposta | Transação atômica |
| Atualizar posição do player | REST PATCH (debounced 2s) | Não precisa de tempo real |
| Notificação de conquista própria | Resposta da API REST | Vem junto com a ação |
| Leaderboard em tempo real | WebSocket | Múltiplos usuários simultâneos |
| Outro usuário concluiu tarefa (sala colaborativa) | WebSocket | Evento externo assíncrono |

### Fluxo de Conclusão de Tarefa
```
Usuário clica "Concluir" no React (features/tasks)
  → POST /api/v1/tasks/{id}/complete
  → Backend calcula XP, verifica level-up, verifica conquistas
  → Resposta: { xpGained, newXpTotal, leveledUp, newLevel, unlockedAchievements[] }
  → React recebe resposta
  → GameEventBus.emit(GAME_EVENTS.TASK_COMPLETED, { xpGained, newTotal })
  → Se leveledUp: GameEventBus.emit(GAME_EVENTS.LEVEL_UP, { newLevel })
  → Se conquistas: GameEventBus.emit(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, { ... })
  → Phaser reage com animações e feedback visual
```

### WebSocket (STOMP sobre SockJS)
```ts
// src/shared/services/websocket.service.ts
// Tópicos relevantes para o jogo:
// /topic/room/{roomId}/activity  → atividade de outros usuários na sala
// /topic/leaderboard             → atualizações do ranking global
// /user/queue/notifications      → notificações pessoais (conquistas assíncronas)

// Ao receber mensagem WebSocket, o serviço React emite no GameEventBus:
stompClient.subscribe('/topic/leaderboard', (msg) => {
  const data = JSON.parse(msg.body)
  GameEventBus.emit(GAME_EVENTS.LEADERBOARD_UPDATED, data)
})
```

### Reconexão e Estado Offline
- WebSocket usa reconexão automática com backoff exponencial (máx. 30s).
- Se desconectado, o jogo continua funcionando em modo local — ações são enfileiradas e sincronizadas ao reconectar.
- Indicador visual de status de conexão no HUD (UIScene).

---

## 7. Asset Pipeline

### Localização dos Assets
- Assets ficam em `frontend/public/assets/` — servidos estaticamente pelo Vite.
- Referenciados no Phaser pelo path relativo: `this.load.image('tileset-img', 'assets/tilemaps/tileset.png')`.
- **Nunca** importar assets de jogo via `import` do bundler — usar o sistema de load do Phaser.

### Convenção de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Spritesheet do player | `player-<variante>.png` | `player-default.png` |
| Tileset | `tileset-<nome>.png` | `tileset-world.png` |
| Tilemap | `<nome>.json` | `world.json` |
| Ícones de UI | `icon-<nome>.png` | `icon-xp.png` |
| Sons | `sfx-<evento>.mp3` | `sfx-levelup.mp3` |
| Música | `bgm-<cena>.mp3` | `bgm-world.mp3` |

### Preload por Cena
- `BootScene` carrega assets **globais** (player, tileset principal, sons de UI).
- Assets específicos de cenas futuras (novas áreas do mapa) são carregados sob demanda na cena correspondente.
- Usar `this.load.on('progress', callback)` para atualizar a barra de loading.

---

## 8. Configuração do Phaser

```ts
// src/game/config/gameConfig.ts
import Phaser from 'phaser'
import { BootScene } from '../scenes/BootScene'
import { WorldScene } from '../scenes/WorldScene'
import { UIScene } from '../scenes/UIScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,           // WebGL com fallback para Canvas
  width: 800,
  height: 600,
  pixelArt: true,              // Desativa antialiasing — essencial para pixel art
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [BootScene, WorldScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,    // Responsivo — escala mantendo aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    disableWebAudio: false,
  },
}
```

---

## 9. Regras Críticas para a IA

- **Nunca** importar hooks React (`useState`, `useEffect`, etc.) dentro de `src/game/`.
- **Nunca** importar classes Phaser (`Phaser.Scene`, etc.) fora de `src/game/`.
- Toda comunicação entre React e Phaser passa **exclusivamente** pelo `GameEventBus`.
- Lógica de negócio (XP, nível, conquistas) **nunca** é calculada em cenas Phaser — apenas recebida via eventos e exibida.
- Ao adicionar um novo evento de gamificação: 1) adicionar a chave em `GAME_EVENTS`, 2) emitir no serviço React após resposta da API, 3) escutar na cena Phaser relevante.
- Assets de jogo ficam em `public/assets/` — nunca em `src/`.
- `UIScene` e `WorldScene` rodam em paralelo — nunca iniciar uma dentro da outra com `scene.start` (usar `scene.launch` para a UIScene).
