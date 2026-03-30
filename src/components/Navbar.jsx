import { useState, useRef, useEffect } from 'react'
import './Navbar.css'

const navItems = [
  'Home',
  'Teams',
  'Projects',
  'About',
  'Contact'
]

export default function Navbar() {
  const [active, setActive] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const containerRef = useRef()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    containerRef.current.style.setProperty('--x', `${x}px`)
    containerRef.current.style.setProperty('--y', `${y}px`)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div
        className="nav-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
      >
        <div className="nav-logo">
          <span className="logo-main">DTU</span>
          <span className="logo-accent">Tech Teams</span>
        </div>
        <div className="nav-menu">
          <div
            className="nav-indicator"
            style={{
              transform: `translateX(${active * 96}px)`
            }}
          />

          {navItems.map((item, i) => (
            <button
              key={i}
              className={`nav-item ${active === i ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              {item}
            </button>
          ))}
        </div>

      </div>
    </nav>
  )
}
