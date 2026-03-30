import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useMemo } from 'react'

export default function Connections({ nodes }) {
  const start = new THREE.Vector3(0, -1.2, 0)

  return (
    <group>
      {nodes.map((node, i) => (
        <SingleConnection key={i} node={node} start={start} index={i} />
      ))}
    </group>
  )
}

function SingleConnection({ node, start, index }) {
  const blobRefs = useRef([])
  const speeds = useRef([])
  const offsets = useRef([])

  const baseDelay = useRef(Math.random() * 5)
  const flowSpeed = useRef(0.6 + Math.random() * 0.4)

  const end = new THREE.Vector3(...node.position)

  const mid = new THREE.Vector3(
    node.position[0] * 0.5,
    -3.5,
    node.position[2] * 0.5
  )

  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(start, mid, end),
    [start.x, start.y, start.z, mid.x, mid.y, mid.z, end.x, end.y, end.z]
  )

  // 🔥 just 2 thin tubes — no thick outer glow
  const lineTube  = useMemo(() => new THREE.TubeGeometry(curve, 60, 0.028, 8, false), [curve])
  const glowTube  = useMemo(() => new THREE.TubeGeometry(curve, 60, 0.07,  8, false), [curve])

  useMemo(() => {
    for (let i = 0; i < 3; i++) {
      speeds.current[i]  = 0.012 + Math.random() * 0.02
      offsets.current[i] = i * 0.33 + Math.random() * 0.1
    }
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const localTime = (t + baseDelay.current) * flowSpeed.current

    blobRefs.current.forEach((blob, j) => {
      if (!blob) return
      const progress = (localTime * speeds.current[j] + offsets.current[j]) % 1
      const pos = curve.getPoint(progress)
      blob.position.copy(pos)
      const scale = 0.055 + Math.sin(localTime * 1.8 + j * 2.1) * 0.008
      blob.scale.setScalar(scale)
    })
  })

const glowColor = "#7dd3fc"
const lineColor = "#bae6fd"

  return (
    <group>

      {/* ── subtle outer glow — very faint ── */}
      <mesh geometry={glowTube}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* ── main thin line ── */}
      <mesh geometry={lineTube}>
        <meshBasicMaterial
          color={lineColor}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>

      {/* ── 3 small blobs traveling along ── */}
      {[...Array(3)].map((_, j) => (
        <group key={j} ref={(el) => (blobRefs.current[j] = el)}>

          {/* soft outer glow */}
          <mesh scale={2.2}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={0.12}
              depthWrite={false}
            />
          </mesh>

          {/* bright white dot */}
          <mesh>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.85}
            />
          </mesh>

        </group>
      ))}

    </group>
  )
}