import Phaser from 'phaser'
import { gameConfig } from './config/gameConfig'
import { GameEventBus } from './GameEventBus'
import { BootScene } from './scenes/BootScene'
import { WorldScene } from './scenes/WorldScene'
import { UIScene } from './scenes/UIScene'

let gameInstance: Phaser.Game | null = null

export function startGame(parent: HTMLElement): Phaser.Game {
  if (gameInstance !== null) {
    console.warn('GameManager: game already running, returning existing instance')
    return gameInstance
  }

  const config: Phaser.Types.Core.GameConfig = {
    ...gameConfig,
    parent,
    scene: [BootScene, WorldScene, UIScene],
  }
  gameInstance = new Phaser.Game(config)
  return gameInstance
}

export function destroyGame(): void {
  if (gameInstance === null) return
  GameEventBus.removeAllListeners()
  gameInstance.destroy(true)
  gameInstance = null
}

export function getGame(): Phaser.Game | null {
  return gameInstance
}
