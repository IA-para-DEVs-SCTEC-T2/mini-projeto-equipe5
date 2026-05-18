# Implementation Plan: Player Movement

## Overview

Implement the foundational game layer for QuestBoard: a Phaser 3 canvas mounted in React where a player character moves with W-A-S-D / arrow keys and plays directional animations. All code is TypeScript, lives in `frontend/src/game/` and `frontend/src/features/game/`, and follows the architecture rules defined in the steering files.

## Tasks

- [ ] 1. Set up project dependencies and directory structure
  - Install `phaser` as a production dependency in `frontend/`
  - Install `fast-check` as a dev dependency for property-based tests
  - Create the directory tree: `src/game/scenes/`, `src/game/entities/`, `src/game/systems/`, `src/game/config/`, `src/features/game/components/`
  - Create `public/assets/spritesheets/` directory
  - Add a placeholder `player-default.png` spritesheet (32×32 frames, 5 animations × 4 frames = 20 frames minimum) — can be a generated placeholder for now
  - _Requirements: 3.1, 3.2_

- [ ] 2. Implement GameEventBus and gameConfig
  - [ ] 2.1 Create `src/game/GameEventBus.ts`
    - Export `GameEventBus` as a singleton `new Phaser.Events.EventEmitter()`
    - Export `GAME_EVENTS` const object with all event keys (`TASK_COMPLETED`, `LEVEL_UP`, `ACHIEVEMENT_UNLOCKED`, `PLAYER_DATA_LOADED`, `LEADERBOARD_UPDATED`)
    - _Requirements: 8.1_

  - [ ] 2.2 Create `src/game/config/gameConfig.ts`
    - Export `gameConfig: Phaser.Types.Core.GameConfig` with `pixelArt: true`, `type: Phaser.AUTO`, arcade physics with zero gravity, `Phaser.Scale.FIT` + `CENTER_BOTH`, scene array `[BootScene, WorldScene, UIScene]`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 2.3 Write unit tests for gameConfig
    - Verify `pixelArt === true`
    - Verify `physics.arcade.gravity` equals `{ x: 0, y: 0 }`
    - Verify `scale.mode === Phaser.Scale.FIT`
    - Verify `type === Phaser.AUTO`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 3. Implement GameManager singleton
  - [ ] 3.1 Create `src/game/GameManager.ts`
    - Module-level `gameInstance: Phaser.Game | null = null`
    - `startGame(parent: HTMLElement): Phaser.Game` — guard against duplicate instances, merge `parent` into `gameConfig`, instantiate `new Phaser.Game(config)`
    - `destroyGame(): void` — call `GameEventBus.removeAllListeners()`, call `game.destroy(true)`, set `gameInstance = null`; no-op if already null
    - `getGame(): Phaser.Game | null`
    - _Requirements: 1.1, 1.2, 1.4, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 3.2 Write property test for GameManager singleton invariant
    - **Property 3: GameManager singleton invariant**
    - **Validates: Requirements 1.4, 10.3, 10.4**
    - Use `fast-check` to generate arbitrary sequences of `startGame` / `destroyGame` calls
    - Assert that `getGame()` is never non-null after `destroyGame()` and that at most one instance exists at any time
    - Mock `Phaser.Game` constructor to avoid real canvas creation

  - [ ]* 3.3 Write unit tests for GameManager
    - Test `startGame()` returns existing instance on second call
    - Test `destroyGame()` is a no-op when no instance exists
    - Test `destroyGame()` calls `GameEventBus.removeAllListeners()` before `game.destroy()`
    - _Requirements: 1.4, 10.1, 10.2, 10.3, 10.4_

- [ ] 4. Checkpoint — Verify GameManager and config compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Player entity
  - [ ] 5.1 Create `src/game/entities/Player.ts`
    - Extend `Phaser.Physics.Arcade.Sprite`
    - Constructor: call `scene.add.existing(this)`, `scene.physics.add.existing(this)`, `setCollideWorldBounds(true)`, call `registerAnimations()`, play `'idle'`
    - `registerAnimations()`: register all five animations (`idle`, `walk-down`, `walk-up`, `walk-left`, `walk-right`) from `'player-default'` spritesheet using `PLAYER_ANIMATIONS` config; guard with `anims.exists()` to avoid duplicate registration
    - Export `WASDKeys` type
    - _Requirements: 5.7, 6.1, 6.2_

  - [ ] 5.2 Implement `handleMovement(cursors, wasd)` on Player
    - Read `isDown` state for all 8 keys (4 cursor + 4 WASD)
    - Compute `vx` and `vy` from active keys
    - Normalize diagonal velocity: when both axes non-zero, multiply each component by `SPEED / Math.sqrt(2 * SPEED²)`
    - Call `setVelocity(vx, vy)`
    - Call `playMovementAnimation(vx, vy)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ] 5.3 Implement `playMovementAnimation(vx, vy)` on Player
    - When `vx === 0 && vy === 0`: play `'idle'` (skip if already playing)
    - When `vy < 0`: `play('walk-up', true)`
    - When `vy > 0`: `play('walk-down', true)`
    - When `vx < 0`: `play('walk-left', true)`
    - When `vx > 0`: `play('walk-right', true)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8_

  - [ ]* 5.4 Write property test for velocity magnitude
    - **Property 1: Velocity magnitude never exceeds SPEED**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**
    - Use `fast-check` to generate all 16 combinations of boolean key states (W, A, S, D)
    - For each combination, call `handleMovement` with mocked key objects and assert `Math.sqrt(vx² + vy²) ≤ SPEED`

  - [ ]* 5.5 Write property test for animation key validity
    - **Property 2: Animation key is always valid and direction-consistent**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
    - Use `fast-check` to generate arbitrary `(vx, vy)` velocity pairs (including zero, positive, negative, diagonal)
    - Assert the resulting animation key is always in `{ 'idle', 'walk-up', 'walk-down', 'walk-left', 'walk-right' }`
    - Assert the key matches the direction rules (idle when both zero, vertical priority on diagonal)

  - [ ]* 5.6 Write unit tests for Player
    - Test all 5 animation states with concrete input examples
    - Test opposing keys cancel out (W+S → vy = 0)
    - Test `registerAnimations()` does not throw when called twice (idempotent)
    - _Requirements: 4.6, 5.7, 5.8_

- [ ] 6. Checkpoint — Verify Player logic passes all tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement CameraSystem
  - [ ] 7.1 Create `src/game/systems/CameraSystem.ts`
    - Constructor: accept `scene: Phaser.Scene`, `worldWidth: number`, `worldHeight: number`
    - `setBounds(x, y, width, height)`: call `scene.cameras.main.setBounds(...)`
    - `follow(target)`: call `scene.cameras.main.startFollow(target, true, 0.1, 0.1)`
    - In constructor, call `setBounds(0, 0, worldWidth, worldHeight)`
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 7.2 Write unit tests for CameraSystem
    - Test `follow()` calls `startFollow` with correct lerp values
    - Test `setBounds()` is called with world dimensions in constructor
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8. Implement Phaser scenes
  - [ ] 8.1 Create `src/game/scenes/BootScene.ts`
    - `preload()`: load `'player-default'` spritesheet from `'assets/spritesheets/player-default.png'` with `frameWidth: 32, frameHeight: 32`; attach `this.load.on('progress', ...)` to update a loading bar graphics object
    - `create()`: call `this.scene.start('WorldScene')` and `this.scene.launch('UIScene')`
    - Handle load errors with `this.load.on('loaderror', ...)` — log error and continue
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3_

  - [ ] 8.2 Create `src/game/scenes/WorldScene.ts`
    - `create()`: add a background rectangle, instantiate `Player` at world center (1600, 1600), create `cursors` via `createCursorKeys()`, create `wasd` keys via `addKey()` for W/A/S/D, instantiate `CameraSystem(this, 3200, 3200)`, call `cameraSystem.follow(player)`, set `physics.world.setBounds(0, 0, 3200, 3200)`, stub `GameEventBus` listeners
    - `update()`: call `this.player.handleMovement(this.cursors, this.wasd)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.3, 7.1, 7.2, 8.1_

  - [ ] 8.3 Create `src/game/scenes/UIScene.ts`
    - `create()`: add a placeholder HUD text (e.g., `'QuestBoard'` in top-left corner); stub `GameEventBus` listeners for future HUD events
    - `update()`: empty for now
    - _Requirements: 2.5, 8.4_

  - [ ]* 8.4 Write unit tests for BootScene
    - Test `preload()` calls `this.load.spritesheet` with correct key and frame config
    - Test `create()` calls `scene.start('WorldScene')` and `scene.launch('UIScene')`
    - Test load error handler is registered
    - _Requirements: 2.1, 2.3, 3.1, 3.3_

- [ ] 9. Implement GameCanvas React component
  - [ ] 9.1 Create `src/features/game/components/GameCanvas.tsx`
    - `useRef<HTMLDivElement>` for the container
    - `useEffect`: call `startGame(containerRef.current)` on mount, return cleanup calling `destroyGame()`
    - Render `<div ref={containerRef} id="game-container" style={{ width: '100%', height: '100vh' }} />`
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 9.2 Write integration tests for GameCanvas
    - Test that mounting renders `<div id="game-container">`
    - Test that `startGame` is called with the container element on mount (spy on GameManager)
    - Test that `destroyGame` is called on unmount (spy on GameManager)
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 10. Wire everything together in GameManager
  - Update `src/game/GameManager.ts` to import `gameConfig` and merge the `parent` element before passing to `new Phaser.Game()`
  - Verify `BootScene`, `WorldScene`, `UIScene` are all imported in `gameConfig.ts` scene array
  - Add a route or page in the React app that renders `<GameCanvas />` so the game screen is accessible (e.g., `/game` route or a dedicated page component in `src/features/game/`)
  - _Requirements: 1.1, 2.4, 9.1, 9.2, 9.3, 9.4_

- [ ] 11. Final checkpoint — Full integration smoke test
  - Ensure all unit and property tests pass
  - Manually verify: game canvas renders, player appears, W-A-S-D moves the player with correct animations, camera follows, player cannot leave world bounds
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All game code must stay in `src/game/` — no React hooks inside Phaser scenes
- All communication between React and Phaser goes exclusively through `GameEventBus`
- Assets must be loaded via Phaser's load system from `public/assets/` — never via `import`
- The `player-default.png` spritesheet needs to be sourced or generated before Task 8 can be fully tested visually
- Property tests use `fast-check` and mock Phaser internals — no real canvas required for unit/property tests
- Each task references specific requirements for traceability
