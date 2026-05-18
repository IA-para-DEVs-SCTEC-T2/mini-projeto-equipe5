import Phaser from 'phaser'
import { GameEventBus, GAME_EVENTS } from '../GameEventBus'

const INTERACTION_RADIUS = 80

export class Interactable extends Phaser.GameObjects.Container {
  private promptText: Phaser.GameObjects.Text
  private body!: Phaser.Physics.Arcade.StaticBody
  private isModalOpen = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    // Visual: golden chest/board rectangle
    const box = scene.add.rectangle(0, 0, 40, 40, 0xffd700)
    const label = scene.add.text(0, -28, '📋', {
      fontSize: '20px',
      fontFamily: 'monospace',
    }).setOrigin(0.5)

    // Interaction prompt — hidden by default
    this.promptText = scene.add.text(0, -52, '[E] Nova Tarefa', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000cc',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setVisible(false)

    this.add([box, label, this.promptText])

    scene.add.existing(this)
    scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY)
    this.body = this.body as Phaser.Physics.Arcade.StaticBody

    // Listen for modal close to reset state
    GameEventBus.on(GAME_EVENTS.CLOSE_TASK_MODAL, () => {
      this.isModalOpen = false
    })
  }

  updateProximity(playerX: number, playerY: number, interactKey: boolean): void {
    const dist = Phaser.Math.Distance.Between(playerX, playerY, this.x, this.y)
    const isNear = dist < INTERACTION_RADIUS

    this.promptText.setVisible(isNear && !this.isModalOpen)

    if (isNear && interactKey && !this.isModalOpen) {
      this.isModalOpen = true
      GameEventBus.emit(GAME_EVENTS.OPEN_TASK_MODAL)
    }
  }
}
