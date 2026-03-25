import { useRef } from "react"
import "./Footer.css"

export default function Footer() {
  const ref = useRef()

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ref.current.style.setProperty("--x", `${x}px`)
    ref.current.style.setProperty("--y", `${y}px`)
  }

  return (
    <footer
      className="footer"
      ref={ref}
      onMouseMove={handleMouseMove}
    >
      <div className="footer-inner">

        {/* LEFT */}
        <div className="footer-left">
          <span className="logo-main">DTU</span>
          <span className="logo-accent">Tech Teams</span>
        </div>

        {/* CENTER */}
        <div className="footer-center">
          {["Home", "Teams", "Projects", "About", "Contact"].map((item, i) => (
            <span key={i} className="footer-link">
              {item}
            </span>
          ))}
        </div>

        {/* RIGHT */}
        <div className="footer-right">
          © 2026 DTU
        </div>

      </div>
    </footer>
  )
}