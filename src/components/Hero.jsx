import './Hero.css'

import dev from '../assets/software_manaquin.png'
import print from '../assets/threedPrinter_manaquin.png'
import elec from '../assets/electronics_manaquin.png'

export default function Hero() {
  return (
    <div className="hero">
      <div className="zone left">
        <img src={dev} className="man" />
      </div>
      <div className="zone center">
        <img src={print} className="man" />
      </div>
      <div className="zone right">
        <img src={elec} className="man" />
      </div>

    </div>
  )
}
