import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'

const getIcon = (title) => {
  if (title.includes("UAV") || title.includes("UAS")) return "🚁"
  if (title.includes("AUV")) return "🚤"
  if (title.includes("UGV")) return "🚗"
  if (title.includes("ROBOT")) return "🤖"
  if (title.includes("SOLAR")) return "☀️"
  if (title.includes("RAFTAAR")) return "🏎️"
  if (title.includes("ALTAIR")) return "🛰️"
  return "⚙️"
}

export default function PeripheralNode({ position, title, onClick }) {
  const ref = useRef()
  const glowRef = useRef()
  const worldPos = useRef(new THREE.Vector3())
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.getWorldPosition(worldPos.current)
    const z = worldPos.current.z
    let frontFactor = 1
    if (z > 0) {
      frontFactor = THREE.MathUtils.mapLinear(z, 0, 5, 1, 0.67)
    }
    const baseScale = 0.85 * frontFactor
    const target = hovered ? baseScale * 1.06 : baseScale
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12)

    if (glowRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 1.4) * 0.5 + 0.5
      glowRef.current.material.opacity = hovered
        ? 0.18 + pulse * 0.1
        : 0.05 + pulse * 0.04
    }
  })

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick(title)
      }}
    >
      <Billboard>
        <mesh ref={glowRef} position={[0, 0, -0.1]}>
          <planeGeometry args={[1.97, 1.97]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0, -0.06]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={hovered ? 0.07 : 0}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshBasicMaterial
            color="#1a3a5c"
            transparent
            opacity={hovered ? 0.62 : 0.48}
          />
        </mesh>
        <mesh position={[0, 0.72, 0.01]}>
          <planeGeometry args={[1.9, 0.46]} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.06}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.95, 1.95]} />
          <meshBasicMaterial
            color={hovered ? "#7dd3fc" : "#38bdf8"}
            transparent
            opacity={hovered ? 0.7 : 0.35}
          />
        </mesh>
        <Text
          position={[0, 0.28, 0.05]}
          fontSize={0.52}
          color="#e0f2fe"
          anchorX="center"
          anchorY="middle"
        >
          {getIcon(title)}
        </Text>
        <mesh position={[0, -0.08, 0.04]}>
          <planeGeometry args={[1.5, 0.007]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={hovered ? 0.45 : 0.15}
          />
        </mesh>
        <Text
          position={[0, -0.42, 0.05]}
          fontSize={0.2}
          color={hovered ? "#7dd3fc" : "#cbd5e1"}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          maxWidth={1.6}
        >
          {title}
        </Text>

      </Billboard>
    </group>
  )
} 
