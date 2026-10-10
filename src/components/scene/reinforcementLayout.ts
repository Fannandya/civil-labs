import { beamReinforcementLayout, type EngineeringParams } from "@/lib/engineeringCalculations";

export type CageAxis = 0 | 1 | 2;
export type CageOffset = [number, number];

/** Returns normalized longitudinal bar offsets in the cage's two cross-section axes. */
export function longitudinalBarOffsets(axis: CageAxis, count: number, params: EngineeringParams = {}): CageOffset[] {
  const corners: CageOffset[] = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
  ];

  if (axis === 0 || axis === 2) {
    const verticalIndex = axis === 0 ? 0 : 1;
    const horizontalIndex = 1 - verticalIndex;
    const layout = beamReinforcementLayout({ ...params, bars: count });
    if (!layout.fits) return [];
    const offsets: CageOffset[] = layout.positions.map(([x, y]) => {
      const offset: CageOffset = [0, 0];
      offset[horizontalIndex] = x / (layout.width / 2);
      offset[verticalIndex] = (y - layout.height / 2) / (layout.height / 2);
      return offset;
    });
    // Two constructive top bars are independent of the requested tension count.
    for (const x of [-layout.width / 2 + layout.edge, layout.width / 2 - layout.edge]) {
      const offset: CageOffset = [0, 0];
      offset[horizontalIndex] = x / (layout.width / 2);
      offset[verticalIndex] = (layout.height / 2 - layout.edge) / (layout.height / 2);
      offsets.push(offset);
    }
    return offsets;
  }

  const offsets = [...corners];
  const extraCount = Math.max(0, count - 4);
  const sideCounts = [0, 0, 0, 0];
  for (let i = 0; i < extraCount; i++) sideCounts[i % 4]++;

  for (let side = 0; side < 4; side++) {
    const faceCount = sideCounts[side];
    for (let i = 1; i <= faceCount; i++) {
      const alongFace = -1 + (2 * i) / (faceCount + 1);
      if (side === 0) offsets.push([-1, alongFace]);
      else if (side === 1) offsets.push([1, alongFace]);
      else if (side === 2) offsets.push([alongFace, -1]);
      else offsets.push([alongFace, 1]);
    }
  }
  return offsets.slice(0, Math.max(0, count));
}
