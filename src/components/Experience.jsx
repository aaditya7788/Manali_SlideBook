import { Environment, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GradientBackground() {
  const { scene } = useThree();
  const colorTop = new THREE.Color("#a1c4fd"); // light blue
  const colorBottom = new THREE.Color("#c2e9fb"); // softer blue

  const skyGeo = new THREE.SphereGeometry(100, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: colorTop },
      bottomColor: { value: colorBottom },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(skyGeo, skyMat);
  scene.background = null;
  scene.add(mesh);
  return null;
}

function Snowfall({ count = 500 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: THREE.MathUtils.randFloatSpread(20),
        y: Math.random() * 10,
        z: THREE.MathUtils.randFloatSpread(20),
        speed: Math.random() * 0.01 + 0.005,
      })),
    [count]
  );

  useFrame(() => {
    positions.forEach((p, i) => {
      p.y -= p.speed;
      if (p.y < -1) p.y = 10;
      dummy.position.set(p.x, p.y, p.z);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
}

import { useThree } from "@react-three/fiber";

export const Experience = () => {
  return (
    <>
      <GradientBackground />
      <Snowfall />

      <Book />

      <OrbitControls />
      <Environment preset="studio" />

      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
