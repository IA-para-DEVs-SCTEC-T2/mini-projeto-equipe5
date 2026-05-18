import { useEffect, useRef, useState } from 'react'
import { GameEventBus, GAME_EVENTS } from '../../../game/GameEventBus'

interface Task {
  id: string
  title: string
  description: string
  createdAt: string
}

interface TaskCreationModalProps {
  tasks: Task[]
  onTaskAdded: (task: Task) => void
}

export function TaskCreationModal({ tasks, onTaskAdded }: TaskCreationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const openHandler = () => setIsOpen(true)
    const closeHandler = () => setIsOpen(false)

    GameEventBus.on(GAME_EVENTS.OPEN_TASK_MODAL, openHandler)
    GameEventBus.on(GAME_EVENTS.CLOSE_TASK_MODAL, closeHandler)

    return () => {
      GameEventBus.off(GAME_EVENTS.OPEN_TASK_MODAL, openHandler)
      GameEventBus.off(GAME_EVENTS.CLOSE_TASK_MODAL, closeHandler)
    }
  }, [])

  // Focus first field when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setTitleError('')
    GameEventBus.emit(GAME_EVENTS.CLOSE_TASK_MODAL)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setTitleError('O título é obrigatório.')
      return
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    }

    console.log('[LocalTaskStore] Task added:', newTask)
    onTaskAdded(newTask)

    setTitle('')
    setDescription('')
    setTitleError('')
    GameEventBus.emit(GAME_EVENTS.CLOSE_TASK_MODAL)
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          background: '#1a1a2e',
          border: '2px solid #ffd700',
          borderRadius: '8px',
          padding: '24px',
          width: '100%',
          maxWidth: '420px',
          color: '#ffffff',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 id="modal-title" style={{ margin: 0, color: '#ffd700', fontSize: '18px' }}>
            📋 Nova Tarefa
          </h2>
          <button
            onClick={handleClose}
            aria-label="Fechar modal"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="task-title" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#aaaaaa' }}>
              Título *
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError('') }}
              placeholder="O que você precisa fazer?"
              aria-describedby={titleError ? 'title-error' : undefined}
              aria-invalid={!!titleError}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: '#0d0d1a',
                border: `1px solid ${titleError ? '#ff4444' : '#444466'}`,
                borderRadius: '4px',
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            {titleError && (
              <span id="title-error" role="alert" style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {titleError}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="task-description" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#aaaaaa' }}>
              Descrição (opcional)
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: '#0d0d1a',
                border: '1px solid #444466',
                borderRadius: '4px',
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: '1px solid #444466',
                borderRadius: '4px',
                color: '#aaaaaa',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                background: '#ffd700',
                border: 'none',
                borderRadius: '4px',
                color: '#000000',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Criar Tarefa
            </button>
          </div>
        </form>

        {tasks.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #333355', paddingTop: '16px' }}>
            <p style={{ fontSize: '12px', color: '#aaaaaa', margin: '0 0 8px' }}>
              Tarefas criadas nesta sessão ({tasks.length}):
            </p>
            <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: '#cccccc' }}>
              {tasks.map((t) => (
                <li key={t.id} style={{ marginBottom: '4px' }}>{t.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
