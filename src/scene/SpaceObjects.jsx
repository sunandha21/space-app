import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function Stars({ count = 3500 }) {
  const points = useRef();

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = 250 + Math.random() * 900;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      c.setHSL(0.55 + Math.random() * 0.1, 0.45, 0.72 + Math.random() * 0.2);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return { positions, colors };
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.elapsedTime * 0.005;
    points.current.rotation.x = Math.sin(clock.elapsedTime * 0.07) * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.6}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}

export function Planet({
  position = [0, 0, 0],
  radius = 4,
  colorA = "#7e90ff",
  colorB = "#b4c5ff",
  speed = 0.12
}) {
  const body = useRef();
  const ring = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (body.current) {
      body.current.rotation.y = t * speed;
      body.current.rotation.x = Math.sin(t * speed * 0.4) * 0.08;
    }
    if (ring.current) {
      ring.current.rotation.z = t * speed * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh ref={body} castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={colorA}
          roughness={0.75}
          metalness={0.08}
          emissive={colorB}
          emissiveIntensity={0.18}
        />
      </mesh>

      <mesh ref={ring} rotation-x={Math.PI / 2.5}>
        <torusGeometry args={[radius * 1.45, radius * 0.08, 24, 140]} />
        <meshStandardMaterial
          color={colorB}
          transparent
          opacity={0.35}
          roughness={1}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

export function Earth({ position = [0, 0, 0] }) {
  const earth = useRef();

  useFrame(({ clock }) => {
    if (!earth.current) return;
    earth.current.rotation.y = clock.elapsedTime * 0.17;
  });

  return (
    <group position={position}>
      <mesh ref={earth} castShadow receiveShadow>
        <sphereGeometry args={[3.1, 80, 80]} />
        <meshStandardMaterial
          color="#2b6ef4"
          emissive="#123277"
          emissiveIntensity={0.2}
          roughness={0.82}
          metalness={0.05}
        />
      </mesh>

      <mesh scale={1.02}>
        <sphereGeometry args={[3.1, 80, 80]} />
        <meshStandardMaterial color="#8be0ff" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

export function Spaceship({ progress = 0, returning = false }) {
  const ship = useRef();
  const flame = useRef();
  const flameCore = useRef();

  useFrame(({ clock }) => {
    if (!ship.current) return;

    // playful wobble
    ship.current.rotation.z = Math.sin(clock.elapsedTime * 5.5) * 0.035;
    ship.current.rotation.x = 0.08 + Math.sin(clock.elapsedTime * 3.4) * 0.02;

    // flame pulse animation
    const pulse = 1 + Math.sin(clock.elapsedTime * 18) * 0.2;
    if (flame.current) flame.current.scale.set(1, pulse, 1);
    if (flameCore.current) flameCore.current.scale.set(1, 0.9 + Math.sin(clock.elapsedTime * 20) * 0.18, 1);
  });

  const p = THREE.MathUtils.clamp(progress, 0, 1);

  // Diagonal corner-to-corner path
  let x, y, z, yaw;
  if (!returning) {
    x = THREE.MathUtils.lerp(-24, 24, p) + Math.sin(p * Math.PI * 4) * 1.3;
    y = THREE.MathUtils.lerp(14, -10, p) + Math.sin(p * Math.PI * 2.1) * 1.15;
    z = THREE.MathUtils.lerp(34, -140, p);
    yaw = -0.34;
  } else {
    x = THREE.MathUtils.lerp(24, -20, p) + Math.sin(p * Math.PI * 3.2) * 1.15;
    y = THREE.MathUtils.lerp(-9, 10, p) + Math.sin(p * Math.PI * 2) * 0.95;
    z = THREE.MathUtils.lerp(-140, 40, p);
    yaw = Math.PI - 0.34;
  }

  return (
    <group ref={ship} position={[x, y, z]} rotation={[0.08, yaw, 0]} scale={1.35}>
      {/* Body (chunky cartoon capsule) */}
      <mesh castShadow>
        <capsuleGeometry args={[0.95, 3.2, 12, 26]} />
        <meshStandardMaterial color="#eaf1ff" metalness={0.45} roughness={0.32} />
      </mesh>

      {/* Nose cap */}
      <mesh position={[0, 2.45, 0]} castShadow>
        <coneGeometry args={[0.86, 1.6, 28]} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.22} />
      </mesh>

      {/* Ring stripe */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.92, 0.1, 12, 36]} />
        <meshStandardMaterial color="#8fb0ff" metalness={0.4} roughness={0.38} />
      </mesh>

      {/* Big cartoon window */}
      <mesh position={[0, 1.25, 0.78]}>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial
          color="#86e3ff"
          emissive="#55d4ff"
          emissiveIntensity={0.95}
          metalness={0.25}
          roughness={0.18}
        />
      </mesh>

      {/* Side pods */}
      <mesh position={[1.15, -0.35, -0.08]} castShadow>
        <capsuleGeometry args={[0.24, 1.8, 8, 16]} />
        <meshStandardMaterial color="#d3e2ff" metalness={0.35} roughness={0.42} />
      </mesh>
      <mesh position={[-1.15, -0.35, -0.08]} castShadow>
        <capsuleGeometry args={[0.24, 1.8, 8, 16]} />
        <meshStandardMaterial color="#d3e2ff" metalness={0.35} roughness={0.42} />
      </mesh>

      {/* Large playful fins */}
      <mesh position={[1.02, -1.65, -0.55]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[1.25, 0.2, 1.5]} />
        <meshStandardMaterial color="#7d9dff" metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh position={[-1.02, -1.65, -0.55]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[1.25, 0.2, 1.5]} />
        <meshStandardMaterial color="#7d9dff" metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh position={[0, -1.78, -1.0]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[0.82, 0.2, 1.45]} />
        <meshStandardMaterial color="#7d9dff" metalness={0.25} roughness={0.45} />
      </mesh>

      {/* Engine bell */}
      <mesh position={[0, -2.35, -0.15]}>
        <cylinderGeometry args={[0.4, 0.55, 0.6, 20]} />
        <meshStandardMaterial color="#90a5c8" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Big cartoon flame */}
      <mesh ref={flame} position={[0, -3.55, -0.15]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.58, 2.3, 24]} />
        <meshStandardMaterial
          color="#ff8d2c"
          emissive="#ff5a00"
          emissiveIntensity={1.35}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Flame core */}
      <mesh ref={flameCore} position={[0, -3.2, -0.15]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.27, 1.45, 16]} />
        <meshStandardMaterial
          color="#ffe5a8"
          emissive="#ffc666"
          emissiveIntensity={1.2}
          transparent
          opacity={0.96}
        />
      </mesh>

      {/* Exhaust glow */}
      <pointLight position={[0, -3.2, -0.15]} intensity={2.5} color="#ff7a33" distance={20} />
    </group>
  );
}

export function Chicken({ position = [0, 0, 0], phase = 0 }) {
  const group = useRef();

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y = position[1] + Math.abs(Math.sin(clock.elapsedTime * 3 + phase)) * 0.4;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 2 + phase) * 0.18;
  });

  return (
    <group ref={group} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial color="#fff6de" />
      </mesh>

      <mesh position={[0, 0.75, 0.45]} castShadow>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color="#fff6de" />
      </mesh>

      <mesh position={[0, 0.75, 0.95]}>
        <coneGeometry args={[0.12, 0.35, 14]} />
        <meshStandardMaterial color="#ffb05e" />
      </mesh>

      <mesh position={[0, 1.25, 0.4]}>
        <coneGeometry args={[0.22, 0.35, 10]} />
        <meshStandardMaterial color="#ff7d5f" />
      </mesh>

      <mesh position={[0.22, -0.78, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.35, 8]} />
        <meshStandardMaterial color="#f7a132" />
      </mesh>
      <mesh position={[-0.22, -0.78, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.35, 8]} />
        <meshStandardMaterial color="#f7a132" />
      </mesh>
    </group>
  );
}

export function PanAndFood({ time = 0 }) {
  const broccoli = useRef();
  const beef = useRef();

  useFrame(() => {
    if (broccoli.current) broccoli.current.rotation.y += 0.02;
    if (beef.current) beef.current.rotation.x += 0.015;
  });

  return (
    <group position={[0, -2.8, -6]}>
      <mesh rotation-x={-Math.PI / 2}>
        <cylinderGeometry args={[4, 4.5, 0.5, 48]} />
        <meshStandardMaterial color="#20252e" metalness={0.7} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[3.2, 0.5, 16, 60]} />
        <meshStandardMaterial color="#2d3340" metalness={0.5} roughness={0.45} />
      </mesh>

      <group ref={broccoli}>
        <mesh position={[-1 + Math.sin(time * 1.3), 0.9, -0.2]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#3ea85d" />
        </mesh>
        <mesh position={[0.1 + Math.cos(time * 1.1), 0.75, 0.4]}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial color="#42b564" />
        </mesh>
      </group>

      <group ref={beef}>
        <mesh position={[1.3 + Math.cos(time * 1.2), 0.8, -0.6]}>
          <boxGeometry args={[0.8, 0.35, 0.5]} />
          <meshStandardMaterial color="#8f4a34" />
        </mesh>
        <mesh position={[0.8 + Math.sin(time * 1.4), 0.7, 0.85]}>
          <boxGeometry args={[0.75, 0.3, 0.4]} />
          <meshStandardMaterial color="#9b5339" />
        </mesh>
      </group>
    </group>
  );
}