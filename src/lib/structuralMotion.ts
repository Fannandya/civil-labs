import type { VisualizationMode } from "@/store/viewer";

/** Illustrative scene displacements, in model units; these are not analysis results. */
export type MotionFrame = { baseX: number; swayX: number; gravityY: number; wallX: number; upliftY: number };
export const REST_MOTION: Readonly<MotionFrame> = Object.freeze({ baseX: 0, swayX: 0, gravityY: 0, wallX: 0, upliftY: 0 });
const clamp = (n: number, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const value = (params: Record<string, number>, key: string, fallback: number) => Number.isFinite(params[key]) ? params[key] : fallback;
const smooth = (n: number) => { const v = clamp(n); return v * v * (3 - 2 * v); };

export function createStructuralMotionFrame(
  mode: VisualizationMode,
  params: Record<string, number>,
  time: number,
  enabled = true,
  out: MotionFrame = { ...REST_MOTION }
): MotionFrame {
  Object.assign(out, REST_MOTION);
  if (!enabled || mode === "structure") return out;
  const t = Math.max(0, Number.isFinite(time) ? time : 0);
  const entrance = smooth(t / 1.2);

  // Explanatory load cycle with smooth load/unload envelope (cycle length 10s)
  const cycle = t % 10;
  const envelope = cycle < 1 ? 0 : cycle < 3.5 ? smooth((cycle - 1) / 2.5) : cycle < 7 ? 1 : cycle < 9 ? 1 - smooth((cycle - 7) / 2) : 0;

  if (mode === "seismic") {
    const sds = Math.max(0, value(params, "sds", 0.71));
    const weight = Math.max(0, value(params, "weight", 12000));
    const gain = clamp((sds / 0.71) * (0.65 + 0.35 * (weight / 12000)), 0.25, 1.45);
    // Ground acceleration translation at foundation level
    out.baseX = 0.045 * Math.sin(t * 2.6) * entrance * gain;
    // Superstructure first-mode lateral flexural vibration with dynamic phase lag & harmonic overtone
    out.swayX = 0.22 * (Math.sin(t * 2.6 - 0.7) + 0.12 * Math.sin(t * 5.2 - 0.35)) * entrance * gain;
  } else if (mode === "wind") {
    const speed = Math.max(0, value(params, "speed", 35));
    if (speed <= 0) return out;
    const gain = clamp((speed / 35) ** 2, 0.05, 1.6);
    // Static lateral aerodynamic drag drift + turbulent gust buffeting pulsation
    const buffeting = 0.74 + 0.26 * Math.sin(t * 1.5) + 0.08 * Math.cos(t * 3.2);
    out.swayX = 0.18 * buffeting * entrance * gain;
  } else if (mode === "gravity") {
    // Structural dead load + live load vs member flexural stiffness
    const occupants = Math.max(0, value(params, "occupantCount", 180));
    const personWeight = Math.max(0, value(params, "personWeight", 70));
    const floorArea = Math.max(1, value(params, "floorArea", 192));
    const qLiveOccupants = (occupants * personWeight * 9.81) / (floorArea * 1000);
    const qFurniture = Math.max(0, value(params, "partitionFurniture", 1.0));
    const qLive = qLiveOccupants + qFurniture;

    const slabHf = Math.max(50, value(params, "slabThickness", 140));
    const beamH = Math.max(150, value(params, "beamDepth", 600));
    const sidl = Math.max(0, value(params, "deadLoadSidl", 1.5));
    const qDead = 24 * (slabHf / 1000) + sidl;
    const qTotal = qDead + qLive;

    // Flexural rigidity EI scaling (slab h_f^3 and beam h^3)
    const kSlab = (slabHf / 140) ** 3;
    const kBeam = (beamH / 600) ** 3;
    const stiffness = 0.55 * kSlab + 0.45 * kBeam;
    const flexFactor = clamp((qTotal / 6.5) / Math.max(0.25, stiffness), 0.3, 1.8);

    // Dynamic occupant activity / live-load breathing pulsation
    const pulse = 0.88 + 0.12 * Math.sin(t * 1.8);
    out.gravityY = 0.075 * flexFactor * envelope * pulse;
  } else if (mode === "soil") {
    const hWall = Math.max(0.5, value(params, "height", 4.0));
    const phiDeg = clamp(value(params, "phi", 30), 10, 50);
    // At-rest earth pressure coefficient K0 = 1 - sin(phi)
    const k0 = 1 - Math.sin((phiDeg * Math.PI) / 180);
    const thrustRatio = (k0 / 0.5) * (hWall / 4.0) ** 2;
    const gain = clamp(thrustRatio, 0.25, 2.0);

    const pulse = 0.90 + 0.10 * Math.sin(t * 1.4);
    out.wallX = 0.095 * gain * envelope * pulse;
  } else if (mode === "water") {
    const hBasement = Math.max(0.5, value(params, "height", 4.0));
    const wDepth = value(params, "waterDepth", 2.0);
    const wHead = Math.max(0, value(params, "waterHead", 3.0));

    const submergedHeight = clamp(hBasement - wDepth, 0, hBasement);
    const wetFraction = submergedHeight / hBasement;
    const hydroGain = clamp((submergedHeight / 2.0) ** 1.5, 0, 2.0);
    const upliftGain = clamp(wHead / 3.0, 0, 2.0);

    const wallPulse = 0.92 + 0.08 * Math.sin(t * 1.5);
    const upliftPulse = 0.90 + 0.10 * Math.sin(t * 1.8);

    out.wallX = wetFraction > 0.001 ? 0.09 * hydroGain * envelope * wallPulse : 0;
    out.upliftY = wHead > 0.001 ? 0.075 * upliftGain * envelope * upliftPulse : 0;
  }
  return out;
}

/** The same continuous world-space field is used by concrete, steel and load guides. */
export function deformPoint<T extends { x: number; y: number; z: number }>(
  x: number,
  y: number,
  z: number,
  frame: MotionFrame,
  out: T
): T {
  const height = clamp((y - 0.45) / 3.9);
  const spanX = Math.max(0, 1 - (x / 1.65) ** 2);
  const spanZ = Math.max(0, 1 - (z / 1.25) ** 2);

  // Zero sag at every corner support; smooth below the first floor.
  // Attenuate slab sag near rigid central core shear wall so vertical walls do not drop.
  const nearCore = Math.max(0, 1 - Math.abs(x) / 0.22) * Math.max(0, 1 - Math.abs(z + 0.65) / 0.7);
  const sag = (spanX + spanZ) * 0.5 * smooth((y + 0.1) / 0.45) * (1 - 0.85 * nearCore);

  const wallHeight = clamp((y + 2.1) / 2.288);
  const wallShape = Math.sin(Math.PI * wallHeight) ** 2 * spanZ * Math.max(0, 1 - Math.abs(x + 1.65) / 0.4);

  // The raft flexes between pile heads; pile axes and all corner attachments stay fixed.
  const raftShape = spanX * spanZ * Math.max(0, 1 - Math.abs(y + 2.275) / 0.65);

  out.x = x + frame.baseX + frame.swayX * height ** 1.35 + frame.wallX * wallShape;
  out.y = y - frame.gravityY * sag + frame.upliftY * raftShape;
  out.z = z;
  return out;
}
