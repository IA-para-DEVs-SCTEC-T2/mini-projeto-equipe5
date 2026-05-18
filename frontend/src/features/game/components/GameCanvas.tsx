import { useEffect, useRef } from 'react'
import { startGame, destroyGame } from '../../../game/GameManager'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    startGame(containerRef.current)
    return () => {
      destroyGame()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="game-container"
      style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
    />
  )
}
