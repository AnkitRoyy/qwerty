import { Routes, Route } from 'react-router-dom'
import './App.css'

import Scene from './components/Scene'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MapScene from './components/MapScene'
import Footer from './components/Footer'
import TeamPage from './components/TeamPage'

function HomePage() {
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/team/:teamName" element={<TeamPage />} />
    </Routes>
  )
}

export default App