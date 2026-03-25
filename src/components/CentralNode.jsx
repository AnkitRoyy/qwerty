import { useTexture } from '@react-three/drei'
import dtuLogo from '../assets/dtu-logo.png'

export default function CentralNode() {
  const texture = useTexture(dtuLogo)

  const aspect =
    texture.image
      ? texture.image.width / texture.image.height
      : 1

  const height = 1.5
  const width = height * aspect

  return (
    <mesh position={[0, -1.2  , -0.8]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  )
}