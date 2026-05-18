import { useState } from 'react'
import { GameCanvas } from './features/game/components/GameCanvas'
import { TaskCreationModal } from './features/tasks/components/TaskCreationModal'
import './App.css'

interface Task {
  id: string
  title: string
  description: string
  createdAt: string
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])

  const handleTaskAdded = (task: Task) => {
    setTasks((prev) => [...prev, task])
  }

  return (
    <>
      <GameCanvas />
      <TaskCreationModal tasks={tasks} onTaskAdded={handleTaskAdded} />
    </>
  )
}

export default App
