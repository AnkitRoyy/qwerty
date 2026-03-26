import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import TeamMarker from './TeamMarker'

import { useLayoutEffect, useRef } from 'react'

useGLTF.preload('/map.glb')

function MapModel() {
  const { scene } = useGLTF('/map.glb')
  const groupRef = useRef()

  useLayoutEffect(() => {
    if (!scene || !groupRef.current) return

    // 🔥 force update before measuring
    scene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        child.geometry.computeBoundingBox()
        child.geometry.computeBoundingSphere()
      }
    })

    // ⚠️ CRITICAL: Reset the parent group scale and position so scene measures its true size!
    // Otherwise on React re-renders, it measures the already-scaled model and zooms back in.
    groupRef.current.scale.set(1, 1, 1)
    groupRef.current.position.set(0, 0, 0)
    
    // Update matrices BEFORE measuring bounding box
    groupRef.current.updateMatrixWorld(true)
    scene.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)

    // ⚠️ prevent divide-by-zero / tiny scale bug
    if (maxDim === 0) return

    const scale = 30 / maxDim

    groupRef.current.scale.setScalar(scale)

    // Shift map up slightly
    const yOffset = 5;
    
    groupRef.current.position.set(
      -center.x * scale,
      -center.y * scale + yOffset,
      -center.z * scale
    )

  }, [scene])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />

      <TeamMarker position={[14, 3.2, -40]} label="UGV" />
      <TeamMarker position={[-1, 0.2, 2]} label="Robotics" />
      <TeamMarker position={[3, 0.2, 3]} label="Solaris" />
      <TeamMarker position={[-3, 0.2, -2]} label="Altair" />
      <TeamMarker position={[1, 0.2, 4]} label="UAV" />
    </group>
  )
}

export default function MapScene() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 15, 30], fov: 60 }}
      >
        {/* 🌌 BACKGROUND */}
        <color attach="background" args={['#020617']} />

        {/* 🌫️ FOG */}
        {/* <fog attach="fog" args={['#020617', 30, 120]} /> */}

        {/* 💡 LIGHTING */}
        <ambientLight intensity={0.5} />

        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
        />

        {/* <axesHelper args={[5]} /> */}

        <pointLight
          position={[0, 5, 0]}
          intensity={0.8}
          color="#38bdf8"
        />

        <OrbitControls
          enableZoom={true}
          minDistance={3}
          maxDistance={120}
          maxPolarAngle={Math.PI / 2.1}
        />

        {/* 🗺️ MAP */}
        <MapModel />


      </Canvas>
    </div>
  )
}