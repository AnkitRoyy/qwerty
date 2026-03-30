import { useLayoutEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import TeamMarker from './TeamMarker'

useGLTF.preload('/map.glb')
function GridFloor() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity =
        0.15 + Math.sin(state.clock.getElapsedTime() * 0.8) * 0.05
    }
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[80, 80, 40, 40]} />
      <meshBasicMaterial
        color="#38bdf8"
        wireframe
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </mesh>
  )
}
function Particles({ count = 60 }) {
  const mesh = useRef()

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = []
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = Math.random() * 12 - 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
      spd.push(0.005 + Math.random() * 0.01)
    }
    return [pos, spd]
  }, [])

  useFrame(() => {
    if (!mesh.current) return
    const pos = mesh.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += speeds[i]
      if (pos.array[i * 3 + 1] > 12) pos.array[i * 3 + 1] = -2
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#7dd3fc" size={0.08} transparent opacity={0.6} depthWrite={false} />
    </points>
  )
}
function RingPulse() {
  const ref  = useRef()
  const ref2 = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current)  ref.current.rotation.z  = t * 0.15
    if (ref2.current) ref2.current.rotation.z = -t * 0.1
    if (ref.current)  ref.current.material.opacity  = 0.2  + Math.sin(t * 1.2) * 0.1
    if (ref2.current) ref2.current.material.opacity = 0.15 + Math.sin(t * 0.9 + 1) * 0.08
  })

  return (
    <group position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={ref}>
        <ringGeometry args={[18, 18.3, 128]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ref2}>
        <ringGeometry args={[21, 21.2, 128]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.12} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
function RadarSweep() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.5
  })

  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.absarc(0, 0, 22, 0, Math.PI / 6, false)
    s.lineTo(0, 0)
    return s
  }, [])

  const geometry = useMemo(() => new THREE.ShapeGeometry(shape, 32), [shape])

  return (
    <group position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ref} geometry={geometry}>
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
function CornerBrackets() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((c, i) => {
        c.material.opacity = 0.4 + Math.sin(state.clock.getElapsedTime() * 1.5 + i) * 0.2
      })
    }
  })

  const corners = [[-16, 0, -16], [16, 0, -16], [-16, 0, 16], [16, 0, 16]]

  return (
    <group ref={ref} position={[0, 0.2, 0]}>
      {corners.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[1.5, 0.08, 0.08]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
      {corners.map(([x, y, z], i) => (
        <mesh key={`v${i}`} position={[x, y, z]}>
          <boxGeometry args={[0.08, 0.08, 1.5]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
function createHeightMaterial(minY, maxY) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMinY:      { value: minY },
      uMaxY:      { value: maxY },
      uLandColor: { value: new THREE.Color('#0a1828') },
      uBldColor:  { value: new THREE.Color('#7dd3fc') },
      uLightDir:  { value: new THREE.Vector3(0.4, 1.0, 0.6).normalize() },
    },
    vertexShader: `
      uniform float uMinY;
      uniform float uMaxY;

      varying float vHeight;
      varying vec3  vNormal;
      varying vec3  vWorldPos;

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vHeight   = clamp((worldPos.y - uMinY) / max(uMaxY - uMinY, 0.001), 0.0, 1.0);
        vNormal   = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3  uLandColor;
      uniform vec3  uBldColor;
      uniform vec3  uLightDir;

      varying float vHeight;
      varying vec3  vNormal;
      varying vec3  vWorldPos;

      void main() {
        float t = smoothstep(0.05, 0.20, vHeight);
        vec3 baseColor = mix(uLandColor, uBldColor, t);
        float diff = max(dot(vNormal, uLightDir), 0.0);
        float ambient = 0.35;
        float light = ambient + (1.0 - ambient) * diff;
        float emissive = t * 0.25;

        vec3 finalColor = baseColor * light + uBldColor * emissive * t;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  })
}

function MapModel() {
  const { scene } = useGLTF('/map.glb')
  const groupRef  = useRef()

  useLayoutEffect(() => {
    if (!scene || !groupRef.current) return
    scene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        child.geometry.computeBoundingBox()
        child.geometry.computeBoundingSphere()
      }
    })

    groupRef.current.scale.set(1, 1, 1)
    groupRef.current.position.set(0, 0, 0)
    groupRef.current.updateMatrixWorld(true)
    scene.updateMatrixWorld(true)

    const box    = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const size   = box.getSize(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim === 0) return

    const scale   = 30 / maxDim
    const yOffset = 5

    groupRef.current.scale.setScalar(scale)
    groupRef.current.position.set(
      -center.x * scale,
      -center.y * scale + yOffset,
      -center.z * scale
    )
    groupRef.current.updateMatrixWorld(true)
    const worldBox = new THREE.Box3().setFromObject(groupRef.current)
    const minY = worldBox.min.y
    const maxY = worldBox.max.y
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = createHeightMaterial(minY, maxY)
      }
    })
  }, [scene])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      <TeamMarker position={[14, 3.2, -40]} label="UGV"     />
      <TeamMarker position={[-1, 0.2,   2]} label="Robotics" />
      <TeamMarker position={[ 3, 0.2,   3]} label="Solaris"  />
      <TeamMarker position={[-3, 0.2,  -2]} label="Altair"   />
      <TeamMarker position={[ 1, 0.2,   4]} label="UAV"      />
    </group>
  )
}

export default function MapScene() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div style={{
      width:          '100%',
      height:         '100%',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
    }}>
      <div
        style={{ width: '90%', height: '100%' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Canvas
          style={{ width: '100%', height: '100%' }}
          camera={{ position: [0, 15, 30], fov: 60 }}
        >
          <color attach="background" args={['#020c1b']} />

                    <ambientLight intensity={0.3} color="#ffffff" />
          <directionalLight position={[5, 12, 15]}  intensity={0.8} color="#c8e6f5" />
          <pointLight position={[0, 20, 0]} intensity={0.6} color="#38bdf8" distance={60} decay={2} />

                    <GridFloor />
          <Particles count={60} />
          <RingPulse />
          <RadarSweep />
          <CornerBrackets />

          <OrbitControls
            enableZoom={isHovered}
            enablePan={isHovered}
            minDistance={3}
            maxDistance={120}
            maxPolarAngle={Math.PI / 2.1}
          />

          <MapModel />
        </Canvas>
      </div>
    </div>
  )
}