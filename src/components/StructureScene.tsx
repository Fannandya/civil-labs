"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, ContactShadows, Edges, Grid } from "@react-three/drei";
import { CameraPreset, useViewerStore } from "@/store/viewer";
import { Vector3 } from "three";
import { StructuralModel } from "./scene/StructuralModel";
import { SceneAnimationProvider } from "./scene/SceneAnimation";
import { StructuralMotionProvider } from "./scene/StructuralMotion";
import { LoadJourney } from "./scene/LoadJourney";
import {
  GravityLoadSystem,
  WindLoadSystem,
  SeismicLoadSystem,
  SoilPressureSystem,
  WaterPressureSystem,
  CurvedLoadPathSystem
} from "./LoadVisualizer";

function CameraRig() {
  const controls = useRef<CameraControls>(null);
  const size = useThree((s) => s.size);
  const preset = useViewerStore((s) => s.preset);
  const mode = useViewerStore((s) => s.visualizationMode);
  const version = useViewerStore((s) => s.presetVersion);
  const active = useViewerStore((s) => s.activeId);
  const exhibition = useViewerStore((s) => s.exhibitionMode);
  const [reducedMotion, setReducedMotion] = useState(false);
  const freeX = useViewerStore((s) => s.freePanX);
  const freeY = useViewerStore((s) => s.freePanY);
  const previousFreePan = useRef({ x: freeX, y: freeY });
  const previousPreset = useRef(preset);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    // Entering Bebas preserves the current orbit orientation and distance.
    if (preset === "free") return;
    const mobilePanel = active && window.innerWidth < 1280;
    const aspect = size.width / Math.max(1, size.height);
    const scale = Math.max(1, 0.82 / Math.max(0.32, aspect)) * (mobilePanel ? 1.18 : 1) * (exhibition ? 0.94 : 1);
    const targetY = preset === "substructure" ? -1.75 : mobilePanel ? 0.6 : 0.05;
    const distance = 16.7 * scale;

    const positions: Record<CameraPreset, [number, number, number, number, number, number]> = {
      isometric: [distance * 0.63 * (mode === "wind" ? -1 : 1), targetY + distance * 0.48, distance * 0.76, 0, targetY, 0],
      front: [0, targetY + 0.3, distance, 0, targetY, 0],
      top: [0.001, distance, 0.001, 0, 0, 0],
      substructure: [distance * 0.52 * (mode === "soil" || mode === "water" ? -1 : 1), targetY + distance * 0.32, distance * 0.7, 0, targetY, 0],
      free: [distance * 0.63 + freeX, distance * 0.48 + freeY, distance * 0.76, freeX, freeY, 0]
    };

    c.setLookAt(...positions[preset], !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [preset, mode, version, active, exhibition, size.width, size.height, freeX, freeY]);

  useEffect(() => {
    const enteringFree = preset === "free" && previousPreset.current !== "free";
    previousPreset.current = preset;
    const previous = previousFreePan.current;
    previousFreePan.current = { x: freeX, y: freeY };
    const c = controls.current;
    if (!c || preset !== "free") return;
    const target = c.getTarget(new Vector3(), true);
    if (enteringFree) {
      previousFreePan.current = { x: target.x, y: target.y };
      useViewerStore.setState({ freePanX: target.x, freePanY: target.y });
      return;
    }
    c.moveTo(target.x + freeX - previous.x, target.y + freeY - previous.y, target.z,
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [preset, freeX, freeY]);

  useFrame((_, delta) => {
    if (!exhibition || preset !== "isometric" || active || reducedMotion) return;
    controls.current?.rotate(0.12 * delta, 0, false);
  });

  return (
    <CameraControls
      ref={controls}
      minDistance={4}
      maxDistance={75}
      minPolarAngle={0.02}
      maxPolarAngle={Math.PI / 2 + 0.25}
    />
  );
}

export function StructureCanvas({
  onContextLost,
  onContextRestored,
  onReady
}: {
  onContextLost: (restore: () => void) => void;
  onContextRestored: () => void;
  onReady: () => void;
}) {
  const layers = useViewerStore((s) => s.layers);
  const mode = useViewerStore((s) => s.visualizationMode);
  const hover = useViewerStore((s) => s.hover);
  const select = useViewerStore((s) => s.select);
  const touch = useViewerStore((s) => s.touch);
  const exhibition = useViewerStore((s) => s.exhibitionMode);
  const isTouch = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  );

  const pick = (id: string, event: ThreeEvent<MouseEvent>, point: [number, number, number]) => {
    event.stopPropagation();
    if (exhibition) return;
    if (isTouch) touch(id, point);
    else select(id, point);
  };

  const callbacks = { onPick: pick, onHover: exhibition ? () => {} : hover };

  const isPlaygroundActive = useViewerStore((s) => s.isPlaygroundActive);
  const activeId = useViewerStore((s) => s.activeId);

  return (
    <Canvas
      style={{ isolation: "isolate" }}
      onCreated={onReady}
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [10.5, 8.1, 12.7], fov: 36, near: 0.1, far: 100 }}
      onPointerMissed={() => {
        hover(null);
        document.body.style.cursor = "";
        if (isTouch) touch(null);
        else select(null);
      }}
    >
      <SceneAnimationProvider>
      <StructuralMotionProvider>
        <ContextRecovery onContextLost={onContextLost} onContextRestored={onContextRestored} />
        <color attach="background" args={["#eaf0f4"]} />
        <fog attach="fog" args={["#eaf0f4", 36, 75]} />

        {/* Studio-Grade Architectural Lighting Setup */}
        <ambientLight intensity={0.9} color="#f8fafc" />
        <hemisphereLight args={["#ffffff", "#94a3b8", 0.95]} />

        {/* Key Sun Directional Light with soft shadows */}
        <directionalLight
          position={[9, 14, 8]}
          intensity={2.3}
          color="#fffbf2"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-camera-near={0.5}
          shadow-camera-far={35}
          shadow-bias={-0.0002}
          shadow-normalBias={0.03}
        />

        {/* Rim light from back-left for contour definition */}
        <directionalLight position={[-8, 6, -8]} intensity={0.85} color="#dbeafe" />

        {/* Soft upward fill light to illuminate substructure excavation and bored piles */}
        <directionalLight position={[0, -6, 0]} intensity={0.4} color="#bae6fd" />

        <CameraRig />

        {/* Ground Foundation Pedestal Slab */}
        <mesh position={[0, -4.42, 0]} receiveShadow>
          <boxGeometry args={[8.8, 0.12, 7.2]} />
          <meshStandardMaterial color="#d4dde2" roughness={0.92} />
          <Edges color="#94a3b8" transparent opacity={0.45} />
        </mesh>

        {/* Architectural Base Coordinate Grid */}
        <Grid
          position={[0, -4.351, 0]}
          args={[8.6, 7.0]}
          cellSize={0.5}
          cellThickness={0.4}
          cellColor="#94a3b8"
          sectionSize={2.0}
          sectionThickness={0.8}
          sectionColor="#64748b"
          fadeDistance={22}
        />

        {/* 3D Physical Structural Elements Model */}
        <StructuralModel {...callbacks} />

        {/* Active Load Vectors & Force Systems (Active in both specific visualization modes AND interactive playground) */}
        {layers.load_vector && (
          <group name="LoadVectors_Node">
            <LoadJourney />
            {(mode === "gravity" ||
            (mode === "structure" && isPlaygroundActive &&
                (activeId === "elem-balok" ||
                  activeId === "elem-kolom" ||
                  activeId === "elem-pelat-lantai" ||
                  activeId === "elem-pondasi" ||
                  activeId === "load-gravitasi" ||
                  !activeId))) && (
              <>
                <GravityLoadSystem {...callbacks} />
                {mode === "structure" && <CurvedLoadPathSystem />}
              </>
            )}
          {(mode === "wind" || (mode === "structure" && isPlaygroundActive && activeId === "load-angin")) && (
              <WindLoadSystem {...callbacks} />
            )}
            {(mode === "seismic" ||
            (mode === "structure" && isPlaygroundActive && (activeId === "load-gempa" || activeId === "elem-dinding-geser"))) && (
              <SeismicLoadSystem {...callbacks} />
            )}
            {(mode === "soil" ||
            (mode === "structure" && isPlaygroundActive && (activeId === "load-tekanan-tanah" || activeId === "elem-dinding-basement"))) && (
              <SoilPressureSystem {...callbacks} />
            )}
          {(mode === "water" || (mode === "structure" && isPlaygroundActive && activeId === "load-tekanan-air")) && (
              <WaterPressureSystem {...callbacks} />
            )}
          </group>
        )}

        {/* Ground Contact Soft Ambient Shadows */}
        <ContactShadows
          position={[0, -4.345, 0]}
          opacity={0.25}
          scale={14}
          blur={2.5}
          far={10}
          resolution={256}
          color="#334155"
        />
      </StructuralMotionProvider>
      </SceneAnimationProvider>
    </Canvas>
  );
}

function ContextRecovery({
  onContextLost,
  onContextRestored
}: {
  onContextLost: (restore: () => void) => void;
  onContextRestored: () => void;
}) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onContextLost(() => gl.forceContextRestore());
    };
    const restored = () => onContextRestored();
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl, onContextLost, onContextRestored]);
  return null;
}
