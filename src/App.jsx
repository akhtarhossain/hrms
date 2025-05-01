import { useState } from 'react'
import './App.css'
import Sidebar from './shared/Sidebar'
import Employees from './components/pages/employees/employees'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex h-screen">
      <div className="w-60">
        <Sidebar />
      </div>
      <div className="flex-1 bg-gray-100 py-9 px-1 overflow-auto">
        <Employees />
      </div>
    </div>
  )
}

export default App
