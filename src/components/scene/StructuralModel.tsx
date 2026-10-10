"use client";

import { useEffect, useMemo, useRef } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Edges, Line } from "@react-three/drei";
import * as THREE from "three";
import { useViewerStore, type VisualizationMode } from "@/store/viewer";
import { sceneDimensions } from "./sceneConfig";
import { LOAD_JOURNEYS } from "@/lib/loadJourney";
import { VECTOR_COLORS } from "./ScenePrimitives";
import { subdivideLinePositions, useDeformedGeometry, useStructuralMotion } from "./StructuralMotion";
import { longitudinalBarOffsets } from "./reinforcementLayout";
import { MODEL_LEVELS } from "@/lib/modelLevels";

type Point = [number, number, number];
export type ModelPick = (id: string, event: ThreeEvent<MouseEvent>, point: Point) => void;
type Callbacks = { onPick: ModelPick; onHover: (id: string | null) => void };

type MemberProps = Callbacks & {
  id: string;
  position: Point;
  size: Point;
  color: string;
  cylindrical?: boolean;
  isBoundaryElement?: boolean;
};

const levels = MODEL_LEVELS.map((level) => level.sceneY);
const columns: Point[] = [-1.65, 1.65].flatMap((x) =>
  [-1.25, 1.25].map((z) => [x, 0, z] as Point)
);

// High-grade civil engineering architectural concrete palette
const concretePalette = {
  slab: "#d5dde2",         // Smooth cast structural concrete slab floor
  beam: "#9dafc0",         // Structural framing beam
  column: "#8699a6",       // Heavy load-bearing RC column
  core: "#637785",         // Monolithic seismic shear wall
  boundaryElement: "#516573", // Boundary element (elemen batas tertekan khusus SRPMK)
  basement: "#72848e",     // Subterranean waterproof retaining wall
  raft: "#546670",         // Massive foundation raft / pile cap
  pile: "#445660",         // Precast spun pile shaft
  steel: "#2b343b",        // High-tensile deformed rebar steel
  accent: "#426b8a",
  safeGlow: VECTOR_COLORS.safe,       // DCR <= 0.70
  warningGlow: VECTOR_COLORS.warning, // 0.70 < DCR <= 1.00
  dangerGlow: VECTOR_COLORS.danger    // DCR > 1.00
};

/** Concrete and steel share a continuous illustrative deformation field. */
function Member({
  id,
  position,
  size,
  color,
  cylindrical,
  isBoundaryElement,
  onPick,
  onHover
}: MemberProps) {
  const [width, height, depth] = size;
  const geometry = useMemo(() => cylindrical
    ? new THREE.CylinderGeometry(width, width, height, 20, Math.max(1, Math.ceil(height / .2)))
    : new THREE.BoxGeometry(width, height, depth, Math.max(1, Math.ceil(width / .25)), Math.max(1, Math.ceil(height / .25)), Math.max(1, Math.ceil(depth / .25))),
  [cylindrical, width, height, depth]);
  const edges = useMemo(() => {
    const source = new THREE.EdgesGeometry(geometry, 20);
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(subdivideLinePositions(source.getAttribute("position").array), 3));
    source.dispose();
    return result;
  }, [geometry]);
  useDeformedGeometry(geometry, position, true);
  useDeformedGeometry(edges, position);
  useEffect(() => () => { geometry.dispose(); edges.dispose(); }, [geometry, edges]);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const selected = useViewerStore((s) => s.activeId === id);
  const hovered = useViewerStore((s) => s.hoveredId === id || s.touchCandidate === id);
  const context = useViewerStore((s) => s.activeId !== null && s.activeId !== id);
  const xray = useViewerStore((s) => s.xray);
  const reinforcement = useViewerStore((s) => s.showReinforcement);
  const activeDcr = useViewerStore((s) => s.activeDcr);
  const mode = useViewerStore((s) => s.visualizationMode);
  const journeyStep = useViewerStore((s) => s.journeyStep);
  const showJourney = useViewerStore((s) => s.layers.load_vector);
  const params = useViewerStore((s) => s.playgroundParams);
  const noDemand = (mode === "wind" && (params.speed ?? 35) <= 0)
    || (mode === "water" && (journeyStep < 2
      ? (params.waterDepth ?? 2) >= (params.height ?? 4)
      : journeyStep === 2 && (params.waterHead ?? 3) <= 0));
  const lessonActive = showJourney && mode !== "structure" && !noDemand;
  const journeyHighlighted = lessonActive && LOAD_JOURNEYS[mode][journeyStep]?.elementIds.includes(id);
  const journeyColor = lessonActive ? VECTOR_COLORS[mode] : color;

  const translucent = xray || reinforcement;

  // Determine stress glow color based on real-time DCR
  const stressColor = useMemo(() => {
    if (!selected && !hovered) return null;
    if (selected && activeDcr !== null) {
      if (activeDcr <= 0.7) return concretePalette.safeGlow;
      if (activeDcr <= 1.0) return concretePalette.warningGlow;
      return concretePalette.dangerGlow;
    }
    return concretePalette.accent;
  }, [selected, hovered, activeDcr]);

  const displayColor = stressColor ?? (journeyHighlighted ? journeyColor : color);
  const isHighlighted = selected || hovered;

  // Target opacity for smooth cross-fading
  const targetOpacity = reinforcement
    ? (selected ? 0.16 : hovered ? 0.12 : 0.0)
    : translucent
    ? (selected ? 0.42 : 0.22)
    : lessonActive && !isHighlighted
    ? (journeyHighlighted ? 0.95 : 0.38)
    : context
    ? 0.8
    : 1.0;

  const targetEdgeOpacity = reinforcement
    ? (isHighlighted ? 0.35 : 0.0)
    : translucent
    ? 0.28
    : lessonActive && !isHighlighted
    ? (journeyHighlighted ? 0.85 : 0.15)
    : context
    ? 0.2
    : isHighlighted
    ? 0.9
    : 0.42;

  // Material transitions leave all structural joints and reinforcement aligned.
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const clampedDelta = Math.min(delta, 0.1);
    // Smooth damp opacity for concrete body
    if (materialRef.current) {
      const currentOpacity = materialRef.current.opacity;
      const nextOpacity = THREE.MathUtils.damp(currentOpacity, targetOpacity, 10, clampedDelta);
      materialRef.current.opacity = nextOpacity;
      materialRef.current.depthWrite = !reinforcement && !translucent && nextOpacity > 0.85;

      if (nextOpacity <= 0.005 && targetOpacity === 0) {
        meshRef.current.visible = false;
      } else {
        meshRef.current.visible = true;
      }
    }

    // Smooth damp opacity for chamfer edges
    meshRef.current.children.forEach((child) => {
      if (child instanceof THREE.LineSegments && child.material) {
        const lineMat = child.material as THREE.LineBasicMaterial;
        if (lineMat) {
          lineMat.opacity = THREE.MathUtils.damp(lineMat.opacity, targetEdgeOpacity, 10, clampedDelta);
          lineMat.transparent = true;
        }
      }
    });
  });

  return (
    <mesh
      ref={meshRef}
      name={id}
      position={position}
      geometry={geometry}
      castShadow={!translucent}
      receiveShadow
      onPointerOver={(event) => {
        if (reinforcement && targetOpacity === 0) return;
        event.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(id);
      }}
      onPointerOut={(event) => {
        if (reinforcement && targetOpacity === 0) return;
        event.stopPropagation();
        document.body.style.cursor = "";
        onHover(null);
      }}
      onClick={(event) => {
        if (reinforcement && targetOpacity === 0) return;
        onPick(id, event, event.point.toArray() as Point);
      }}
    >

      <meshStandardMaterial
        ref={materialRef}
        color={displayColor}
        roughness={cylindrical ? 0.7 : isBoundaryElement ? 0.85 : 0.72}
        metalness={cylindrical ? 0.1 : 0.05}
        transparent={true}
        opacity={targetOpacity}
        depthWrite={!translucent && !reinforcement && targetOpacity > 0.85}
        emissive={stressColor ?? (journeyHighlighted ? journeyColor : isHighlighted ? concretePalette.accent : "#000000")}
        emissiveIntensity={
          selected
            ? activeDcr !== null && activeDcr > 1.0
              ? 0.55
              : 0.28
            : hovered
            ? 0.14
            : journeyHighlighted && !reinforcement
            ? 0.18
            : 0
        }
      />

      <lineSegments geometry={edges} raycast={() => {}}>
        <lineBasicMaterial
          color={stressColor ?? (journeyHighlighted ? journeyColor : isHighlighted
            ? concretePalette.accent : isBoundaryElement ? "#374151" : "#4b5563")}
          transparent
          opacity={targetEdgeOpacity}
        />
      </lineSegments>
    </mesh>
  );
}

type Segment = [Point, Point];
function line(segments: Segment[], a: Point, b: Point) {
  segments.push([a, b]);
}

/**
 * Illustrates longitudinal bars and closed stirrups; this is not complete SRPMK detailing.
 */
function rectangularCage(
  segments: Segment[],
  center: Point,
  size: Point,
  axis: 0 | 1 | 2,
  spacing = 0.15,
  longitudinalBarCount = 4,
  beamParams?: Record<string, number>
) {
  const half = size.map((v) => v / 2) as Point;
  const perpendicular = [0, 1, 2].filter((v) => v !== axis);
  const point = (t: number, a: number, b: number): Point => {
    const p: Point = [...center];
    p[axis] += t;
    p[perpendicular[0]] += a;
    p[perpendicular[1]] += b;
    return p;
  };
  const inset = beamParams ? ((beamParams.cover ?? 40) + (beamParams.stirrupDiameter ?? 10)) * .0005 : 0;
  const a = Math.max(0, half[perpendicular[0]] - inset);
  const b = Math.max(0, half[perpendicular[1]] - inset);
  const length = size[axis];

  // Longitudinal bars match slider counts and stay on the intended beam or column faces.
  for (const [aOffset, bOffset] of longitudinalBarOffsets(axis, longitudinalBarCount, beamParams)) {
    line(
      segments,
      point(-length / 2, aOffset * half[perpendicular[0]], bOffset * half[perpendicular[1]]),
      point(length / 2, aOffset * half[perpendicular[0]], bOffset * half[perpendicular[1]])
    );
  }

  // 3. Transverse closed seismic stirrups (sengkang tertutup gempa)
  const count = Math.max(3, Math.ceil(length / spacing));
  for (let i = 0; i <= count; i++) {
    const t = -length / 2 + (length * i) / count;
    const corners = [
      point(t, -a, -b),
      point(t, a, -b),
      point(t, a, b),
      point(t, -a, b)
    ];
    corners.forEach((corner, j) => line(segments, corner, corners[(j + 1) % 4]));
  }
}

/**
 * Spun Pile Cylindrical Rebar Cage with Spiral Confinement Ties
 */
function pileCage(segments: Segment[], x: number, z: number) {
  const radius = 0.115;
  const bottom = -4.25;
  const top = -2.45;

  // 8 Longitudinal rebars arranged radially
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    line(
      segments,
      [x + Math.cos(angle) * radius, bottom, z + Math.sin(angle) * radius],
      [x + Math.cos(angle) * radius, top, z + Math.sin(angle) * radius]
    );
  }

  // Continuous spiral confinement hoop
  for (let y = bottom; y <= top; y += 0.12) {
    for (let i = 0; i < 18; i++) {
      const angle = (i * Math.PI) / 9;
      const next = ((i + 1) * Math.PI) / 9;
      line(
        segments,
        [x + Math.cos(angle) * radius, y, z + Math.sin(angle) * radius],
        [x + Math.cos(next) * radius, y, z + Math.sin(next) * radius]
      );
    }
  }
}

/**
 * Raft Foundation / Pile Cap Rebar Detailing
 * Top and bottom two-way flexural rebar mesh with edge shear ties and pile head connection dowels.
 */
function raftCage(segments: Segment[]) {
  const xMin = -2.0;
  const xMax = 2.0;
  const zMin = -1.6;
  const zMax = 1.6;
  const yTop = -2.13;
  const yBot = -2.42;

  // 1. Bottom Two-Way Rebar Mat (along X and Z)
  for (let z = zMin; z <= zMax + 0.01; z += 0.2) {
    line(segments, [xMin, yBot, z], [xMax, yBot, z]);
    // Edge 90° hook up into raft core
    line(segments, [xMin, yBot, z], [xMin, yBot + 0.22, z]);
    line(segments, [xMax, yBot, z], [xMax, yBot + 0.22, z]);
  }
  for (let x = xMin; x <= xMax + 0.01; x += 0.2) {
    line(segments, [x, yBot, zMin], [x, yBot, zMax]);
    // Edge 90° hook up into raft core
    line(segments, [x, yBot, zMin], [x, yBot + 0.22, zMin]);
    line(segments, [x, yBot, zMax], [x, yBot + 0.22, zMax]);
  }

  // 2. Top Two-Way Rebar Mat (along X and Z)
  for (let z = zMin; z <= zMax + 0.01; z += 0.2) {
    line(segments, [xMin, yTop, z], [xMax, yTop, z]);
    // Edge 90° hook down
    line(segments, [xMin, yTop, z], [xMin, yTop - 0.22, z]);
    line(segments, [xMax, yTop, z], [xMax, yTop - 0.22, z]);
  }
  for (let x = xMin; x <= xMax + 0.01; x += 0.2) {
    line(segments, [x, yTop, zMin], [x, yTop, zMax]);
    // Edge 90° hook down
    line(segments, [x, yTop, zMin], [x, yTop - 0.22, zMin]);
    line(segments, [x, yTop, zMax], [x, yTop - 0.22, zMax]);
  }

  // 3. Vertical Shear Ties / Chair Spacers
  for (let x = xMin + 0.2; x <= xMax - 0.1; x += 0.4) {
    for (let z = zMin + 0.2; z <= zMax - 0.1; z += 0.4) {
      line(segments, [x, yBot, z], [x, yTop, z]);
    }
  }

  // 4. Starter Dowels into Basement Columns (4 locations)
  for (const [cx, , cz] of columns) {
    for (const dx of [-0.15, 0.15]) {
      for (const dz of [-0.15, 0.15]) {
        line(segments, [cx + dx, yBot, cz + dz], [cx + dx, -1.95, cz + dz]);
      }
    }
  }
}

/**
 * Basement Retaining Wall Double-Curtain Rebar Cage
 * Conforms to SNI 2847 double-layer rebar requirements for subterranean retaining walls.
 */
function basementWallsCage(segments: Segment[], cutaway: boolean) {
  const yBot = -2.05;
  const yTop = 0.18;

  // Rear Wall (z = -1.25, x from -1.65 to 1.65) - Double Curtain
  for (const z of [-1.17, -1.33]) {
    for (let x = -1.55; x <= 1.55 + 0.01; x += 0.18) {
      line(segments, [x, yBot, z], [x, yTop, z]);
    }
    for (let y = yBot; y <= yTop + 0.01; y += 0.18) {
      line(segments, [-1.55, y, z], [1.55, y, z]);
    }
  }

  // Left Wall (x = -1.65, z from -1.25 to 1.25) - Double Curtain
  for (const x of [-1.57, -1.73]) {
    for (let z = -1.15; z <= 1.15 + 0.01; z += 0.18) {
      line(segments, [x, yBot, z], [x, yTop, z]);
    }
    for (let y = yBot; y <= yTop + 0.01; y += 0.18) {
      line(segments, [x, y, -1.15], [x, y, 1.15]);
    }
  }

  // Front Wall (z = 1.25) - Double Curtain (shown when not cutaway)
  if (!cutaway) {
    for (const z of [1.17, 1.33]) {
      for (let x = -1.55; x <= 1.55 + 0.01; x += 0.18) {
        line(segments, [x, yBot, z], [x, yTop, z]);
      }
      for (let y = yBot; y <= yTop + 0.01; y += 0.18) {
        line(segments, [-1.55, y, z], [1.55, y, z]);
      }
    }
    // Right Wall (x = 1.65) - Double Curtain
    for (const x of [1.57, 1.73]) {
      for (let z = -1.15; z <= 1.15 + 0.01; z += 0.18) {
        line(segments, [x, yBot, z], [x, yTop, z]);
      }
      for (let y = yBot; y <= yTop + 0.01; y += 0.18) {
        line(segments, [x, y, -1.15], [x, y, 1.15]);
      }
    }
  }

  // Crossties / S-ties connecting inner and outer curtains
  for (let y = yBot + 0.18; y < yTop; y += 0.36) {
    for (let x = -1.4; x <= 1.4; x += 0.36) {
      line(segments, [x, y, -1.17], [x, y, -1.33]);
    }
    for (let z = -1.0; z <= 1.0; z += 0.36) {
      line(segments, [-1.57, y, z], [-1.73, y, z]);
    }
  }
}

/**
 * Realistic Steel Rebar Cage Display with Silky Smooth Fade Transition
 */
function Reinforcement({
  id,
  segments,
  show = true,
  onPick,
  onHover
}: Callbacks & { id: string; segments: Segment[]; show?: boolean }) {
  const selected = useViewerStore((s) => s.activeId === id);
  const hovered = useViewerStore((s) => s.hoveredId === id || s.touchCandidate === id);
  const geometry = useMemo(() => {
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(subdivideLinePositions(segments.flat(2)), 3));
    return result;
  }, [segments]);
  useDeformedGeometry(geometry);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const lineRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  // Smoothly damp line opacity in useFrame
  useFrame((_, delta) => {
    if (!materialRef.current || !lineRef.current) return;
    const clampedDelta = Math.min(delta, 0.1);
    const targetOpacity = show ? (selected ? 1.0 : hovered ? 0.95 : 0.85) : 0.0;
    const currentOpacity = materialRef.current.opacity;

    // Smooth frame-rate independent exponential transition
    const nextOpacity = THREE.MathUtils.damp(currentOpacity, targetOpacity, 10, clampedDelta);
    materialRef.current.opacity = nextOpacity;

    // Turn off visibility to bypass GPU draw calls when completely faded out
    if (nextOpacity <= 0.005 && !show) {
      lineRef.current.visible = false;
    } else {
      lineRef.current.visible = true;
    }
  });

  return (
    <lineSegments
      ref={lineRef}
      name={`${id}-reinforcement`}
      geometry={geometry}
      visible={show}
      onPointerOver={(event) => {
        if (!show) return;
        event.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(id);
      }}
      onPointerOut={() => {
        if (!show) return;
        document.body.style.cursor = "";
        onHover(null);
      }}
      onClick={(event) => {
        if (!show) return;
        onPick(id, event, event.point.toArray() as Point);
      }}
    >
      <lineBasicMaterial
        ref={materialRef}
        color={selected ? concretePalette.accent : hovered ? "#38bdf8" : "#24323d"}
        transparent
        opacity={show ? (selected ? 1.0 : hovered ? 0.95 : 0.85) : 0.0}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/**
 * Civil Engineering Geotechnical Soil Stratigraphy Block
 * Dynamic water table elevation line linked to waterDepth slider.
 * Retains solid excavation context for substructure rebar inspection.
 */
function SoilSection({ waterY, mode }: { waterY: number; mode: VisualizationMode }) {
  const ground = useRef<THREE.Group>(null);
  const motion = useStructuralMotion();
  useFrame(() => { if (ground.current) ground.current.position.x = motion.current.baseX; }, -.25);
  const layers = mode === "soil"
    ? [{ top: 0.25, bottom: -4.3, color: "#aba28c", name: "Tanah homogen" }]
    : [
    { top: 0.25, bottom: -0.85, color: "#c4bca7", name: "Tanah Timbunan & Lempung Lunak" },
    { top: -0.85, bottom: -2.45, color: "#aba28c", name: "Pasir Berlanau Kepadatan Sedang" },
    { top: -2.45, bottom: -4.3, color: "#877f6b", name: "Lempung Keras / Hard Strata" }
  ];

  return (
    <group ref={ground} name="Geotechnical_Soil_Stratigraphy">
      {layers.flatMap((layer, i) => [
        // Rear excavation soil block
        <mesh key={`soil-rear-${i}`} position={[-0.38, (layer.top + layer.bottom) / 2, -2.06]} receiveShadow>
          <boxGeometry args={[5.55, layer.top - layer.bottom, 0.78]} />
          <meshStandardMaterial color={layer.color} roughness={0.95} metalness={0.02} />
          <Edges color="#6b7280" transparent opacity={0.25} />
        </mesh>,
        // Left excavation soil block
        <mesh key={`soil-left-${i}`} position={[-2.58, (layer.top + layer.bottom) / 2, -0.88]} receiveShadow>
          <boxGeometry args={[0.8, layer.top - layer.bottom, 1.5]} />
          <meshStandardMaterial color={layer.color} roughness={0.95} metalness={0.02} />
          <Edges color="#6b7280" transparent opacity={0.25} />
        </mesh>
      ])}

      {/* Surface Vegetation / Ground Surface Slab (±0.00 Muka Tanah) */}
      <mesh key="soil-surface-rear" position={[-0.38, 0.272, -2.06]} receiveShadow>
        <boxGeometry args={[5.55, 0.04, 0.78]} />
        <meshStandardMaterial color="#849984" roughness={0.9} />
      </mesh>
      <mesh key="soil-surface-left" position={[-2.58, 0.272, -0.88]} receiveShadow>
        <boxGeometry args={[0.8, 0.04, 1.5]} />
        <meshStandardMaterial color="#849984" roughness={0.9} />
      </mesh>

      {/* Groundwater Table (MAT) Elevation Line dynamically responsive to waterDepth slider */}
      {(mode === "water" || mode === "structure") && (
        <Line
          points={[
            [-2.95, waterY, 0.4],
            [2.35, waterY, 0.4]
          ]}
          color={VECTOR_COLORS.water}
          lineWidth={1.3}
          dashed
          dashSize={0.12}
          gapSize={0.06}
        />
      )}
    </group>
  );
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

/**
 * 3D Native WebGL Architectural Datum Elevation Marker
 * Uses CanvasTexture + Sprite (100% WebGL native, auto-faces camera, zero DOM overhead, 0 browser issues).
 */
function ArchitecturalDatum({
  position,
  elevation,
  title,
  leaderStart
}: {
  position: Point;
  elevation: string;
  title: string;
  leaderStart?: Point;
}) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 96);

    // Clean semi-translucent pill badge
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.beginPath();
    drawRoundedRect(ctx, 6, 6, 500, 84, 16);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();

    // Elevation datum symbol ▽
    ctx.fillStyle = "#0284c7";
    ctx.font = "bold 34px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("▽", 24, 48);

    // High-contrast elevation value
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px ui-monospace, monospace";
    ctx.fillText(elevation, 68, 48);

    // Element / floor level title
    const elevWidth = ctx.measureText(elevation).width;
    ctx.fillStyle = "#334155";
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillText(`· ${title}`, 68 + elevWidth + 14, 49);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [elevation, title]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <group position={position}>
      {/* Billboard camera-facing 3D sprite */}
      <sprite scale={[1.85, 0.35, 1]}>
        <spriteMaterial map={texture} depthTest={false} transparent opacity={0.96} />
      </sprite>

      {/* Dashed architectural leader line */}
      {leaderStart && (
        <Line
          points={[
            [leaderStart[0] - position[0], leaderStart[1] - position[1], leaderStart[2] - position[2]],
            [-0.95, 0, 0]
          ]}
          color="#94a3b8"
          lineWidth={1.5}
          dashed
          dashSize={0.08}
          gapSize={0.04}
        />
      )}
    </group>
  );
}

/**
 * 3D Native WebGL Column Grid Identifier (A, B, 1, 2)
 * Rendered on circular billboard disc in 3D WebGL space.
 */
function GridMarker({
  position,
  label
}: {
  position: Point;
  label: string;
}) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, 128, 128);

    // Deep slate circular disc
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();

    // High-visibility cyan border ring
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#38bdf8";
    ctx.stroke();

    // Bold white label text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 64, 66);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [label]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <group position={position}>
      <sprite scale={[0.42, 0.42, 1]}>
        <spriteMaterial map={texture} depthTest={false} transparent opacity={0.96} />
      </sprite>
    </group>
  );
}

/**
 * Complete Engineering Model: Superstructure, Substructure & Structural Details
 * Fully synchronized with interactive Playground sliders (concrete dimensions, rebar count, water depth).
 */
export function StructuralModel(callbacks: Callbacks) {
  const layers = useViewerStore((s) => s.layers);
  const motionEnabled = useViewerStore((s) => s.structuralMotionEnabled);
  const cutaway = useViewerStore((s) => s.cutaway);
  const mode = useViewerStore((s) => s.visualizationMode);
  const exhibition = useViewerStore((s) => s.exhibitionMode);
  const showReinforcement = useViewerStore((s) => s.showReinforcement);
  const showLabels = useViewerStore((s) => s.showLabels);
  const playground = useViewerStore((s) => s.isPlaygroundActive);
  const params = useViewerStore((s) => s.playgroundParams);

  const { slab, column, beamWidth, beamDepth } = sceneDimensions(params, playground);
  const beamOffset = slab / 2 + beamDepth / 2;

  // Real-time rebar counts from sliders
  const beamBars = params.bars ?? params.rebarCount ?? 4;
  const columnBars = params.columnRebarCount ?? 12;
  const wallSpacing = (params.spacing ?? 150) * 0.001;

  // Real-time water depth for ground water line in soil section
  const waterDepth = params.waterDepth ?? 2.0;
  const wallHeight = params.height ?? 4.0;
  const grade = 0.25;
  const base = -2.1;
  const waterY = grade - (Math.min(waterDepth, wallHeight) / wallHeight) * (grade - base);

  // Rebar Cages Calculation: dynamically recalculates with bar count and element dimensions!
  const cages = useMemo(() => {
    const groups: Record<string, Segment[]> = {
      beam: [],
      column: [],
      slab: [],
      wallUpper: [],
      wallLower: [],
      basement: [],
      foundation: [],
      basementColumn: []
    };

    for (const floor of levels) {
      const floorCutaway = cutaway && !(mode === "gravity" && floor === 4.35);

      // Beams along X and Z with dynamic bar counts
      for (const z of [-1.25, 1.25]) {
        rectangularCage(
          groups.beam,
          [0, floor - beamOffset, z],
          [3.3, beamDepth, beamWidth],
          0,
          0.14,
          beamBars,
          { ...params, beamWidth: beamWidth / .0005, beamDepth: beamDepth / .0005 }
        );
      }
      for (const x of [-1.65, 1.65]) {
        rectangularCage(
          groups.beam,
          [x, floor - beamOffset, 0],
          [beamWidth, beamDepth, 2.5],
          2,
          0.14,
          beamBars,
          { ...params, beamWidth: beamWidth / .0005, beamDepth: beamDepth / .0005 }
        );
      }

      // Orthogonal top and bottom slab rebar mesh
      for (let i = 0; i <= 14; i++) {
        const x = -1.78 + (3.56 * i) / 14;
        line(
          groups.slab,
          [x, floor + slab * 0.15, -1.38],
          [x, floor + slab * 0.15, floorCutaway && x > 0 ? -0.05 : 1.38]
        );
      }
      for (let i = 0; i <= 11; i++) {
        const z = -1.38 + (2.76 * i) / 11;
        line(
          groups.slab,
          [-1.78, floor - slab * 0.15, z],
          [floorCutaway && z > 0 ? -0.05 : 1.78, floor - slab * 0.15, z]
        );
      }
    }

    // Columns & Piles with dynamic column rebar count
    for (const [x, , z] of columns) {
      rectangularCage(
        groups.column,
        [x, 2.4, z],
        [column * 0.65, 3.9, column * 0.65],
        1,
        0.12,
        columnBars
      );
      rectangularCage(
        groups.basementColumn,
        [x, -0.825, z],
        [column * 0.65, 2.55, column * 0.65],
        1,
        0.12,
        columnBars
      );
      pileCage(groups.foundation, x, z);
    }
    // Raft Foundation / Pile Cap complete two-way flexural rebar mats + starter dowels
    raftCage(groups.foundation);

    // Shear Wall Cages with Confined Boundary Elements and dynamic stirrup spacing
    for (const [name, bottom, top] of [
      ["wallUpper", 0.45, 4.39],
      ["wallLower", -2.08, 0.45]
    ] as const) {
      // 1. Web distributed vertical & horizontal rebar mesh
      for (let i = 0; i <= 8; i++) {
        for (const x of [-0.045, 0.045]) {
          const z = -1.17 + (1.04 * i) / 8;
          line(groups[name], [x, bottom, z], [x, top, z]);
        }
      }
      for (let y = bottom; y < top; y += Math.max(0.1, wallSpacing)) {
        for (const x of [-0.045, 0.045]) {
          line(groups[name], [x, y, -1.17], [x, y, -0.13]);
        }
      }

      // 2. Confined Boundary Element Cages (Left & Right SRPMK Boundary Elements)
      rectangularCage(
        groups[name],
        [0, (bottom + top) / 2, -1.18],
        [0.15, top - bottom, 0.13],
        1,
        0.10,
        6
      );
      rectangularCage(
        groups[name],
        [0, (bottom + top) / 2, -0.12],
        [0.15, top - bottom, 0.13],
        1,
        0.10,
        6
      );
    }

    // Basement Retaining Walls: Full double-curtain rebar on all walls (rear, left, front, right)
    basementWallsCage(groups.basement, cutaway);

    return groups;
  }, [slab, column, beamWidth, beamDepth, beamOffset, cutaway, mode, beamBars, columnBars, wallSpacing, params]);

  const member = (
    id: string,
    position: Point,
    size: Point,
    color: string,
    key: string,
    cylindrical = false,
    isBoundaryElement = false
  ) => (
    <Member
      key={key}
      id={id}
      position={position}
      size={size}
      color={color}
      cylindrical={cylindrical}
      isBoundaryElement={isBoundaryElement}
      {...callbacks}
    />
  );

  return (
    <group name="Engineering_Structural_Model">
      {motionEnabled && layers.load_vector && mode !== "structure" && (
        <group name="Undeformed_Reference">
          {layers.superstructure && (mode === "seismic" || mode === "wind") && (
            <Line points={[[-1.65, .45, 1.25], [-1.65, 4.35, 1.25], [1.65, 4.35, 1.25]]}
              color="#64748b" lineWidth={1} transparent opacity={.55}
              dashed dashSize={.10} gapSize={.08} depthTest={false} raycast={() => {}} />
          )}
          {layers.superstructure && mode === "gravity" && (
            <Line points={[[-1.65, 4.35 + slab / 2, .6], [1.65, 4.35 + slab / 2, .6]]}
              color="#64748b" lineWidth={1} transparent opacity={.55}
              dashed dashSize={.10} gapSize={.08} depthTest={false} raycast={() => {}} />
          )}
          {layers.substructure && (mode === "soil" || mode === "water") && (
            <Line points={[[-1.65, -2.1, .7], [-1.65, .188, .7]]}
              color="#64748b" lineWidth={1} transparent opacity={.55}
              dashed dashSize={.10} gapSize={.08} depthTest={false} raycast={() => {}} />
          )}
          {layers.substructure && mode === "water" && (
            <Line points={[[-1.5, -2.465, .65], [1.5, -2.465, .65]]}
              color="#64748b" lineWidth={1} transparent opacity={.55}
              dashed dashSize={.10} gapSize={.08} depthTest={false} raycast={() => {}} />
          )}
        </group>
      )}
      {/* 1. Substructure Geotechnical Soil Section with dynamic water table line */}
      {layers.substructure && <SoilSection waterY={waterY} mode={mode} />}

      {/* 2. Superstructure Framing Node (Slabs, Beams, Columns, Shear Wall) */}
      {layers.superstructure && <group name="Superstructure_Node">
        {/* Floor Slabs (with architectural cutaway option) */}
        {levels.flatMap((y, i) =>
          cutaway && !(mode === "gravity" && i === 3)
            ? [
                member(
                  "elem-pelat-lantai",
                  [0, y, -0.75],
                  [3.8, slab, 1.5],
                  concretePalette.slab,
                  `slab-back-${i}`
                ),
                member(
                  "elem-pelat-lantai",
                  [-0.95, y, 0.75],
                  [1.9, slab, 1.5],
                  concretePalette.slab,
                  `slab-left-${i}`
                )
              ]
            : [
                member(
                  "elem-pelat-lantai",
                  [0, y, 0],
                  [3.8, slab, 3.0],
                  concretePalette.slab,
                  `slab-${i}`
                )
              ]
        )}

        {/* Framing Columns (4 columns across building corners) */}
        {columns.map(([x, , z], i) =>
          member(
            "elem-kolom",
            [x, 2.4, z],
            [column, 3.9, column],
            concretePalette.column,
            `column-${i}`
          )
        )}

        {/* Framing Beams along X and Z axes */}
        {levels.flatMap((y, i) => [
          ...[-1.25, 1.25].map((z) =>
            member(
              "elem-balok",
              [0, y - beamOffset, z],
              [3.3, beamDepth, beamWidth],
              concretePalette.beam,
              `beam-x-${i}-${z}`
            )
          ),
          ...[-1.65, 1.65].map((x) =>
            member(
              "elem-balok",
              [x, y - beamOffset, 0],
              [beamWidth, beamDepth, 2.5],
              concretePalette.beam,
              `beam-z-${i}-${x}`
            )
          )
        ])}

        {/* Special Reinforced Concrete Shear Wall with Boundary Element Detailing */}
        {member(
          "elem-dinding-geser",
          [0, 2.43, -0.65],
          [0.16, 3.96, 1.2],
          concretePalette.core,
          "core-upper"
        )}
        {/* Left & Right Boundary Element Zones (Boundary Element SNI 2847 Pasal 18.10.6) */}
        {member(
          "elem-dinding-geser",
          [0, 2.43, -1.18],
          [0.2, 3.96, 0.16],
          concretePalette.boundaryElement,
          "boundary-left-upper",
          false,
          true
        )}
        {member(
          "elem-dinding-geser",
          [0, 2.43, -0.12],
          [0.2, 3.96, 0.16],
          concretePalette.boundaryElement,
          "boundary-right-upper",
          false,
          true
        )}

        {/* Rebar Cages with Smooth Fade Transition */}
        <Reinforcement id="elem-balok" segments={cages.beam} show={showReinforcement} {...callbacks} />
        <Reinforcement id="elem-kolom" segments={cages.column} show={showReinforcement} {...callbacks} />
        <Reinforcement id="elem-pelat-lantai" segments={cages.slab} show={showReinforcement} {...callbacks} />
        <Reinforcement id="elem-dinding-geser" segments={cages.wallUpper} show={showReinforcement} {...callbacks} />
      </group>}

      {/* 3. Substructure Node (Basement Columns, Walls, Raft, Spun Piles) */}
      {layers.substructure && <group name="Substructure_Node">
        {/* Basement Columns */}
        {columns.map(([x, , z], i) =>
          member(
            "elem-kolom",
            [x, -0.825, z],
            [column, 2.55, column],
            concretePalette.column,
            `basement-column-${i}`
          )
        )}

        {/* Substructure Shear Wall Core */}
        {member(
          "elem-dinding-geser",
          [0, -0.825, -0.65],
          [0.16, 2.55, 1.2],
          concretePalette.core,
          "core-lower"
        )}

        {/* Substructure Basement Retaining Walls */}
        {member(
          "elem-dinding-basement",
          [0, -0.956, -1.25],
          [3.3, 2.288, 0.18],
          concretePalette.basement,
          "basement-rear"
        )}
        {member(
          "elem-dinding-basement",
          [-1.65, -0.956, 0],
          [0.18, 2.288, 2.5],
          concretePalette.basement,
          "basement-left"
        )}

        {!cutaway && (
          <>
            {member(
              "elem-dinding-basement",
              [0, -0.956, 1.25],
              [3.3, 2.288, 0.18],
              concretePalette.basement,
              "basement-front"
            )}
            {member(
              "elem-dinding-basement",
              [1.65, -0.956, 0],
              [0.18, 2.288, 2.5],
              concretePalette.basement,
              "basement-right"
            )}
          </>
        )}

        {/* Massive Raft Foundation / Pile Cap (4.2m x 3.4m x 0.35m) */}
        {member(
          "elem-pondasi",
          [0, -2.275, 0],
          [4.2, 0.38, 3.4],
          concretePalette.raft,
          "raft"
        )}

        {/* 4 Cylindrical Spun Piles Penetrating into Hard Soil Stratum */}
        {columns.map(([x, , z], i) =>
          member(
            "elem-pondasi",
            [x, -3.35, z],
            [0.16, 1.8, 0.16],
            concretePalette.pile,
            `pile-${i}`,
            true
          )
        )}

        {/* Substructure Rebar Cages with Smooth Fade Transition */}
        <Reinforcement id="elem-pondasi" segments={cages.foundation} show={showReinforcement} {...callbacks} />
        <Reinforcement id="elem-kolom" segments={cages.basementColumn} show={showReinforcement} {...callbacks} />
        <Reinforcement id="elem-dinding-basement" segments={cages.basement} show={showReinforcement} {...callbacks} />
        <Reinforcement id="elem-dinding-geser" segments={cages.wallLower} show={showReinforcement} {...callbacks} />
      </group>}

      {/* 4. University-Grade 3D Architectural Datum & Grid Lines (100% WebGL Native Sprites) */}
      {showLabels && !exhibition && mode === "structure" && (
        <group name="Architectural_Annotations">
          {/* Elevation Datum Levels: Superstructure */}
          {layers.superstructure && (
            <group key="superstructure-datums" name="Superstructure_Datums">
              {MODEL_LEVELS.map(({ sceneY, height, title }) => (
                <ArchitecturalDatum
                  key={`datum-super-${title}`}
                  position={[3.15, sceneY, 1.4]}
                  leaderStart={[1.9, sceneY, 1.4]}
                  elevation={`+${height.toFixed(2)} m`}
                  title={title}
                />
              ))}
            </group>
          )}

          {/* Elevation Datum Levels: Substructure */}
          {layers.substructure && (
            <group key="substructure-datums" name="Substructure_Datums">
              <ArchitecturalDatum
                key="datum-sub-grade"
                position={[3.15, 0.25, 1.4]}
                leaderStart={[1.9, 0.25, 1.4]}
                elevation="±0.00 m"
                title="Muka Tanah Asli"
              />
              <ArchitecturalDatum
                key="datum-sub-mat"
                position={[3.15, waterY, 1.4]}
                leaderStart={[2.35, waterY, 0.4]}
                elevation={`-${Math.min(waterDepth, wallHeight).toFixed(1)} m`}
                title="Muka Air Tanah (MAT)"
              />
              <ArchitecturalDatum
                key="datum-sub-pilecap"
                position={[3.15, -2.25, 1.4]}
                leaderStart={[2.1, -2.25, 1.4]}
                elevation="-4.50 m"
                title="Dasar Pile Cap"
              />
              <ArchitecturalDatum
                key="datum-sub-hardstrata"
                position={[3.15, -4.25, 1.4]}
                leaderStart={[1.8, -4.25, 1.4]}
                elevation="-8.50 m"
                title="Ujung Tiang / Hard Strata"
              />
            </group>
          )}

          {/* Column Grid Identifiers */}
          <group key="column-grid-markers" name="Grid_Markers">
            <GridMarker key="grid-marker-A" position={[-1.65, -4.38, 1.7]} label="A" />
            <GridMarker key="grid-marker-B" position={[1.65, -4.38, 1.7]} label="B" />
            <GridMarker key="grid-marker-1" position={[-2.1, -4.38, -1.25]} label="1" />
            <GridMarker key="grid-marker-2" position={[-2.1, -4.38, 1.25]} label="2" />
          </group>
        </group>
      )}
    </group>
  );
}
