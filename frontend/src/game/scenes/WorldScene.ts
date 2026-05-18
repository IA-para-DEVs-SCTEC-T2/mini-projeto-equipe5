import Phaser from 'phaser'
import { Player, WASDKeys } from '../entities/Player'
import { CameraSystem } from '../systems/CameraSystem'
import { GameEventBus, GAME_EVENTS } from '../GameEventBus'

const WORLD_WIDTH = 3200
const WORLD_HEIGHT = 3200

export class WorldScene extends Phaser.Scene {
  private player!: Player
  private cameraSystem!: CameraSystem
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: WASDKeys

  constructor() {
    super({ key: 'WorldScene' })
  }

  create(): void {
    // Background
    this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x1a1a2e).setOrigin(0, 0)

    // Grid lines for visual reference
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0x333355, 0.5)
    for (let x = 0; x <= WORLD_WIDTH; x += 64) {
      graphics.moveTo(x, 0)
      graphics.lineTo(x, WORLD_HEIGHT)
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 64) {
      graphics.moveTo(0, y)
      graphics.lineTo(WORLD_WIDTH, y)
    }
    graphics.strokePath()

    // Physics world bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    // Player at world center
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2)

    // Arrow keys
    this.cursors = this.input.keyboard!.createCursorKeys()

    // WASD keys
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    // Camera
    this.cameraSystem = new CameraSystem(this, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameraSystem.follow(this.player)

    // Stub event listeners for future features
    GameEventBus.on(GAME_EVENTS.TASK_COMPLETED, this.onTaskCompleted, this)
    GameEventBus.on(GAME_EVENTS.LEVEL_UP, this.onLevelUp, this)
  }

  update(): void {
    this.player.handleMovement(this.cursors, this.wasd)
  }

  private onTaskCompleted(_payload: unknown): void {
    // TODO: trigger celebrate animation and feedback in future tasks
  }

  private onLevelUp(_payload: unknown): void {
    // TODO: trigger level-up animation in future tasks
  }
}
