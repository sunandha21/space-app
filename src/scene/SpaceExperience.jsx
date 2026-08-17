import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Earth, Planet, Spaceship, Stars, Chicken, PanAndFood } from "./SpaceObjects";
import { PHASES } from "./phases";

function CameraDirector({ phase, phaseProgress }) {
  const camRef = useRef();
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!camRef.current) return;

    if (phase === PHASES.LAUNCH || phase === PHASES.FLYBY) {
      const p = phaseProgress;
      const shipX = THREE.MathUtils.lerp(-24, 24, p) + Math.sin(p * Math.PI * 4) * 1.3;
      const shipY = THREE.MathUtils.lerp(14, -10, p) + Math.sin(p * Math.PI * 2.1) * 1.15;
      const shipZ = THREE.MathUtils.lerp(34, -140, p);

      desired.set(shipX + 7.8, shipY + 4.2, shipZ + 16);
      target.set(shipX, shipY + 0.2, shipZ - 7);
    } else if (phase === PHASES.RETURN) {
      const p = phaseProgress;
      const shipX = THREE.MathUtils.lerp(24, -20, p) + Math.sin(p * Math.PI * 3.2) * 1.15;
      const shipY = THREE.MathUtils.lerp(-9, 10, p) + Math.sin(p * Math.PI * 2) * 0.95;
      const shipZ = THREE.MathUtils.lerp(-140, 40, p);

      desired.set(shipX - 7, shipY + 3.6, shipZ + 15);
      target.set(shipX, shipY + 0.2, shipZ - 7);
    } else if (phase === PHASES.CHICKENS || phase === PHASES.COOKING) {
      desired.set(0, 2.5, 10);
      target.set(0, 0, 0);
    } else if (phase === PHASES.END) {
      desired.set(0, 4, 14);
      target.set(0, 1, 0);
    } else {
      desired.set(0, 3, 16);
      target.set(0, 0, 0);
    }

    camRef.current.position.lerp(desired, 0.03);
    camRef.current.lookAt(target);
  });

  return <PerspectiveCamera ref={camRef} makeDefault fov={52} position={[0, 3, 16]} />;
}

function Scene({ phase, phaseProgress, darkAmount, time }) {
  const showSpace =
    phase !== PHASES.INTRO &&
    phase !== PHASES.NO_MESSAGE &&
    phase !== PHASES.TRANSITION_DARK
      ? true
      : darkAmount > 0.25;

  return (
    <>
      <CameraDirector phase={phase} phaseProgress={phaseProgress} />

      <color
        attach="background"
        args={[
          new THREE.Color().setHSL(
            0.62,
            0.45,
            THREE.MathUtils.lerp(0.97, 0.03, darkAmount)
          )
        ]}
      />
      <fog attach="fog" args={["#05070f", 40, 400]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 12, 4]} intensity={1.4} castShadow />
      <pointLight position={[-10, 5, -30]} intensity={2.2} color="#7ba8ff" />
      <pointLight position={[16, -4, -80]} intensity={1.6} color="#ff9a5e" />

      {showSpace && (
        <>
          <Stars count={3500} />
          <Sparkles
            count={220}
            size={2.4}
            speed={0.35}
            opacity={0.5}
            color="#b7dcff"
            scale={[200, 200, 200]}
          />
        </>
      )}

      {(phase === PHASES.LAUNCH ||
        phase === PHASES.FLYBY ||
        phase === PHASES.EGG_TART_GALAXY ||
        phase === PHASES.NO_TARTS ||
        phase === PHASES.RETURN) && (
        <>
          <Earth position={[0, -2, 24]} />
          <Planet position={[-14, 6, -32]} radius={4.4} colorA="#8d76ff" colorB="#c4b9ff" speed={0.1} />
          <Planet position={[16, -5, -58]} radius={6.2} colorA="#2f6f96" colorB="#88b9d6" speed={0.07} />
          <Planet position={[-20, -8, -92]} radius={8.4} colorA="#62453c" colorB="#c88f63" speed={0.05} />
          <Planet position={[22, 9, -124]} radius={5.5} colorA="#6f3c94" colorB="#f4a9ff" speed={0.09} />
        </>
      )}

      {(phase === PHASES.LAUNCH ||
        phase === PHASES.FLYBY ||
        phase === PHASES.EGG_TART_GALAXY ||
        phase === PHASES.NO_TARTS) && <Spaceship progress={phaseProgress} />}

      {phase === PHASES.RETURN && <Spaceship progress={phaseProgress} returning />}

      {(phase === PHASES.CHICKENS || phase === PHASES.COOKING || phase === PHASES.END) && (
        <group position={[0, -1.2, -4]}>
          <Chicken position={[-3.8, 0, 0]} phase={0} />
          <Chicken position={[0, 0.2, -1.2]} phase={1.2} />
          <Chicken position={[3.8, 0, 0.5]} phase={2.4} />
        </group>
      )}

      {phase === PHASES.COOKING && <PanAndFood time={time} />}

      <Environment preset="night" />
    </>
  );
}

export default function SpaceExperience(props) {
  return (
    <Canvas shadows gl={{ antialias: true }}>
      <Scene {...props} />
    </Canvas>
  );
}