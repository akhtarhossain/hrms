import { useState } from 'react'
import './App.css'
import Navbar from './shared/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
<Navbar />
    </>
  )
}

export default App
