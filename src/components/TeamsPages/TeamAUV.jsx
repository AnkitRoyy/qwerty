import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"

// ─────────────────────────────────────────────────────────
//  PLACEHOLDER IMAGE URLS
// ─────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", caption: "Varuna 4.0 · Water tank trials" },
  { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", caption: "AMUROVc 2026 · Competition floor" },
  { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", caption: "Electronics integration sprint" },
  { url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80", caption: "Mechanical assembly · Semester 1" },
  { url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80", caption: "Software stack review" },
  { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80", caption: "Depth sensor calibration" },
]

// ─────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────
const STATS = [
  { value: "05", label: "Departments",     unit: "core"      },
  { value: "04", label: "Major Awards",    unit: "podiums"   },
  { value: "02", label: "Research Papers", unit: "published" },
  { value: "V4", label: "Latest Platform", unit: "varuna"    },
]
const DEPARTMENTS = [
  { role: "Mechanical",  name: "Structure, stability, hydrodynamics",   description: "Designs in SolidWorks, validates through ANSYS CFD, and selects fabrication strategies for robust underwater operation." },
  { role: "Software",    name: "Autonomy, control and perception",       description: "Builds on ROS Kinetic, tunes PID controllers, and develops CV pipelines using CNNs and YOLOv2 for task execution." },
  { role: "Embedded",    name: "Electronics and low-level control",      description: "Engineers sensing with Arduino and STM32, validates in LTspice, and designs custom PCBs in Altium Designer." },
  { role: "Corporate",   name: "Funding and long-term sustainability",   description: "Secures sponsorships and manages budgets so workshops and prototype campaigns stay aligned with team goals." },
  { role: "Design",      name: "Identity, storytelling, event presence", description: "Shapes visual language across branding, social media, and sponsor-facing collateral." },
]
const ACHIEVEMENTS = [
  { rank: "MOST INNOVATIVE VEHICLE", event: "AMU-ROVc 2026",    comp: "Recognized for vehicle innovation and system integration", color: "#fbbf24" },
  { rank: "3RD PRIZE",               event: "AMU-ROV 2024",     comp: "Competition podium finish",                               color: "#cbd5e1" },
  { rank: "BEST DESIGN AWARD",       event: "IIT Guwahati 2023",comp: "Winner for overall vehicle design quality",               color: "#38bdf8" },
  { rank: "2ND POSITION",            event: "ROBOSUB 2021",     comp: "Power Management Skill · international stage",           color: "#94a3b8" },
]
const PUBLICATIONS = [
  { role: "2020", name: "Int. Journal of Engineering and Research Technology", description: "Technical paper on underwater robotics research and engineering." },
  { role: "2019", name: "Int. Journal of Recent Technology and Engineering",  description: "Paper on ongoing development and innovation trajectory." },
]
const MEMBERS = [
  "Parag Gole","Nirman Aggarwal","Jaiveer Singh","Suyash Raiswal","Aditya Agrawal","Raghav Singh Gosain",
  "Uday Singh Goondli","OD Madhav Prakash","Ansh Wadhera","Vighnesh R Pai","Smit Bachan","Azhar Jawed",
  "Arshia Dhar","Marvin Rao","Kushagra Rai","Vyom Bhat",
]
const TOOLCHAIN = [
  "SolidWorks","ANSYS","CFD","ROS Kinetic","PID Control","CNNs","YOLOv2","Arduino","STM32","MATLAB","LTspice","Altium Designer",
]

// ─────────────────────────────────────────────────────────
//  SHARED UTILS
// ─────────────────────────────────────────────────────────
function useMouse() {
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [])
  return mouse
}

// ─────────────────────────────────────────────────────────
//  THREE.JS HERO SCENE (all unchanged)
// ─────────────────────────────────────────────────────────
function EarthGlobe() {
  const meshRef = useRef(), wireRef = useRef(), glowRef = useRef(), atmosphereRef = useRef()
  const wireGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pts = []
    const R = 2.02, LATS = 18, LONS = 36
    for (let lat = -80; lat <= 80; lat += 180 / LATS) {
      const rad = (lat * Math.PI) / 180, y = R * Math.sin(rad), r = R * Math.cos(rad)
      for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2; pts.push(r * Math.cos(a), y, r * Math.sin(a)) }
    }
    for (let lon = 0; lon < 360; lon += 360 / LONS) {
      const a = (lon * Math.PI) / 180
      for (let i = 0; i <= 64; i++) { const lat = (i / 64) * Math.PI - Math.PI / 2; pts.push(R * Math.cos(lat) * Math.cos(a), R * Math.sin(lat), R * Math.cos(lat) * Math.sin(a)) }
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) meshRef.current.rotation.y = t * 0.08
    if (wireRef.current) { wireRef.current.rotation.y = t * 0.08; wireRef.current.material.opacity = 0.18 + Math.sin(t * 0.6) * 0.06 }
    if (glowRef.current) { const s = 1 + Math.sin(t * 0.5) * 0.02; glowRef.current.scale.set(s,s,s); glowRef.current.material.opacity = 0.06 + Math.sin(t * 0.4) * 0.02 }
    if (atmosphereRef.current) atmosphereRef.current.material.opacity = 0.12 + Math.sin(t * 0.3) * 0.04
  })
  return (
    <group>
      <mesh ref={meshRef}><sphereGeometry args={[2,64,64]} /><meshStandardMaterial color="#020c1b" roughness={0.9} metalness={0.1} /></mesh>
      <lineSegments ref={wireRef} geometry={wireGeo}><lineBasicMaterial color="#38bdf8" transparent opacity={0.18} depthWrite={false} /></lineSegments>
      <mesh ref={glowRef}><sphereGeometry args={[2.18,32,32]} /><meshBasicMaterial color="#0ea5e9" transparent opacity={0.06} depthWrite={false} side={THREE.BackSide} /></mesh>
      <mesh ref={atmosphereRef}><sphereGeometry args={[2.35,32,32]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.12} depthWrite={false} side={THREE.BackSide} /></mesh>
      <ContinentDots />
    </group>
  )
}
function ContinentDots() {
  const mesh = useRef()
  const positions = useMemo(() => {
    const clusters = [
      ...Array.from({length:40},()=>({lat:35+Math.random()*25,lon:-90+Math.random()*40})),
      ...Array.from({length:30},()=>({lat:45+Math.random()*15,lon:5+Math.random()*30})),
      ...Array.from({length:60},()=>({lat:20+Math.random()*40,lon:60+Math.random()*80})),
      ...Array.from({length:35},()=>({lat:-20+Math.random()*40,lon:10+Math.random()*40})),
      ...Array.from({length:30},()=>({lat:-30+Math.random()*50,lon:-65+Math.random()*25})),
      ...Array.from({length:20},()=>({lat:-25+Math.random()*15,lon:125+Math.random()*25})),
    ]
    const R = 2.03, arr = new Float32Array(clusters.length*3)
    clusters.forEach(({lat,lon},i)=>{
      const phi=(90-lat)*(Math.PI/180),theta=(lon+180)*(Math.PI/180)
      arr[i*3]=-R*Math.sin(phi)*Math.cos(theta); arr[i*3+1]=R*Math.cos(phi); arr[i*3+2]=R*Math.sin(phi)*Math.sin(theta)
    })
    return arr
  }, [])
  useFrame(({clock})=>{ if(mesh.current){mesh.current.rotation.y=clock.getElapsedTime()*0.08; mesh.current.material.opacity=0.55+Math.sin(clock.getElapsedTime()*0.7)*0.15} })
  return (<points ref={mesh}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /></bufferGeometry><pointsMaterial color="#7dd3fc" size={0.055} transparent opacity={0.6} depthWrite={false} /></points>)
}
function GyroRings() {
  const refs = [useRef(),useRef(),useRef(),useRef()]
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(refs[0].current){refs[0].current.rotation.z=t*0.22; refs[0].current.material.opacity=0.55+Math.sin(t*1.1)*0.12}
    if(refs[1].current){refs[1].current.rotation.x=t*0.16; refs[1].current.material.opacity=0.38+Math.sin(t*0.9)*0.1}
    if(refs[2].current){refs[2].current.rotation.y=t*0.19; refs[2].current.rotation.z=t*0.07; refs[2].current.material.opacity=0.25+Math.sin(t*0.7)*0.08}
    if(refs[3].current){refs[3].current.rotation.x=-t*0.1; refs[3].current.rotation.z=t*0.13; refs[3].current.material.opacity=0.16+Math.sin(t*1.3)*0.06}
  })
  return (<group>
    <mesh ref={refs[0]}><torusGeometry args={[2.8,0.018,3,200]} /><meshBasicMaterial color="#7dd3fc" transparent opacity={0.55} depthWrite={false} /></mesh>
    <mesh ref={refs[1]} rotation={[Math.PI/2.5,0,0]}><torusGeometry args={[3.6,0.013,3,200]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.38} depthWrite={false} /></mesh>
    <mesh ref={refs[2]} rotation={[Math.PI/6,Math.PI/5,0]}><torusGeometry args={[4.5,0.009,3,200]} /><meshBasicMaterial color="#bae6fd" transparent opacity={0.25} depthWrite={false} /></mesh>
    <mesh ref={refs[3]} rotation={[Math.PI/3.5,Math.PI/4,Math.PI/7]}><torusGeometry args={[5.4,0.006,3,200]} /><meshBasicMaterial color="#7dd3fc" transparent opacity={0.16} depthWrite={false} /></mesh>
  </group>)
}
function SubmarineModel() {
  const propRef=useRef(), sonarRef=useRef(), lightRef=useRef(), hullGlowRef=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(propRef.current) propRef.current.rotation.z=t*10
    if(sonarRef.current) sonarRef.current.rotation.y=t*2
    if(lightRef.current) lightRef.current.intensity=1.5+Math.sin(t*4)*0.5
    if(hullGlowRef.current) hullGlowRef.current.material.opacity=0.12+Math.sin(t*1.2)*0.05
  })
  const hullMat=<meshStandardMaterial color="#0a1f38" roughness={0.2} metalness={0.9} emissive="#0a4a7a" emissiveIntensity={0.8} />
  const accentMat=<meshStandardMaterial color="#0d2a4a" roughness={0.3} metalness={0.75} emissive="#0a3a6a" emissiveIntensity={0.6} />
  const glowMat=<meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.1} emissive="#38bdf8" emissiveIntensity={3} />
  const propMat=<meshStandardMaterial color="#7dd3fc" roughness={0.1} metalness={0.95} emissive="#38bdf8" emissiveIntensity={1.8} />
  return (<group>
    <mesh ref={hullGlowRef} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.46,0.46,2.85,24]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.12} depthWrite={false} side={THREE.BackSide} /></mesh>
    <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.38,0.38,2.8,24]} />{hullMat}</mesh>
    <mesh position={[1.4,0,0]} rotation={[0,0,-Math.PI/2]}><sphereGeometry args={[0.38,24,16,0,Math.PI*2,0,Math.PI/2]} />{hullMat}</mesh>
    <mesh position={[-1.4,0,0]} rotation={[0,0,Math.PI/2]}><coneGeometry args={[0.38,0.7,20]} />{hullMat}</mesh>
    <mesh position={[0.2,0.42,0]}><boxGeometry args={[0.55,0.44,0.3]} />{accentMat}</mesh>
    <mesh position={[0.2,0.68,0]}><boxGeometry args={[0.38,0.08,0.24]} />{accentMat}</mesh>
    <mesh position={[0.25,0.88,0]}><cylinderGeometry args={[0.025,0.025,0.3,8]} />{glowMat}</mesh>
    <mesh position={[1.72,0,0]}><sphereGeometry args={[0.16,16,16]} />{glowMat}</mesh>
    <pointLight ref={lightRef} position={[2.2,0,0]} color="#38bdf8" intensity={6} distance={4.0} decay={2} />
    {[-0.7,0,0.7].map((x,i)=>(<mesh key={i} position={[x,0.395,0]}><boxGeometry args={[0.38,0.012,0.76]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.55} depthWrite={false} /></mesh>))}
    <mesh position={[-0.95,0,0.55]}><boxGeometry args={[0.55,0.06,0.45]} />{hullMat}</mesh>
    <mesh position={[-0.95,0,-0.55]}><boxGeometry args={[0.55,0.06,0.45]} />{hullMat}</mesh>
    <mesh position={[0.1,0,0.48]}><boxGeometry args={[0.35,0.04,0.32]} />{accentMat}</mesh>
    <mesh position={[0.1,0,-0.48]}><boxGeometry args={[0.35,0.04,0.32]} />{accentMat}</mesh>
    <mesh position={[-0.95,0.3,0]}><boxGeometry args={[0.55,0.55,0.06]} />{hullMat}</mesh>
    <mesh position={[-1.1,-0.1,0.42]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.1,0.1,0.28,12]} />{accentMat}</mesh>
    <mesh position={[-1.1,-0.1,-0.42]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.1,0.1,0.28,12]} />{accentMat}</mesh>
    <group ref={propRef} position={[-1.82,0,0]}>
      {[0,1,2].map((i)=>(<mesh key={i} rotation={[0,0,(i*Math.PI*2)/3]}><boxGeometry args={[0.06,0.55,0.12]} />{propMat}</mesh>))}
      <mesh><cylinderGeometry args={[0.07,0.07,0.12,10]} />{accentMat}</mesh>
    </group>
    <group ref={sonarRef} position={[1.55,0,0]}><mesh rotation={[0,0,Math.PI/2]}><torusGeometry args={[0.2,0.022,6,40]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.9} depthWrite={false} /></mesh></group>
    {[-0.6,0,0.6].map((x,i)=>(<mesh key={i} position={[x,0.39,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.001,0.001,0.76,4]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.35} /></mesh>))}
  </group>)
}
function Submarine() {
  const subRef=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(subRef.current){
      const ox=Math.sin(t*0.28)*4.5, oy=Math.cos(t*0.18)*1.2-3.5, oz=Math.cos(t*0.22)*3.2
      subRef.current.position.set(ox,oy,oz)
      const vx=Math.cos(t*0.28)*4.5*0.28, vy=-Math.sin(t*0.18)*1.2*0.18
      subRef.current.rotation.z=Math.atan2(vy,vx)*0.4
      subRef.current.rotation.y=-Math.atan2(oz,ox)+Math.PI*0.5
    }
  })
  return (<group ref={subRef} scale={0.52}><SubmarineModel /></group>)
}
function AUVModel() {
  const thrusterRefs=[useRef(),useRef(),useRef(),useRef()], lightFRef=useRef(), lightBRef=useRef(), scanRef=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    thrusterRefs.forEach((r,i)=>{if(r.current) r.current.rotation.y=t*(6+i*0.7)*(i%2===0?1:-1)})
    if(lightFRef.current) lightFRef.current.intensity=3.5+Math.sin(t*5)*0.8
    if(lightBRef.current) lightBRef.current.intensity=0.3+Math.sin(t*3+1)*0.1
    if(scanRef.current) scanRef.current.rotation.y=t*1.5
  })
  const frameMat=<meshBasicMaterial color="#0d4a8a" />, panelMat=<meshBasicMaterial color="#1a6aaa" />, glowMat=<meshBasicMaterial color="#38bdf8" />, darkMat=<meshStandardMaterial color="#071526" roughness={0.8} metalness={0.3} />
  return (<group>
    <mesh position={[0,0.52,0]}><boxGeometry args={[1.9,0.05,0.05]} />{frameMat}</mesh>
    <mesh position={[0,-0.52,0.38]}><boxGeometry args={[1.9,0.05,0.05]} />{frameMat}</mesh>
    <mesh position={[0,-0.52,-0.38]}><boxGeometry args={[1.9,0.05,0.05]} />{frameMat}</mesh>
    {[[-0.9,0.38],[-0.9,-0.38],[0.9,0.38],[0.9,-0.38]].map(([x,z],i)=>(<mesh key={i} position={[x,0,z]}><boxGeometry args={[0.05,1.0,0.05]} />{frameMat}</mesh>))}
    {[-0.9,0,0.9].map((x,i)=>(<mesh key={i} position={[x,-0.52,0]}><boxGeometry args={[0.05,0.05,0.82]} />{frameMat}</mesh>))}
    <mesh position={[0,0.1,0]}><boxGeometry args={[1.1,0.55,0.52]} />{panelMat}</mesh>
    <mesh position={[0.56,0.1,0]}><cylinderGeometry args={[0.26,0.26,0.08,20]} /><meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.1} transparent opacity={0.35} emissive="#38bdf8" emissiveIntensity={0.2} /></mesh>
    <mesh position={[-0.56,0.1,0]}><cylinderGeometry args={[0.26,0.26,0.08,20]} /><meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.1} transparent opacity={0.35} emissive="#38bdf8" emissiveIntensity={0.2} /></mesh>
    <mesh position={[0,-0.22,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.14,0.14,0.95,16]} />{darkMat}</mesh>
    {[[-0.55,0.58,0],[0.55,0.58,0]].map(([x,y,z],i)=>(<group key={i} position={[x,y,z]}><mesh><torusGeometry args={[0.18,0.028,8,24]} />{frameMat}</mesh><group ref={thrusterRefs[i]}>{[0,1,2].map((b)=>(<mesh key={b} rotation={[0,(b*Math.PI*2)/3,0]}><boxGeometry args={[0.28,0.025,0.06]} /><meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} /></mesh>))}</group></group>))}
    {[[0.9,-0.1,0.38],[0.9,-0.1,-0.38]].map(([x,y,z],i)=>(<group key={i} position={[x,y,z]} rotation={[Math.PI/2,0,0]}><mesh><torusGeometry args={[0.15,0.024,8,24]} />{frameMat}</mesh><group ref={thrusterRefs[i+2]}>{[0,1,2].map((b)=>(<mesh key={b} rotation={[0,(b*Math.PI*2)/3,0]}><boxGeometry args={[0.22,0.022,0.055]} /><meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} /></mesh>))}</group></group>))}
    {[0.22,-0.22].map((z,i)=>(<group key={i} position={[0.96,0.1,z]}><mesh><sphereGeometry args={[0.055,10,10]} />{glowMat}</mesh></group>))}
    <pointLight ref={lightFRef} position={[1.3,0.1,0]} color="#38bdf8" intensity={3.5} distance={8} />
    <mesh position={[-0.96,0.1,0]}><sphereGeometry args={[0.04,8,8]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} /></mesh>
    <pointLight ref={lightBRef} position={[-1.2,0.1,0]} color="#22c55e" intensity={0.3} distance={1.5} />
    <group ref={scanRef} position={[0.7,0.1,0]}><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.32,0.01,4,40]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.55} depthWrite={false} /></mesh></group>
    <mesh position={[1.0,-0.18,0]} rotation={[0,0,-Math.PI/8]}><boxGeometry args={[0.28,0.05,0.05]} /><meshStandardMaterial color="#1a3a5c" roughness={0.4} metalness={0.7} /></mesh>
    <mesh position={[1.18,-0.3,0.06]} rotation={[0,0,-Math.PI/4]}><boxGeometry args={[0.18,0.04,0.04]} />{frameMat}</mesh>
    <mesh position={[1.18,-0.3,-0.06]} rotation={[0,0,-Math.PI/4]}><boxGeometry args={[0.18,0.04,0.04]} />{frameMat}</mesh>
    <mesh position={[0,-0.54,0.2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.03,0.03,0.45,8]} />{darkMat}</mesh>
  </group>)
}
function AUV() {
  const auvRef=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(auvRef.current){
      const ox=Math.sin(t*0.22+Math.PI)*4.8, oy=Math.sin(t*0.14)*1.5+2.8, oz=Math.cos(t*0.26+Math.PI)*3.0
      auvRef.current.position.set(ox,oy,oz)
      auvRef.current.rotation.z=Math.sin(t*0.22)*0.15
      auvRef.current.rotation.x=Math.cos(t*0.14)*0.08
      auvRef.current.rotation.y=-Math.atan2(oz,ox)+Math.PI*0.5
    }
  })
  return (<group ref={auvRef} scale={0.48}><AUVModel /></group>)
}
function HeroParticles() {
  const mesh=useRef(), count=150
  const [positions,phases]=useMemo(()=>{
    const pos=new Float32Array(count*3), ph=[]
    for(let i=0;i<count;i++){
      const radius=2.5+Math.random()*6, theta=Math.random()*Math.PI*2, phi=Math.acos(2*Math.random()-1)
      pos[i*3]=radius*Math.sin(phi)*Math.cos(theta); pos[i*3+1]=radius*Math.sin(phi)*Math.sin(theta); pos[i*3+2]=radius*Math.cos(phi)
      ph.push(Math.random()*Math.PI*2)
    }
    return [pos,ph]
  },[])
  useFrame(({clock})=>{
    if(!mesh.current) return
    const t=clock.getElapsedTime(), attr=mesh.current.geometry.attributes.position
    for(let i=0;i<count;i++){
      const s=1+Math.sin(t*0.4+phases[i])*0.07
      attr.array[i*3]=positions[i*3]*s; attr.array[i*3+1]=positions[i*3+1]*s+Math.sin(t*0.3+phases[i])*0.04; attr.array[i*3+2]=positions[i*3+2]*s
    }
    attr.needsUpdate=true
  })
  return (<points ref={mesh}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]} /></bufferGeometry><pointsMaterial color="#bae6fd" size={0.055} transparent opacity={0.5} depthWrite={false} /></points>)
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
      <color attach="background" args={["#01070f"]} />
      <ambientLight intensity={0.15} color="#7dd3fc" />
      <pointLight position={[0,0,6]} intensity={1.5} color="#38bdf8" />
      <pointLight position={[0,-4,4]} intensity={2.5} color="#38bdf8" distance={20} decay={2} />
      <Stars radius={80} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <MouseTracker><EarthGlobe /><GyroRings /></MouseTracker>
      <Submarine /><AUV /><HeroParticles />
    </Canvas>
  )
}

// ─────────────────────────────────────────────────────────
//  DIVIDER SCENE
// ─────────────────────────────────────────────────────────
function DataNode({position,phase}) {
  const ref=useRef()
  useFrame(({clock})=>{const t=clock.getElapsedTime(); if(ref.current){ref.current.material.opacity=0.5+Math.sin(t*1.5+phase)*0.3; const s=0.85+Math.sin(t*1.5+phase)*0.18; ref.current.scale.set(s,s,s)}})
  return (<mesh ref={ref} position={position}><octahedronGeometry args={[0.12,0]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.7} depthWrite={false} /></mesh>)
}
function RingMeshD({radius,tube,tilt,color,opacity,speed}) {
  const ref=useRef()
  useFrame(({clock})=>{const t=clock.getElapsedTime(); if(ref.current){ref.current.rotation.z=t*speed; ref.current.material.opacity=opacity+Math.sin(t*0.7+radius)*(opacity*0.25)}})
  return (<mesh ref={ref} rotation={tilt}><torusGeometry args={[radius,tube,3,200]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} /></mesh>)
}
function CentralCore() {
  const ref=useRef(), wire=useRef()
  useFrame(({clock})=>{const t=clock.getElapsedTime(), p=Math.sin(t*0.9)*0.5+0.5; if(ref.current){const s=1+p*0.1; ref.current.scale.set(s,s,s); ref.current.material.opacity=0.08+p*0.07} if(wire.current){wire.current.rotation.y=t*0.1; wire.current.material.opacity=0.15+p*0.08}})
  return (<><mesh ref={ref}><sphereGeometry args={[0.7,32,32]} /><meshBasicMaterial color="#38bdf8" transparent opacity={0.08} depthWrite={false} /></mesh><mesh ref={wire}><sphereGeometry args={[0.72,14,14]} /><meshBasicMaterial color="#7dd3fc" wireframe transparent opacity={0.15} depthWrite={false} /></mesh></>)
}
function DividerRings() {
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
      onPointerDown={(e)=>{isDragging.current=true; lastX.current=e.clientX; document.body.style.cursor="grabbing"}}
      onPointerUp={()=>{isDragging.current=false; document.body.style.cursor="grab"}}
      onPointerLeave={()=>{isDragging.current=false; document.body.style.cursor="auto"}}
      onPointerMove={(e)=>{if(!isDragging.current)return; const dx=e.clientX-lastX.current; lastX.current=e.clientX; const d=dx*0.006; targetY.current+=d; velocity.current=d}}
      onPointerOver={()=>{document.body.style.cursor="grab"}}
      onPointerOut={()=>{document.body.style.cursor="auto"}}
    >
      {[{radius:1.2,tube:0.04,tilt:[0,0,0],color:"#38bdf8",opacity:0.75,speed:0.4},{radius:2.0,tube:0.028,tilt:[Math.PI/2.2,0,0],color:"#7dd3fc",opacity:0.55,speed:0.28},{radius:2.8,tube:0.02,tilt:[Math.PI/5,Math.PI/6,0],color:"#38bdf8",opacity:0.4,speed:0.18},{radius:3.6,tube:0.015,tilt:[Math.PI/3,0,Math.PI/7],color:"#bae6fd",opacity:0.28,speed:0.13},{radius:4.3,tube:0.011,tilt:[Math.PI/4,Math.PI/3,0],color:"#38bdf8",opacity:0.2,speed:0.09},{radius:5.0,tube:0.008,tilt:[Math.PI/6,Math.PI/5,Math.PI/8],color:"#7dd3fc",opacity:0.14,speed:0.07},{radius:5.7,tube:0.006,tilt:[0,Math.PI/4,Math.PI/5],color:"#38bdf8",opacity:0.09,speed:0.05}].map((r,i)=><RingMeshD key={i} {...r} />)}
      <CentralCore />
      <group ref={dotsGroup}>{dots.map((pos,i)=><DataNode key={i} position={pos} phase={i*0.8} />)}</group>
    </group>
  )
}
function DividerScene() {
  return (<Canvas camera={{position:[0,0,8],fov:52}} style={{width:"100%",height:"100%"}} gl={{antialias:true}}><color attach="background" args={["#020c1b"]} /><DividerRings /></Canvas>)
}

// ─────────────────────────────────────────────────────────
//  STATS 3D SCENE
// ─────────────────────────────────────────────────────────
function StatOrbInstance({position,color,hovered}) {
  const r1=useRef(), r2=useRef(), core=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime(), boost=hovered?2.2:1
    if(r1.current){r1.current.rotation.x=t*0.5*boost; r1.current.material.opacity=(hovered?0.75:0.45)+Math.sin(t*1.2)*0.1}
    if(r2.current){r2.current.rotation.z=t*0.35*boost; r2.current.material.opacity=(hovered?0.5:0.28)+Math.sin(t*0.9)*0.08}
    if(core.current){const s=hovered?1+Math.sin(t*2)*0.07:1; core.current.scale.set(s,s,s); core.current.material.opacity=hovered?0.22:0.08}
  })
  return (<group position={position}>
    <mesh ref={r1}><torusGeometry args={[0.85,0.018,3,100]} /><meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} /></mesh>
    <mesh ref={r2} rotation={[Math.PI/2.5,0,Math.PI/6]}><torusGeometry args={[1.05,0.012,3,100]} /><meshBasicMaterial color="#7dd3fc" transparent opacity={0.28} depthWrite={false} /></mesh>
    <mesh ref={core}><sphereGeometry args={[0.42,18,18]} /><meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} /></mesh>
    <mesh><sphereGeometry args={[0.43,10,10]} /><meshBasicMaterial color={color} wireframe transparent opacity={hovered?0.22:0.08} depthWrite={false} /></mesh>
  </group>)
}
const STAT_COLORS=["#38bdf8","#7dd3fc","#bae6fd","#38bdf8"]
const STAT_POSITIONS=[[-4.5,0,0],[-1.5,0,0],[1.5,0,0],[4.5,0,0]]
function StatsScene({hoveredIdx}) {
  return (<Canvas camera={{position:[0,0,5.5],fov:70}} style={{width:"100%",height:"100%",position:"absolute",inset:0}} gl={{antialias:true,alpha:true}}>
    {STAT_POSITIONS.map((pos,i)=>(<StatOrbInstance key={i} position={pos} color={STAT_COLORS[i]} hovered={hoveredIdx===i} />))}
  </Canvas>)
}

// ─────────────────────────────────────────────────────────
//  TROPHY ORB
// ─────────────────────────────────────────────────────────
function TrophyOrbSingle({color,position}) {
  const r1=useRef(), r2=useRef(), dot=useRef()
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(r1.current){r1.current.rotation.y=t*0.5; r1.current.material.opacity=0.7+Math.sin(t*1.5)*0.1}
    if(r2.current){r2.current.rotation.x=t*0.35; r2.current.material.opacity=0.45+Math.sin(t*1.1)*0.08}
    if(dot.current){const s=1+Math.sin(t*2)*0.12; dot.current.scale.set(s,s,s)}
  })
  return (<group position={position}>
    <mesh ref={r1}><torusGeometry args={[0.7,0.04,3,80]} /><meshBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} /></mesh>
    <mesh ref={r2} rotation={[Math.PI/2.2,0,0]}><torusGeometry args={[0.7,0.025,3,80]} /><meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} /></mesh>
    <mesh ref={dot}><sphereGeometry args={[0.16,14,14]} /><meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} /></mesh>
  </group>)
}

// ─────────────────────────────────────────────────────────
//  UI PRIMITIVES
// ─────────────────────────────────────────────────────────

// Section label
function SLabel({n, title}) {
  return (
    <motion.div initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
      style={{display:"flex",alignItems:"center",gap:14,marginBottom:48}}>
      <div style={{width:38,height:38,border:"1px solid rgba(56,189,248,0.6)",background:"rgba(4,16,40,0.9)",boxShadow:"0 0 12px rgba(56,189,248,0.12)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:"#38bdf8",letterSpacing:"0.1em"}}>{String(n).padStart(2,"0")}</span>
      </div>
      <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.78rem",letterSpacing:"0.22em",color:"#cbd5e1",textTransform:"uppercase",fontWeight:700}}>{title}</span>
      <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(56,189,248,0.35),transparent)"}} />
    </motion.div>
  )
}

// Text block wrapper
function TextBlock({children}) {
  return (
    <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}}
      style={{padding:"44px 52px",borderRadius:8,background:"rgba(5,16,40,0.92)",border:"1px solid rgba(56,189,248,0.28)",boxShadow:"0 4px 28px rgba(0,0,0,0.6),inset 0 0 40px rgba(56,189,248,0.02)",backdropFilter:"blur(18px)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,width:64,height:1,background:"rgba(56,189,248,0.45)"}} />
      <div style={{position:"absolute",top:0,left:0,width:1,height:64,background:"rgba(56,189,248,0.45)"}} />
      <div style={{position:"absolute",bottom:0,right:0,width:64,height:1,background:"rgba(56,189,248,0.2)"}} />
      <div style={{position:"absolute",bottom:0,right:0,width:1,height:64,background:"rgba(56,189,248,0.2)"}} />
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
//  SECTION COMPONENTS
// ─────────────────────────────────────────────────────────

// Telemetry — full-width 4-col grid, tall cards
function TelemetrySection({hoveredStat, setHoveredStat}) {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={1} title="Telemetry" />
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",inset:0,height:200,pointerEvents:"none",opacity:0.32}}>
          <StatsScene hoveredIdx={hoveredStat} />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,position:"relative",zIndex:1}}>
          {STATS.map((stat,i)=>(
            <motion.div key={stat.label}
              initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              transition={{delay:i*0.09,duration:0.55,ease:[0.22,1,0.36,1]}}
              onHoverStart={()=>setHoveredStat(i)} onHoverEnd={()=>setHoveredStat(null)}
              whileHover={{scale:1.03}}
              style={{
                height:200,padding:"36px 24px 28px",borderRadius:8,
                background:hoveredStat===i?"rgba(4,20,50,0.98)":"rgba(4,16,40,0.92)",
                border:`1px solid ${hoveredStat===i?"rgba(56,189,248,0.7)":"rgba(56,189,248,0.35)"}`,
                boxShadow:hoveredStat===i?"0 0 32px rgba(56,189,248,0.12),inset 0 0 20px rgba(56,189,248,0.05)":"0 4px 24px rgba(0,0,0,0.55),inset 0 0 12px rgba(56,189,248,0.02)",
                backdropFilter:"blur(10px)",textAlign:"center",transition:"border-color 0.3s,background 0.3s",cursor:"default",
              }}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"3.6rem",fontWeight:700,color:"#f0f9ff",letterSpacing:"-0.03em",lineHeight:1}}>{stat.value}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.68rem",color:"#38bdf8",letterSpacing:"0.2em",marginTop:8,textTransform:"uppercase"}}>{stat.unit}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.55rem",letterSpacing:"0.2em",color:"#4a6a8a",textTransform:"uppercase",marginTop:10}}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// About — two-column layout: text left, key facts right
function AboutSection() {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={2} title="About" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,alignItems:"stretch"}}>
        <TextBlock>
          <p style={{fontSize:"1.1rem",lineHeight:1.92,color:"#8fa8c8",fontWeight:300}}>
            DTU-AUV is an interdisciplinary undergraduate team working under the guidance of{" "}
            <span style={{color:"#e2e8f0",fontWeight:600}}>Prof. K.C. Tiwari</span>. The team designs and develops{" "}
            <span style={{color:"#e2e8f0",fontWeight:600}}>Autonomous Underwater Vehicles and Remotely Operated Vehicles</span> for demanding national and international competitions.
          </p>
          <p style={{marginTop:22,fontSize:"1.1rem",lineHeight:1.92,color:"#8fa8c8",fontWeight:300}}>
            The mission is to push the boundaries of underwater robotics through strong engineering fundamentals, intelligent autonomy, and purposeful design — building platforms that move toward{" "}
            <span style={{color:"#38bdf8",fontWeight:500}}>industrial-grade performance and reliability</span>.
          </p>
        </TextBlock>
        {/* Quick facts sidebar */}
        <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6,delay:0.15,ease:[0.22,1,0.36,1]}}
          style={{padding:"36px 30px",borderRadius:8,background:"rgba(4,16,40,0.92)",border:"1px solid rgba(56,189,248,0.28)",boxShadow:"0 4px 28px rgba(0,0,0,0.6)",backdropFilter:"blur(18px)",display:"flex",flexDirection:"column",gap:28}}>
          {[{label:"Founded",value:"2018"},{label:"Institution",value:"DTU"},{label:"City",value:"New Delhi"},{label:"Advisor",value:"Prof. K.C. Tiwari"}].map((f,i)=>(
            <div key={i} style={{borderBottom:"1px solid rgba(56,189,248,0.1)",paddingBottom:20,lastChild:{border:"none"}}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.52rem",letterSpacing:"0.22em",color:"#38bdf8",textTransform:"uppercase",marginBottom:6}}>{f.label}</div>
              <div style={{color:"#e2e8f0",fontSize:"0.95rem",fontWeight:600}}>{f.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Departments — 3-col grid then 2-col for last two
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

function DeptCard({role,name,description,i}) {
  const [hovered,setHovered]=useState(false)
  return (
    <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
      transition={{delay:i*0.07,duration:0.5,ease:[0.22,1,0.36,1]}}
      onHoverStart={()=>setHovered(true)} onHoverEnd={()=>setHovered(false)}
      animate={{y:hovered?-4:0}}
      style={{padding:"30px 28px",borderRadius:8,background:hovered?"rgba(6,22,52,0.98)":"rgba(5,16,40,0.9)",border:`1px solid ${hovered?"rgba(56,189,248,0.5)":"rgba(56,189,248,0.22)"}`,boxShadow:hovered?"0 8px 32px rgba(0,0,0,0.6),0 0 20px rgba(56,189,248,0.08)":"0 4px 20px rgba(0,0,0,0.55)",backdropFilter:"blur(14px)",position:"relative",overflow:"hidden",transition:"border-color 0.25s,background 0.25s"}}>
      <div style={{position:"absolute",top:0,right:0,width:24,height:1,background:"rgba(56,189,248,0.45)"}} />
      <div style={{position:"absolute",top:0,right:0,width:1,height:24,background:"rgba(56,189,248,0.45)"}} />
      <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:"#38bdf8",boxShadow:"0 0 8px #38bdf8"}} />
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.2em",color:"#38bdf8",fontWeight:700,textTransform:"uppercase"}}>{role}</span>
      </div>
      <div style={{color:"#e2e8f0",fontSize:"1rem",fontWeight:600,marginBottom:14,lineHeight:1.45}}>{name}</div>
      <p style={{color:"#8fa8c8",fontSize:"0.88rem",lineHeight:1.82,fontWeight:400}}>{description}</p>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${hovered?"rgba(56,189,248,0.45)":"rgba(56,189,248,0.12)"},transparent)`,transition:"background 0.25s"}} />
    </motion.div>
  )
}

// Podium — full-width rows with wider layout
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

function AchRow({rank,event,comp,color,i}) {
  const [hovered,setHovered]=useState(false)
  return (
    <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
      transition={{delay:i*0.1,duration:0.5,ease:[0.22,1,0.36,1]}}
      onHoverStart={()=>setHovered(true)} onHoverEnd={()=>setHovered(false)}
      animate={{x:hovered?6:0}}
      style={{display:"flex",alignItems:"center",gap:24,padding:"22px 28px",borderRadius:8,background:hovered?"rgba(6,22,52,0.98)":"rgba(5,16,40,0.9)",border:`1px solid ${hovered?color+"88":"rgba(56,189,248,0.22)"}`,borderLeft:`3px solid ${color}`,boxShadow:hovered?`0 8px 32px rgba(0,0,0,0.6),0 0 20px ${color}14`:"0 4px 20px rgba(0,0,0,0.55)",backdropFilter:"blur(12px)",transition:"background 0.25s,border-color 0.25s"}}>
      <div style={{width:88,height:88,flexShrink:0}}>
        <Canvas camera={{position:[0,0,3.2],fov:38}} style={{width:"100%",height:"100%"}} gl={{alpha:true,antialias:false}}>
          <TrophyOrbSingle color={color} position={[0,0,0]} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"inline-block",padding:"4px 12px",borderRadius:3,background:color+"18",border:`1px solid ${color}44`,marginBottom:10}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:color,letterSpacing:"0.14em",fontWeight:700}}>{rank}</span>
        </div>
        <div style={{color:"#f1f5f9",fontSize:"1.1rem",fontWeight:600,marginBottom:7,lineHeight:1.3}}>{event}</div>
        <div style={{color:"#64748b",fontSize:"0.8rem",fontFamily:"'Space Mono',monospace",letterSpacing:"0.05em"}}>{comp}</div>
      </div>
      {/* Year tag */}
      <div style={{flexShrink:0,textAlign:"right"}}>
        <div style={{width:9,height:9,borderRadius:"50%",background:color,boxShadow:`0 0 10px ${color},0 0 24px ${color}55`,marginLeft:"auto"}} />
      </div>
    </motion.div>
  )
}

// Latest Development + Research — side by side
function DevResearchSection() {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={5} title="Latest Development" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <TextBlock>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.28em",color:"#38bdf8",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#38bdf8",boxShadow:"0 0 8px #38bdf8"}} />
            VARUNA 4.0
          </div>
          <p style={{fontSize:"1rem",lineHeight:1.9,color:"#8fa8c8",fontWeight:300}}>
            Varuna 4.0 is a <span style={{color:"#e2e8f0",fontWeight:600}}>Remotely Operated Underwater Vehicle</span> built for the multi-stage challenges of AMUROVc 4.0.
          </p>
          <p style={{marginTop:16,fontSize:"1rem",lineHeight:1.9,color:"#8fa8c8",fontWeight:300}}>
            Built around a durable mechanical architecture and sensor-driven control strategy, Varuna 4.0 handles endurance navigation, low-light color-guided movement, and QR-based pickup-and-placement tasks with consistent mission reliability.
          </p>
        </TextBlock>
        {/* Research stacked in right column */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.22em",color:"#cbd5e1",textTransform:"uppercase",fontWeight:700,marginBottom:4,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:24,height:1,background:"rgba(56,189,248,0.4)"}} />
            Research Publications
          </div>
          {PUBLICATIONS.map((p,i)=><ResearchCard key={p.name} {...p} i={i} />)}
        </div>
      </div>
    </section>
  )
}

function ResearchCard({role,name,description,i}) {
  const [hovered,setHovered]=useState(false)
  return (
    <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
      transition={{delay:i*0.1,duration:0.5,ease:[0.22,1,0.36,1]}}
      onHoverStart={()=>setHovered(true)} onHoverEnd={()=>setHovered(false)}
      animate={{y:hovered?-3:0}}
      style={{flex:1,padding:"28px 26px",borderRadius:8,background:hovered?"rgba(6,22,52,0.98)":"rgba(5,16,40,0.9)",border:`1px solid ${hovered?"rgba(56,189,248,0.5)":"rgba(56,189,248,0.22)"}`,boxShadow:hovered?"0 8px 32px rgba(0,0,0,0.6)":"0 4px 20px rgba(0,0,0,0.55)",backdropFilter:"blur(14px)",position:"relative",overflow:"hidden",transition:"border-color 0.25s,background 0.25s"}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.2em",color:"#38bdf8",fontWeight:700,marginBottom:10}}>{role}</div>
      <div style={{color:"#e2e8f0",fontSize:"0.95rem",fontWeight:600,marginBottom:12,lineHeight:1.5}}>{name}</div>
      <p style={{color:"#8fa8c8",fontSize:"0.85rem",lineHeight:1.8}}>{description}</p>
    </motion.div>
  )
}

// Crew — masonry-style full-width wrap
function CrewSection() {
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={6} title="Crew" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {MEMBERS.map((m,i)=>(
          <motion.div key={m}
            initial={{opacity:0,scale:0.92}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
            transition={{delay:i*0.03,duration:0.35}}
            whileHover={{borderColor:"rgba(56,189,248,0.55)",color:"#7dd3fc",y:-2,background:"rgba(6,22,52,0.98)"}}
            style={{padding:"16px 20px",borderRadius:6,border:"1px solid rgba(56,189,248,0.28)",background:"rgba(4,16,40,0.85)",color:"#b0c8e0",fontSize:"0.78rem",letterSpacing:"0.05em",fontFamily:"'Space Mono',monospace",boxShadow:"0 2px 12px rgba(0,0,0,0.45)",transition:"border-color 0.2s,color 0.2s,background 0.2s",cursor:"default",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:"rgba(56,189,248,0.5)",flexShrink:0}} />
            {m}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// Gallery — 3-col
function GallerySection() {
  const [lightboxIdx,setLightboxIdx]=useState(null)
  return (
    <section style={{marginBottom:120}}>
      <SLabel n={7} title="Gallery" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {GALLERY_IMAGES.map((img,i)=>(
          <motion.div key={i}
            initial={{opacity:0,scale:0.96}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
            transition={{delay:i*0.07,duration:0.5,ease:[0.22,1,0.36,1]}}
            whileHover={{scale:1.02}} onClick={()=>setLightboxIdx(i)}
            style={{position:"relative",borderRadius:8,overflow:"hidden",cursor:"zoom-in",aspectRatio:"4/3",border:"1px solid rgba(56,189,248,0.28)",boxShadow:"0 4px 20px rgba(0,0,0,0.6)"}}>
            <img src={img.url} alt={img.caption}
              style={{width:"100%",height:"100%",objectFit:"cover",display:"block",filter:"brightness(0.55) contrast(1.1) saturate(0.65)",transition:"filter 0.3s"}}
              onMouseEnter={e=>{e.currentTarget.style.filter="brightness(0.78) contrast(1.1) saturate(0.85)"}}
              onMouseLeave={e=>{e.currentTarget.style.filter="brightness(0.55) contrast(1.1) saturate(0.65)"}}
            />
            {[{top:8,left:8},{top:8,right:8},{bottom:8,left:8},{bottom:8,right:8}].map((pos,j)=>(
              <div key={j} style={{position:"absolute",...pos,width:14,height:14,borderTop:pos.bottom!==undefined?"none":"1px solid rgba(56,189,248,0.65)",borderBottom:pos.top!==undefined?"none":"1px solid rgba(56,189,248,0.65)",borderLeft:pos.right!==undefined?"none":"1px solid rgba(56,189,248,0.65)",borderRight:pos.left!==undefined?"none":"1px solid rgba(56,189,248,0.65)"}} />
            ))}
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"28px 16px 14px",background:"linear-gradient(transparent,rgba(1,7,15,0.94))"}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"#7dd3fc",letterSpacing:"0.12em"}}>{img.caption}</div>
            </div>
            <div style={{position:"absolute",top:10,left:10,fontFamily:"'Space Mono',monospace",fontSize:"0.5rem",color:"rgba(56,189,248,0.65)",letterSpacing:"0.1em"}}>{String(i+1).padStart(2,"0")}</div>
          </motion.div>
        ))}
      </div>
      <p style={{fontFamily:"'Space Mono',monospace",fontSize:"0.5rem",color:"#2a4a6a",letterSpacing:"0.2em",marginTop:12,textAlign:"right"}}>CLICK IMAGE TO EXPAND</p>
      {lightboxIdx!==null&&<GalleryLightbox images={GALLERY_IMAGES} activeIdx={lightboxIdx} onClose={()=>setLightboxIdx(null)} />}
    </section>
  )
}

function GalleryLightbox({images,activeIdx,onClose}) {
  useEffect(()=>{ const h=e=>{if(e.key==="Escape") onClose()}; window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h) },[onClose])
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
        style={{position:"fixed",inset:0,zIndex:500,background:"rgba(1,7,15,0.95)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
        <motion.div initial={{scale:0.88,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.88,opacity:0}}
          transition={{duration:0.35,ease:[0.22,1,0.36,1]}} onClick={e=>e.stopPropagation()}
          style={{position:"relative",maxWidth:"82vw",maxHeight:"82vh",border:"1px solid rgba(56,189,248,0.45)",boxShadow:"0 24px 80px rgba(0,0,0,0.85),0 0 40px rgba(56,189,248,0.12)",borderRadius:8,overflow:"hidden"}}>
          <img src={images[activeIdx].url} alt={images[activeIdx].caption} style={{display:"block",width:"100%",height:"100%",objectFit:"cover"}} />
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 24px 20px",background:"linear-gradient(transparent,rgba(1,7,15,0.96))"}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.7rem",color:"#7dd3fc",letterSpacing:"0.14em"}}>{images[activeIdx].caption}</span>
          </div>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(2,12,27,0.88)",border:"1px solid rgba(56,189,248,0.4)",borderRadius:4,color:"#38bdf8",fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",padding:"7px 14px",cursor:"pointer",letterSpacing:"0.12em"}}>ESC</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Toolchain — full-width dense wrap
function ToolchainSection() {
  return (
    <section style={{marginBottom:80}}>
      <SLabel n={8} title="Toolchain" />
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
        {TOOLCHAIN.map((item,i)=>(
          <motion.div key={item}
            initial={{opacity:0,scale:0.9}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
            transition={{delay:i*0.04}}
            whileHover={{borderColor:"rgba(56,189,248,0.55)",color:"#7dd3fc",background:"rgba(6,22,52,0.98)"}}
            style={{padding:"12px 24px",borderRadius:4,border:"1px solid rgba(56,189,248,0.28)",background:"rgba(4,16,40,0.85)",color:"#7a9bbf",fontSize:"0.68rem",letterSpacing:"0.16em",fontFamily:"'Space Mono',monospace",textTransform:"uppercase",boxShadow:"0 2px 12px rgba(0,0,0,0.45)",cursor:"default",transition:"border-color 0.2s,color 0.2s,background 0.2s"}}>
            {item}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function TeamAUV() {
  const navigate=useNavigate()
  const heroRef=useRef()
  const [hoveredStat,setHoveredStat]=useState(null)
  const {scrollYProgress}=useScroll({target:heroRef,offset:["start start","end start"]})
  const heroY=useTransform(scrollYProgress,[0,1],[0,50])
  const heroOpacity=useTransform(scrollYProgress,[0,0.65],[1,0])
  const sceneScale=useTransform(scrollYProgress,[0,1],[1,0.88])

  return (
    <div style={{background:"#020c1b",color:"#e2e8f0",minHeight:"100vh",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.25);border-radius:99px}
      `}</style>

      <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
        onClick={()=>navigate("/")} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
        style={{position:"fixed",top:22,left:22,zIndex:200,padding:"9px 18px",background:"rgba(2,12,27,0.9)",border:"1px solid rgba(56,189,248,0.4)",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",borderRadius:4,color:"#7dd3fc",fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",letterSpacing:"0.14em",cursor:"pointer",backdropFilter:"blur(14px)"}}>
        ← BACK
      </motion.button>

      {/* ════ HERO ════ */}
      <section ref={heroRef} style={{position:"relative",height:"100vh",overflow:"hidden"}}>
        <motion.div style={{position:"absolute",inset:0,scale:sceneScale}}><HeroScene /></motion.div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}}
          style={{position:"absolute",top:24,right:24,zIndex:12,fontFamily:"'Space Mono',monospace",fontSize:"0.48rem",letterSpacing:"0.22em",color:"#1e3a5f",textTransform:"uppercase"}}>
          MOVE CURSOR · GLOBE RESPONDS
        </motion.div>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,rgba(2,12,27,0) 0%,rgba(2,12,27,0.3) 70%,rgba(2,12,27,0.65) 100%)"}} />
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(180deg,rgba(2,12,27,0) 0%,rgba(2,12,27,0.35) 45%,rgba(2,12,27,0.75) 100%)"}} />
        <motion.div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",y:heroY,opacity:heroOpacity,zIndex:11,pointerEvents:"none"}}>
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.35,duration:0.75,ease:[0.22,1,0.36,1]}}
            style={{fontFamily:"'Space Mono',monospace",fontSize:"0.58rem",letterSpacing:"0.32em",color:"#7dd3fc",opacity:0.85,marginBottom:26,display:"flex",alignItems:"center",gap:14,textAlign:"center"}}>
            <span style={{display:"inline-block",width:32,height:1,background:"rgba(56,189,248,0.4)"}} />
            DTU · UNDERWATER ROBOTICS · NEW DELHI
            <span style={{display:"inline-block",width:32,height:1,background:"rgba(56,189,248,0.4)"}} />
          </motion.div>
          <motion.h1 initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.85,ease:[0.22,1,0.36,1]}}
            style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(3rem,8.5vw,8rem)",fontWeight:700,letterSpacing:"-0.03em",lineHeight:0.92,textAlign:"center",color:"#f8fafc",textShadow:"0 6px 30px rgba(2,12,27,0.65)"}}>
            TEAM<br /><span style={{color:"#7dd3fc",textShadow:"0 8px 32px rgba(2,12,27,0.7)"}}>DTU-AUV</span>
          </motion.h1>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9,duration:0.8}}
            style={{marginTop:26,fontFamily:"'Space Mono',monospace",fontSize:"0.68rem",letterSpacing:"0.22em",color:"#e2e8f0",textTransform:"uppercase",textAlign:"center",maxWidth:680,padding:"0 20px",textShadow:"0 6px 24px rgba(2,12,27,0.65)"}}>
            Building autonomous and remotely operated underwater systems that are competition-ready and industry-aware
          </motion.p>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.3}} style={{position:"absolute",bottom:38}}>
            <motion.div animate={{scaleY:[1,0.25,1]}} transition={{duration:2.2,repeat:Infinity,ease:"easeInOut"}}
              style={{width:1,height:42,background:"linear-gradient(to bottom,rgba(56,189,248,0.45),transparent)",transformOrigin:"top",margin:"0 auto"}} />
          </motion.div>
        </motion.div>
      </section>

      {/* ════ CONTENT — full bleed with generous padding ════ */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"110px 48px 80px"}}>

        <TelemetrySection hoveredStat={hoveredStat} setHoveredStat={setHoveredStat} />
        <AboutSection />
        <DepartmentsSection />
        <PodiumSection />

        {/* Divider */}
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
          style={{height:400,marginBottom:120,position:"relative",borderRadius:8,overflow:"hidden"}}>
          <DividerScene />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,#020c1b 0%,transparent 10%,transparent 90%,#020c1b 100%)",pointerEvents:"none"}} />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,#020c1b 0%,transparent 18%,transparent 82%,#020c1b 100%)",pointerEvents:"none"}} />
          <div style={{position:"absolute",bottom:22,left:0,right:0,display:"flex",justifyContent:"center",pointerEvents:"none"}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:"0.5rem",letterSpacing:"0.35em",color:"#1e3a5f",textTransform:"uppercase"}}>DRAG TO ROTATE</span>
          </div>
        </motion.div>

        <DevResearchSection />
        <CrewSection />
        <GallerySection />
        <ToolchainSection />

      </div>
    </div>
  )
}