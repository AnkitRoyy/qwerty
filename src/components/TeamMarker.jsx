import { Billboard, Text } from '@react-three/drei'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function TeamMarker({ position, label }) {
  const [hovered, setHovered] = useState(false)

  const ringRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // 🔥 pulse ring animation
    if (ringRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.2
      ringRef.current.scale.set(scale, scale, scale)
    }

    // 🔥 floating effect
    if (glowRef.current) {
      glowRef.current.position.y = Math.sin(t * 2) * 0.05
    }
  })

  return (
    <group position={position} scale={17}>

      {/* 🔥 GLOW BASE */}
      <mesh ref={glowRef} position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color="#546d77"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* 🔥 INNER CORE */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color="#e2e8f0"
          emissive="#38bdf8"
          emissiveIntensity={hovered ? 1 : 0.4}
        />
      </mesh>

      {/* 🔥 PULSE RING */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial
          color="#5a8ca1"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 🔥 LABEL */}
      {hovered && (
        <Billboard position={[0, 0.6, 0]}>
          <Text
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        </Billboard>
      )}

    </group>
  )
}