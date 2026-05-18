# Requirements Document

## Introduction

This feature adds a fixed interactive object (a Quest Board NPC/chest/board) to the QuestBoard game world. When the player walks near it and presses the interaction key (E or Space), a React modal overlay opens on top of the Phaser canvas. The player can type and submit a new task through the modal. The submitted task is stored in local React state (no backend integration in this iteration). Communication between the Phaser layer and the React layer follows the established `GameEventBus` pattern exclusively.

## Glossary

- **Interactable**: A fixed Phaser entity in `src/game/entities/` that detects player proximity and emits interaction events via `GameEventBus`.
- **InteractionZone**: The circular or rectangular area around the Interactable within which the player is considered "near" and the interaction prompt is shown.
- **InteractionPrompt**: A Phaser UI element (text or icon) rendered above the Interactable when the player is inside the InteractionZone.
- **TaskCreationModal**: A React component rendered as an overlay on top of the game canvas, containing the task creation form.
- **TaskForm**: The form inside the TaskCreationModal where the player enters task data (title, optional description).
- **LocalTaskStore**: The in-memory React state (e.g., `useState` array) that holds submitted tasks for this session. No backend persistence.
- **GameEventBus**: The singleton `Phaser.Events.EventEmitter` in `src/game/GameEventBus.ts` used as the exclusive communication bridge between Phaser and React.
- **GAME_EVENTS**: The `const` object in `GameEventBus.ts` that enumerates all event keys.
- **WorldScene**: The main Phaser scene in `src/game/scenes/WorldScene.ts` that manages the game world, player, and entities.
- **Player**: The `Phaser.Physics.Arcade.Sprite` in `src/game/entities/Player.ts` controlled by the user via WASD/arrow keys.

---

## Requirements

### Requirement 1: Interactable Entity in the Game World

**User Story:** As a player, I want to see a fixed interactive object on the game map, so that I know where I can go to create a new task.

#### Acceptance Criteria

1. THE `Interactable` SHALL be a Phaser entity defined in `src/game/entities/Interactable.ts` and placed at a fixed position in the `WorldScene`.
2. THE `Interactable` SHALL be rendered as a visible sprite or colored rectangle with a distinct visual style that differentiates it from background tiles.
3. THE `WorldScene` SHALL instantiate exactly one `Interactable` during its `create()` lifecycle method.
4. THE `Interactable` SHALL have an `InteractionZone` with a radius of 80 pixels centered on the entity's position; a `Player` at a distance of exactly 80 pixels SHALL be treated as outside the zone.
5. WHILE the `Player` is inside the `InteractionZone` (distance strictly less than 80 pixels), THE `Interactable` SHALL display the `InteractionPrompt` (e.g., "[E] New Task") above the entity.
6. WHILE the `Player` is outside the `InteractionZone` (distance greater than or equal to 80 pixels), THE `Interactable` SHALL hide the `InteractionPrompt`.

---

### Requirement 2: Interaction Key Detection

**User Story:** As a player, I want to press a key when near the interactive object, so that I can open the task creation form without leaving the game world.

#### Acceptance Criteria

1. THE `WorldScene` SHALL register both the `E` key and the `Space` key as interaction keys during `create()`.
2. WHEN the `Player` is inside the `InteractionZone` and the `E` key or `Space` key is pressed, THE `WorldScene` SHALL check the player's position at the moment of the key press and, if the player is inside the zone, emit the `GAME_EVENTS.OPEN_TASK_MODAL` event on the `GameEventBus`.
3. WHEN the `Player` is outside the `InteractionZone` and the `E` key or `Space` key is pressed, THE `WorldScene` SHALL NOT emit `GAME_EVENTS.OPEN_TASK_MODAL`.
4. WHILE the `TaskCreationModal` is open, THE `WorldScene` SHALL NOT emit `GAME_EVENTS.OPEN_TASK_MODAL` in response to key presses.
5. THE `GAME_EVENTS` object in `GameEventBus.ts` SHALL include the key `OPEN_TASK_MODAL` with value `'ui:open_task_modal'`.
6. THE `GAME_EVENTS` object in `GameEventBus.ts` SHALL include the key `CLOSE_TASK_MODAL` with value `'ui:close_task_modal'`.

---

### Requirement 3: Player Movement Suspension

**User Story:** As a player, I want the character to stop moving while the task form is open, so that I don't accidentally navigate away while typing.

#### Acceptance Criteria

1. WHEN `GAME_EVENTS.OPEN_TASK_MODAL` is emitted, THE `WorldScene` SHALL suspend `Player` movement input processing.
2. WHILE `Player` movement is suspended, THE `Player` SHALL have zero velocity regardless of key input.
3. WHEN `GAME_EVENTS.CLOSE_TASK_MODAL` is emitted, THE `WorldScene` SHALL resume `Player` movement input processing.
4. WHEN `GAME_EVENTS.CLOSE_TASK_MODAL` is emitted, THE `WorldScene` SHALL restore the `Player` velocity to zero as the initial resumed state (no residual movement from keys held before the modal opened).

---

### Requirement 4: Task Creation Modal (React)

**User Story:** As a player, I want a form to appear over the game when I interact with the board, so that I can enter the details of a new task.

#### Acceptance Criteria

1. THE `TaskCreationModal` SHALL be a React component located at `src/features/tasks/components/TaskCreationModal.tsx`.
2. WHEN the `GameEventBus` emits `GAME_EVENTS.OPEN_TASK_MODAL`, THE `TaskCreationModal` SHALL become visible as an overlay on top of the game canvas.
3. WHILE the `TaskCreationModal` is visible, THE `TaskCreationModal` SHALL render a `TaskForm` containing at minimum a required "Title" text input and a "Submit" button.
4. WHERE an optional description field is included, THE `TaskForm` SHALL render a "Description" textarea that accepts multi-line text.
5. THE `TaskCreationModal` SHALL render a visible close/cancel control (button or icon) that allows the player to dismiss the modal without submitting.
6. THE `TaskCreationModal` SHALL be keyboard-accessible: focus SHALL move to the first form field when the modal opens, and pressing `Escape` SHALL close the modal.
7. THE `TaskCreationModal` SHALL include appropriate `aria-modal`, `role="dialog"`, and `aria-labelledby` attributes to meet WCAG 2.1 AA accessibility requirements.

---

### Requirement 5: Task Form Validation

**User Story:** As a player, I want the form to prevent me from submitting an empty task, so that all tasks have at least a meaningful title.

#### Acceptance Criteria

1. WHEN the player attempts to submit the `TaskForm` with an empty "Title" field, THE `TaskForm` SHALL display a visible inline validation error message adjacent to the "Title" input.
2. WHEN the player attempts to submit the `TaskForm` with an empty "Title" field, THE `TaskForm` SHALL NOT add a task to the `LocalTaskStore`.
3. WHEN the "Title" field contains only whitespace characters, THE `TaskForm` SHALL treat it as empty and apply the same validation as criterion 1.
4. WHEN the "Title" field contains at least one non-whitespace character, THE `TaskForm` SHALL allow submission.
5. THE `TaskForm` SHALL trim leading and trailing whitespace from the "Title" value before storing the task.

---

### Requirement 6: Task Submission and Local Storage

**User Story:** As a player, I want my submitted task to be saved, so that I can see it was recorded even without a backend.

#### Acceptance Criteria

1. WHEN the player submits a valid `TaskForm`, THE `TaskCreationModal` SHALL add a new task object to the `LocalTaskStore` containing at minimum the trimmed title, optional description, and a creation timestamp.
2. WHEN the player submits a valid `TaskForm`, THE `TaskCreationModal` SHALL emit `GAME_EVENTS.CLOSE_TASK_MODAL` on the `GameEventBus` after storing the task.
3. WHEN the player submits a valid `TaskForm`, THE `TaskCreationModal` SHALL reset the form fields to empty before closing.
4. THE `LocalTaskStore` SHALL be a React state array managed in a component or hook at or above the `TaskCreationModal` in the component tree, so that submitted tasks persist for the duration of the browser session.
5. WHEN a task is added to the `LocalTaskStore` via form submission, THE application SHALL log the new task object to the browser console (e.g., `console.log('[LocalTaskStore] Task added:', task)`). Tasks added through other means (future API sync, imports) are not required to trigger this log.

---

### Requirement 7: Modal Dismissal and Game Resumption

**User Story:** As a player, I want the game to resume normally after I close the modal, so that I can continue exploring the world.

#### Acceptance Criteria

1. WHEN the player activates the close/cancel control in the `TaskCreationModal`, THE `TaskCreationModal` SHALL emit `GAME_EVENTS.CLOSE_TASK_MODAL` on the `GameEventBus`.
2. WHEN the player presses `Escape` while the `TaskCreationModal` is open, THE `TaskCreationModal` SHALL emit `GAME_EVENTS.CLOSE_TASK_MODAL` on the `GameEventBus`.
3. WHEN `GAME_EVENTS.CLOSE_TASK_MODAL` is emitted on the `GameEventBus`, THE `TaskCreationModal` SHALL become hidden. The modal SHALL NOT hide directly from a key press or other trigger — it SHALL only hide after `GAME_EVENTS.CLOSE_TASK_MODAL` has been properly emitted.
4. WHEN the `TaskCreationModal` is dismissed without submission, THE `TaskForm` SHALL reset all fields to empty.
5. WHEN `GAME_EVENTS.CLOSE_TASK_MODAL` is emitted, THE `WorldScene` SHALL resume player movement (as specified in Requirement 3, criterion 3).

---

### Requirement 8: GameEventBus Isolation

**User Story:** As a developer, I want all React ↔ Phaser communication to go through the GameEventBus, so that the architecture boundary between game code and UI code is never violated.

#### Acceptance Criteria

1. THE `Interactable` entity SHALL NOT import any React module, hook, or Context.
2. THE `WorldScene` SHALL NOT import any React module, hook, or Context.
3. THE `TaskCreationModal` SHALL NOT import any Phaser class or reference `Phaser` directly.
4. THE `TaskCreationModal` SHALL subscribe to `GAME_EVENTS.OPEN_TASK_MODAL` on the `GameEventBus` using a React `useEffect` hook, and SHALL unsubscribe when the component unmounts.
5. WHEN the `TaskCreationModal` component unmounts, THE component SHALL remove all `GameEventBus` listeners it registered to prevent memory leaks.
6. THE `GameEventBus` SHALL remain the single source of truth for cross-layer communication — no direct method calls, shared module-level variables, or DOM events SHALL be used as substitutes.
