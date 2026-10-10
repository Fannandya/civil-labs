"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useScenePhase } from "./SceneAnimation";
import { deformPoint } from "@/lib/structuralMotion";
import { useStructuralMotion } from "./StructuralMotion";
export { SceneAnimationProvider, useJourneyProgress, useScenePhase } from "./SceneAnimation";

export type Point3 = [number, number, number];

export const VECTOR_COLORS = {
  gravity: "#426b8a",
  wind: "#3c7f8a",
  seismic: "#b77932",
  soil: "#936b4f",
  water: "#347db0",
  transfer: "#84724a",
  rebar: "#607b8f",
  safe: "#4d7b6c",
  warning: "#ad8039",
  danger: "#ad5953",
  reaction: "#4d7b6c",
  grid: "#64748b"
};

/** Force glyph anchored to the moving model when requested. */
export function ForceArrow({
  start,
  end,
  color,
  radius = 0.028,
  animate = true,
  pulseSpeed = 0.5,
  deform = false
}: {
  start: Point3;
  end: Point3;
  color: string;
  radius?: number;
  animate?: boolean;
  pulseSpeed?: number;
  deform?: boolean;
  /** Legacy compatibility; expanding rings are no longer rendered. */
  showPulseRing?: boolean;
}) {
  const [startX, startY, startZ] = start;
  const [endX, endY, endZ] = end;
  const { length, rotation } = useMemo(() => {
    const direction = new THREE.Vector3(endX, endY, endZ).sub(new THREE.Vector3(startX, startY, startZ));
    const length = direction.length();
    return {
      length,
      rotation: Number.isFinite(length) && length > 0.001
        ? new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.divideScalar(length))
        : new THREE.Quaternion()
    };
  }, [startX, startY, startZ, endX, endY, endZ]);

  const group = useRef<THREE.Group>(null);
  const motion = useStructuralMotion();
  const mapped = useMemo(() => ({ start: new THREE.Vector3(), end: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);
  const marker = useRef<THREE.Mesh>(null);
  const headMesh = useRef<THREE.Mesh>(null);
  const markerColor = useMemo(() => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.55), [color]);
  const phase = useScenePhase(pulseSpeed, animate);
  const head = Math.min(0.2, length * 0.32);
  const shaftLength = Math.max(0, length - head);
  const shaftRadius = Math.min(Math.max(0.001, radius), length * 0.055);
  const markerHeight = Math.min(shaftRadius * 2.4, shaftLength * 0.16);

  useFrame(() => {
    if (group.current) {
      if (deform && length > 0.001) {
        deformPoint(...start, motion.current, mapped.start);
        deformPoint(...end, motion.current, mapped.end);
        mapped.end.sub(mapped.start);
        const deformedLength = mapped.end.length();
        group.current.position.copy(mapped.start);
        group.current.quaternion.setFromUnitVectors(mapped.up, mapped.end.normalize());
        group.current.scale.y = deformedLength / length;
      } else {
        group.current.position.set(...start);
        group.current.quaternion.copy(rotation);
        group.current.scale.y = 1;
      }
    }
    if (animate) {
      if (marker.current) {
        const travel = Math.max(0, shaftLength - markerHeight);
        marker.current.position.y = markerHeight / 2 + (phase.current % 1) * travel;
      }
      if (headMesh.current) {
        const cycle = phase.current % 1;
        const hit = Math.max(0, (cycle - 0.75) / 0.25);
        const scale = 1.0 + Math.sin(hit * Math.PI) * 0.15;
        headMesh.current.scale.set(scale, scale, scale);
      }
    }
  });

  if (!Number.isFinite(length) || length < 0.001) return null;

  return (
    <group ref={group} position={start} quaternion={rotation}>
      <mesh position={[0, shaftLength / 2, 0]}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 10]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh ref={headMesh} position={[0, length - head / 2, 0]}>
        <coneGeometry args={[shaftRadius * 2.8, head, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      {animate && (
        <mesh ref={marker} position={[0, shaftLength * 0.2, 0]}>
          <cylinderGeometry args={[shaftRadius * 1.5, shaftRadius * 1.5, markerHeight, 10]} />
          <meshStandardMaterial
            color={markerColor}
            emissive={markerColor}
            emissiveIntensity={0.85}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Schematic load-transfer guide with tangent-oriented directional energy pulses.
 * Visible through concrete for clear load path explanation.
 */
export function FlowPath({
  points,
  color = VECTOR_COLORS.transfer,
  count = 3,
  speed = 0.22,
  beadSize = 0.035,
  showLine = true,
  lineWidth = 2.2,
  lineOpacity = 0.65
}: {
  points: Point3[];
  color?: string;
  count?: number;
  speed?: number;
  beadSize?: number;
  showLine?: boolean;
  lineWidth?: number;
  lineOpacity?: number;
}) {
  const validPoints = useMemo(() => points.reduce<Point3[]>((valid, point) => {
    const previous = valid[valid.length - 1];
    if (point.every(Number.isFinite) && (!previous || point.some((v, axis) => v !== previous[axis]))) valid.push(point);
    return valid;
  }, []), [points]);
  const curve = useMemo(() => {
    if (validPoints.length < 2) return null;
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < validPoints.length; i++) {
      path.add(new THREE.LineCurve3(new THREE.Vector3(...validPoints[i - 1]), new THREE.Vector3(...validPoints[i])));
    }
    return path;
  }, [validPoints]);
  const linePoints = useMemo(() => curve?.getPoints(36) ?? [], [curve]);
  const markerCount = Number.isFinite(count) ? Math.min(8, Math.max(0, Math.floor(count))) : 0;
  const markers = useRef<(THREE.Mesh | null)[]>([]);
  const phase = useScenePhase(speed);
  const tempPoint = useMemo(() => new THREE.Vector3(), []);
  const tempTangent = useMemo(() => new THREE.Vector3(), []);
  const upVector = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const emissiveColor = useMemo(() => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.55), [color]);

  useFrame(() => {
    if (!curve) return;
    markers.current.slice(0, markerCount).forEach((marker, index) => {
      if (marker) {
        const u = (phase.current + index / markerCount) % 1;
        curve.getPoint(u, tempPoint);
        curve.getTangent(u, tempTangent);
        marker.position.copy(tempPoint);
        if (tempTangent.lengthSq() > 0.0001) {
          tempTangent.normalize();
          marker.quaternion.setFromUnitVectors(upVector, tempTangent);
        }
      }
    });
  });

  if (!curve) return null;
  return (
    <group name="FlowPath">
      {showLine && (
        <Line
          points={linePoints}
          color={color}
          lineWidth={lineWidth}
          transparent
          opacity={lineOpacity}
          depthTest={false}
          depthWrite={false}
          renderOrder={20}
        />
      )}
      {Array.from({ length: markerCount }, (_, i) => (
        <mesh key={i} ref={(node) => { markers.current[i] = node; }} position={validPoints[0]} renderOrder={22}>
          <cylinderGeometry
            args={[
              Math.max(0.005, beadSize * 0.4),
              Math.max(0.008, beadSize * 0.95),
              Math.max(0.02, beadSize * 2.8),
              8
            ]}
          />
          <meshStandardMaterial
            color={color}
            emissive={emissiveColor}
            emissiveIntensity={1.0}
            roughness={0.2}
            metalness={0.1}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Dynamic Two-Way Slab Tributary Load Flow
 * Animates energy pulses shedding from the slab center directly into the 4 perimeter beams.
 */
export function TributaryLoadFlow({
  center,
  width,
  depth,
  color = VECTOR_COLORS.transfer
}: {
  center: Point3;
  width: number;
  depth: number;
  color?: string;
}) {
  const [cx, cy, cz] = center;
  const hw = width / 2;
  const hd = depth / 2;
  const apexDist = Math.min(hw, hd);

  const streams: Point3[][] = useMemo(() => [
    [[cx, cy + 0.02, cz], [cx, cy + 0.02, cz - hd]],
    [[cx, cy + 0.02, cz], [cx, cy + 0.02, cz + hd]],
    [[cx - hw + apexDist, cy + 0.02, cz], [cx - hw, cy + 0.02, cz]],
    [[cx + hw - apexDist, cy + 0.02, cz], [cx + hw, cy + 0.02, cz]]
  ], [cx, cy, cz, hw, hd, apexDist]);

  return (
    <group name="Tributary_Load_Flow">
      {streams.map((pts, i) => (
        <FlowPath
          key={i}
          points={pts}
          color={color}
          count={2}
          speed={0.2}
          beadSize={0.03}
          lineWidth={1.8}
          lineOpacity={0.75}
        />
      ))}
    </group>
  );
}

/** Flat schematic pressure distribution with a quiet fill and clear boundary. */
export function PressureEnvelope({ points, color, opacity = 0.12 }: {
  points: Point3[];
  color: string;
  opacity?: number;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.BufferGeometry();
    const positions: number[] = [];
    if (points.every((point) => point.every(Number.isFinite))) {
      for (let i = 1; i < points.length - 1; i++) positions.push(...points[0], ...points[i], ...points[i + 1]);
    }
    shape.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    shape.computeVertexNormals();
    return shape;
  }, [points]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  if (points.length < 3 || !points.every((point) => point.every(Number.isFinite))) return null;

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={Math.min(0.24, Math.max(0, opacity))}
          depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Line points={[...points, points[0]]} color={color} lineWidth={1.2} transparent opacity={0.8} />
    </group>
  );
}

/**
 * Civil Engineering Tributary Envelope for Two-Way Slab Panels
 * Displays the 45-degree trapezoidal (long span) and triangular (short span)
 * schematic tributary load division for uniformly loaded two-way panels.
 */
export function TributaryEnvelope({
  center,
  width,
  depth,
  color = VECTOR_COLORS.transfer
}: {
  center: Point3;
  width: number;
  depth: number;
  color?: string;
}) {
  const [cx, cy, cz] = center;
  const hw = width / 2;
  const hd = depth / 2;
  const apexDist = Math.min(hw, hd); // Equal offsets produce the 45-degree boundaries.

  if (width <= 0 || depth <= 0 || !Number.isFinite(width + depth)) return null;

  // Panel corners
  const p1: Point3 = [cx - hw, cy, cz - hd];
  const p2: Point3 = [cx + hw, cy, cz - hd];
  const p3: Point3 = [cx + hw, cy, cz + hd];
  const p4: Point3 = [cx - hw, cy, cz + hd];

  // Ridge endpoints (along the longer direction)
  const isWidthLonger = width >= depth;
  const r1: Point3 = isWidthLonger
    ? [cx - hw + apexDist, cy, cz]
    : [cx, cy, cz - hd + apexDist];
  const r2: Point3 = isWidthLonger
    ? [cx + hw - apexDist, cy, cz]
    : [cx, cy, cz + hd - apexDist];

  return (
    <group name="Tributary_Envelope">
      {/* Tributary boundary lines */}
      <Line points={[p1, r1]} color={color} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.05} transparent opacity={0.65} />
      <Line points={[p4, r1]} color={color} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.05} transparent opacity={0.65} />
      <Line points={[p2, r2]} color={color} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.05} transparent opacity={0.65} />
      <Line points={[p3, r2]} color={color} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.05} transparent opacity={0.65} />
      {width !== depth && <Line points={[r1, r2]} color={color} lineWidth={1.3} transparent opacity={0.8} />}

      {/* Shaded tributary zones */}
      <PressureEnvelope points={[p1, p4, r1]} color={color} opacity={0.08} />
      <PressureEnvelope points={[p2, p3, r2]} color={color} opacity={0.08} />
      <PressureEnvelope points={[p1, r1, r2, p2]} color={color} opacity={0.12} />
      <PressureEnvelope points={[p4, r1, r2, p3]} color={color} opacity={0.12} />
    </group>
  );
}

/**
 * Soil Resistance / Upward Pile Skin Friction & End Bearing Vectors
 * Illustrates Newton's 3rd law (soil upward reaction balancing building downward load).
 */
export function SoilReactionVector({
  position,
  height,
  radius = 0.02,
  color = VECTOR_COLORS.reaction
}: {
  position: Point3;
  height: number;
  radius?: number;
  color?: string;
}) {
  const [x, y, z] = position;
  if (!Number.isFinite(height) || height <= 0) return null;
  const bottom = y - height / 2;
  const arrowLength = Math.min(0.32, height * 0.15);
  return (
    <group name="SoilReaction">
      {/* Shaft friction is distributed along the pile, entirely below its head. */}
      {[0.2, 0.5, 0.8].map((fraction, i) => {
        const arrowX = x + (i % 2 === 0 ? 0.16 : -0.16);
        const arrowY = bottom + height * fraction;
        return <ForceArrow key={i} start={[arrowX, arrowY, z]}
          end={[arrowX, arrowY + arrowLength, z]} color={color}
          radius={radius * 0.8} pulseSpeed={0.35} />;
      })}
      {/* End bearing acts upward on the pile tip. */}
      <ForceArrow start={[x, bottom - Math.min(0.4, height * 0.25), z]}
        end={[x, bottom, z]} color={color} radius={radius * 1.2} pulseSpeed={0.35} />
    </group>
  );
}
