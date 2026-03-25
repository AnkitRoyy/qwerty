import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useMemo } from 'react'

export default function Connections({ nodes }) {
  const start = new THREE.Vector3(0, -1.2, 0)

  return (
    <group>
      {nodes.map((node, i) => (
        <SingleConnection key={i} node={node} start={start} />
      ))}
    </group>
  )
}

/* 🔥 SINGLE CONNECTION */
function SingleConnection({ node, start }) {

  const blobRefs = useRef([])
  const speeds = useRef([])
  const offsets = useRef([])

  // 🔥 per-connection randomness
  const baseDelay = useRef(Math.random() * 5)
  const flowSpeed = useRef(0.8 + Math.random() * 0.6)

  const end = new THREE.Vector3(...node.position)

  const mid = new THREE.Vector3(
    node.position[0] * 0.6,
    -3.5,
    node.position[2] * 0.6
  )

  /* 🔥 CURVE */
  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(start, mid, end),
    [start, mid, end]
  )

  /* 🔥 OPTIMIZED PIPE */
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(
      curve,
      40,     // smoothness (optimized)
      0.075,  // thickness
      12,     // radial segments (optimized)
      false
    )
  }, [curve])

  /* 🔥 INIT RANDOM VALUES */
  useMemo(() => {
    for (let i = 0; i < 3; i++) {
      speeds.current[i] = 0.02 + Math.random() * 0.03
      offsets.current[i] = i*0.5+Math.random()*0.2
    }
  }, [])

  /* 🔥 ANIMATION LOOP */
  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // 🔥 unique time per pipe
    const localTime = (t + baseDelay.current) * flowSpeed.current

    blobRefs.current.forEach((blob, j) => {
      if (!blob) return

      const progress =
        (localTime * speeds.current[j] + offsets.current[j]) % 1

      const pos = curve.getPoint(progress)
      blob.position.copy(pos)

      // subtle breathing (unsynced)
      const scale =
        0.065 + Math.sin(localTime * 2 + j * 1.7) * 0.008

      blob.scale.setScalar(scale)
    })
  })

  return (
    <group>

      {/* 🌫️ OUTER GLOW */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* 🧊 GLASS PIPE */}
      <mesh geometry={tubeGeometry}>
        <meshPhysicalMaterial
          color="#cfe9ff"
          transparent
          opacity={0.28}

          roughness={0.1}
          metalness={0}

          transmission={1}
          thickness={1.8}
          ior={1.3}

          clearcoat={1}
          clearcoatRoughness={0.06}

          depthWrite={false}
        />
      </mesh>

      {/* 🔵 BLOBS */}
      {[...Array(3)].map((_, j) => (
        <group
          key={j}
          ref={(el) => (blobRefs.current[j] = el)}
        >

          {/* CORE */}
          <mesh>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial
              color="#e6faff"
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* GLOW */}
          <mesh scale={1.6}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </mesh>

        </group>
      ))}

    </group>
  )
}