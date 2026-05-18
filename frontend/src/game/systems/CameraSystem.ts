import Phaser from 'phaser'

export class CameraSystem {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    this.scene = scene
    this.setBounds(0, 0, worldWidth, worldHeight)
  }

  setBounds(x: number, y: number, width: number, height: number): void {
    this.scene.cameras.main.setBounds(x, y, width, height)
  }

  follow(target: Phaser.GameObjects.GameObject): void {
    this.scene.cameras.main.startFollow(target, true, 0.1, 0.1)
  }
}
