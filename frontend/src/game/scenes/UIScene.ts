import Phaser from 'phaser'
import { GameEventBus, GAME_EVENTS } from '../GameEventBus'

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' })
  }

  create(): void {
    // HUD placeholder — top-left title
    this.add.text(16, 16, 'QuestBoard', {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'monospace',
    }).setScrollFactor(0)

    // Connection status placeholder
    this.add.text(16, 42, '● Online', {
      fontSize: '12px',
      color: '#00ff88',
      fontFamily: 'monospace',
    }).setScrollFactor(0)

    // Stub listeners for future HUD events
    GameEventBus.on(GAME_EVENTS.LEVEL_UP, this.onLevelUp, this)
    GameEventBus.on(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, this.onAchievementUnlocked, this)
  }

  update(): void {
    // Empty for now — HUD updates will be added in future tasks
  }

  private onLevelUp(_payload: unknown): void {
    // TODO: show level-up notification banner
  }

  private onAchievementUnlocked(_payload: unknown): void {
    // TODO: show achievement notification banner
  }
}
