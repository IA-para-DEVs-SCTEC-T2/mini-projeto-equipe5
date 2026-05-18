import Phaser from 'phaser'

export const GameEventBus = new Phaser.Events.EventEmitter()

export const GAME_EVENTS = {
  TASK_COMPLETED: 'task:completed',
  LEVEL_UP: 'level:up',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  PLAYER_DATA_LOADED: 'player:data_loaded',
  LEADERBOARD_UPDATED: 'leaderboard:updated',
} as const
