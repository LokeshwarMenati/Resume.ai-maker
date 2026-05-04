import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function DocsCluster({ mouse }) {
  const group = useRef(null);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#6366f1"),
        roughness: 0.35,
        metalness: 0.22,
        emissive: new THREE.Color("#8b5cf6"),
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0.86,
      }),
    []
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += dt * 0.11;
    g.rotation.x += dt * 0.03;

    const tx = mouse.current.x * 1.35;
    const ty = mouse.current.y * 0.95;
    g.position.x = THREE.MathUtils.lerp(g.position.x, tx, 0.06);
    g.position.y = THREE.MathUtils.lerp(g.position.y, ty, 0.06);
  });

  return (
    <group ref={group}>
      <Float speed={1.35} rotationIntensity={0.55} floatIntensity={0.85}>
        <mesh material={mat} position={[-3.7, 0.45, -1.1]} rotation={[0.55, 0.45, 0.2]}>
          <icosahedronGeometry args={[1.22, 0]} />
        </mesh>
      </Float>
      <Float speed={1.05} rotationIntensity={0.45} floatIntensity={0.75}>
        <mesh material={mat} position={[3.35, -0.55, -1.75]} rotation={[0.15, -0.35, -0.15]} scale={[1.9, 1.15, 1.9]}>
          <torusGeometry args={[0.8, 0.3, 18, 64]} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.65} floatIntensity={0.95}>
        <mesh material={mat} position={[1.45, -0.1, -0.55]} rotation={[Math.PI / 7, Math.PI / 10, Math.PI / 6]}>
          <coneGeometry args={[1.05, 1.75, 4]} />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene3D({ mouse }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45, near: 0.1, far: 55 }}
        dpr={[1, 1.45]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[10, 14, 12]} intensity={1.05} />
        <pointLight position={[-14, -10, 6]} intensity={0.55} color="#f472b6" />
        <DocsCluster mouse={mouse} />
      </Canvas>
    </div>
  );
}
