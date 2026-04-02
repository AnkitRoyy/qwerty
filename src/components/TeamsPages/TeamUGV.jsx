import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import * as THREE from "three"

import img1 from "../../assets/teams/UGV/1.jpeg"
import img2 from "../../assets/teams/UGV/2.jpg"
import img3 from "../../assets/teams/UGV/3.jpeg"
import img4 from "../../assets/teams/UGV/4.jpg"
import img5 from "../../assets/teams/UGV/5.jpeg"
import img6 from "../../assets/teams/UGV/6.jpg"




const GALLERY = [
  { url: img1,  },
  { url: img2, },
  { url: img3,  },
  { url: img4, },
  { url: img5,  },
  { url: img6,  },
]

const C = {
  bg: "#040d08",
  accent: "#00ff88",
  accent2: "#00cc66",
  accent3: "#00ffaa",
  warn: "#ffcc00",
  border: "rgba(0,255,136,0.25)",
  text: "#a0c4a8",
  bright: "#e8f5eb",
}

const STATS = [
  { value: "6", label: "Rovers Built", unit: "since 2019" },
  { value: "DTU", label: "Delhi Tech Univ", unit: "New Delhi" },
  { value: "ROS2", label: "Autonomy Stack", unit: "powered" },
  { value: "IGVC", label: "Global Rank 15", unit: "2025" },
]

const DEPARTMENTS = [
  {
    role: "Autonomy",
    name: "Perception, localization, planning & control",
    description: "Fuses LiDAR, stereo cameras and IMU on a ROS2 stack. Implements SLAM-based mapping and Nav2 local/global planners for untethered terrain navigation in unstructured outdoor environments.",
  },
  {
    role: "Robotics Systems",
    name: "Mechanical, electronics & embedded systems",
    description: "Designs robust all-terrain chassis, motor driver arrays, power management boards, and failsafe circuits. Integrates custom PCBs and embedded controllers validated through simulation and field testing.",
  },
  {
    role: "Research",
    name: "SLAM, AI perception & robust autonomy",
    description: "Focused on advancing SLAM algorithms, AI-based obstacle detection, and GPS-denied localization through experimentation. Trains YOLOv8 pipelines and develops visual odometry for real-world terrain operations.",
  },
]

const ACHIEVEMENTS = [
  { rank: "GLOBAL RANK 10", event: "ISDC · 2026", comp: "International Space Drone Challenge — aerial autonomy in GPS-denied environments", color: "#00ff88" },
  { rank: "GLOBAL RANK 15", event: "IGVC · 2025", comp: "Intelligent Ground Vehicle Competition — autonomous outdoor navigation", color: "#00ffaa" },
  { rank: "3RD PLACE", event: "IGVC Cyber Challenge & Design · 2023", comp: "Cybersecurity and design track at Intelligent Ground Vehicle Competition", color: "#ffcc00" },
  { rank: "2ND PLACE", event: "Techfest IIT Bombay · 2023", comp: "Mernifire and TIH-IoT challenge at India's largest technical festival", color: "#00cc66" },
  { rank: "1ST RUNNER UP", event: "Autodesk Sustainable Design · 2023", comp: "National sustainable engineering design competition", color: "#00ff88" },
  { rank: "2ND PLACE", event: "Techfest IIT Bombay · 2022", comp: "Line Following Robot challenge", color: "#00ffaa" },
  { rank: "3RD PLACE", event: "Techfest IIT Bombay · 2022", comp: "Micromouse autonomous maze-solving competition", color: "#ffcc00" },
  { rank: "3RD PLACE", event: "MATLAB Mini Drone Competition", comp: "Autonomous drone control using MATLAB and Simulink", color: "#00cc66" },
]

const TOOLCHAIN = [
  "ROS2", "Nav2", "SLAM", "YOLOv8", "LiDAR", "OpenCV",
  "STM32", "Altium", "SolidWorks", "MATLAB", "Simulink",
  "Python", "C++", "Gazebo", "ArUco", "PointCloud",
  "RTK-GPS", "Sensor Fusion", "EKF",
]



function terrainY(x, z) {
  const bowl  = Math.sin(z * 0.09) * 0.6
  const macro = Math.sin(x * 0.22 + 0.5) * 0.9 + Math.cos(z * 0.18 + 1.2) * 0.7
  const mid   = Math.sin(x * 0.7 + z * 0.5) * 0.38 + Math.cos(x * 0.55 - z * 0.8) * 0.3
  const fine  = Math.sin(x * 1.9 + z * 1.4) * 0.18 + Math.sin(x * 3.1 - z * 2.6) * 0.1
  const micro = Math.sin(x * 5.2 + z * 4.8) * 0.04 + Math.cos(x * 7.1 - z * 6.3) * 0.02
  return bowl + macro + mid + fine + micro
}

const WHEEL_LOCAL_XZ = [
  [-0.52,  0.48], [ 0.52,  0.48],
  [-0.58,  0.00], [ 0.58,  0.00],
  [-0.52, -0.48], [ 0.52, -0.48],
]
const WHEEL_RADIUS    = 0.18
const CHASSIS_TO_AXLE = 0.18

function computeBodyPose(wx, wz, yaw) {
  const cosY = Math.cos(yaw), sinY = Math.sin(yaw)
  const contacts = WHEEL_LOCAL_XZ.map(([lx, lz]) => {
    const cx = wx + lx * cosY - lz * sinY
    const cz = wz + lx * sinY + lz * cosY
    return new THREE.Vector3(cx, terrainY(cx, cz), cz)
  })
  const avgY  = contacts.reduce((s, c) => s + c.y, 0) / contacts.length
  const bodyY = avgY + CHASSIS_TO_AXLE + WHEEL_RADIUS

  const frontMid = new THREE.Vector3().addVectors(contacts[0], contacts[1]).multiplyScalar(0.5)
  const rearMid  = new THREE.Vector3().addVectors(contacts[4], contacts[5]).multiplyScalar(0.5)
  const leftMid  = new THREE.Vector3().add(contacts[0]).add(contacts[2]).add(contacts[4]).divideScalar(3)
  const rightMid = new THREE.Vector3().add(contacts[1]).add(contacts[3]).add(contacts[5]).divideScalar(3)

  const fwd   = new THREE.Vector3().subVectors(frontMid, rearMid).normalize()
  const right = new THREE.Vector3().subVectors(rightMid, leftMid).normalize()
  const up    = new THREE.Vector3().crossVectors(fwd, right).normalize()

  const pitch = Math.atan2(-up.z, up.y)
  const roll  = Math.atan2( up.x, up.y)
  return { y: bodyY, pitch, roll }
}

function buildGeo(W, D, segsX, segsZ) {
  const geo = new THREE.PlaneGeometry(W, D, segsX, segsZ)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const colors = []
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const y = terrainY(x, z)
    pos.setY(i, y)
    const h     = (y + 2) / 4
    const ridge = Math.max(0, Math.sin(x * 1.9 + z * 1.4) * 0.5 + 0.5)
    colors.push(0.03 + h*0.05 + ridge*0.03, 0.06 + h*0.09 + ridge*0.06, 0.03 + h*0.03)
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

function Boulders() {
  const list = useMemo(() => {
    const r = (a, b) => a + Math.random() * (b - a)
    return Array.from({ length: 38 }, (_, i) => {
      let x, z
      do { x = r(-18,18); z = r(-16,10) } while (Math.abs(x)<2.5 && Math.abs(z)<3)
      return { x, y: terrainY(x, z), z, sc: r(0.08,0.55), rot:[r(0,Math.PI),r(0,Math.PI),r(0,Math.PI)], t:i%3 }
    })
  }, [])
  return (
    <group>
      {list.map((b,i) => (
        <mesh key={i} position={[b.x, b.y+b.sc*0.4, b.z]} rotation={b.rot} scale={b.sc}>
          {b.t===0&&<sphereGeometry args={[0.8,5,4]} />}
          {b.t===1&&<dodecahedronGeometry args={[0.7,0]} />}
          {b.t===2&&<octahedronGeometry args={[0.75,0]} />}
          <meshStandardMaterial color={new THREE.Color(0.06+b.sc*0.05, 0.14+b.sc*0.08, 0.06)} roughness={0.96} metalness={0.08} emissive={new THREE.Color(0.01,0.03,0.01)} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function MarsGround({ onTerrainClick }) {
  const solidGeo = useMemo(() => buildGeo(48,52,130,130), [])
  const wireGeo  = useMemo(() => buildGeo(48,52,28,28),   [])
  return (
    <group>
            <mesh
        rotation={[-Math.PI/2, 0, 0]}
        position={[0, 0, 0]}
        onClick={onTerrainClick}
        visible={false}
      >
        <planeGeometry args={[48, 52]} />
        <meshBasicMaterial />
      </mesh>

      <mesh geometry={solidGeo} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.98} metalness={0} emissive={new THREE.Color(0.004,0.012,0.005)} emissiveIntensity={0.3} />
      </mesh>
      <mesh geometry={wireGeo}>
        <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.028} depthWrite={false} />
      </mesh>
      <mesh geometry={wireGeo} position={[0,0.012,0]}>
        <meshBasicMaterial color="#00cc55" wireframe transparent opacity={0.015} depthWrite={false} />
      </mesh>
      <Boulders />
    </group>
  )
}

const WAYPOINT_COORDS = [
  [-6.5,0,0.6],[-4.5,0,-0.5],[-2,0,0.9],[0.5,0,-0.2],[2.8,0,0.8],[5.5,0,0.3],[7,0,1.4]
]

function PathLine({ waypoints }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const pts = waypoints.map(w => new THREE.Vector3(w.x, w.y+0.1, w.z))
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [waypoints])
  useFrame(({ clock }) => { if (ref.current) ref.current.material.opacity = 0.22 + Math.sin(clock.getElapsedTime()*2.2)*0.08 })
  return <line ref={ref} geometry={geo}><lineBasicMaterial color="#00ff88" transparent opacity={0.22} depthWrite={false} /></line>
}

function WaypointMarker({ wp, active, idx }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = wp.y + 0.18 + Math.sin(t*2.2+idx)*0.05
    ref.current.material.opacity = active ? 0.95+Math.sin(t*4)*0.05 : 0.22
  })
  return (
    <group position={[wp.x, wp.y, wp.z]}>
      <mesh ref={ref}><octahedronGeometry args={[0.1,0]} /><meshBasicMaterial color={active?"#00ff88":"#003318"} transparent opacity={0.7} depthWrite={false} /></mesh>
      <mesh rotation={[Math.PI/2,0,0]}><ringGeometry args={[0.15,0.20,16]} /><meshBasicMaterial color="#00ff88" transparent opacity={active?0.5:0.1} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

function NavTargetMarker({ target }) {
  const ringRef  = useRef()
  const ring2Ref = useRef()
  const arrowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ringRef.current)  ringRef.current.material.opacity  = 0.8 + Math.sin(t * 3) * 0.15
    if (ring2Ref.current) {
      ring2Ref.current.material.opacity = 0.4 + Math.sin(t * 2 + 1) * 0.2
      const s = 1 + Math.sin(t * 2) * 0.12
      ring2Ref.current.scale.set(s, 1, s)
    }
    if (arrowRef.current) arrowRef.current.position.y = target.y + 0.5 + Math.sin(t * 2.5) * 0.08
  })

  if (!target) return null
  const y = terrainY(target.x, target.z)

  return (
    <group position={[target.x, y, target.z]}>
            <mesh ref={ringRef} rotation={[Math.PI/2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.85} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

            <mesh ref={ring2Ref} rotation={[Math.PI/2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.32, 0.42, 32]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

            <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.2, 6]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.35} depthWrite={false} />
      </mesh>

            <group ref={arrowRef} position={[0, 0.5, 0]}>
        <mesh rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.1, 0.22, 8]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      </group>

      {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0.45, 0.04, 0.45]} rotation={[Math.PI/2, 0, 0]}>
            <planeGeometry args={[0.18, 0.015]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.45, 0.04, 0.45]} rotation={[Math.PI/2, Math.PI/2, 0]}>
            <planeGeometry args={[0.18, 0.015]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

            <pointLight color="#00ff88" intensity={2.5} distance={4} decay={2} position={[0, 0.3, 0]} />
    </group>
  )
}

function ClickRipple({ pos, onDone }) {
  const ref = useRef()
  const startTime = useRef(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    if (!startTime.current) startTime.current = clock.getElapsedTime()
    const elapsed = clock.getElapsedTime() - startTime.current
    const progress = elapsed / 0.6
    if (progress >= 1) { onDone(); return }
    const s = 1 + progress * 3
    ref.current.scale.set(s, 1, s)
    ref.current.material.opacity = 0.8 * (1 - progress)
  })

  if (!pos) return null
  const y = terrainY(pos.x, pos.z)

  return (
    <mesh ref={ref} rotation={[Math.PI/2, 0, 0]} position={[pos.x, y + 0.06, pos.z]}>
      <ringGeometry args={[0.1, 0.18, 24]} />
      <meshBasicMaterial color="#00ff88" transparent opacity={0.8} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function UGVModel({ scanning }) {
  const wheels  = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()]
  const arm     = useRef(), lidar = useRef(), ring1 = useRef(), ring2 = useRef(), scanSph = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    wheels.forEach(r => { if (r.current) r.current.rotation.x = t*(scanning?0:2.8) })
    if (lidar.current)   lidar.current.rotation.y   = t*(scanning?5:2)
    if (arm.current)     arm.current.rotation.z     = scanning ? Math.sin(t*1.2)*0.3+0.45 : 0.1
    if (ring1.current)   { ring1.current.rotation.z  = t*2.5;  ring1.current.material.opacity  = scanning?0.88+Math.sin(t*5)*0.08:0 }
    if (ring2.current)   { ring2.current.rotation.x  = t*1.7;  ring2.current.material.opacity  = scanning?0.6+Math.sin(t*3.5)*0.1:0 }
    if (scanSph.current) scanSph.current.material.opacity = scanning?0.1+Math.sin(t*6)*0.04:0
  })

  const bodyM   = <meshStandardMaterial color="#0a1a0c" roughness={0.3} metalness={0.82} emissive="#002510" emissiveIntensity={0.55} />
  const accentM = <meshStandardMaterial color="#00ff88" roughness={0.05} metalness={0.1} emissive="#00ff88" emissiveIntensity={2.8} />
  const darkM   = <meshStandardMaterial color="#040e06" roughness={0.7} metalness={0.5} />
  const wheelM  = <meshStandardMaterial color="#060e06" roughness={0.85} metalness={0.35} emissive="#001a08" emissiveIntensity={0.35} />
  const AY = -CHASSIS_TO_AXLE
  const wPos = [
    [-0.52, AY,  0.48], [ 0.52, AY,  0.48],
    [-0.58, AY,  0.00], [ 0.58, AY,  0.00],
    [-0.52, AY, -0.48], [ 0.52, AY, -0.48],
  ]

  return (
    <group>
      <mesh position={[0,0.18,0]}>{bodyM}<boxGeometry args={[0.88,0.22,0.72]} /></mesh>
      <mesh position={[0,0.32,0]}>{bodyM}<boxGeometry args={[0.72,0.1,0.58]} /></mesh>
      <mesh position={[0.18,0.4,0.1]}><boxGeometry args={[0.28,0.04,0.28]} />{darkM}</mesh>
      <mesh position={[-0.18,0.4,-0.1]}><boxGeometry args={[0.28,0.04,0.28]} />{darkM}</mesh>
      <mesh position={[0.28,0.46,0]}>
        <sphereGeometry args={[0.1,12,8,0,Math.PI*2,0,Math.PI/2]} />
        <meshStandardMaterial color="#001a0e" roughness={0.1} metalness={0.9} transparent opacity={0.82} />
      </mesh>
      <group ref={lidar} position={[0.28,0.46,0]}>
        <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.065,0.01,4,40]} /><meshBasicMaterial color="#00ff88" transparent opacity={0.9} depthWrite={false} /></mesh>
      </group>
      <mesh position={[-0.12,0.56,0.12]}><cylinderGeometry args={[0.018,0.018,0.28,8]} />{accentM}</mesh>
      <mesh position={[-0.12,0.72,0.12]}><boxGeometry args={[0.09,0.07,0.1]} />{darkM}</mesh>
      <mesh position={[-0.12,0.72,0.19]}><sphereGeometry args={[0.02,8,8]} />{accentM}</mesh>
      <mesh position={[-0.12,0.72,0.23]}><sphereGeometry args={[0.02,8,8]} />{accentM}</mesh>
      <group ref={arm} position={[0.45,0.3,0.18]}>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.022,0.022,0.35,8]} />{accentM}</mesh>
        <mesh position={[0.18,0.1,0]} rotation={[0,0,Math.PI/3]}><cylinderGeometry args={[0.016,0.016,0.22,8]} />{accentM}</mesh>
        <mesh position={[0.28,0.19,0]}><sphereGeometry args={[0.035,10,10]} />{accentM}</mesh>
      </group>
      <mesh position={[-0.35,0.42,-0.25]} rotation={[0.2,0,0.1]}><cylinderGeometry args={[0.007,0.007,0.3,6]} />{accentM}</mesh>
      <mesh position={[-0.35,0.58,-0.24]}><sphereGeometry args={[0.018,8,8]} />{accentM}</mesh>
      <group position={[0,0.3,0]}>
        <mesh ref={ring1}><torusGeometry args={[0.75,0.012,3,120]} /><meshBasicMaterial color="#00ff88" transparent opacity={0} depthWrite={false} /></mesh>
        <mesh ref={ring2} rotation={[Math.PI/2.2,0,0]}><torusGeometry args={[1.1,0.008,3,120]} /><meshBasicMaterial color="#00ffaa" transparent opacity={0} depthWrite={false} /></mesh>
        <mesh ref={scanSph}><sphereGeometry args={[1.4,16,16]} /><meshBasicMaterial color="#00ff88" transparent opacity={0} depthWrite={false} side={THREE.BackSide} /></mesh>
      </group>
      {wPos.map(([x,y,z],i) => (
        <group key={i} position={[x,y,z]}>
          <mesh ref={wheels[i]} rotation={[0,0,Math.PI/2]}>
            {wheelM}<cylinderGeometry args={[WHEEL_RADIUS,WHEEL_RADIUS,0.09,16]} />
          </mesh>
          <mesh rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[0.06,0.06,0.092,10]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.5} depthWrite={false} />
          </mesh>
          {[0,1,2,3].map(j => (
            <mesh key={j} rotation={[j*Math.PI/4, Math.PI/2, 0]}>
              <boxGeometry args={[WHEEL_RADIUS*2, 0.008, 0.08]} />
              <meshBasicMaterial color="#00ff88" transparent opacity={0.25} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
      {[0.48,-0.48].map((z,i) => (
        <mesh key={i} position={[0, AY+0.02, z]}>
          <boxGeometry args={[1.16,0.015,0.015]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.32} depthWrite={false} />
        </mesh>
      ))}
      {[-0.25,0.25].map((x,i) => (
        <group key={i} position={[x,0.18,0.38]}>
          <mesh><sphereGeometry args={[0.025,8,8]} />{accentM}</mesh>
          <pointLight color="#00ff88" intensity={scanning?4:1.5} distance={3.5} decay={2} />
        </group>
      ))}
      <mesh position={[0,0.2,0]}>
        <boxGeometry args={[1.0,0.36,0.86]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={scanning?0.06:0.025} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function DustTrail({ roverPos, moving }) {
  const mesh  = useRef()
  const COUNT = 80
  const data  = useMemo(() => {
    const pos  = new Float32Array(COUNT*3).fill(999)
    const life = new Float32Array(COUNT)
    const vel  = Array.from({length:COUNT}, () => ({
      x:(Math.random()-0.5)*0.05, y:Math.random()*0.05+0.01, z:(Math.random()-0.5)*0.05
    }))
    return { pos, life, vel }
  }, [])
  const timer = useRef(0)
  useFrame((_, dt) => {
    if (!mesh.current || !moving) return
    timer.current += dt
    if (timer.current > 0.035) {
      timer.current = 0
      for (let i=0;i<COUNT;i++) {
        if (data.life[i]<=0) {
          data.pos[i*3]   = roverPos.current.x+(Math.random()-0.5)*0.35
          data.pos[i*3+1] = roverPos.current.y+0.04
          data.pos[i*3+2] = roverPos.current.z+(Math.random()-0.5)*0.35
          data.life[i]=1; break
        }
      }
    }
    for (let i=0;i<COUNT;i++) {
      if (data.life[i]>0) {
        data.life[i]-=dt*0.75
        data.pos[i*3]  +=data.vel[i].x
        data.pos[i*3+1]+=data.vel[i].y*0.4
        data.pos[i*3+2]+=data.vel[i].z
        if (data.life[i]<=0) { data.pos[i*3]=999; data.pos[i*3+1]=999; data.pos[i*3+2]=999 }
      }
    }
    mesh.current.geometry.attributes.position.array.set(data.pos)
    mesh.current.geometry.attributes.position.needsUpdate=true
  })
  return (
    <points ref={mesh}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.pos,3]} /></bufferGeometry>
      <pointsMaterial color="#336644" size={0.07} transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

function ScanBurst({ active, pos }) {
  const mesh  = useRef()
  const COUNT = 80
  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT*3)
    const phases    = Array.from({length:COUNT}, (_,i) => ({
      theta:(i/COUNT)*Math.PI*2, phi:Math.acos(2*Math.random()-1),
      r:0.5+Math.random()*1.2, speed:0.8+Math.random()*0.6,
    }))
    return { positions, phases }
  }, [])
  useFrame(({ clock }) => {
    if (!mesh.current||!pos) return
    const t    = clock.getElapsedTime()
    const attr = mesh.current.geometry.attributes.position
    phases.forEach((p,i) => {
      const e = active?Math.min((t%3.5)*p.speed,p.r):0
      attr.array[i*3]   = pos.x+Math.sin(p.phi)*Math.cos(p.theta+t*0.6)*e
      attr.array[i*3+1] = pos.y+0.3+Math.cos(p.phi)*e*0.55
      attr.array[i*3+2] = pos.z+Math.sin(p.phi)*Math.sin(p.theta+t*0.6)*e
    })
    attr.needsUpdate=true
    mesh.current.material.opacity=active?0.7:0
  })
  return (
    <points ref={mesh}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /></bufferGeometry>
      <pointsMaterial color="#00ff88" size={0.038} transparent opacity={0} depthWrite={false} />
    </points>
  )
}

function RoverScene({ onRoverClick, scanning, scanPos, navTarget, onNavArrived }) {
  const roverRef  = useRef()
  const roverXZ   = useRef({ x:-6.5, z:0.6 })
  const roverYaw  = useRef(0)
  const wpIdx     = useRef(0)
  const roverPos  = useRef(new THREE.Vector3(-6.5, 0, 0.6))
  const mode      = useRef("auto")
  const { camera } = useThree()
  const [ripple, setRipple] = useState(null)

  useEffect(() => {
    camera.position.set(-2, 5.5, 13)
    camera.lookAt(1, -0.5, -2)
  }, [camera])

  const waypoints = useMemo(() =>
    WAYPOINT_COORDS.map(([x,,z]) => ({ x, z, y:terrainY(x,z) })), [])
  useEffect(() => {
    if (navTarget) mode.current = "nav"
  }, [navTarget])

  useEffect(() => {
    if (!roverRef.current) return
    const pose = computeBodyPose(roverXZ.current.x, roverXZ.current.z, roverYaw.current)
    roverRef.current.position.set(roverXZ.current.x, pose.y, roverXZ.current.z)
    roverPos.current.set(roverXZ.current.x, pose.y, roverXZ.current.z)
  }, [])
  const handleTerrainClick = useCallback((e) => {
    e.stopPropagation()
    if (scanning) return
    const pt = e.point
    const ty = terrainY(pt.x, pt.z)
    const target = { x: pt.x, z: pt.z, y: ty }
    setRipple({ x: pt.x, z: pt.z })
    onNavArrived && onNavArrived(target)
  }, [scanning, onNavArrived])

  useFrame((_, delta) => {
    if (!roverRef.current || scanning) return

    let tx, tz

    if (mode.current === "nav" && navTarget) {
      tx = navTarget.x
      tz = navTarget.z
    } else {
      const wp = waypoints[wpIdx.current % waypoints.length]
      tx = wp.x; tz = wp.z
    }

    const dx   = tx - roverXZ.current.x
    const dz   = tz - roverXZ.current.z
    const dist = Math.sqrt(dx*dx + dz*dz)
    const arrivalThreshold = mode.current === "nav" ? 0.3 : 0.14

    if (dist < arrivalThreshold) {
      if (mode.current === "nav") {
        onNavArrived && onNavArrived(null)
        mode.current = "auto"
      } else {
        wpIdx.current++
        if (wpIdx.current >= waypoints.length) wpIdx.current = 0
      }
    } else {
      const spd = 1.2 * delta
      const nx  = dx / dist
      const nz  = dz / dist
      roverXZ.current.x += nx * spd
      roverXZ.current.z += nz * spd

      roverYaw.current = Math.atan2(nx, nz)

      const pose = computeBodyPose(roverXZ.current.x, roverXZ.current.z, roverYaw.current)
      roverRef.current.rotation.order = "YXZ"
      roverRef.current.position.set(roverXZ.current.x, pose.y, roverXZ.current.z)
      roverRef.current.rotation.y = roverYaw.current
      roverRef.current.rotation.x = pose.pitch
      roverRef.current.rotation.z = pose.roll
      roverPos.current.set(roverXZ.current.x, pose.y, roverXZ.current.z)
    }
  })

  return (
    <>
      <color attach="background" args={["#040d08"]} />
      <ambientLight intensity={0.08} color="#00ff88" />
      <directionalLight position={[12,14,-6]} intensity={2} color="#44aa77" castShadow />
      <directionalLight position={[-10,6,8]} intensity={0.9} color="#004422" />
      <pointLight position={[0,-2,0]} intensity={0.6} color="#002211" distance={40} decay={2} />
      <pointLight position={[0,8,-20]} intensity={1.4} color="#003322" distance={60} decay={2} />
      <pointLight position={[0,5,5]} intensity={1.0} color="#00cc55" distance={25} decay={2} />
      <Stars radius={100} depth={70} count={3000} factor={3} saturation={0} fade speed={0.25} />

      <MarsGround onTerrainClick={handleTerrainClick} />

      <mesh position={[0,-1.8,-22]} rotation={[Math.PI/2,0,0]}>
        <planeGeometry args={[80,10]} /><meshBasicMaterial color="#001a08" transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0,-0.5,-20]} rotation={[Math.PI/2,0,0]}>
        <planeGeometry args={[80,6]} /><meshBasicMaterial color="#000f06" transparent opacity={0.45} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

            {!navTarget && <PathLine waypoints={waypoints} />}
      {!navTarget && waypoints.map((wp,i) => (
        <WaypointMarker key={i} wp={wp} active={i===wpIdx.current%waypoints.length} idx={i} />
      ))}

            {navTarget && <NavTargetMarker target={navTarget} />}

            {ripple && <ClickRipple pos={ripple} onDone={() => setRipple(null)} />}

      <group ref={roverRef}
        onClick={e => { e.stopPropagation(); onRoverClick(roverPos.current.clone()) }}
        onPointerOver={() => { document.body.style.cursor="pointer" }}
        onPointerOut={()  => { document.body.style.cursor="crosshair" }}>
        <UGVModel scanning={scanning} />
      </group>

      <DustTrail roverPos={roverPos} moving={!scanning} />
      {scanning && scanPos && <ScanBurst active={scanning} pos={scanPos} />}
    </>
  )
}

function ScanHUD({ active, onDismiss }) {
  const [progress, setProgress] = useState(0)
  const [phase,    setPhase]    = useState("INIT")
  const phases = ["INIT","LIDAR SWEEP","SOIL ANALYSIS","BIOSIGN CHECK","UPLINK","COMPLETE"]
  useEffect(() => {
    if (!active) { setProgress(0); setPhase("INIT"); return }
    let p=0
    const iv=setInterval(() => {
      p=Math.min(p+1.4,100); setProgress(p)
      setPhase(phases[Math.min(Math.floor(p/20),phases.length-1)])
      if (p>=100) { clearInterval(iv); setTimeout(onDismiss,1200) }
    },60)
    return ()=>clearInterval(iv)
  },[active])
  if (!active) return null
  return (
    <motion.div initial={{opacity:0,x:24,y:8}} animate={{opacity:1,x:0,y:0}} exit={{opacity:0,x:24}}
      style={{position:"absolute",bottom:80,right:28,zIndex:50,pointerEvents:"none",width:290,fontFamily:"'Space Mono',monospace"}}>
      {[{top:-6,left:-6},{top:-6,right:-6},{bottom:-6,left:-6},{bottom:-6,right:-6}].map((pos,i)=>(
        <div key={i} style={{position:"absolute",width:18,height:18,...pos,
          borderTop:    pos.bottom!==undefined?"none":`1px solid ${C.accent}`,
          borderBottom: pos.top!==undefined?"none":`1px solid ${C.accent}`,
          borderLeft:   pos.right!==undefined?"none":`1px solid ${C.accent}`,
          borderRight:  pos.left!==undefined?"none":`1px solid ${C.accent}`,
        }}/>
      ))}
      <div style={{padding:"18px 22px",background:"rgba(4,13,8,0.95)",border:`1px solid ${C.border}`,backdropFilter:"blur(16px)"}}>
        <div style={{fontSize:"0.46rem",letterSpacing:"0.32em",color:C.accent,marginBottom:9}}>◉ MISSION SCAN ACTIVE</div>
        <div style={{fontSize:"0.68rem",color:C.bright,letterSpacing:"0.12em",marginBottom:12}}>{phase}</div>
        <div style={{height:2,background:"rgba(0,255,136,0.12)",marginBottom:12}}>
          <motion.div animate={{width:`${progress}%`}} style={{height:"100%",background:C.accent,boxShadow:`0 0 8px ${C.accent}`}} />
        </div>
        {[["LIDAR RANGE",`${(12.4+progress*0.08).toFixed(1)}m`],["SOIL DENSITY",`${(2.1+Math.sin(progress*0.1)*0.4).toFixed(2)} g/cm³`],["TEMP",`-${(62-progress*0.2).toFixed(0)}°C`],["SIGNAL",`${Math.min(100,progress+12).toFixed(0)}%`]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:"0.51rem",letterSpacing:"0.1em"}}>
            <span style={{color:"#3a7a4a"}}>{k}</span><span style={{color:C.accent,fontWeight:700}}>{v}</span>
          </div>
        ))}
        <div style={{marginTop:9,fontSize:"0.44rem",color:"#1a4a28",letterSpacing:"0.15em"}}>
          {"▮".repeat(Math.floor(progress/10))}{"▯".repeat(10-Math.floor(progress/10))}{progress>=100?" DONE":""}
        </div>
      </div>
    </motion.div>
  )
}

function SLabel({ n, title }) {
  return (
    <motion.div initial={{opacity:0,x:-12}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
      style={{display:"flex",alignItems:"center",gap:14,marginBottom:48}}>
      <div style={{width:36,height:36,border:"1px solid rgba(0,255,136,0.45)",background:"rgba(0,20,10,0.95)",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.56rem",color:C.accent,letterSpacing:"0.1em"}}>{String(n).padStart(2,"0")}</span>
      </div>
      <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.72rem",letterSpacing:"0.26em",color:"#8aaa90",textTransform:"uppercase",fontWeight:700}}>{title}</span>
      <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(0,255,136,0.28),transparent)"}} />
    </motion.div>
  )
}
function Card({ children, delay=0, style={} }) {
  return (
    <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay,duration:0.55,ease:[0.22,1,0.36,1]}}
      style={{padding:"36px 40px",borderRadius:4,background:"rgba(4,16,6,0.9)",border:`1px solid ${C.border}`,boxShadow:"0 4px 28px rgba(0,0,0,0.7)",backdropFilter:"blur(16px)",position:"relative",overflow:"hidden",...style}}>
      <div style={{position:"absolute",top:0,left:0,width:48,height:1,background:"rgba(0,255,136,0.55)"}}/>
      <div style={{position:"absolute",top:0,left:0,width:1,height:48,background:"rgba(0,255,136,0.55)"}}/>
      <div style={{position:"absolute",bottom:0,right:0,width:48,height:1,background:"rgba(0,255,136,0.2)"}}/>
      <div style={{position:"absolute",bottom:0,right:0,width:1,height:48,background:"rgba(0,255,136,0.2)"}}/>
      {children}
    </motion.div>
  )
}
function TelemetrySection({ hoveredStat, setHoveredStat }) {
  return (
    <section style={{marginBottom:110}}>
      <SLabel n={1} title="Telemetry" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {STATS.map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
            onHoverStart={()=>setHoveredStat(i)} onHoverEnd={()=>setHoveredStat(null)} whileHover={{scale:1.02}}
            style={{height:192,padding:"32px 22px 24px",borderRadius:4,background:hoveredStat===i?"rgba(0,28,10,0.98)":"rgba(4,14,6,0.92)",border:`1px solid ${hoveredStat===i?"rgba(0,255,136,0.6)":"rgba(0,255,136,0.26)"}`,textAlign:"center",transition:"all 0.28s",cursor:"default",position:"relative",overflow:"hidden",backdropFilter:"blur(10px)"}}>
            {hoveredStat===i&&<div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,136,0.014) 3px,rgba(0,255,136,0.014) 4px)",pointerEvents:"none"}}/>}
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"3.2rem",fontWeight:700,color:hoveredStat===i?C.accent:C.bright,letterSpacing:"-0.03em",lineHeight:1}}>{s.value}</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:C.accent,letterSpacing:"0.22em",marginTop:8,textTransform:"uppercase"}}>{s.unit}</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.18em",color:"#1a4a24",textTransform:"uppercase",marginTop:8}}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section style={{marginBottom:110}}>
      <SLabel n={2} title="About" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 310px",gap:14}}>
        <Card>
          <p style={{fontSize:"1.06rem",lineHeight:1.95,color:"#7a9a80",fontWeight:300}}>
            The <span style={{color:C.bright,fontWeight:600}}>UGV Tech Team at Delhi Technological University</span> is a student-driven robotics team focused on building autonomous ground vehicles for real-world research and competitions.
          </p>
          <p style={{marginTop:20,fontSize:"1.06rem",lineHeight:1.95,color:"#7a9a80",fontWeight:300}}>
            Our work spans <span style={{color:C.accent,fontWeight:500}}>perception, localization, planning, and control</span> — building systems that operate without human intervention across complex, unstructured terrain at the highest international level.
          </p>
        </Card>
        <Card delay={0.12} style={{padding:"28px 26px",display:"flex",flexDirection:"column",gap:22}}>
          {[
            {label:"University", value:"Delhi Tech University"},
            {label:"Active Rovers", value:"ASHWINI · Valkyrie"},
            {label:"Autonomy", value:"ROS2 / Nav2"},
            {label:"Perception", value:"LiDAR + Stereo + YOLO"},
          ].map((f,i)=>(
            <div key={i} style={{borderBottom:"1px solid rgba(0,255,136,0.1)",paddingBottom:16}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.48rem",letterSpacing:"0.24em",color:C.accent,textTransform:"uppercase",marginBottom:5}}>{f.label}</div>
              <div style={{color:C.bright,fontSize:"0.88rem",fontWeight:600}}>{f.value}</div>
            </div>
          ))}
        </Card>
      </div>
    </section>
  )
}
function DeptCard({ role, name, description, i }) {
  const [hov,setHov]=useState(false)
  return (
    <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)} animate={{y:hov?-4:0}}
      style={{padding:"26px 24px",borderRadius:4,background:hov?"rgba(0,26,10,0.98)":"rgba(4,14,6,0.9)",border:`1px solid ${hov?"rgba(0,255,136,0.42)":"rgba(0,255,136,0.17)"}`,backdropFilter:"blur(12px)",position:"relative",overflow:"hidden",transition:"all 0.22s"}}>
      {hov&&<div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,136,0.01) 3px,rgba(0,255,136,0.01) 4px)",pointerEvents:"none"}}/>}
      <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{width:4,height:4,borderRadius:"50%",background:C.accent,boxShadow:`0 0 6px ${C.accent}`}}/>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.56rem",letterSpacing:"0.2em",color:C.accent,fontWeight:700,textTransform:"uppercase"}}>{role}</span>
      </div>
      <div style={{color:C.bright,fontSize:"0.93rem",fontWeight:600,marginBottom:12,lineHeight:1.45}}>{name}</div>
      <p style={{color:"#7a9a80",fontSize:"0.84rem",lineHeight:1.82}}>{description}</p>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${hov?"rgba(0,255,136,0.38)":"rgba(0,255,136,0.1)"},transparent)`}}/>
    </motion.div>
  )
}
function DepartmentsSection() {
  return (
    <section style={{marginBottom:110}}>
      <SLabel n={3} title="Departments" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
        {DEPARTMENTS.slice(0,3).map((d,i)=><DeptCard key={d.role} {...d} i={i}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {DEPARTMENTS.slice(3).map((d,i)=><DeptCard key={d.role} {...d} i={i+3}/>)}
      </div>
    </section>
  )
}
function AchRow({ rank, event, comp, color, i }) {
  const [hov,setHov]=useState(false)
  return (
    <motion.div initial={{opacity:0,x:-18}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.1}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)} animate={{x:hov?6:0}}
      style={{display:"flex",alignItems:"center",gap:22,padding:"20px 26px",borderRadius:4,background:hov?"rgba(0,26,10,0.98)":"rgba(4,14,6,0.9)",border:`1px solid ${hov?color+"60":"rgba(0,255,136,0.17)"}`,borderLeft:`3px solid ${color}`,backdropFilter:"blur(12px)",transition:"all 0.22s",position:"relative",overflow:"hidden"}}>
      {hov&&<div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,136,0.01) 3px,rgba(0,255,136,0.01) 4px)",pointerEvents:"none"}}/>}
      <div style={{width:9,height:9,borderRadius:"50%",background:color,boxShadow:`0 0 12px ${color},0 0 26px ${color}55`,flexShrink:0}}/>
      <div style={{flex:1}}>
        <div style={{display:"inline-block",padding:"3px 10px",borderRadius:2,background:color+"14",border:`1px solid ${color}3a`,marginBottom:8}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.57rem",color,letterSpacing:"0.13em",fontWeight:700}}>{rank}</span>
        </div>
        <div style={{color:C.bright,fontSize:"1.04rem",fontWeight:600,marginBottom:5}}>{event}</div>
        <div style={{color:"#2a5a34",fontSize:"0.76rem",fontFamily:"'Space Mono',monospace",letterSpacing:"0.05em"}}>{comp}</div>
      </div>
    </motion.div>
  )
}
function PodiumSection() {
  return (
    <section style={{marginBottom:110}}>
      <SLabel n={4} title="Podium" />
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {ACHIEVEMENTS.map((a,i)=><AchRow key={a.event} {...a} i={i}/>)}
      </div>
    </section>
  )
}
function GallerySection() {
  const [lb,setLb]=useState(null)
  useEffect(()=>{
    if(lb===null)return
    const h=e=>{if(e.key==="Escape")setLb(null)}
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h)
  },[lb])
  return (
    <section style={{marginBottom:110}}>
      <SLabel n={5} title="Gallery" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {GALLERY.map((img,i)=>(
          <motion.div key={i} initial={{opacity:0,scale:0.96}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.07}}
            whileHover={{scale:1.02}} onClick={()=>setLb(i)}
            style={{position:"relative",borderRadius:4,overflow:"hidden",cursor:"zoom-in",aspectRatio:"4/3",border:`1px solid ${C.border}`}}>
            <img src={img.url} alt={img.caption} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",filter:"brightness(0.42) contrast(1.15) saturate(0.45) hue-rotate(90deg)",transition:"filter 0.3s"}}
              onMouseEnter={e=>{e.currentTarget.style.filter="brightness(0.68) contrast(1.1) saturate(0.65) hue-rotate(70deg)"}}
              onMouseLeave={e=>{e.currentTarget.style.filter="brightness(0.42) contrast(1.15) saturate(0.45) hue-rotate(90deg)"}}/>
            {[{top:7,left:7},{top:7,right:7},{bottom:7,left:7},{bottom:7,right:7}].map((pos,j)=>(
              <div key={j} style={{position:"absolute",...pos,width:11,height:11,
                borderTop:pos.bottom!==undefined?"none":`1px solid ${C.accent}55`,
                borderBottom:pos.top!==undefined?"none":`1px solid ${C.accent}55`,
                borderLeft:pos.right!==undefined?"none":`1px solid ${C.accent}55`,
                borderRight:pos.left!==undefined?"none":`1px solid ${C.accent}55`,
              }}/>
            ))}
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 13px 11px",background:"linear-gradient(transparent,rgba(4,13,8,0.95))"}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.56rem",color:C.accent2,letterSpacing:"0.1em"}}>{img.caption}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {lb!==null&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLb(null)}
            style={{position:"fixed",inset:0,zIndex:500,background:"rgba(4,13,8,0.96)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
            <motion.div initial={{scale:0.88}} animate={{scale:1}} onClick={e=>e.stopPropagation()}
              style={{position:"relative",maxWidth:"80vw",maxHeight:"80vh",border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
              <img src={GALLERY[lb].url} alt={GALLERY[lb].caption} style={{display:"block",width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 20px 14px",background:"linear-gradient(transparent,rgba(4,13,8,0.97))"}}>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.66rem",color:C.accent2,letterSpacing:"0.12em"}}>{GALLERY[lb].caption}</span>
              </div>
              <button onClick={()=>setLb(null)} style={{position:"absolute",top:12,right:12,background:"rgba(4,13,8,0.9)",border:`1px solid ${C.border}`,borderRadius:2,color:C.accent,fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",padding:"6px 12px",cursor:"pointer",letterSpacing:"0.1em"}}>ESC</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
function ToolchainSection() {
  return (
    <section style={{marginBottom:80}}>
      <SLabel n={6} title="Toolchain" />
      <div style={{display:"flex",flexWrap:"wrap",gap:9}}>
        {TOOLCHAIN.map((item,i)=>(
          <motion.div key={item} initial={{opacity:0,scale:0.88}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.035}}
            whileHover={{borderColor:"rgba(0,255,136,0.52)",color:C.accent2,background:"rgba(0,26,10,0.98)"}}
            style={{padding:"11px 20px",borderRadius:3,border:"1px solid rgba(0,255,136,0.2)",background:"rgba(4,14,6,0.85)",color:"#2a5a34",fontSize:"0.65rem",letterSpacing:"0.16em",fontFamily:"'Space Mono',monospace",textTransform:"uppercase",cursor:"default",transition:"all 0.2s"}}>
            {item}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
export default function TeamUGV() {
  const heroRef       = useRef()
  const [scanning, setScanning]     = useState(false)
  const [scanPos,  setScanPos]      = useState(null)
  const [showHint, setShowHint]     = useState(true)
  const [hoveredStat, setHoveredStat] = useState(null)
  const [navTarget, setNavTarget]   = useState(null)
  const autoTimer = useRef(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start","end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0,0.7], [1,0])
  const heroScale   = useTransform(scrollYProgress, [0,1],   [1,0.9])

  const handleRoverClick = useCallback((pos) => {
    if (scanning) return
    setScanning(true); setScanPos(pos); setShowHint(false)
  }, [scanning])

  const handleScanDone = useCallback(() => { setScanning(false); setScanPos(null) }, [])
  const handleNavUpdate = useCallback((target) => {
    if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = null }

    if (target) {
      setNavTarget(target)
    } else {
      autoTimer.current = setTimeout(() => {
        setNavTarget(null)
        autoTimer.current = null
      }, 2000)
    }
  }, [])
  useEffect(() => () => { if (autoTimer.current) clearTimeout(autoTimer.current) }, [])
  const statusText = scanning
    ? "MISSION SCAN IN PROGRESS"
    : navTarget
      ? "NAV2 · NAVIGATING TO TARGET"
      : "ROVER ACTIVE · AUTONOMOUS MODE"

  return (
    <div style={{background:C.bg,color:C.bright,minHeight:"100vh",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(0,255,136,0.18);border-radius:99px}
        body{cursor:crosshair}
      `}</style>

      <section ref={heroRef} style={{position:"relative",height:"100vh",overflow:"hidden"}}>
        <motion.div style={{position:"absolute",inset:0,scale:heroScale}}>
          <Canvas style={{width:"100%",height:"100%"}} gl={{antialias:true,alpha:false}}>
            <RoverScene
              onRoverClick={handleRoverClick}
              scanning={scanning}
              scanPos={scanPos}
              navTarget={navTarget}
              onNavArrived={handleNavUpdate}
            />
          </Canvas>
        </motion.div>

        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,136,0.009) 2px,rgba(0,255,136,0.009) 3px)",zIndex:5}}/>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 35%,rgba(4,13,8,0.45) 75%,rgba(4,13,8,0.82) 100%)",zIndex:6}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"20%",pointerEvents:"none",background:"linear-gradient(transparent,rgba(4,13,8,0.92))",zIndex:6}}/>

        <motion.div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",zIndex:15,pointerEvents:"none",padding:"0 6vw",opacity:heroOpacity}}>
          <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:0.3,duration:0.7}}
            style={{fontFamily:"'Space Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.38em",color:C.accent2,marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:28,height:1,background:"rgba(0,255,136,0.5)"}}/>
            UNMANNED GROUND VEHICLE · AUTONOMOUS NAVIGATION
          </motion.div>
          <motion.h1 initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} transition={{delay:0.45,duration:0.85,ease:[0.22,1,0.36,1]}}
            style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(2.8rem,7.5vw,7rem)",fontWeight:700,letterSpacing:"-0.04em",lineHeight:0.9,color:C.bright,textShadow:"0 4px 24px rgba(4,13,8,0.85)"}}>
            TEAM<br/><span style={{color:C.accent,textShadow:"0 0 30px rgba(0,255,136,0.4)"}}>UGV-DTU</span>
          </motion.h1>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.85}}
            style={{marginTop:22,fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.18em",color:"#7a9a80",textTransform:"uppercase",maxWidth:460,lineHeight:1.75}}>
            Autonomous terrain navigation<br/>— from sensor to decision to motion
          </motion.p>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.4}}
            style={{marginTop:30,display:"flex",alignItems:"center",gap:10,fontFamily:"'Space Mono',monospace",fontSize:"0.48rem",letterSpacing:"0.2em",color:navTarget?C.warn:scanning?C.accent:"#1e4a26"}}>
            <motion.div animate={{opacity:[1,0.2,1]}} transition={{duration:1.1,repeat:Infinity}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:navTarget?C.warn:scanning?C.accent:"#1e4a26",boxShadow:navTarget?`0 0 8px ${C.warn}`:scanning?`0 0 8px ${C.accent}`:"none"}}/>
            </motion.div>
            {statusText}
          </motion.div>
        </motion.div>

        <div style={{position:"absolute",inset:0,zIndex:20,pointerEvents:"none"}}>
          <AnimatePresence>{scanning&&<ScanHUD active={scanning} onDismiss={handleScanDone}/>}</AnimatePresence>
        </div>

                <AnimatePresence>
          {showHint&&!scanning&&(
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              style={{position:"absolute",bottom:46,left:"50%",transform:"translateX(-50%)",fontFamily:"'Space Mono',monospace",fontSize:"0.48rem",letterSpacing:"0.3em",color:C.accent,zIndex:20,display:"flex",alignItems:"center",gap:10,pointerEvents:"none"}}>
              <motion.div animate={{scale:[1,1.5,1]}} transition={{duration:1.6,repeat:Infinity}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:C.accent,boxShadow:`0 0 10px ${C.accent}`}}/>
              </motion.div>
              CLICK TERRAIN TO SET NAV TARGET · CLICK ROVER TO SCAN
              <motion.div animate={{scale:[1,1.5,1]}} transition={{duration:1.6,repeat:Infinity,delay:0.8}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:C.accent,boxShadow:`0 0 10px ${C.accent}`}}/>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2}}
          style={{position:"absolute",top:22,right:22,zIndex:18,fontFamily:"'Space Mono',monospace",fontSize:"0.44rem",letterSpacing:"0.2em",color:"#1a4a26",lineHeight:1.95,textTransform:"uppercase"}}>
          <div>LAT: 18.2243° N</div><div>LON: 77.1025° E</div>
          <div style={{color:C.accent2,marginTop:4}}>◉ GPS LOCK</div>
        </motion.div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}}
          style={{position:"absolute",bottom:26,right:34,zIndex:18}}>
          <motion.div animate={{y:[0,5,0]}} transition={{duration:2,repeat:Infinity}}
            style={{width:1,height:34,background:"linear-gradient(to bottom,rgba(0,255,136,0.4),transparent)"}}/>
        </motion.div>
      </section>

      <div style={{maxWidth:1260,margin:"0 auto",padding:"100px 44px 80px"}}>
        
        <TelemetrySection hoveredStat={hoveredStat} setHoveredStat={setHoveredStat}/>
        <AboutSection/>
        <DepartmentsSection/>
        <PodiumSection/>
        <GallerySection/>
        <ToolchainSection/>
       
      </div>
    </div>
  )
}
