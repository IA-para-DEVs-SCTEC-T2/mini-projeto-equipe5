# Requirements Document

## Introduction

This document defines the requirements for the **Player Movement** feature of QuestBoard — the first piece of the game layer. The feature introduces a Phaser 3 game canvas embedded in the React application where a player character can move using W-A-S-D (or arrow) keys with directional animations. It establishes the foundational game architecture (`GameCanvas`, `GameManager`, `GameEventBus`, scene structure, `Player` entity, `CameraSystem`) that all future game features will build upon.

## Glossary

- **GameCanvas**: The single React component (`GameCanvas.tsx`) responsible for mounting and unmounting the Phaser game canvas.
- **GameManager**: The TypeScript module (`GameManager.ts`) that instantiates and holds the singleton `Phaser.Game` instance.
- **GameEventBus**: The singleton `Phaser.Events.EventEmitter` used as the exclusive communication bridge between React and Phaser.
- **BootScene**: The Phaser scene responsible for preloading all global assets and transitioning to the main scenes.
- **WorldScene**: The main Phaser scene that renders the game world, manages the Player entity, and handles input.
- **UIScene**: The parallel Phaser scene that renders the HUD overlay on top of WorldScene.
- **Player**: The `Phaser.Physics.Arcade.Sprite` subclass representing the player character.
- **CameraSystem**: The system class that encapsulates camera configuration and follow behavior.
- **WASD Keys**: The W, A, S, D keyboard keys used for player movement (up, left, down, right respectively).
- **SPEED**: The player movement speed constant in pixels per second (default: 160).
- **Spritesheet**: The `player-default.png` image file containing all player animation frames at 32×32 pixels each.
- **Idle animation**: The looping animation played when the player is not moving.
- **Walk animation**: One of four directional looping animations (`walk-up`, `walk-down`, `walk-left`, `walk-right`) played during movement.

---

## Requirements

### Requirement 1: Game Canvas Mounting

**User Story:** As a developer, I want a React component that mounts and unmounts the Phaser game canvas, so that the game integrates cleanly into the React application lifecycle.

#### Acceptance Criteria

1. WHEN the `GameCanvas` component mounts, THE `GameCanvas` SHALL call `GameManager.startGame()` with the container DOM element, causing a Phaser game instance to be created and the canvas to appear inside the container.
2. WHEN the `GameCanvas` component unmounts, THE `GameCanvas` SHALL call `GameManager.destroyGame()`, causing the Phaser game instance and its canvas to be removed from the DOM.
3. THE `GameCanvas` SHALL render a `<div>` container that fills its parent element to allow the Phaser canvas to scale responsively.
4. IF `GameManager.startGame()` is called while a game instance already exists, THEN THE `GameManager` SHALL return the existing instance without creating a second canvas.

---

### Requirement 2: Game Initialization and Scene Flow

**User Story:** As a player, I want the game to load its assets and start the main scene automatically, so that I see the game world without any manual steps.

#### Acceptance Criteria

1. WHEN the Phaser game starts, THE `BootScene` SHALL begin executing as the first scene.
2. WHILE `BootScene` is loading assets, THE `BootScene` SHALL display a loading progress indicator.
3. WHEN `BootScene` finishes loading all assets, THE `BootScene` SHALL start `WorldScene` and launch `UIScene` in parallel.
4. THE `GameManager` SHALL register `BootScene`, `WorldScene`, and `UIScene` in the Phaser game configuration.
5. THE `UIScene` SHALL run in parallel with `WorldScene` using `scene.launch` so that both scenes are active simultaneously.

---

### Requirement 3: Asset Loading

**User Story:** As a developer, I want all game assets loaded through Phaser's load system, so that assets are managed correctly and never imported via the JavaScript bundler.

#### Acceptance Criteria

1. THE `BootScene` SHALL load the player spritesheet from `assets/spritesheets/player-default.png` using Phaser's `this.load.spritesheet()` method with a frame width and height of 32 pixels.
2. THE `BootScene` SHALL load all assets using Phaser's built-in load system with paths relative to `public/assets/` — assets SHALL NOT be imported via `import` statements in TypeScript.
3. IF an asset fails to load, THEN THE `BootScene` SHALL log a descriptive error and continue scene initialization with a fallback placeholder so the game remains functional.

---

### Requirement 4: Player Movement with WASD and Arrow Keys

**User Story:** As a player, I want to move my character using W-A-S-D or arrow keys, so that I can navigate the game world intuitively.

#### Acceptance Criteria

1. WHEN the W key or up arrow is held, THE `Player` SHALL move upward at `SPEED` pixels per second.
2. WHEN the S key or down arrow is held, THE `Player` SHALL move downward at `SPEED` pixels per second.
3. WHEN the A key or left arrow is held, THE `Player` SHALL move left at `SPEED` pixels per second.
4. WHEN the D key or right arrow is held, THE `Player` SHALL move right at `SPEED` pixels per second.
5. WHEN no directional keys are held, THE `Player` SHALL have a velocity of zero and remain stationary.
6. WHEN two opposing directional keys are held simultaneously (e.g., W and S), THE `Player` SHALL remain stationary on that axis.
7. WHEN two non-opposing directional keys are held simultaneously (diagonal movement), THE `Player` SHALL move diagonally with a velocity magnitude that does not exceed `SPEED` pixels per second.

---

### Requirement 5: Player Animations

**User Story:** As a player, I want my character to display the correct directional animation while moving and an idle animation when still, so that the character feels alive and responsive.

#### Acceptance Criteria

1. WHEN the player is stationary, THE `Player` SHALL play the `idle` animation in a continuous loop.
2. WHEN the player moves upward, THE `Player` SHALL play the `walk-up` animation in a continuous loop.
3. WHEN the player moves downward, THE `Player` SHALL play the `walk-down` animation in a continuous loop.
4. WHEN the player moves left, THE `Player` SHALL play the `walk-left` animation in a continuous loop.
5. WHEN the player moves right, THE `Player` SHALL play the `walk-right` animation in a continuous loop.
6. WHEN the player moves diagonally, THE `Player` SHALL play the vertical walk animation (`walk-up` or `walk-down`) taking priority over the horizontal animation.
7. THE `Player` SHALL register all five animations (`idle`, `walk-up`, `walk-down`, `walk-left`, `walk-right`) from the `player-default` spritesheet during construction, using 32×32 pixel frames.
8. WHEN an animation is already playing, THE `Player` SHALL NOT restart that animation from frame zero — it SHALL continue the current animation cycle.

---

### Requirement 6: World Bounds and Physics

**User Story:** As a player, I want my character to be constrained within the game world, so that I cannot walk off the edge of the map.

#### Acceptance Criteria

1. THE `Player` SHALL have arcade physics enabled with zero gravity.
2. THE `Player` SHALL collide with the world bounds so that it cannot move outside the defined world area.
3. THE `WorldScene` SHALL define a world bounds area larger than the visible viewport to allow camera scrolling.

---

### Requirement 7: Camera Follow

**User Story:** As a player, I want the camera to follow my character smoothly, so that I can always see my character as I navigate the world.

#### Acceptance Criteria

1. WHEN the player moves, THE `CameraSystem` SHALL keep the camera centered on the player with smooth lerp interpolation.
2. THE `CameraSystem` SHALL constrain the camera to the world bounds so that the camera does not show areas outside the game world.
3. THE `CameraSystem` SHALL be configured with a lerp factor that produces smooth, non-jarring camera movement.

---

### Requirement 8: React–Phaser Isolation

**User Story:** As a developer, I want React and Phaser code to be strictly isolated, so that the codebase remains maintainable and each layer can evolve independently.

#### Acceptance Criteria

1. THE `GameEventBus` SHALL be the exclusive communication channel between React components and Phaser scenes — React SHALL NOT call Phaser scene methods directly, and Phaser scenes SHALL NOT import React hooks or Context.
2. THE `WorldScene` and `UIScene` SHALL NOT import any React hooks (`useState`, `useEffect`, etc.) or React Context.
3. THE `GameCanvas` component SHALL NOT access Phaser scene objects directly — all communication SHALL go through `GameEventBus`.
4. THE `UIScene` SHALL NOT access `WorldScene` objects directly — all inter-scene communication SHALL go through `GameEventBus`.

---

### Requirement 9: Phaser Configuration

**User Story:** As a developer, I want the Phaser game configured correctly for pixel art rendering and responsive scaling, so that the game looks sharp and adapts to different screen sizes.

#### Acceptance Criteria

1. THE `gameConfig` SHALL set `pixelArt: true` to disable texture antialiasing for correct pixel art rendering.
2. THE `gameConfig` SHALL use `Phaser.Scale.FIT` scale mode with `autoCenter: Phaser.Scale.CENTER_BOTH` for responsive scaling.
3. THE `gameConfig` SHALL configure arcade physics with `gravity: { x: 0, y: 0 }`.
4. THE `gameConfig` SHALL use `type: Phaser.AUTO` to enable WebGL with Canvas fallback.

---

### Requirement 10: Game Teardown and Cleanup

**User Story:** As a developer, I want the game to clean up all resources when destroyed, so that there are no memory leaks or orphaned event listeners when navigating away from the game screen.

#### Acceptance Criteria

1. WHEN `GameManager.destroyGame()` is called, THE `GameManager` SHALL call `GameEventBus.removeAllListeners()` before destroying the Phaser game instance.
2. WHEN `GameManager.destroyGame()` is called, THE `GameManager` SHALL call `game.destroy(true)` to remove the canvas from the DOM.
3. AFTER `GameManager.destroyGame()` completes, THE `GameManager` SHALL set its internal game reference to `null` so that a new game can be started subsequently.
4. IF `GameManager.destroyGame()` is called when no game instance exists, THEN THE `GameManager` SHALL return without error.
