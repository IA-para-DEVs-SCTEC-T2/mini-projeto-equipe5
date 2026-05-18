import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics
  private progressBar!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    this.createLoadingBar()

    this.load.on('progress', (value: number) => {
      this.progressBar.clear()
      this.progressBar.fillStyle(0xffd700, 1)
      this.progressBar.fillRect(
        this.cameras.main.width / 4,
        this.cameras.main.height / 2 - 16,
        (this.cameras.main.width / 2) * value,
        32
      )
    })

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error(`BootScene: failed to load asset "${file.key}" from "${file.url}"`)
    })

    this.load.spritesheet('player-default', 'assets/spritesheets/player-default.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
  }

  create(): void {
    this.loadingBar.destroy()
    this.progressBar.destroy()
    this.scene.start('WorldScene')
    this.scene.launch('UIScene')
  }

  private createLoadingBar(): void {
    const { width, height } = this.cameras.main

    this.loadingBar = this.add.graphics()
    this.loadingBar.fillStyle(0x222222, 0.8)
    this.loadingBar.fillRect(width / 4 - 2, height / 2 - 18, width / 2 + 4, 36)

    this.progressBar = this.add.graphics()
  }
}
