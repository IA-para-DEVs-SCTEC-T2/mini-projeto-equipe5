import Phaser from 'phaser'

const SPEED = 160

export type WASDKeys = {
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
}

interface AnimationConfig {
  key: string
  frameStart: number
  frameEnd: number
  frameRate: number
  repeat: number
}

const PLAYER_ANIMATIONS: AnimationConfig[] = [
  { key: 'idle',        frameStart: 0,  frameEnd: 3,  frameRate: 6,  repeat: -1 },
  { key: 'walk-down',   frameStart: 4,  frameEnd: 7,  frameRate: 10, repeat: -1 },
  { key: 'walk-up',     frameStart: 8,  frameEnd: 11, frameRate: 10, repeat: -1 },
  { key: 'walk-left',   frameStart: 12, frameEnd: 15, frameRate: 10, repeat: -1 },
  { key: 'walk-right',  frameStart: 16, frameEnd: 19, frameRate: 10, repeat: -1 },
]

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-default', 0)
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setCollideWorldBounds(true)
    this.registerAnimations()
    this.play('idle')
  }

  private registerAnimations(): void {
    const anims = this.scene.anims
    if (anims.exists('idle')) return

    PLAYER_ANIMATIONS.forEach(({ key, frameStart, frameEnd, frameRate, repeat }) => {
      anims.create({
        key,
        frames: anims.generateFrameNumbers('player-default', {
          start: frameStart,
          end: frameEnd,
        }),
        frameRate,
        repeat,
      })
    })
  }

  handleMovement(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd: WASDKeys
  ): void {
    const up    = cursors.up.isDown    || wasd.up.isDown
    const down  = cursors.down.isDown  || wasd.down.isDown
    const left  = cursors.left.isDown  || wasd.left.isDown
    const right = cursors.right.isDown || wasd.right.isDown

    let vx = 0
    let vy = 0

    if (left)  vx -= SPEED
    if (right) vx += SPEED
    if (up)    vy -= SPEED
    if (down)  vy += SPEED

    // Normalize diagonal velocity so magnitude never exceeds SPEED
    if (vx !== 0 && vy !== 0) {
      const factor = SPEED / Math.sqrt(SPEED * SPEED + SPEED * SPEED)
      vx *= factor
      vy *= factor
    }

    this.setVelocity(vx, vy)
    this.playMovementAnimation(vx, vy)
  }

  private playMovementAnimation(vx: number, vy: number): void {
    if (vx === 0 && vy === 0) {
      if (this.anims.currentAnim?.key !== 'idle') {
        this.play('idle')
      }
      return
    }

    // Vertical takes priority over horizontal
    if (vy < 0) {
      this.play('walk-up', true)
    } else if (vy > 0) {
      this.play('walk-down', true)
    } else if (vx < 0) {
      this.play('walk-left', true)
    } else {
      this.play('walk-right', true)
    }
  }
}
