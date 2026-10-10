"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useViewerStore } from "@/store/viewer";
import { createStructuralMotionFrame, deformPoint, REST_MOTION, type MotionFrame } from "@/lib/structuralMotion";
import { useSceneClock, useSceneReducedMotion } from "./SceneAnimation";

const neutral = { current: { ...REST_MOTION } };
const MotionContext = createContext<{ current: MotionFrame }>(neutral);
export const useStructuralMotion = () => useContext(MotionContext);

export function StructuralMotionProvider({ children }: { children: ReactNode }) {
  const frame = useRef<MotionFrame>({ ...REST_MOTION });
  const clock = useSceneClock();
  const reduced = useSceneReducedMotion();
  const origin = useRef({ mode: "", revision: -1, time: 0 });
  useFrame(() => {
    const state = useViewerStore.getState();
    if (state.visualizationMode !== origin.current.mode || state.journeyRevision !== origin.current.revision) {
      origin.current = { mode: state.visualizationMode, revision: state.journeyRevision, time: clock.current - (state.animationPlaying ? 0 : 3) };
    }
    createStructuralMotionFrame(state.visualizationMode, state.playgroundParams,
      clock.current - origin.current.time,
      state.structuralMotionEnabled && !reduced, frame.current);
  }, -.5);
  return <MotionContext.Provider value={frame}>{children}</MotionContext.Provider>;
}

/** Deform cached vertices in place, preserving correct geometry bounds and picking. */
export function useDeformedGeometry(geometry: THREE.BufferGeometry, center: readonly number[] = [0, 0, 0], normals = false) {
  const [centerX, centerY, centerZ] = center;
  const frame = useStructuralMotion();
  const rest = useMemo(() => new Float32Array(geometry.getAttribute("position").array), [geometry]);
  const previous = useRef<MotionFrame>({ baseX: NaN, swayX: 0, gravityY: 0, wallX: 0, upliftY: 0 });
  const point = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => { previous.current.baseX = NaN; }, [geometry, centerX, centerY, centerZ]);
  useFrame(() => {
    const f = frame.current, p = previous.current;
    if (f.baseX === p.baseX && f.swayX === p.swayX && f.gravityY === p.gravityY && f.wallX === p.wallX && f.upliftY === p.upliftY) return;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < rest.length; i += 3) {
      deformPoint(rest[i] + centerX, rest[i + 1] + centerY, rest[i + 2] + centerZ, f, point);
      attr.setXYZ(i / 3, point.x - centerX, point.y - centerY, point.z - centerZ);
    }
    attr.needsUpdate = true;
    if (normals) geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    Object.assign(p, f);
  }, -.25);
}

/** Edges and rebars need intermediate vertices to follow curved members. */
export function subdivideLinePositions(positions: ArrayLike<number>) {
  const result: number[] = [];
  for (let i = 0; i < positions.length; i += 6) {
    const length = Math.hypot(positions[i + 3] - positions[i], positions[i + 4] - positions[i + 1], positions[i + 5] - positions[i + 2]);
    const count = Math.max(1, Math.ceil(length / .2));
    for (let n = 0; n < count; n++) {
      for (const t of [n / count, (n + 1) / count]) {
        for (let axis = 0; axis < 3; axis++) result.push(positions[i + axis] + (positions[i + axis + 3] - positions[i + axis]) * t);
      }
    }
  }
  return new Float32Array(result);
}
