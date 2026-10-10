"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import { deformPoint } from "@/lib/structuralMotion";
import { useStructuralMotion } from "./StructuralMotion";
import { useViewerStore } from "@/store/viewer";
import { LOAD_JOURNEYS, type JourneyMode } from "@/lib/loadJourney";
import { sceneDimensions } from "./sceneConfig";
import { useJourneyProgress, VECTOR_COLORS, type Point3 } from "./ScenePrimitives";

type Route = { points: Point3[]; layer: "superstructure" | "substructure" | "both"; reaction?: boolean };

/** Grow each straight segment in turn, keeping the arrow tangent at every joint. */
function JourneyRoute({ route, color, active, completed, progress, number, label }: {
  route: Route; color: string; active: boolean; completed: boolean;
  progress: MutableRefObject<number>; number: number; label: string | null;
}) {
  const shafts = useRef<(THREE.Mesh | null)[]>([]);
  const arrow = useRef<THREE.Mesh>(null);
  const motion = useStructuralMotion();
  const line = useRef<Line2>(null);
  const endpoint = useRef<THREE.Group>(null);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  // Short segments keep the guide attached along bending columns and walls.
  const points = useMemo(() => {
    const result: Point3[] = [route.points[0]];
    for (let i = 1; i < route.points.length; i++) {
      const from = route.points[i - 1];
      const to = route.points[i];
      const count = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]) / 0.25));
      for (let j = 1; j <= count; j++) {
        result.push([from[0] + (to[0] - from[0]) * j / count,
          from[1] + (to[1] - from[1]) * j / count, from[2] + (to[2] - from[2]) * j / count]);
      }
    }
    return result;
  }, [route.points]);
  const mapped = useMemo(() => points.map((point) => new THREE.Vector3(...point)), [points]);
  const segments = useMemo(() => points.slice(1).map(() => ({
    direction: new THREE.Vector3(), length: 0, rotation: new THREE.Quaternion()
  })), [points]);
  const end = points[points.length - 1];
  const routeColor = route.reaction ? VECTOR_COLORS.reaction : color;

  useFrame(() => {
    let total = 0;
    points.forEach((point, i) => deformPoint(...point, motion.current, mapped[i]));
    const starts = line.current?.geometry.getAttribute("instanceStart");
    const ends = line.current?.geometry.getAttribute("instanceEnd");
    segments.forEach((segment, i) => {
      segment.direction.copy(mapped[i + 1]).sub(mapped[i]);
      segment.length = segment.direction.length();
      segment.direction.normalize();
      segment.rotation.setFromUnitVectors(up, segment.direction);
      total += segment.length;
      starts?.setXYZ(i, mapped[i].x, mapped[i].y, mapped[i].z);
      ends?.setXYZ(i, mapped[i + 1].x, mapped[i + 1].y, mapped[i + 1].z);
    });
    if (starts) starts.needsUpdate = true;
    if (ends) ends.needsUpdate = true;
    // Buffer bounds must follow the displaced path for correct frustum culling.
    line.current?.geometry.computeBoundingBox();
    line.current?.geometry.computeBoundingSphere();
    if (endpoint.current) endpoint.current.position.copy(mapped[mapped.length - 1]);
    if (!active) return;
    const distance = Math.max(0.035, Math.min(1, progress.current / 0.8) * total);
    let traveled = 0;
    let headPlaced = false;
    segments.forEach((segment, i) => {
      const covered = THREE.MathUtils.clamp(distance - traveled, 0, segment.length);
      const shaft = shafts.current[i];
      if (shaft) {
        shaft.visible = covered > 0.001;
        shaft.scale.y = Math.max(0.001, covered);
        shaft.position.copy(mapped[i]).addScaledVector(segment.direction, covered / 2);
        shaft.quaternion.copy(segment.rotation);
      }
      if (arrow.current && !headPlaced && distance <= traveled + segment.length + 0.001) {
        arrow.current.position.copy(mapped[i]).addScaledVector(segment.direction, covered - 0.12);
        arrow.current.quaternion.copy(segment.rotation);
        headPlaced = true;
      }
      traveled += segment.length;
    });
  });

  return (
    <group name={`Load_Journey_Step_${number}`}>
      <Line ref={line} points={points} color={active || completed ? routeColor : "#7e8b98"}
        lineWidth={active ? 2.5 : 1.3} transparent opacity={active ? 0.42 : completed ? 0.28 : 0.14}
        depthTest={false} depthWrite={false} renderOrder={31} />
      {active && <>
        {segments.map((segment, i) => (
          <mesh key={i} ref={(mesh) => { shafts.current[i] = mesh; }}
            quaternion={segment.rotation} visible={false} renderOrder={32}>
            <cylinderGeometry args={[0.026, 0.026, 1, 8]} />
            <meshBasicMaterial color={routeColor} depthTest={false} depthWrite={false} />
          </mesh>
        ))}
        <mesh ref={arrow} position={route.points[0]} quaternion={segments[0].rotation} renderOrder={34}>
          <coneGeometry args={[0.095, 0.24, 12]} />
          <meshBasicMaterial color={routeColor} depthTest={false} depthWrite={false} />
        </mesh>
        <group ref={endpoint} position={end}>
        <Billboard>
          <mesh renderOrder={33}>
            <ringGeometry args={[0.11, 0.14, 32]} />
            <meshBasicMaterial color={routeColor} transparent opacity={0.8} side={THREE.DoubleSide} depthTest={false} depthWrite={false} />
          </mesh>
        </Billboard>
        {label && <Html center zIndexRange={[90, 0]} style={{ pointerEvents: "none" }}>
          <div className="journey-node" style={{ borderColor: routeColor, color: routeColor, transform: "translateY(26px)" }} aria-hidden="true">
            <span>{route.reaction ? "R" : number}</span>
            <strong>{route.reaction ? "Reaksi tanah" : label}</strong>
          </div>
        </Html>}
        </group>
      </>}
    </group>
  );
}

/** One representative equilibrium path. Positions follow the schematic members. */
export function LoadJourney() {
  const mode = useViewerStore((s) => s.visualizationMode);
  const step = useViewerStore((s) => s.journeyStep);
  const layers = useViewerStore((s) => s.layers);
  const params = useViewerStore((s) => s.playgroundParams);
  const playground = useViewerStore((s) => s.isPlaygroundActive);
  const labels = useViewerStore((s) => s.showLabels);
  const progress = useJourneyProgress();
  const dimensions = sceneDimensions(params, playground);
  const slabTop = 4.35 + dimensions.slab / 2;
  const beamY = 4.35 - dimensions.slab / 2 - dimensions.beamDepth / 2;
  const floorTop = 3.05 + dimensions.slab / 2;
  const floorBeam = 3.05 - dimensions.slab / 2 - dimensions.beamDepth / 2;
  const height = Math.max(0.1, params.height ?? 4);
  const waterHeight = Math.max(0, height - (params.waterDepth ?? 2));
  const pressureY = -2.1 + (2.35 * waterHeight / height) / 3;

  const routes = useMemo<Record<JourneyMode, Route[][]>>(() => ({
    gravity: [
      [{ points: [[-0.55, slabTop + 1.2, 0.6], [-0.55, slabTop, 0.6]], layer: "superstructure" }],
      [{ points: [[-0.55, slabTop, 0.6], [-0.55, slabTop, 1.25], [-0.55, beamY, 1.25]], layer: "superstructure" }],
      [{ points: [[-0.55, beamY, 1.25], [-1.65, beamY, 1.25]], layer: "superstructure" }],
      [{ points: [[-1.65, beamY, 1.25], [-1.65, 0.45, 1.25], [-1.65, -2.275, 1.25]], layer: "both" }],
      [{ points: [[-1.65, -2.275, 1.25], [-1.65, -4.25, 1.25]], layer: "substructure" },
       { points: [[-1.32, -4.65, 1.25], [-1.32, -4.25, 1.25]], layer: "substructure", reaction: true }]
    ],
    wind: [
      [{ points: [[-3.2, floorTop, 0.65], [-1.9, floorTop, 0.65]], layer: "superstructure" }],
      [{ points: [[-1.9, floorTop, 0.65], [-0.65, floorTop, 0.65], [-0.65, floorTop, 1.25]], layer: "superstructure" }],
      [{ points: [[-0.65, floorTop, 1.25], [-0.65, floorBeam, 1.25], [-1.65, floorBeam, 1.25], [-1.65, 0.45, 1.25]], layer: "superstructure" }],
      [{ points: [[-1.65, 0.45, 1.25], [-1.65, -2.275, 1.25], [-1.65, -4.25, 1.25]], layer: "substructure" }]
    ],
    seismic: [
      [{ points: [[-2.65, -2.275, 1.25], [-1.65, -2.275, 1.25]], layer: "substructure" }],
      [{ points: [[-1.45, floorTop, 0.65], [-0.65, floorTop, 0.65], [-0.65, floorTop, 1.25]], layer: "superstructure" }],
      [{ points: [[-0.65, floorTop, 1.25], [-0.65, floorBeam, 1.25], [-1.65, floorBeam, 1.25], [-1.65, 0.45, 1.25]], layer: "superstructure" }],
      [{ points: [[-1.65, 0.45, 1.25], [-1.65, -2.275, 1.25], [-1.65, -4.25, 1.25]], layer: "substructure" }]
    ],
    soil: [
      [{ points: [[-3.1, -1.32, 0.7], [-1.74, -1.32, 0.7]], layer: "substructure" }],
      [{ points: [[-1.74, -1.32, 0.7], [-1.65, -1.32, 0.7], [-1.65, -0.5, 0.7]], layer: "substructure" },
       { points: [[-1.65, -1.32, 0.7], [-1.65, -1.8, 0.7]], layer: "substructure" }],
      [{ points: [[-1.65, -0.5, 0.7], [-1.65, 0.18, 0.7], [-1.65, 0.18, 1.25], [-1.65, 0.45, 1.25]], layer: "both" },
       { points: [[-1.65, -1.8, 0.7], [-1.65, -2.275, 0.7]], layer: "substructure" }]
    ],
    water: [
      [{ points: [[-2.7, pressureY, 0.7], [-1.65, pressureY, 0.7]], layer: "substructure" }],
      [{ points: [[-1.65, pressureY, 0.7], [-1.65, 0.18, 0.7], [-1.65, 0.18, 1.25], [-1.65, 0.45, 1.25]], layer: "both" },
       { points: [[-1.65, pressureY, 0.7], [-1.65, -2.275, 0.7]], layer: "substructure" }],
      [{ points: [[-0.6, -3.15, 1], [-0.6, -2.465, 1]], layer: "substructure" }],
      [{ points: [[-1.65, -0.7, 1.25], [-1.65, -2.275, 1.25]], layer: "substructure" }]
    ]
  }), [slabTop, beamY, floorTop, floorBeam, pressureY]);

  if (mode === "structure" || !layers.load_vector) return null;
  if (mode === "wind" && (params.speed ?? 35) <= 0) return null;
  const stages = LOAD_JOURNEYS[mode];
  return <group name="Staged_Load_Journey">
    {routes[mode].flatMap((stageRoutes, index) => {
      if (mode === "water" && ((index < 2 && waterHeight <= 0) || (index === 2 && (params.waterHead ?? 3) <= 0))) return [];
      return stageRoutes.filter((route) => route.layer === "both"
        ? layers.superstructure && layers.substructure : layers[route.layer]).map((route, branch) => (
        <JourneyRoute key={`${mode}-${index}-${branch}`} route={route} color={VECTOR_COLORS[mode]}
          active={index === step} completed={index < step} progress={progress} number={index + 1}
          label={labels && branch === 0 ? stages[index].title : null} />
      ));
    })}
  </group>;
}
