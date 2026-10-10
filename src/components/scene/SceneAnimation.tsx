"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useViewerStore } from "@/store/viewer";
import { JOURNEY_STAGE_SECONDS } from "@/lib/loadJourney";

const SceneClock = createContext<{ current: number } | null>(null);
const ReducedMotion = createContext(false);
const JourneyProgress = createContext<{ current: number } | null>(null);

/** One clock and motion preference listener for the entire canvas. */
export function SceneAnimationProvider({ children }: { children: ReactNode }) {
  const elapsed = useRef(0);
  const journeyProgress = useRef(1);
  const journeySnapshot = useRef({ mode: "", revision: -1 });
  const playing = useViewerStore((s) => s.animationPlaying);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(media.matches);
      journeyProgress.current = media.matches || !useViewerStore.getState().animationPlaying ? 1 : 0;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useFrame((_, delta) => {
    if (playing && !reduced) elapsed.current += Math.min(delta, 0.05);
    const state = useViewerStore.getState();
    if (journeySnapshot.current.mode !== state.visualizationMode || journeySnapshot.current.revision !== state.journeyRevision) {
      journeySnapshot.current = { mode: state.visualizationMode, revision: state.journeyRevision };
      journeyProgress.current = state.animationPlaying && !reduced ? 0 : 1;
    }
    if (reduced || !state.animationPlaying || state.visualizationMode === "structure" || !state.layers.load_vector) return;
    journeyProgress.current += Math.min(delta, 0.05) / JOURNEY_STAGE_SECONDS;
    if (journeyProgress.current >= 1) {
      journeyProgress.current %= 1;
      state.advanceJourney();
    }
  }, -1);

  return (
    <SceneClock.Provider value={elapsed}>
      <ReducedMotion.Provider value={reduced}>
        <JourneyProgress.Provider value={journeyProgress}>{children}</JourneyProgress.Provider>
      </ReducedMotion.Provider>
    </SceneClock.Provider>
  );
}

/** Normalized progress within the shared load journey stage; updated before scene meshes. */
export function useJourneyProgress() {
  const progress = useContext(JourneyProgress);
  const fallback = useRef(1);
  return progress ?? fallback;
}

export function useScenePhase(speed = 1, enabled = true) {
  const clock = useContext(SceneClock);
  const phase = useRef(0.2);
  const previous = useRef<number | null>(null);
  useFrame(() => {
    if (!clock) return;
    if (previous.current !== null && enabled) {
      phase.current += Math.max(0, clock.current - previous.current) * speed;
    }
    previous.current = clock.current;
  });
  return phase;
}

/** Read-only shared elapsed time. Pausing and reduced motion stop this clock. */
export function useSceneClock() {
  const clock = useContext(SceneClock);
  const fallback = useRef(0);
  return clock ?? fallback;
}

export function useSceneReducedMotion() {
  return useContext(ReducedMotion);
}
