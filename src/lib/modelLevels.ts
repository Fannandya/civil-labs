/** Scene coordinates are schematic; metre labels and seismic examples share this datum. */
export const MODEL_LEVELS = [
  { sceneY: 0.45, height: 3.9, title: "Lantai 1" },
  { sceneY: 1.75, height: 7.8, title: "Lantai 2" },
  { sceneY: 3.05, height: 11.7, title: "Lantai 3" },
  { sceneY: 4.35, height: 15.6, title: "Atap" }
] as const;

export const SEISMIC_FLOOR_HEIGHTS = MODEL_LEVELS.map((level) => level.height);
