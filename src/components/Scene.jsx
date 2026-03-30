import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

import CentralNode from './CentralNode'
import PeripheralNode from './PeripheralNode'
import Connections from './Connections'

const TEAMS = [
  "UAS DTU", "RAFTAAR", "UGV", "ALTAIR",
  "ROBOTICS", "SOLARIS", "AUV", "Team 1", "Team 2", "team 3",
]

function RotatingGroup({ nodes, isHovering, onNodeClick }) {
  const ref = useRef()

  const state = useRef({
    isDragging: false,
    lastX: 0,
    velocity: 0,
    targetRotation: 0
  })

  const onPointerDown = (e) => {
    e.stopPropagation()
    state.current.isDragging = true
    state.current.lastX = e.clientX
    document.body.style.cursor = "grabbing"
  }

  const onPointerUp = () => {
    state.current.isDragging = false
    document.body.style.cursor = "grab"
  }

  const onPointerMove = (e) => {
    if (!state.current.isDragging) return

    const dx = e.clientX - state.current.lastX
    state.current.lastX = e.clientX

    const delta = dx * 0.005
    state.current.targetRotation += delta
    state.current.velocity = delta
  }

  useEffect(() => {
    const onWheel = (e) => {
      if (!isHovering) return

      e.preventDefault()
      state.current.targetRotation += e.deltaY * 0.001
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel)
  }, [isHovering])

  useFrame(() => {
    if (!state.current.isDragging) {
      state.current.targetRotation += state.current.velocity
      state.current.velocity *= 0.92
    }

    if (ref.current) {
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        state.current.targetRotation,
        0.08
      )
    }
  })

  return (
    <group
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerOver={() => (document.body.style.cursor = "grab")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {nodes.map((node, i) => (
        <PeripheralNode key={i} {...node} onClick={onNodeClick} />
      ))}

      <Connections nodes={nodes} />
      <mesh visible={false}>
        <cylinderGeometry args={[6.5, 6.5, 10, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

export default function Scene() {
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)
  const nodes = TEAMS.map((title, i) => {
    const radius = 5
    const angle = (i / TEAMS.length) * Math.PI * 2

    return {
      title,
      position: [
        Math.cos(angle) * radius,
        0.28,
        Math.sin(angle) * radius
      ]
    }
  })

  return (
    <div
      className="canvas-container"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Canvas camera={{ position: [0, 3, 11], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} />

        <Suspense fallback={null}>
          <group position={[0, 1.05, 0]} scale={1.68}>
            <CentralNode />
            <RotatingGroup
              nodes={nodes}
              isHovering={hover}
              onNodeClick={(title) => navigate(`/team/${encodeURIComponent(title)}`)}
            />
          </group>
        </Suspense>
      </Canvas>
    </div>
  )
}
