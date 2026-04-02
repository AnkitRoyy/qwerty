import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"

import img1 from "../../assets/teams/INFERNO/1.png"
import img2 from "../../assets/teams/INFERNO/2.jpg"
import img3 from "../../assets/teams/INFERNO/3.jpg"
import img4 from "../../assets/teams/INFERNO/4.png"
import img5 from "../../assets/teams/INFERNO/5.png"
import img6 from "../../assets/teams/INFERNO/6.png"
import img7 from "../../assets/teams/INFERNO/7.png"

const GALLERY_IMAGES = [
  { url: img1,  },
  { url: img2, },
  { url: img3,  },
  { url: img4, },
  { url: img5,  },
  { url: img6,  },
  { url: img7,  },
]

const STATS = [
  { value: "05", label: "Departments",   unit: "core"      },
  { value: "10+",label: "Major Awards",  unit: "honours"   },
  { value: "3",  label: "Competitions",  unit: "active"    },
  { value: "6",  label: "DOF Arm",       unit: "precision" },
]

const DEPARTMENTS = [
  { role: "Mechanical",             name: "Structure, suspension & fabrication",       description: "Designs the rocker-bogie chassis in SolidWorks, validates through ANSYS simulation, and drives fabrication of lightweight aluminium structures for rugged terrain." },
  { role: "Electrical & Embedded",  name: "Electronics, power & real-time control",    description: "Engineers sensing and motor control on STM32 microcontrollers, designs custom PCBs in Altium, and manages power distribution across all rover subsystems." },
  { role: "Software & Autonomy",    name: "Perception, mapping & mission planning",    description: "Builds on a ROS2 stack for SLAM, sensor fusion and path planning, powered by NVIDIA Jetson Orin Nano for real-time autonomous operation." },
  { role: "Science & Research",     name: "Payloads, instruments & biosignature work", description: "Develops the in-house Raman spectrometer, designs soil sampling systems, and conducts geological and environmental analysis protocols for competition science tasks." },
  { role: "Operations & Management",name: "Scheduling, logistics & corporate relations",description: "Coordinates competition campaigns, manages sponsorship relations, and ensures the team operates with clear milestones and project accountability." },
]

const ACHIEVEMENTS = [
  { rank: "7TH GLOBALLY",            event: "Int. Space Drone Challenge · 2025", comp: "Recognised in the international space drone competition circuit",   color: "#f97316" },
  { rank: "BEST BUSINESS PLAN",      event: "Int. Rover Challenge · 2025",       comp: "Top honours in strategy and commercial viability presentation",     color: "#fb923c" },
  { rank: "BEST PROJECT MANAGEMENT", event: "IRC · 2025 & 2024 & 2023",          comp: "Three consecutive years of project management excellence",          color: "#fbbf24" },
  { rank: "1ST PLACE",               event: "Project Implementation · 2025",     comp: "First position in Project Implementation & Management Assessment",  color: "#f97316" },
  { rank: "4TH OVERALL",             event: "Int. Rover Challenge · 2024",        comp: "Strong overall finish against international competition",           color: "#fb923c" },
  { rank: "3RD PLACE",               event: "IRDC · 2020",                        comp: "Podium finish at the India Rover Design Challenge",                 color: "#fbbf24" },
]

const COMPETITIONS = [
  { role: "ERC", name: "European Rover Challenge",      description: "One of the world's most prestigious planetary robotics competitions, testing full Mars mission simulation across mobility, autonomy and science tasks." },
  { role: "URC", name: "University Rover Challenge",    description: "Held at the Mars Desert Research Station — an international benchmark for real-world mission execution in Mars-analog terrain." },
  { role: "IRC", name: "International Rover Challenge", description: "Asia's leading space robotics competition, fostering innovation in planetary exploration technologies. Team Inferno's most decorated stage." },
]

const SPONSORS = {
  gold:   ["SolidWorks","SGR Engineering Works","Onshape","MATLAB","India Circuits Pvt. Ltd.","Ansys","YRobots","Altium","Neutronium 3D"],
  silver: ["Polymaker","Gobilda","AIS (Advanced Integrated Solutions)"],
}

const TOOLCHAIN = [
  "SolidWorks","Onshape","ANSYS","MATLAB","Altium Designer",
  "ROS2","SLAM","Sensor Fusion","NVIDIA Jetson","STM32",
  "Python","C++","Cycloidal Drives","Raman Spectroscopy","Path Planning",
]
const A  = "#f97316"
const A2 = "#fb923c"
const A3 = "#fbbf24"
const BG = "#0a0200"
function useMouse() {
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const h = e => { mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2 }
    window.addEventListener("mousemove", h); return () => window.removeEventListener("mousemove", h)
  }, [])
  return mouse
}
function MarsPlanet() {
  const meshRef = useRef(), wireRef = useRef(), glowRef = useRef(), atmRef = useRef()
  const wireGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry(), pts = [], R = 2.02
    for (let lat = -80; lat <= 80; lat += 180/16) {
      const rad=(lat*Math.PI)/180, y=R*Math.sin(rad), r=R*Math.cos(rad)
      for (let i=0;i<=64;i++){const a=(i/64)*Math.PI*2; pts.push(r*Math.cos(a),y,r*Math.sin(a))}
    }
    for (let lon=0;lon<360;lon+=360/32) {
      const a=(lon*Math.PI)/180
      for (let i=0;i<=64;i++){const lat=(i/64)*Math.PI-Math.PI/2; pts.push(R*Math.cos(lat)*Math.cos(a),R*Math.sin(lat),R*Math.cos(lat)*Math.sin(a))}
    }
    geo.setAttribute("position",new THREE.Float32BufferAttribute(pts,3)); return geo
  }, [])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) meshRef.current.rotation.y = t * 0.06
    if (wireRef.current) { wireRef.current.rotation.y = t * 0.06; wireRef.current.material.opacity = 0.22 + Math.sin(t*0.5)*0.06 }
    if (glowRef.current) { const s=1+Math.sin(t*0.4)*0.018; glowRef.current.scale.set(s,s,s); glowRef.current.material.opacity=0.1+Math.sin(t*0.35)*0.03 }
    if (atmRef.current) atmRef.current.material.opacity = 0.14 + Math.sin(t*0.28)*0.04
  })
  return (
    <group>
      <mesh ref={meshRef}><sphereGeometry args={[2,64,64]} /><meshStandardMaterial color="#2a0c00" roughness={0.9} metalness={0.05} emissive="#1a0500" emissiveIntensity={0.3} /></mesh>
      <lineSegments ref={wireRef} geometry={wireGeo}><lineBasicMaterial color="#f97316" transparent opacity={0.22} depthWrite={false} /></lineSegments>
      <mesh ref={glowRef}><sphereGeometry args={[2.18,32,32]} /><meshBasicMaterial color="#c2410c" transparent opacity={0.1} depthWrite={false} side={THREE.BackSide} /></mesh>
      <mesh ref={atmRef}><sphereGeometry args={[2.36,32,32]} /><meshBasicMaterial color="#f97316" transparent opacity={0.14} depthWrite={false} side={THREE.BackSide} /></mesh>
      <MarsSurface />
    </group>
  )
}
function MarsSurface() {
  const mesh = useRef()
  const positions = useMemo(() => {
    const clusters = [
      ...Array.from({length:55},()=>({lat:15+Math.random()*35,lon:60+Math.random()*90})),
      ...Array.from({length:40},()=>({lat:-20+Math.random()*40,lon:-30+Math.random()*60})),
      ...Array.from({length:30},()=>({lat:40+Math.random()*20,lon:150+Math.random()*70})),
      ...Array.from({length:20},()=>({lat:-40+Math.random()*15,lon:100+Math.random()*50})),
    ]
    const R=2.03, arr=new Float32Array(clusters.length*3)
    clusters.forEach(({lat,lon},i)=>{
      const phi=(90-lat)*(Math.PI/180),theta=(lon+180)*(Math.PI/180)
      arr[i*3]=-R*Math.sin(phi)*Math.cos(theta); arr[i*3+1]=R*Math.cos(phi); arr[i*3+2]=R*Math.sin(phi)*Math.sin(theta)
    })
    return arr
  }, [])
  useFrame(({clock})=>{if(mesh.current){mesh.current.rotation.y=clock.getElapsedTime()*0.06; mesh.current.material.opacity=0.6+Math.sin(clock.getElapsedTime()*0.6)*0.12}})
  return (<points ref={mesh}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /></bufferGeometry><pointsMaterial color="#fb923c" size={0.07} transparent opacity={0.65} depthWrite={false} /></points>)
}
function PlanetaryRings() {
  const refs = [useRef(),useRef(),useRef(),useRef()]
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(refs[0].current){refs[0].current.rotation.z=t*0.18; refs[0].current.material.opacity=0.7+Math.sin(t*1.0)*0.12}
    if(refs[1].current){refs[1].current.rotation.x=t*0.13; refs[1].current.material.opacity=0.5+Math.sin(t*0.8)*0.1}
    if(refs[2].current){refs[2].current.rotation.y=t*0.15; refs[2].current.rotation.z=t*0.06; refs[2].current.material.opacity=0.35+Math.sin(t*0.6)*0.08}
    if(refs[3].current){refs[3].current.rotation.x=-t*0.09; refs[3].current.rotation.z=t*0.11; refs[3].current.material.opacity=0.22+Math.sin(t*1.1)*0.06}
  })
  return (<group>
    <mesh ref={refs[0]}><torusGeometry args={[2.9,0.018,3,200]} /><meshBasicMaterial color="#f97316" transparent opacity={0.7} depthWrite={false} /></mesh>
    <mesh ref={refs[1]} rotation={[Math.PI/2.4,0,0]}><torusGeometry args={[3.7,0.013,3,200]} /><meshBasicMaterial color="#fb923c" transparent opacity={0.5} depthWrite={false} /></mesh>
    <mesh ref={refs[2]} rotation={[Math.PI/5.5,Math.PI/6,0]}><torusGeometry args={[4.6,0.009,3,200]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.35} depthWrite={false} /></mesh>
    <mesh ref={refs[3]} rotation={[Math.PI/3.8,0,Math.PI/7]}><torusGeometry args={[5.5,0.006,3,200]} /><meshBasicMaterial color="#f97316" transparent opacity={0.22} depthWrite={false} /></mesh>
  </group>)
}
function RoverModel() {
  const wheelRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()]
  const armRef=useRef(), sensorRef=useRef(), lightRef=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    wheelRefs.forEach(r=>{if(r.current) r.current.rotation.x=t*2.2})
    if(armRef.current)   armRef.current.rotation.z   = Math.sin(t*0.45)*0.22+0.18
    if(sensorRef.current)sensorRef.current.rotation.y= t*1.2
    if(lightRef.current) lightRef.current.intensity   = 3.5+Math.sin(t*3.5)*0.8
  })
  const bodyMat  = <meshStandardMaterial color="#1a0800" roughness={0.2} metalness={0.85} emissive="#5a1e00" emissiveIntensity={1.2} />
  const panelMat = <meshStandardMaterial color="#2a1000" roughness={0.25} metalness={0.75} emissive="#3a1500" emissiveIntensity={0.9} />
  const glowMat  = <meshStandardMaterial color="#f97316" roughness={0.02} metalness={0.1} emissive="#f97316" emissiveIntensity={6} />
  const wheelMat = <meshStandardMaterial color="#150600" roughness={0.7} metalness={0.5} emissive="#2a0c00" emissiveIntensity={0.6} />
  const armMat   = <meshStandardMaterial color="#f97316" roughness={0.05} metalness={0.9} emissive="#f97316" emissiveIntensity={3} />

  const wPos = [[-0.82,-0.22,0.55],[-0.82,-0.22,-0.55],[0,-0.28,0.60],[0,-0.28,-0.60],[0.82,-0.22,0.55],[0.82,-0.22,-0.55]]

  return (
    <group>
      <mesh position={[0,0.05,0]}>{bodyMat}<boxGeometry args={[1.55,0.32,0.82]} /></mesh>
      <mesh position={[0,0.24,0]}>{panelMat}<boxGeometry args={[1.35,0.06,0.72]} /></mesh>
      <mesh position={[0.35,0.48,0]}><cylinderGeometry args={[0.025,0.025,0.38,8]} />{armMat}</mesh>
      <mesh position={[0.35,0.68,0]}><boxGeometry args={[0.12,0.09,0.14]} />{panelMat}</mesh>
      <mesh position={[0.42,0.68,0.04]}><sphereGeometry args={[0.028,10,10]} />{glowMat}</mesh>
      <mesh position={[0.42,0.68,-0.04]}><sphereGeometry args={[0.028,10,10]} />{glowMat}</mesh>
      <pointLight ref={lightRef} position={[0.7,0.68,0]} color="#f97316" intensity={3.5} distance={6} decay={2} />
      <group ref={sensorRef} position={[-0.2,0.36,0]}>
        <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.1,0.02,6,40]} /><meshBasicMaterial color="#f97316" transparent opacity={0.95} depthWrite={false} /></mesh>
      </group>
      <mesh position={[-0.28,0.28,0]} rotation={[0.15,0,0]}><boxGeometry args={[0.55,0.03,0.62]} /><meshStandardMaterial color="#f97316" roughness={0.05} metalness={0.1} transparent opacity={0.55} emissive="#f97316" emissiveIntensity={0.6} /></mesh>
      <group ref={armRef} position={[0.72,0.12,0]}>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.035,0.035,0.4,10]} />{armMat}</mesh>
        <mesh position={[0.22,0.12,0]} rotation={[0,0,Math.PI/4]}><cylinderGeometry args={[0.028,0.028,0.32,10]} />{armMat}</mesh>
        <mesh position={[0.38,0.28,0]}><sphereGeometry args={[0.055,10,10]} />{glowMat}</mesh>
      </group>
      {wPos.map(([x,y,z],i)=>(
        <group key={i} position={[x,y,z]}>
          <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.014,0.014,0.1,6]} /><meshStandardMaterial color="#f97316" roughness={0.1} metalness={0.9} emissive="#f97316" emissiveIntensity={1.5} /></mesh>
          <mesh ref={wheelRefs[i]} rotation={[0,0,Math.PI/2]}>{wheelMat}<cylinderGeometry args={[0.19,0.19,0.1,18]} /></mesh>
          <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.07,0.07,0.105,10]} /><meshBasicMaterial color="#f97316" transparent opacity={0.7} depthWrite={false} /></mesh>
        </group>
      ))}
      {[0.55,-0.55].map((z,i)=>(
        <group key={i}>
          <mesh position={[-0.41,-0.04,z]}><boxGeometry args={[0.82,0.025,0.025]} /><meshBasicMaterial color="#f97316" transparent opacity={0.7} depthWrite={false} /></mesh>
          <mesh position={[0.41,-0.04,z]}><boxGeometry args={[0.82,0.025,0.025]} /><meshBasicMaterial color="#fb923c" transparent opacity={0.55} depthWrite={false} /></mesh>
        </group>
      ))}
      <mesh position={[-0.58,0.1,0]}><boxGeometry args={[0.32,0.22,0.55]} />{panelMat}</mesh>
      <mesh position={[-0.75,0.1,0]}><boxGeometry args={[0.02,0.18,0.45]} /><meshBasicMaterial color="#f97316" transparent opacity={0.6} depthWrite={false} /></mesh>
      <mesh position={[0,0.05,0]}><boxGeometry args={[1.6,0.38,0.9]} /><meshBasicMaterial color="#f97316" transparent opacity={0.06} depthWrite={false} side={THREE.BackSide} /></mesh>
    </group>
  )
}

function Rover() {
  const roverRef = useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(roverRef.current){
      const ox=Math.sin(t*0.2)*5.2, oy=Math.cos(t*0.15)*1.4-3.2, oz=Math.cos(t*0.24)*3.6
      roverRef.current.position.set(ox,oy,oz)
      roverRef.current.rotation.z=Math.sin(t*0.15)*0.08
      roverRef.current.rotation.y=-Math.atan2(oz,ox)+Math.PI*0.5
    }
  })
  return (<group ref={roverRef} scale={0.72}><RoverModel /></group>)
}

function SmallRover() {
  const ref = useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(ref.current){
      const ox=Math.sin(t*0.28+Math.PI)*4.2, oy=Math.sin(t*0.19)*1.6+3.0, oz=Math.cos(t*0.32+Math.PI)*2.8
      ref.current.position.set(ox,oy,oz)
      ref.current.rotation.y=-Math.atan2(oz,ox)+Math.PI*0.5
      ref.current.rotation.z=Math.sin(t*0.19)*0.1
    }
  })
  return (<group ref={ref} scale={0.45}><RoverModel /></group>)
}

function DustParticles() {
  const mesh=useRef(), count=180
  const [positions,phases]=useMemo(()=>{
    const pos=new Float32Array(count*3), ph=[]
    for(let i=0;i<count;i++){
      const radius=2.8+Math.random()*6.5, theta=Math.random()*Math.PI*2, phi=Math.acos(2*Math.random()-1)
      pos[i*3]=radius*Math.sin(phi)*Math.cos(theta); pos[i*3+1]=radius*Math.sin(phi)*Math.sin(theta); pos[i*3+2]=radius*Math.cos(phi)
      ph.push(Math.random()*Math.PI*2)
    }
    return [pos,ph]
  },[])
  useFrame(({clock})=>{
    if(!mesh.current) return
    const t=clock.getElapsedTime(), attr=mesh.current.geometry.attributes.position
    for(let i=0;i<count;i++){
      const s=1+Math.sin(t*0.35+phases[i])*0.08
      attr.array[i*3]=positions[i*3]*s; attr.array[i*3+1]=positions[i*3+1]*s+Math.sin(t*0.28+phases[i])*0.05; attr.array[i*3+2]=positions[i*3+2]*s
    }
    attr.needsUpdate=true
  })
  return (<points ref={mesh}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /></bufferGeometry><pointsMaterial color="#fb923c" size={0.06} transparent opacity={0.55} depthWrite={false} /></points>)
}

function MouseTracker({children}) {
  const groupRef=useRef(), mouse=useMouse(), target=useRef({x:0,y:0})
  useFrame(()=>{
    target.current.x+=(mouse.current.x-target.current.x)*0.04
    target.current.y+=(mouse.current.y-target.current.y)*0.04
    if(groupRef.current){groupRef.current.rotation.y=target.current.x*0.5; groupRef.current.rotation.x=target.current.y*0.25}
  })
  return <group ref={groupRef}>{children}</group>
}

function HeroScene() {
  return (
    <Canvas camera={{position:[0,0,10],fov:52}} style={{width:"100%",height:"100%"}} gl={{antialias:true,alpha:false}}>
      <color attach="background" args={["#0a0200"]} />
      <ambientLight intensity={0.25} color="#fb923c" />
      <pointLight position={[0,0,6]} intensity={3} color="#f97316" />
      <pointLight position={[0,-4,4]} intensity={4} color="#fb923c" distance={25} decay={2} />
      <pointLight position={[4,2,2]} intensity={2} color="#fbbf24" distance={15} decay={2} />
      <Stars radius={80} depth={50} count={2000} factor={3} saturation={0} fade speed={0.4} />
      <MouseTracker><MarsPlanet /><PlanetaryRings /></MouseTracker>
      <Rover /><SmallRover /><DustParticles />
    </Canvas>
  )
}
function DataNodeD({position,phase}) {
  const ref=useRef()
  useFrame(({clock})=>{const t=clock.getElapsedTime(); if(ref.current){ref.current.material.opacity=0.6+Math.sin(t*1.5+phase)*0.3; const s=0.85+Math.sin(t*1.5+phase)*0.18; ref.current.scale.set(s,s,s)}})
  return (<mesh ref={ref} position={position}><octahedronGeometry args={[0.12,0]} /><meshBasicMaterial color="#f97316" transparent opacity={0.8} depthWrite={false} /></mesh>)
}
function RingD({radius,tube,tilt,color,opacity,speed}) {
  const ref=useRef()
  useFrame(({clock})=>{const t=clock.getElapsedTime(); if(ref.current){ref.current.rotation.z=t*speed; ref.current.material.opacity=opacity+Math.sin(t*0.7+radius)*(opacity*0.25)}})
  return (<mesh ref={ref} rotation={tilt}><torusGeometry args={[radius,tube,3,200]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} /></mesh>)
}
function CoreD() {
  const ref=useRef(), wire=useRef()
  useFrame(({clock})=>{const t=clock.getElapsedTime(), p=Math.sin(t*0.9)*0.5+0.5; if(ref.current){const s=1+p*0.1; ref.current.scale.set(s,s,s); ref.current.material.opacity=0.1+p*0.08} if(wire.current){wire.current.rotation.y=t*0.1; wire.current.material.opacity=0.18+p*0.1}})
  return (<><mesh ref={ref}><sphereGeometry args={[0.7,32,32]} /><meshBasicMaterial color="#f97316" transparent opacity={0.1} depthWrite={false} /></mesh><mesh ref={wire}><sphereGeometry args={[0.72,14,14]} /><meshBasicMaterial color="#fb923c" wireframe transparent opacity={0.18} depthWrite={false} /></mesh></>)
}
function DividerContent() {
  const groupRef=useRef(), isDragging=useRef(false), lastX=useRef(0), velocity=useRef(0), targetY=useRef(0)
  const dots=useMemo(()=>Array.from({length:8},(_,i)=>{const a=(i/8)*Math.PI*2,r=2.5; return [Math.cos(a)*r,Math.sin(a*0.5)*0.5,Math.sin(a)*r]}),[])
  const dotsGroup=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(!isDragging.current){targetY.current+=0.004+velocity.current; velocity.current*=0.94}
    if(groupRef.current){groupRef.current.rotation.y=THREE.MathUtils.lerp(groupRef.current.rotation.y,targetY.current,0.07); groupRef.current.rotation.x=Math.sin(t*0.2)*0.12}
    if(dotsGroup.current) dotsGroup.current.rotation.y=-t*0.25
  })
  return (
    <group ref={groupRef}
      onPointerDown={e=>{isDragging.current=true; lastX.current=e.clientX; document.body.style.cursor="grabbing"}}
      onPointerUp={()=>{isDragging.current=false; document.body.style.cursor="grab"}}
      onPointerLeave={()=>{isDragging.current=false; document.body.style.cursor="auto"}}
      onPointerMove={e=>{if(!isDragging.current)return; const dx=e.clientX-lastX.current; lastX.current=e.clientX; const d=dx*0.006; targetY.current+=d; velocity.current=d}}
      onPointerOver={()=>{document.body.style.cursor="grab"}}
      onPointerOut={()=>{document.body.style.cursor="auto"}}
    >
      {[{radius:1.2,tube:0.04,tilt:[0,0,0],color:"#f97316",opacity:0.75,speed:0.4},{radius:2.0,tube:0.028,tilt:[Math.PI/2.2,0,0],color:"#fb923c",opacity:0.55,speed:0.28},{radius:2.8,tube:0.02,tilt:[Math.PI/5,Math.PI/6,0],color:"#f97316",opacity:0.4,speed:0.18},{radius:3.6,tube:0.015,tilt:[Math.PI/3,0,Math.PI/7],color:"#fbbf24",opacity:0.28,speed:0.13},{radius:4.3,tube:0.011,tilt:[Math.PI/4,Math.PI/3,0],color:"#f97316",opacity:0.2,speed:0.09},{radius:5.0,tube:0.008,tilt:[Math.PI/6,Math.PI/5,Math.PI/8],color:"#fb923c",opacity:0.14,speed:0.07},{radius:5.7,tube:0.006,tilt:[0,Math.PI/4,Math.PI/5],color:"#f97316",opacity:0.09,speed:0.05}].map((r,i)=><RingD key={i} {...r} />)}
      <CoreD />
      <group ref={dotsGroup}>{dots.map((pos,i)=><DataNodeD key={i} position={pos} phase={i*0.8} />)}</group>
    </group>
  )
}
function DividerScene() {
  return (<Canvas camera={{position:[0,0,8],fov:52}} style={{width:"100%",height:"100%"}} gl={{antialias:true}}><color attach="background" args={["#0a0200"]} /><DividerContent /></Canvas>)
}
const STAT_COLORS=[A,A2,A3,A]
const STAT_POSITIONS=[[-4.5,0,0],[-1.5,0,0],[1.5,0,0],[4.5,0,0]]
function StatOrb({position,color,hovered}) {
  const r1=useRef(), r2=useRef(), core=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime(), boost=hovered?2.2:1
    if(r1.current){r1.current.rotation.x=t*0.5*boost; r1.current.material.opacity=(hovered?0.85:0.55)+Math.sin(t*1.2)*0.1}
    if(r2.current){r2.current.rotation.z=t*0.35*boost; r2.current.material.opacity=(hovered?0.6:0.38)+Math.sin(t*0.9)*0.08}
    if(core.current){const s=hovered?1+Math.sin(t*2)*0.07:1; core.current.scale.set(s,s,s); core.current.material.opacity=hovered?0.28:0.12}
  })
  return (<group position={position}>
    <mesh ref={r1}><torusGeometry args={[0.85,0.018,3,100]} /><meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} /></mesh>
    <mesh ref={r2} rotation={[Math.PI/2.5,0,Math.PI/6]}><torusGeometry args={[1.05,0.012,3,100]} /><meshBasicMaterial color="#fb923c" transparent opacity={0.38} depthWrite={false} /></mesh>
    <mesh ref={core}><sphereGeometry args={[0.42,18,18]} /><meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} /></mesh>
    <mesh><sphereGeometry args={[0.43,10,10]} /><meshBasicMaterial color={color} wireframe transparent opacity={hovered?0.28:0.12} depthWrite={false} /></mesh>
  </group>)
}
function StatsScene({hoveredIdx}) {
  return (<Canvas camera={{position:[0,0,5.5],fov:70}} style={{width:"100%",height:"100%",position:"absolute",inset:0}} gl={{antialias:true,alpha:true}}>
    {STAT_POSITIONS.map((pos,i)=>(<StatOrb key={i} position={pos} color={STAT_COLORS[i]} hovered={hoveredIdx===i} />))}
  </Canvas>)
}
function TrophyOrb({color,position}) {
  const r1=useRef(), r2=useRef(), dot=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(r1.current){r1.current.rotation.y=t*0.5; r1.current.material.opacity=0.8+Math.sin(t*1.5)*0.1}
    if(r2.current){r2.current.rotation.x=t*0.35; r2.current.material.opacity=0.55+Math.sin(t*1.1)*0.08}
    if(dot.current){const s=1+Math.sin(t*2)*0.12; dot.current.scale.set(s,s,s)}
  })
  return (<group position={position}>
    <mesh ref={r1}><torusGeometry args={[0.7,0.04,3,80]} /><meshBasicMaterial color={color} transparent opacity={0.8} depthWrite={false} /></mesh>
    <mesh ref={r2} rotation={[Math.PI/2.2,0,0]}><torusGeometry args={[0.7,0.025,3,80]} /><meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} /></mesh>
    <mesh ref={dot}><sphereGeometry args={[0.16,14,14]} /><meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} /></mesh>
  </group>)
}
function SLabel({n,title}) {
  return (
    <motion.div initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
      style={{display:"flex",alignItems:"center",gap:14,marginBottom:48}}>
      <div style={{width:38,height:38,border:`1px solid rgba(249,115,22,0.7)`,background:"rgba(30,8,0,0.95)",boxShadow:"0 0 14px rgba(249,115,22,0.2)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:A,letterSpacing:"0.1em"}}>{String(n).padStart(2,"0")}</span>
      </div>
      <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.78rem",letterSpacing:"0.22em",color:"#e8d4b8",textTransform:"uppercase",fontWeight:700}}>{title}</span>
      <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(249,115,22,0.5),transparent)"}} />
    </motion.div>
  )
}
function Card({children,delay=0,style={}}) {
  return (
    <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay,duration:0.6,ease:[0.22,1,0.36,1]}}
      style={{padding:"40px 48px",borderRadius:8,background:"rgba(28,8,0,0.95)",border:"1px solid rgba(249,115,22,0.4)",boxShadow:"0 4px 32px rgba(0,0,0,0.7),inset 0 0 40px rgba(249,115,22,0.04)",backdropFilter:"blur(18px)",position:"relative",overflow:"hidden",...style}}>
      <div style={{position:"absolute",top:0,left:0,width:64,height:1,background:"rgba(249,115,22,0.6)"}} />
      <div style={{position:"absolute",top:0,left:0,width:1,height:64,background:"rgba(249,115,22,0.6)"}} />
      <div style={{position:"absolute",bottom:0,right:0,width:64,height:1,background:"rgba(249,115,22,0.28)"}} />
      <div style={{position:"absolute",bottom:0,right:0,width:1,height:64,background:"rgba(249,115,22,0.28)"}} />
      {children}
    </motion.div>
  )
}
function TelemetrySection({hoveredStat,setHoveredStat}) {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={1} title="Telemetry" />
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",inset:0,height:200,pointerEvents:"none",opacity:0.35}}>
          <StatsScene hoveredIdx={hoveredStat} />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,position:"relative",zIndex:1}}>
          {STATS.map((stat,i)=>(
            <motion.div key={stat.label}
              initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              transition={{delay:i*0.09,duration:0.55,ease:[0.22,1,0.36,1]}}
              onHoverStart={()=>setHoveredStat(i)} onHoverEnd={()=>setHoveredStat(null)}
              whileHover={{scale:1.03}}
              style={{height:200,padding:"36px 24px 28px",borderRadius:8,
                background:hoveredStat===i?"rgba(35,10,0,0.99)":"rgba(28,8,0,0.95)",
                border:`1px solid ${hoveredStat===i?"rgba(249,115,22,0.8)":"rgba(249,115,22,0.45)"}`,
                boxShadow:hoveredStat===i?"0 0 36px rgba(249,115,22,0.18),inset 0 0 20px rgba(249,115,22,0.07)":"0 4px 24px rgba(0,0,0,0.65),inset 0 0 12px rgba(249,115,22,0.03)",
                backdropFilter:"blur(10px)",textAlign:"center",transition:"all 0.3s",cursor:"default"}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"3.6rem",fontWeight:700,color:"#fff8f0",letterSpacing:"-0.03em",lineHeight:1}}>{stat.value}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.68rem",color:A,letterSpacing:"0.2em",marginTop:8,textTransform:"uppercase"}}>{stat.unit}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.2em",color:"#8a5a30",textTransform:"uppercase",marginTop:10}}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={2} title="About" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,alignItems:"stretch"}}>
        <Card>
          <p style={{fontSize:"1.1rem",lineHeight:1.92,color:"#c09070",fontWeight:300}}>
            Team Inferno is a <span style={{color:"#fff8f0",fontWeight:600}}>multidisciplinary student engineering team</span> dedicated to the design and development of high-performance planetary rovers for international Mars simulation competitions. Our work integrates advanced mechanical systems, intelligent autonomy, precision robotics, and scientific instrumentation.
          </p>
          <p style={{marginTop:22,fontSize:"1.1rem",lineHeight:1.92,color:"#c09070",fontWeight:300}}>
            Beyond competition success, Team Inferno aims to contribute to the broader ecosystem of space technology development — building systems ready for the next frontier of <span style={{color:A,fontWeight:500}}>extraterrestrial exploration</span>.
          </p>
        </Card>
        <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6,delay:0.15,ease:[0.22,1,0.36,1]}}
          style={{padding:"36px 30px",borderRadius:8,background:"rgba(28,8,0,0.95)",border:"1px solid rgba(249,115,22,0.4)",boxShadow:"0 4px 28px rgba(0,0,0,0.7)",backdropFilter:"blur(18px)",display:"flex",flexDirection:"column",gap:28}}>
          {[{label:"Latest Rover",value:"AARAMBH"},{label:"Autonomy Stack",value:"ROS2"},{label:"Compute",value:"NVIDIA Jetson Orin"},{label:"Suspension",value:"Rocker-Bogie"}].map((f,i)=>(
            <div key={i} style={{borderBottom:"1px solid rgba(249,115,22,0.15)",paddingBottom:20}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.22em",color:A,textTransform:"uppercase",marginBottom:6}}>{f.label}</div>
              <div style={{color:"#fff8f0",fontSize:"0.95rem",fontWeight:600}}>{f.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function DeptCard({role,name,description,i}) {
  const [hov,setHov]=useState(false)
  return (
    <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
      transition={{delay:i*0.07,duration:0.5,ease:[0.22,1,0.36,1]}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)} animate={{y:hov?-4:0}}
      style={{padding:"30px 28px",borderRadius:8,
        background:hov?"rgba(35,10,0,0.99)":"rgba(28,8,0,0.95)",
        border:`1px solid ${hov?"rgba(249,115,22,0.6)":"rgba(249,115,22,0.32)"}`,
        boxShadow:hov?"0 8px 32px rgba(0,0,0,0.7),0 0 22px rgba(249,115,22,0.1)":"0 4px 20px rgba(0,0,0,0.6)",
        backdropFilter:"blur(14px)",position:"relative",overflow:"hidden",transition:"all 0.25s"}}>
      <div style={{position:"absolute",top:0,right:0,width:24,height:1,background:"rgba(249,115,22,0.6)"}} />
      <div style={{position:"absolute",top:0,right:0,width:1,height:24,background:"rgba(249,115,22,0.6)"}} />
      <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:A,boxShadow:`0 0 8px ${A}`}} />
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.2em",color:A,fontWeight:700,textTransform:"uppercase"}}>{role}</span>
      </div>
      <div style={{color:"#fff8f0",fontSize:"1rem",fontWeight:600,marginBottom:14,lineHeight:1.45}}>{name}</div>
      <p style={{color:"#c09070",fontSize:"0.88rem",lineHeight:1.82,fontWeight:400}}>{description}</p>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${hov?"rgba(249,115,22,0.5)":"rgba(249,115,22,0.16)"},transparent)`,transition:"background 0.25s"}} />
    </motion.div>
  )
}
function DepartmentsSection() {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={3} title="Departments" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:14}}>
        {DEPARTMENTS.slice(0,3).map((d,i)=><DeptCard key={d.role} {...d} i={i} />)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        {DEPARTMENTS.slice(3).map((d,i)=><DeptCard key={d.role} {...d} i={i+3} />)}
      </div>
    </section>
  )
}

function AchRow({rank,event,comp,color,i}) {
  const [hov,setHov]=useState(false)
  return (
    <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
      transition={{delay:i*0.1,duration:0.5,ease:[0.22,1,0.36,1]}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)} animate={{x:hov?6:0}}
      style={{display:"flex",alignItems:"center",gap:24,padding:"22px 28px",borderRadius:8,
        background:hov?"rgba(35,10,0,0.99)":"rgba(28,8,0,0.95)",
        border:`1px solid ${hov?color+"99":"rgba(249,115,22,0.32)"}`,
        borderLeft:`3px solid ${color}`,
        boxShadow:hov?`0 8px 32px rgba(0,0,0,0.7),0 0 22px ${color}18`:"0 4px 20px rgba(0,0,0,0.6)",
        backdropFilter:"blur(12px)",transition:"all 0.25s"}}>
      <div style={{width:88,height:88,flexShrink:0}}>
        <Canvas camera={{position:[0,0,3.2],fov:38}} style={{width:"100%",height:"100%"}} gl={{alpha:true,antialias:false}}>
          <TrophyOrb color={color} position={[0,0,0]} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"inline-block",padding:"4px 12px",borderRadius:3,background:color+"20",border:`1px solid ${color}55`,marginBottom:10}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color,letterSpacing:"0.14em",fontWeight:700}}>{rank}</span>
        </div>
        <div style={{color:"#fff8f0",fontSize:"1.1rem",fontWeight:600,marginBottom:7,lineHeight:1.3}}>{event}</div>
        <div style={{color:"#8a5a30",fontSize:"0.8rem",fontFamily:"'Space Mono',monospace",letterSpacing:"0.05em"}}>{comp}</div>
      </div>
      <div style={{width:9,height:9,borderRadius:"50%",background:color,boxShadow:`0 0 10px ${color},0 0 24px ${color}66`,flexShrink:0}} />
    </motion.div>
  )
}
function PodiumSection() {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={4} title="Podium" />
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {ACHIEVEMENTS.map((a,i)=><AchRow key={a.event} {...a} i={i} />)}
      </div>
    </section>
  )
}

function CompCard({role,name,description,i}) {
  const [hov,setHov]=useState(false)
  return (
    <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
      transition={{delay:i*0.1,duration:0.5}}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)} animate={{y:hov?-3:0}}
      style={{flex:1,padding:"22px 24px",borderRadius:8,
        background:hov?"rgba(35,10,0,0.99)":"rgba(28,8,0,0.95)",
        border:`1px solid ${hov?"rgba(249,115,22,0.6)":"rgba(249,115,22,0.32)"}`,
        backdropFilter:"blur(14px)",position:"relative",overflow:"hidden",transition:"all 0.25s"}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.2em",color:A,fontWeight:700,marginBottom:8}}>{role}</div>
      <div style={{color:"#fff8f0",fontSize:"0.95rem",fontWeight:600,marginBottom:10,lineHeight:1.45}}>{name}</div>
      <p style={{color:"#c09070",fontSize:"0.82rem",lineHeight:1.78}}>{description}</p>
    </motion.div>
  )
}
function RoverSection() {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={5} title="AARAMBH — Latest Rover" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.28em",color:A,marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:A,boxShadow:`0 0 8px ${A}`}} />
            FULLY AUTONOMOUS · MODULAR PLATFORM
          </div>
          <p style={{fontSize:"1rem",lineHeight:1.9,color:"#c09070",fontWeight:300}}>
            AARAMBH is built on a <span style={{color:"#fff8f0",fontWeight:600}}>lightweight aluminium chassis</span> with a six-wheel rocker-bogie suspension and crab steering — engineered for superior stability across rocks, slopes, and uneven terrain.
          </p>
          <p style={{marginTop:16,fontSize:"1rem",lineHeight:1.9,color:"#c09070",fontWeight:300}}>
            A <span style={{color:"#fff8f0",fontWeight:600}}>6-DOF carbon-fiber arm</span> with custom cycloidal drives delivers high-torque precision manipulation. An in-house Raman spectrometer enables on-site chemical and mineralogical analysis.
          </p>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.22em",color:"#e8d4b8",textTransform:"uppercase",fontWeight:700,marginBottom:4,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:24,height:1,background:"rgba(249,115,22,0.5)"}} />
            Competition Circuits
          </div>
          {COMPETITIONS.map((c,i)=><CompCard key={c.role} {...c} i={i} />)}
        </div>
      </div>
    </section>
  )
}

function SponsorsSection() {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={6} title="Sponsors & Partners" />
      <div style={{display:"flex",flexDirection:"column",gap:28}}>
        {[{tier:"Gold Sponsors",color:"#fbbf24",items:SPONSORS.gold},{tier:"Silver Sponsors",color:"#94a3b8",items:SPONSORS.silver}].map(({tier,color,items})=>(
          <div key={tier}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.28em",color,textTransform:"uppercase",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:`0 0 10px ${color}`}} />{tier}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {items.map((s,i)=>(
                <motion.div key={s} initial={{opacity:0,scale:0.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.04}}
                  whileHover={{borderColor:color+"99",color,background:"rgba(35,10,0,0.99)"}}
                  style={{padding:"12px 22px",borderRadius:4,border:`1px solid ${color}44`,background:"rgba(28,8,0,0.95)",color:"#c09070",fontSize:"0.7rem",letterSpacing:"0.1em",fontFamily:"'Space Mono',monospace",cursor:"default",transition:"all 0.2s"}}>
                  {s}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
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
    <section style={{marginBottom:120}}>
      <SLabel n={7} title="Gallery" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {GALLERY_IMAGES.map((img,i)=>(
          <motion.div key={i} initial={{opacity:0,scale:0.96}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.07}}
            whileHover={{scale:1.02}} onClick={()=>setLb(i)}
            style={{position:"relative",borderRadius:8,overflow:"hidden",cursor:"zoom-in",aspectRatio:"4/3",border:"1px solid rgba(249,115,22,0.35)"}}>
            <img src={img.url} alt={img.caption}
              style={{width:"100%",height:"100%",objectFit:"cover",display:"block",filter:"brightness(0.55) contrast(1.1) saturate(0.6) sepia(0.15)",transition:"filter 0.3s"}}
              onMouseEnter={e=>{e.currentTarget.style.filter="brightness(0.8) contrast(1.1) saturate(0.85) sepia(0.08)"}}
              onMouseLeave={e=>{e.currentTarget.style.filter="brightness(0.55) contrast(1.1) saturate(0.6) sepia(0.15)"}} />
            {[{top:8,left:8},{top:8,right:8},{bottom:8,left:8},{bottom:8,right:8}].map((pos,j)=>(
              <div key={j} style={{position:"absolute",...pos,width:14,height:14,
                borderTop:pos.bottom!==undefined?"none":"1px solid rgba(249,115,22,0.7)",
                borderBottom:pos.top!==undefined?"none":"1px solid rgba(249,115,22,0.7)",
                borderLeft:pos.right!==undefined?"none":"1px solid rgba(249,115,22,0.7)",
                borderRight:pos.left!==undefined?"none":"1px solid rgba(249,115,22,0.7)"}} />
            ))}
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"28px 16px 14px",background:"linear-gradient(transparent,rgba(10,2,0,0.96))"}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"#fb923c",letterSpacing:"0.12em"}}>{img.caption}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {lb!==null&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLb(null)}
            style={{position:"fixed",inset:0,zIndex:500,background:"rgba(10,2,0,0.96)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
            <motion.div initial={{scale:0.88}} animate={{scale:1}} onClick={e=>e.stopPropagation()}
              style={{position:"relative",maxWidth:"82vw",maxHeight:"82vh",border:"1px solid rgba(249,115,22,0.5)",borderRadius:8,overflow:"hidden"}}>
              <img src={GALLERY_IMAGES[lb].url} alt={GALLERY_IMAGES[lb].caption} style={{display:"block",width:"100%",height:"100%",objectFit:"cover"}} />
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 24px 20px",background:"linear-gradient(transparent,rgba(10,2,0,0.97))"}}>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.7rem",color:"#fb923c",letterSpacing:"0.14em"}}>{GALLERY_IMAGES[lb].caption}</span>
              </div>
              <button onClick={()=>setLb(null)} style={{position:"absolute",top:14,right:14,background:"rgba(10,2,0,0.9)",border:"1px solid rgba(249,115,22,0.45)",borderRadius:4,color:A,fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",padding:"7px 14px",cursor:"pointer",letterSpacing:"0.12em"}}>ESC</button>
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
      <SLabel n={8} title="Toolchain" />
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
        {TOOLCHAIN.map((item,i)=>(
          <motion.div key={item} initial={{opacity:0,scale:0.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.04}}
            whileHover={{borderColor:"rgba(249,115,22,0.65)",color:"#fb923c",background:"rgba(35,10,0,0.99)"}}
            style={{padding:"12px 24px",borderRadius:4,border:"1px solid rgba(249,115,22,0.32)",background:"rgba(28,8,0,0.95)",color:"#9a6a3a",fontSize:"0.68rem",letterSpacing:"0.16em",fontFamily:"'Space Mono',monospace",textTransform:"uppercase",cursor:"default",transition:"all 0.2s"}}>
            {item}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
export default function TeamInferno() {
  const navigate=useNavigate()
  const heroRef=useRef()
  const [hoveredStat,setHoveredStat]=useState(null)
  const {scrollYProgress}=useScroll({target:heroRef,offset:["start start","end start"]})
  const heroY=useTransform(scrollYProgress,[0,1],[0,50])
  const heroOpacity=useTransform(scrollYProgress,[0,0.65],[1,0])
  const sceneScale=useTransform(scrollYProgress,[0,1],[1,0.88])

  return (
    <div style={{background:BG,color:"#fff8f0",minHeight:"100vh",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(249,115,22,0.32);border-radius:99px}
      `}</style>

      <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
        onClick={()=>navigate("/")} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
        style={{position:"fixed",top:22,left:22,zIndex:200,padding:"9px 18px",background:"rgba(10,2,0,0.92)",border:"1px solid rgba(249,115,22,0.5)",borderRadius:4,color:"#fb923c",fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.14em",cursor:"pointer",backdropFilter:"blur(14px)"}}>
        ← BACK
      </motion.button>

      <section ref={heroRef} style={{position:"relative",height:"100vh",overflow:"hidden"}}>
        <motion.div style={{position:"absolute",inset:0,scale:sceneScale}}><HeroScene /></motion.div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}}
          style={{position:"absolute",top:24,right:24,zIndex:12,fontFamily:"'Space Mono',monospace",fontSize:"0.48rem",letterSpacing:"0.22em",color:"#4a2008",textTransform:"uppercase"}}>
          MOVE CURSOR · MARS RESPONDS
        </motion.div>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,rgba(10,2,0,0) 0%,rgba(10,2,0,0.25) 65%,rgba(10,2,0,0.6) 100%)"}} />
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(180deg,rgba(10,2,0,0) 0%,rgba(10,2,0,0.3) 45%,rgba(10,2,0,0.75) 100%)"}} />
        <motion.div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",y:heroY,opacity:heroOpacity,zIndex:11,pointerEvents:"none"}}>
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.35,duration:0.75,ease:[0.22,1,0.36,1]}}
            style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.32em",color:"#fb923c",marginBottom:26,display:"flex",alignItems:"center",gap:14,textAlign:"center"}}>
            <span style={{display:"inline-block",width:32,height:1,background:"rgba(249,115,22,0.5)"}} />
            PLANETARY EXPLORATION ROBOTICS · INDIA
            <span style={{display:"inline-block",width:32,height:1,background:"rgba(249,115,22,0.5)"}} />
          </motion.div>
          <motion.h1 initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.85,ease:[0.22,1,0.36,1]}}
            style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(3rem,8.5vw,8rem)",fontWeight:700,letterSpacing:"-0.03em",lineHeight:0.92,textAlign:"center",color:"#fff8f0",textShadow:"0 6px 30px rgba(10,2,0,0.7)"}}>
            TEAM<br /><span style={{color:"#f97316",textShadow:"0 8px 32px rgba(10,2,0,0.75),0 0 40px rgba(249,115,22,0.5)"}}>INFERNO</span>
          </motion.h1>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9,duration:0.8}}
            style={{marginTop:26,fontFamily:"'Space Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.22em",color:"#fff8f0",textTransform:"uppercase",textAlign:"center",maxWidth:680,padding:"0 20px",textShadow:"0 6px 24px rgba(10,2,0,0.7)"}}>
            Advancing planetary exploration through autonomous rovers and frontier space robotics
          </motion.p>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.3}} style={{position:"absolute",bottom:38}}>
            <motion.div animate={{scaleY:[1,0.25,1]}} transition={{duration:2.2,repeat:Infinity,ease:"easeInOut"}}
              style={{width:1,height:42,background:"linear-gradient(to bottom,rgba(249,115,22,0.55),transparent)",transformOrigin:"top",margin:"0 auto"}} />
          </motion.div>
        </motion.div>
      </section>

      <div style={{maxWidth:1280,margin:"0 auto",padding:"110px 48px 80px"}}>
        <TelemetrySection hoveredStat={hoveredStat} setHoveredStat={setHoveredStat} />
        <AboutSection />
        <DepartmentsSection />
        <PodiumSection />
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
          style={{height:400,marginBottom:120,position:"relative",borderRadius:8,overflow:"hidden"}}>
          <DividerScene />
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to right,${BG} 0%,transparent 10%,transparent 90%,${BG} 100%)`,pointerEvents:"none"}} />
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,${BG} 0%,transparent 18%,transparent 82%,${BG} 100%)`,pointerEvents:"none"}} />
          <div style={{position:"absolute",bottom:22,left:0,right:0,display:"flex",justifyContent:"center",pointerEvents:"none"}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.35em",color:"#4a2008",textTransform:"uppercase"}}>DRAG TO ROTATE</span>
          </div>
        </motion.div>
        <RoverSection />
        <SponsorsSection />
        <GallerySection />
        <ToolchainSection />
      </div>
    </div>
  )
}