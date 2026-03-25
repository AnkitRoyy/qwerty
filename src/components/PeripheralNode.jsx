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

export default function PeripheralNode({ position, title }) {
  const ref = useRef()
  const worldPos = useRef(new THREE.Vector3())
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (!ref.current) return

    ref.current.getWorldPosition(worldPos.current)

    const z = worldPos.current.z

    let frontFactor = 1
    if (z > 0) {
      frontFactor = THREE.MathUtils.mapLinear(z, 0, 5, 1, 0.67)
    }

    const baseScale = 0.85 * frontFactor
    const target = hovered ? baseScale * 1.03 : baseScale

    ref.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      0.12
    )
  })

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Billboard>

        {/* 🌫️ BACK SOFT GLOW */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.5, 1.6]} />
          <meshBasicMaterial
            color="#1e293b"
            transparent
            opacity={hovered ? 0.08 : 0.03}
          />
        </mesh>

        {/* 🧊 MAIN PANEL (VISIBLE FIXED) */}
        <mesh>
          <planeGeometry args={[2.2, 1.3]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>

        {/* 🔥 TOP LIGHT GRADIENT */}
        <mesh position={[0, 0.35, 0.01]}>
          <planeGeometry args={[2.1, 0.35]} />
          <meshBasicMaterial
            color="#334155"
            transparent
            opacity={0.28}
          />
        </mesh>

        {/* 🌑 BOTTOM DEPTH */}
        <mesh position={[0, -0.35, 0.01]}>
          <planeGeometry args={[2.1, 0.45]} />
          <meshBasicMaterial
            color="#020617"
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* ✨ SOFT EDGE (NOT BORDER) */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[2.25, 1.35]} />
          <meshBasicMaterial
            color="#64748b"
            transparent
            opacity={hovered ? 0.25 : 0.12}
          />
        </mesh>

        {/* 🔥 STRONG SEPARATION HALO */}
<mesh position={[0, 0, -0.04]}>
  <planeGeometry args={[2.8, 1.8]} />
  <meshBasicMaterial
    color="#60a5fa"
    transparent
    opacity={hovered ? 0.22 : 0.12}
  />
</mesh>

{/* 🔥 INNER CONTRAST BOOST */}
<mesh position={[0, 0, 0.015]}>
  <planeGeometry args={[2.0, 1.1]} />
  <meshBasicMaterial
    color="#ffffff"
    transparent
    opacity={hovered ? 0.06 : 0.03}
  />
</mesh>

{/* 🔥 CRISP EDGE */}
<mesh position={[0, 0, 0.03]}>
  <planeGeometry args={[2.25, 1.35]} />
  <meshBasicMaterial
    color="#3d7ac0"
    transparent
    opacity={hovered ? 0.9 : 0.45}
  />
</mesh>

        {/* 💡 HOVER GLOW */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[2.3, 1.4]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={hovered ? 0.08 : 0}
          />
        </mesh>

        {/* 🔥 ICON (BOLD EFFECT SAFE) */}
        <group position={[0, 0.32, 0.05]}>
          <Text fontSize={0.34} color="#f1f5f9" anchorX="center" anchorY="middle">
            {getIcon(title)}
          </Text>
          <Text position={[0.002, 0, 0]} fontSize={0.34} color="#f1f5f9" anchorX="center" anchorY="middle">
            {getIcon(title)}
          </Text>
        </group>

        {/* 🔥 TITLE (BOLD EFFECT SAFE) */}
        <group position={[0, -0.25, 0.06]}>
          <Text fontSize={0.19} color="#e5e7eb" anchorX="center" anchorY="middle">
            {title}
          </Text>
          <Text position={[0.002, 0, 0]} fontSize={0.19} color="#e5e7eb" anchorX="center" anchorY="middle">
            {title}
          </Text>
        </group>

      </Billboard>
    </group>
  )
}