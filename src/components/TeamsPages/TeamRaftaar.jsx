import { motion, useScroll, useTransform } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useRef, useMemo, useState, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

import img1 from "../../assets/teams/RAFTAAR/1.jpg"

function MouseTracker({ children }) {
  const groupRef = useRef()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  useMemo(() => {
    const handler = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  useFrame(() => {
    target.current.x += (mouse.current.x - target.current.x) * 0.04
    target.current.y += (mouse.current.y - target.current.y) * 0.04
    if (groupRef.current) {
      groupRef.current.rotation.y = target.current.x * 0.6
      groupRef.current.rotation.x = target.current.y * 0.3
    }
  })

  return <group ref={groupRef}>{children}</group>
}

function GyroscopeRings() {
  const r1 = useRef(), r2 = useRef(), r3 = useRef(), r4 = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (r1.current) { r1.current.rotation.z = t * 0.25; r1.current.material.opacity = 0.55 + Math.sin(t * 1.1) * 0.15 }
    if (r2.current) { r2.current.rotation.x = t * 0.18; r2.current.material.opacity = 0.4 + Math.sin(t * 0.9 + 1) * 0.12 }
    if (r3.current) { r3.current.rotation.y = t * 0.2; r3.current.rotation.z = t * 0.08; r3.current.material.opacity = 0.3 + Math.sin(t * 0.7 + 2) * 0.1 }
    if (r4.current) { r4.current.rotation.x = -t * 0.12; r4.current.rotation.z = t * 0.15; r4.current.material.opacity = 0.2 + Math.sin(t * 1.3 + 3) * 0.08 }
  })

  return (
    <group>
      <mesh ref={r1}>
        <torusGeometry args={[1.8, 0.022, 3, 200]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.5, 0.016, 3, 200]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh ref={r3} rotation={[Math.PI / 6, Math.PI / 5, 0]}>
        <torusGeometry args={[3.3, 0.011, 3, 200]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh ref={r4} rotation={[Math.PI / 3.5, Math.PI / 4, Math.PI / 7]}>
        <torusGeometry args={[4.2, 0.007, 3, 200]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}

function PulseSphere() {
  const ref = useRef()
  const wireRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = Math.sin(t * 0.8) * 0.5 + 0.5
    if (ref.current) {
      ref.current.rotation.y = t * 0.07
      ref.current.material.opacity = 0.08 + pulse * 0.05
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.05
      wireRef.current.rotation.x = t * 0.04
      wireRef.current.material.opacity = 0.12 + pulse * 0.06
    }
    if (glowRef.current) {
      const s = 1 + pulse * 0.06
      glowRef.current.scale.set(s, s, s)
      glowRef.current.material.opacity = 0.04 + pulse * 0.04
    }
  })

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.05} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.09} depthWrite={false} />
      </mesh>
      <mesh ref={wireRef}>
        <sphereGeometry args={[1.02, 20, 20]} />
        <meshBasicMaterial color="#7dd3fc" wireframe transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  )
}

function HeroParticles() {
  const mesh = useRef()
  const count = 120

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const ph = []
    for (let i = 0; i < count; i++) {
      const r = 1.5 + Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      ph.push(Math.random() * Math.PI * 2)
    }
    return [pos, ph]
  }, [])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.getElapsedTime()
    const pos = mesh.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      const drift = 1 + Math.sin(t * 0.4 + phases[i]) * 0.08
      pos.array[i * 3]     = positions[i * 3]     * drift
      pos.array[i * 3 + 1] = positions[i * 3 + 1] * drift + Math.sin(t * 0.3 + phases[i]) * 0.05
      pos.array[i * 3 + 2] = positions[i * 3 + 2] * drift
    }
    pos.needsUpdate = true
    mesh.current.material.opacity = 0.45 + Math.sin(t * 0.5) * 0.1
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#7dd3fc" size={0.045} transparent opacity={0.5} depthWrite={false} />
    </points>
  )
}

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 55 }} style={{ width: "100%", height: "100%" }}>
      <color attach="background" args={["#020c1b"]} />
      <ambientLight intensity={0.1} color="#38bdf8" />
      <pointLight position={[0, 0, 5]} intensity={0.4} color="#38bdf8" />
      <MouseTracker>
        <GyroscopeRings />
        <PulseSphere />
      </MouseTracker>
      <HeroParticles />
    </Canvas>
  )
}

function TrophyOrb({ color }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 38 }}
      style={{ width: 90, height: 90, flexShrink: 0 }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <TrophyMesh color={color} hovered={hovered} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={hovered ? 6 : 1.5} />
    </Canvas>
  )
}

function TrophyMesh({ color, hovered }) {
  const r1 = useRef(), r2 = useRef(), dot = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (r1.current) {
      r1.current.rotation.y = t * (hovered ? 0.8 : 0.3)
      r1.current.material.opacity = (hovered ? 0.85 : 0.6) + Math.sin(t * 1.5) * 0.1
    }
    if (r2.current) {
      r2.current.rotation.x = t * (hovered ? 0.6 : 0.2)
      r2.current.material.opacity = (hovered ? 0.55 : 0.35) + Math.sin(t * 1.1 + 1) * 0.08
    }
    if (dot.current) {
      const s = 1 + Math.sin(t * 2) * (hovered ? 0.15 : 0.06)
      dot.current.scale.set(s, s, s)
    }
  })

  return (
    <>
      <mesh ref={r1}>
        <torusGeometry args={[0.85, 0.04, 3, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[0.85, 0.025, 3, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh ref={dot}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.15 : 0.05} depthWrite={false} />
      </mesh>
    </>
  )
}

function BigDividerRings() {
  const g = useRef()
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const velocity = useRef(0)
  const targetY = useRef(0)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!isDragging.current) {
      targetY.current += 0.004 + velocity.current
      velocity.current *= 0.94
    }
    if (g.current) {
      g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, targetY.current, 0.07)
      g.current.rotation.x = Math.sin(t * 0.2) * 0.12
    }
  })

  const onPointerDown = useCallback((e) => {
    isDragging.current = true
    lastX.current = e.clientX
    document.body.style.cursor = "grabbing"
  }, [])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = "grab"
  }, [])

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastX.current
    lastX.current = e.clientX
    const delta = dx * 0.006
    targetY.current += delta
    velocity.current = delta
  }, [])

  return (
    <group
      ref={g}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerOver={() => { document.body.style.cursor = "grab" }}
      onPointerOut={() => { document.body.style.cursor = "auto" }}
    >
      {[
        { r: 1.2, tube: 0.04,  tilt: [0, 0, 0],                         col: "#38bdf8", op: 0.75, speed: 0.4  },
        { r: 2.0, tube: 0.028, tilt: [Math.PI/2.2, 0, 0],               col: "#7dd3fc", op: 0.55, speed: 0.28 },
        { r: 2.8, tube: 0.02,  tilt: [Math.PI/5, Math.PI/6, 0],         col: "#38bdf8", op: 0.4,  speed: 0.18 },
        { r: 3.6, tube: 0.015, tilt: [Math.PI/3, 0, Math.PI/7],         col: "#bae6fd", op: 0.28, speed: 0.13 },
        { r: 4.3, tube: 0.011, tilt: [Math.PI/4, Math.PI/3, 0],         col: "#38bdf8", op: 0.2,  speed: 0.09 },
        { r: 5.0, tube: 0.008, tilt: [Math.PI/6, Math.PI/5, Math.PI/8], col: "#7dd3fc", op: 0.14, speed: 0.07 },
        { r: 5.7, tube: 0.006, tilt: [0, Math.PI/4, Math.PI/5],         col: "#38bdf8", op: 0.09, speed: 0.05 },
      ].map((ring, i) => (
        <RingMesh key={i} {...ring} />
      ))}
      <CentralGlow />
      <OrbitingDots />
    </group>
  )
}

function RingMesh({ r, tube, tilt, col, op, speed }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.z = t * speed
      ref.current.material.opacity = op + Math.sin(t * 0.7 + r) * (op * 0.25)
    }
  })
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[r, tube, 3, 200]} />
      <meshBasicMaterial color={col} transparent opacity={op} depthWrite={false} />
    </mesh>
  )
}

function CentralGlow() {
  const ref = useRef()
  const wire = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const p = Math.sin(t * 0.9) * 0.5 + 0.5
    if (ref.current) {
      const s = 1 + p * 0.1
      ref.current.scale.set(s, s, s)
      ref.current.material.opacity = 0.08 + p * 0.07
    }
    if (wire.current) {
      wire.current.rotation.y = t * 0.1
      wire.current.material.opacity = 0.12 + p * 0.08
    }
  })
  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh ref={wire}>
        <sphereGeometry args={[0.72, 14, 14]} />
        <meshBasicMaterial color="#7dd3fc" wireframe transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </>
  )
}

function OrbitingDots() {
  const group = useRef()
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.getElapsedTime() * 0.35
  })

  const dots = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2
      const r = 2.2
      return { x: Math.cos(angle) * r, y: Math.sin(angle * 0.5) * 0.4, z: Math.sin(angle) * r }
    })
  }, [])

  return (
    <group ref={group}>
      {dots.map((d, i) => (
        <DotMesh key={i} position={[d.x, d.y, d.z]} phase={i * 1.05} />
      ))}
    </group>
  )
}

function DotMesh({ position, phase }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      const s = 0.8 + Math.sin(t * 1.5 + phase) * 0.3
      ref.current.scale.set(s, s, s)
      ref.current.material.opacity = 0.5 + Math.sin(t * 1.5 + phase) * 0.3
    }
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 10, 10]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} depthWrite={false} />
    </mesh>
  )
}

function DividerScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 52 }} style={{ width: "100%", height: "100%" }}>
      <color attach="background" args={["#020c1b"]} />
      <BigDividerRings />
    </Canvas>
  )
}

function SectionOrbMesh({ hovered }) {
  const r = useRef(), r2 = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const speed = hovered ? 2.5 : 0.6
    if (r.current)  r.current.rotation.y  = t * speed
    if (r2.current) r2.current.rotation.x = t * speed * 0.7
  })
  return (
    <>
      <mesh ref={r}>
        <torusGeometry args={[0.38, hovered ? 0.055 : 0.038, 3, 80]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={hovered ? 0.9 : 0.5} depthWrite={false} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[0.38, 0.022, 3, 80]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={hovered ? 0.6 : 0.25} depthWrite={false} />
      </mesh>
    </>
  )
}

function MiniOrb() {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ width: 48, height: 48, flexShrink: 0, cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas camera={{ position: [0, 0, 2], fov: 42 }} style={{ width: "100%", height: "100%" }}>
        <SectionOrbMesh hovered={hovered} />
      </Canvas>
    </div>
  )
}

function PhotoFrameScene() {
  const r1 = useRef(), r2 = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (r1.current) {
      r1.current.rotation.y = t * (hovered ? 0.5 : 0.18)
      r1.current.rotation.z = t * 0.08
      r1.current.material.opacity = 0.45 + Math.sin(t) * 0.1
    }
    if (r2.current) {
      r2.current.rotation.x = t * (hovered ? 0.4 : 0.14)
      r2.current.rotation.y = -t * 0.1
      r2.current.material.opacity = 0.28 + Math.sin(t * 0.8 + 1) * 0.08
    }
  })

  return (
    <group onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <mesh ref={r1} rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[3.5, 0.025, 3, 200]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 2.3, Math.PI / 5, 0]}>
        <torusGeometry args={[4.2, 0.015, 3, 200]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  )
}

const ACHIEVEMENTS = [
  { rank: "1ST PLACE", event: "Design Category",            comp: "ASME e-HPVC 2025",               color: "#fbbf24" },
  { rank: "2ND PLACE", event: "Overall",                    comp: "ASME XRC 2024",                  color: "#94a3b8" },
  { rank: "1ST PLACE", event: "Overall",                    comp: "ASME eFest HPVC · Asia Pacific",  color: "#fbbf24" },
]

const LEADERSHIP = [
  { name: "Alok Kumar",           role: "Captain"                        },
  { name: "Abhishek Manu Saxena", role: "Vice Captain · Mechanical Head" },
  { name: "Rachit Arora",         role: "Vice Captain · Manager"         },
]

const SPONSORS = ["Kazam EV", "SolidWorks", "Ansys", "MATLAB", "Altair"]

function SLabel({ n, title }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}
    >
      <MiniOrb />
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.52rem", letterSpacing: "0.28em", color: "#38bdf8", opacity: 0.6 }}>
        {String(n).padStart(2, "0")}
      </span>
      <div style={{ width: 1, height: 18, background: "rgba(56,189,248,0.2)" }} />
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.75rem", letterSpacing: "0.16em", color: "#64748b", textTransform: "uppercase" }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(56,189,248,0.15), transparent)" }} />
    </motion.div>
  )
}

function AchRow({ rank, event, comp, color, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 6 }}
      style={{
        display: "flex", alignItems: "center", gap: 20,
        padding: "16px 20px 16px 12px",
        borderRadius: 3,
        background: "rgba(6,18,36,0.55)",
        border: "1px solid rgba(56,189,248,0.06)",
        borderLeft: `2px solid ${color}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <TrophyOrb color={color} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.6rem", color, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 5 }}>{rank}</div>
        <div style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: 500 }}>{event}</div>
        <div style={{ color: "#1e3a5f", fontSize: "0.65rem", fontFamily: "'Space Mono',monospace", marginTop: 3 }}>{comp}</div>
      </div>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}, 0 0 20px ${color}40` }} />
    </motion.div>
  )
}

function PersonCard({ name, role, i }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      animate={{ y: hov ? -4 : 0 }}
      style={{
        padding: "26px 22px",
        borderRadius: 3,
        background: "rgba(6,18,36,0.55)",
        border: `1px solid ${hov ? "rgba(56,189,248,0.3)" : "rgba(56,189,248,0.08)"}`,
        backdropFilter: "blur(12px)",
        position: "relative", overflow: "hidden",
        transition: "border-color 0.25s",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 18, height: 1, background: "rgba(56,189,248,0.3)" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 1, height: 18, background: "rgba(56,189,248,0.3)" }} />
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.5rem", letterSpacing: "0.22em", color: "#38bdf8", marginBottom: 9, opacity: hov ? 1 : 0.6, textTransform: "uppercase", transition: "opacity 0.2s" }}>
        {role}
      </div>
      <div style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: 500 }}>{name}</div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${hov ? "rgba(56,189,248,0.4)" : "rgba(56,189,248,0.12)"}, transparent)`, transition: "background 0.25s" }} />
    </motion.div>
  )
}

export default function TeamRaftaar() {
  const navigate = useNavigate()
  const heroRef = useRef()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY   = useTransform(scrollYProgress, [0, 1], [0, 50])
  const heroOpa = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const sceneS  = useTransform(scrollYProgress, [0, 1], [1, 0.9])

  return (
    <div style={{ background: "#020c1b", color: "#e2e8f0", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(56,189,248,0.2); border-radius:99px; }
      `}</style>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        style={{
          position: "fixed", top: 22, left: 22, zIndex: 200,
          padding: "9px 16px",
          background: "rgba(2,12,27,0.88)",
          border: "1px solid rgba(56,189,248,0.2)",
          borderRadius: 3, color: "#7dd3fc",
          fontFamily: "'Space Mono',monospace", fontSize: "0.6rem", letterSpacing: "0.14em",
          cursor: "pointer", backdropFilter: "blur(14px)",
        }}
      >
        ← BACK
      </motion.button>

      {/* Hero */}
      <section ref={heroRef} style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        <motion.div style={{ position: "absolute", inset: 0, scale: sceneS }}>
          <HeroScene />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
          style={{
            position: "absolute", top: 24, right: 24, zIndex: 10,
            fontFamily: "'Space Mono',monospace", fontSize: "0.5rem", letterSpacing: "0.2em",
            color: "#1e3a5f", textTransform: "uppercase",
          }}
        >
          MOVE CURSOR TO INTERACT
        </motion.div>

        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 30%, rgba(2,12,27,0.55) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40vh", pointerEvents: "none", background: "linear-gradient(to top, #020c1b, transparent)" }} />

        <motion.div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          y: heroY, opacity: heroOpa, zIndex: 10,
          pointerEvents: "none",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.56rem", letterSpacing: "0.35em", color: "#38bdf8", opacity: 0.65, marginBottom: 26, display: "flex", alignItems: "center", gap: 14 }}
          >
            <span style={{ display: "inline-block", width: 32, height: 1, background: "rgba(56,189,248,0.4)" }} />
            ASME e-HPVC · DTU · NEW DELHI
            <span style={{ display: "inline-block", width: 32, height: 1, background: "rgba(56,189,248,0.4)" }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: "clamp(3rem, 8.5vw, 8rem)",
              fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.92, textAlign: "center",
              color: "#ffffff",
            }}
          >
            TEAM<br />
            <span style={{ WebkitTextStroke: "1px #38bdf8", color: "transparent" }}>
              RAFTAAR
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}
            style={{ marginTop: 30, fontFamily: "'Space Mono',monospace", fontSize: "0.64rem", letterSpacing: "0.24em", color: "#1e3a5f", textTransform: "uppercase" }}
          >
            Just Feel the Need for Speed
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} style={{ position: "absolute", bottom: 38 }}>
            <motion.div
              animate={{ scaleY: [1, 0.25, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 1, height: 42, background: "linear-gradient(to bottom, rgba(56,189,248,0.45), transparent)", transformOrigin: "top", margin: "0 auto" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "90px 28px 70px" }}>

        {/* 01 — The Team */}
        <section style={{ marginBottom: 100 }}>
          <SLabel n={1} title="The Team" />
          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", borderRadius: 4, overflow: "hidden" }}
          >
            <div style={{ position: "absolute", inset: -40, zIndex: 2, pointerEvents: "none" }}>
              <Canvas camera={{ position: [0, 0, 7], fov: 55 }} style={{ width: "100%", height: "100%" }}>
                <PhotoFrameScene />
              </Canvas>
            </div>

            <img
              src={img1}
              alt="Team Raftaar"
              style={{ width: "100%", display: "block", filter: "brightness(0.7) contrast(1.06) saturate(0.78)", position: "relative", zIndex: 1 }}
            />
            <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "linear-gradient(to bottom, rgba(2,12,27,0.2) 0%, transparent 35%, transparent 60%, rgba(2,12,27,0.9) 100%)" }} />
            <div style={{ position: "absolute", bottom: 24, left: 28, right: 28, zIndex: 4, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.52rem", letterSpacing: "0.25em", color: "#38bdf8", opacity: 0.65, marginBottom: 5 }}>
                  SEASON 2025 · ASME e-HPVC
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.95rem", color: "#e2e8f0", fontWeight: 700, letterSpacing: "0.06em" }}>
                  TEAM RAFTAAR
                </div>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.52rem", color: "#334155", letterSpacing: "0.15em" }}>DTU · NEW DELHI</div>
            </div>
            {[0, 1].map((idx) => (
              <div key={idx} style={{ position: "absolute", top: 16, [idx === 0 ? "right" : "left"]: 18, zIndex: 4 }}>
                <div style={{ width: 18, height: 1, background: "rgba(56,189,248,0.4)", marginBottom: 3, marginLeft: idx === 0 ? "auto" : 0 }} />
                <div style={{ width: 1, height: 18, background: "rgba(56,189,248,0.4)", marginLeft: idx === 0 ? "auto" : 0 }} />
              </div>
            ))}
          </motion.div>
        </section>

        {/* 02 — About */}
        <section style={{ marginBottom: 100 }}>
          <SLabel n={2} title="About" />
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: "38px 42px", borderRadius: 3,
              background: "rgba(6,18,36,0.5)", border: "1px solid rgba(56,189,248,0.07)",
              backdropFilter: "blur(16px)", position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: 54, height: 1, background: "rgba(56,189,248,0.35)" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 1, height: 54, background: "rgba(56,189,248,0.35)" }} />
            <p style={{ fontSize: "1.08rem", lineHeight: 1.85, color: "#64748b", fontWeight: 300, maxWidth: 660 }}>
              Team Raftaar designs and builds{" "}
              <span style={{ color: "#e2e8f0", fontWeight: 500 }}>high-performance recumbent bicycles</span>{" "}
              for the ASME e-HPVC competition. Every gram, every curve, every weld is deliberate — engineered for speed without compromise.
            </p>
            <p style={{ marginTop: 18, fontSize: "1.08rem", lineHeight: 1.85, color: "#64748b", fontWeight: 300, maxWidth: 660 }}>
              Currently in deep development for{" "}
              <span style={{ color: "#38bdf8" }}>ASME e-HPVC 2027</span>,
              our next-generation vehicle pushes aerodynamic and structural limits further than ever before.
            </p>
          </motion.div>
        </section>

        {/* 03 — Podium */}
        <section style={{ marginBottom: 100 }}>
          <SLabel n={3} title="Podium" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ACHIEVEMENTS.map((a, i) => <AchRow key={i} {...a} i={i} />)}
          </div>
        </section>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ height: 380, marginBottom: 100, position: "relative", borderRadius: 4, overflow: "hidden" }}
        >
          <DividerScene />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #020c1b 0%, transparent 10%, transparent 90%, #020c1b 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #020c1b 0%, transparent 18%, transparent 82%, #020c1b 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.5rem", letterSpacing: "0.35em", color: "#0f2744", textTransform: "uppercase" }}>
              DRAG TO ROTATE
            </span>
          </div>
        </motion.div>

        {/* 04 — Command */}
        <section style={{ marginBottom: 100 }}>
          <SLabel n={4} title="Command" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 }}>
            {LEADERSHIP.map((p, i) => <PersonCard key={i} {...p} i={i} />)}
          </div>
        </section>

        {/* 05 — Partners */}
        <section style={{ marginBottom: 72 }}>
          <SLabel n={5} title="Partners" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {SPONSORS.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ borderColor: "rgba(56,189,248,0.4)", color: "#7dd3fc" }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{
                  padding: "10px 20px", borderRadius: 3,
                  border: "1px solid rgba(56,189,248,0.1)",
                  background: "rgba(56,189,248,0.02)", color: "#334155",
                  fontSize: "0.65rem", letterSpacing: "0.18em",
                  fontFamily: "'Space Mono',monospace", textTransform: "uppercase",
                  backdropFilter: "blur(6px)", cursor: "default",
                  transition: "border-color 0.2s, color 0.2s",
                }}
              >
                {s}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(56,189,248,0.05)", paddingTop: 28, paddingBottom: 16, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.52rem", letterSpacing: "0.18em", color: "#0f2744" }}>© 2026 TEAM RAFTAAR</span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.52rem", letterSpacing: "0.18em", color: "#0f2744" }}>DTU · NEW DELHI</span>
        </div>

      </div>
    </div>
  )
}