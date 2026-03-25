import './App.css'

import Scene from './components/Scene'
import Navbar from './components/Navbar'
import Hero from './components/Hero'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Hero />
      <Scene />
    </div>
  )
}

export default App
