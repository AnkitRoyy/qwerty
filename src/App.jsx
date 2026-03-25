import './App.css'

import Scene from './components/Scene'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MapScene from './components/MapScene'
import Footer from './components/Footer'

function App() {
  return (
    <>
      {/* 🔥 HERO SCREEN */}
      <div className="app-container">
        <Navbar />
        <Hero />
        <Scene />
      </div>

      {/* 🔥 MAP SECTION */}
      <div className="map-section">
        <MapScene />
      </div>

      <Footer/>
    </>
  )
}

export default App