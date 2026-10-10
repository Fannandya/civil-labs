import { create } from "zustand";
import { LOAD_JOURNEYS } from "@/lib/loadJourney";
import { structuralById, structuralElements } from "../../data/structuralElements";

export type CameraPreset = "isometric" | "front" | "top" | "substructure" | "free";
export type VisualizationMode = "structure" | "gravity" | "wind" | "seismic" | "soil" | "water";
export type SimulationScenario = "normal" | "megathrust" | "cyclone" | "flood" | "overload" | "custom";

type ViewerState = {
  visualizationMode: VisualizationMode;
  animationPlaying: boolean;
  tourPlaying: boolean;
  setTourPlaying: (playing: boolean) => void;
  structuralMotionEnabled: boolean;
  setStructuralMotionEnabled: (enabled: boolean) => void;
  journeyStep: number;
  journeyRevision: number;
  journeyCycle: number;
  setJourneyStep: (step: number) => void;
  restartJourney: () => void;
  advanceJourney: () => void;
  cutaway: boolean;
  showReinforcement: boolean;
  showLabels: boolean;
  exhibitionMode: boolean;
  setVisualizationMode: (mode: VisualizationMode) => void;
  setAnimationPlaying: (playing: boolean) => void;
  toggleCutaway: () => void;
  toggleReinforcement: () => void;
  toggleLabels: () => void;
  setExhibitionMode: (enabled: boolean) => void;
  activeId: string | null;
  focusPoint: [number, number, number] | null;
  hoveredId: string | null;
  touchCandidate: string | null;
  preset: CameraPreset;
  presetVersion: number;
  layers: { superstructure: boolean; substructure: boolean; load_vector: boolean };
  xray: boolean;
  freePanX: number;
  freePanY: number;
  // Interactive Engineering Playground state
  playgroundScenario: SimulationScenario;
  playgroundParams: Record<string, number>;
  playgroundInputError: string | null;
  activeDcr: number | null;
  activeFailureMode: string | null;
  select: (id: string | null, point?: [number, number, number]) => void;
  hover: (id: string | null) => void;
  touch: (id: string | null, point?: [number, number, number]) => void;
  setPreset: (preset: CameraPreset) => void;
  toggleLayer: (layer: keyof ViewerState["layers"]) => void;
  toggleXray: () => void;
  setFreePanX: (x: number) => void;
  setFreePanY: (y: number) => void;
  resetFreePan: () => void;
  setPlaygroundParam: (key: string, value: number) => void;
  setPlaygroundParams: (params: Record<string, number>) => void;
  setPlaygroundScenario: (scenario: SimulationScenario) => void;
  applyPlaygroundScenario: (scenario: SimulationScenario, overrides: Record<string, number>) => void;
  setActiveDcr: (dcr: number | null, failureMode?: string | null) => void;
  isPlaygroundActive: boolean;
  setPlaygroundActive: (active: boolean) => void;
  resetPlayground: () => void;
};

const initialPlaygroundParams: Record<string, number> = {
  ...Object.fromEntries(structuralElements.flatMap(element => element.calculator?.params ?? [])
    .map(param => [param.key, param.defaultValue])),
  speed: 35, // wind speed m/s
  sds: 0.71, // seismic SDS (g)
  weight: 12000, // building seismic weight kN
  waterDepth: 2.0, // water depth m
  waterHead: 3.0, // water uplift head m
  columnPu: 4850, // independent example factored column load, kN
  pileServiceLoad: 4000, // independent example foundation service load, kN
  momentM: 200, // moment kNm
  bars: 4, // beam bars
  fc: 30, // concrete strength MPa
  spacing: 150, // shear wall rebar spacing mm
  span: 5.7, // slab span m
  ratio: 1.5, // aspect ratio
  height: 4.0, // retaining wall height m
  phi: 30, // soil friction angle deg
  floors: 3, // floors count
  tributaryArea: 36, // m2
  occupantCount: 180, // live human occupants count
  personWeight: 70, // kg/person (asumsi contoh)
  floorArea: 192, // m2 effective floor area (16m x 12m)
  partitionFurniture: 1.0, // kN/m2 asumsi furnitur bergerak; bukan nilai universal SNI
  slabThickness: 140, // mm (tebal pelat lantai h_f)
  beamWidth: 300, // mm (lebar balok b)
  beamDepth: 600, // mm (tinggi balok h)
  columnSize: 600, // mm (dimensi kolom persegi c)
  rebarCount: 4, // jumlah tulangan utama balok D22
  rebarDiameter: 22, // mm (diameter tulangan utama balok)
  columnRebarCount: 12, // jumlah tulangan kolom D25
  deadLoadSidl: 1.5 // kN/m2 (beban mati tambahan SIDL: keramik, spesi, ME, plafon)
};

const nonnegativeParams = new Set(["speed", "sds", "sd1", "s1", "waterDepth", "waterHead", "columnPu", "pileServiceLoad", "occupantCount", "partitionFurniture", "deadLoadSidl", "minimumLiveLoad", "alphaFm", "shearDemand", "cover", "stirrupDiameter"]);
const integerParams = new Set(["bars", "rebarCount", "columnRebarCount", "floors", "occupantCount"]);
const additionalParams = new Set(["cover", "stirrupDiameter", "fy", "wallHeight", "wallLength", "wallThickness"]);
const parameterBounds: Record<string, [number, number]> = {};
for (const param of structuralElements.flatMap(element => element.calculator?.params ?? [])) {
  const previous = parameterBounds[param.key];
  parameterBounds[param.key] = previous ? [Math.min(previous[0], param.min), Math.max(previous[1], param.max)] : [param.min, param.max];
}
Object.assign(parameterBounds, {
  beamWidth: [200, 500], beamDepth: [350, 900], columnSize: [400, 900],
  rebarCount: [2, 8], rebarDiameter: [10, 40], columnRebarCount: [8, 20],
  partitionFurniture: [0, 2.5], floors: [1, 20], tributaryArea: [1, 1000],
  cover: [0, 200], stirrupDiameter: [0, 40], fy: [200, 1000],
  wallHeight: [0.1, 100], wallLength: [0.1, 100], wallThickness: [50, 2000]
});
// Physically valid zero loads remain available even when a teaching slider starts above zero.
for (const key of nonnegativeParams) if (parameterBounds[key]) parameterBounds[key][0] = 0;

function parameterError(params: Record<string, number>) {
  for (const [key, value] of Object.entries(params)) {
    if (!(key in initialPlaygroundParams) && !additionalParams.has(key)) return `Parameter ${key} tidak dikenal.`;
    if (!Number.isFinite(value)) return `Parameter ${key} harus berupa angka berhingga.`;
    if (key === "momentM") {
      if (Math.abs(value) > parameterBounds.momentM[1]) return "Momen contoh harus berada pada rentang −600–600 kNm.";
      continue; // Signed moment is valid within the configured example range.
    }
    if (nonnegativeParams.has(key) ? value < 0 : value <= 0) return `Parameter ${key} ${nonnegativeParams.has(key) ? "tidak boleh negatif" : "harus lebih besar dari nol"}.`;
    if (integerParams.has(key) && !Number.isInteger(value)) return `Parameter ${key} harus berupa bilangan bulat.`;
    if (key === "phi" && value >= 90) return "Sudut geser phi harus di antara 0° dan 90°.";
    if (key === "targetSF" && value < 1.5) return "SF target pemeriksaan ini minimal 1,50.";
    const bounds = parameterBounds[key];
    if (bounds && (value < bounds[0] || value > bounds[1])) return `Parameter ${key} harus berada pada rentang ${bounds[0]}–${bounds[1]}.`;
  }
  return null;
}

const loadModes: Record<string, VisualizationMode> = {
  "load-gravitasi": "gravity", "load-angin": "wind", "load-gempa": "seismic",
  "load-tekanan-tanah": "soil", "load-tekanan-air": "water"
};

export const useViewerStore = create<ViewerState>((set) => ({
  visualizationMode: "structure",
  animationPlaying: true,
  tourPlaying: false,
  setTourPlaying: (tourPlaying) => set(state => ({ tourPlaying: tourPlaying && !state.exhibitionMode })),
  structuralMotionEnabled: true,
  setStructuralMotionEnabled: (structuralMotionEnabled) => set({ structuralMotionEnabled }),
  journeyStep: 0,
  journeyRevision: 0,
  journeyCycle: 0,
  setJourneyStep: (step) => set((state) => ({
    journeyStep: state.visualizationMode === "structure" ? 0 : Math.max(0, Math.min(
      LOAD_JOURNEYS[state.visualizationMode].length - 1, Number.isFinite(step) ? Math.floor(step) : 0
    )),
    animationPlaying: false,
    journeyRevision: state.journeyRevision + 1
  })),
  restartJourney: () => set((state) => ({ journeyStep: 0, animationPlaying: true, journeyRevision: state.journeyRevision + 1 })),
  advanceJourney: () => set((state) => {
    if (state.visualizationMode === "structure") return { journeyStep: 0 };
    const journeyStep = (state.journeyStep + 1) % LOAD_JOURNEYS[state.visualizationMode].length;
    return { journeyStep, journeyCycle: state.journeyCycle + (journeyStep === 0 ? 1 : 0) };
  }),
  cutaway: true,
  showReinforcement: false,
  showLabels: true,
  exhibitionMode: true,
  setVisualizationMode: (visualizationMode) => set((state) => ({
    visualizationMode,
    ...(visualizationMode !== state.visualizationMode ? { journeyStep: 0, journeyRevision: state.journeyRevision + 1, animationPlaying: true } : {}),
    layers: { superstructure: true, substructure: true, load_vector: true },
    activeId: null, focusPoint: null, hoveredId: null, touchCandidate: null,
    activeDcr: null, activeFailureMode: null
  })),
  setAnimationPlaying: (animationPlaying) => set({ animationPlaying }),
  toggleCutaway: () => set((state) => ({ cutaway: !state.cutaway })),
  toggleReinforcement: () => set((state) => ({ showReinforcement: !state.showReinforcement })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  setExhibitionMode: (exhibitionMode) => set((state) => ({
    exhibitionMode,
    activeId: null,
    activeDcr: null,
    ...(exhibitionMode ? {
      tourPlaying: false,
      visualizationMode: "structure" as const,
      journeyStep: 0,
      journeyRevision: state.journeyRevision + 1,
      layers: { superstructure: true, substructure: true, load_vector: true },
      isPlaygroundActive: false,
      xray: false,
      showReinforcement: false
    } : {})
  })),
  activeId: null,
  focusPoint: null,
  hoveredId: null,
  touchCandidate: null,
  preset: "isometric",
  presetVersion: 0,
  layers: { superstructure: true, substructure: true, load_vector: true },
  xray: false,
  freePanX: 0,
  freePanY: 1.8,
  playgroundScenario: "normal",
  playgroundParams: { ...initialPlaygroundParams },
  playgroundInputError: null,
  activeDcr: null,
  activeFailureMode: null,
  select: (activeId, focusPoint) =>
    set((state) => ({ activeId, focusPoint: focusPoint ?? null, touchCandidate: null,
      ...(activeId ? { tourPlaying: false } : {}),
      activeDcr: null, activeFailureMode: null,
      exhibitionMode: activeId ? false : state.exhibitionMode,
      visualizationMode: activeId && loadModes[activeId] ? loadModes[activeId] : state.visualizationMode,
      ...(activeId && loadModes[activeId] && loadModes[activeId] !== state.visualizationMode ? { journeyStep: 0, journeyRevision: state.journeyRevision + 1, animationPlaying: true } : {}),
      layers: activeId && loadModes[activeId] ? { ...state.layers, load_vector: true } : state.layers
    })),
  hover: (hoveredId) => set({ hoveredId }),
  touch: (id, point) =>
    set((state) =>
      id === null
        ? { activeId: null, focusPoint: null, touchCandidate: null }
        : id === state.touchCandidate
        ? { activeId: id, focusPoint: point ?? null, touchCandidate: null, activeDcr: null, activeFailureMode: null, exhibitionMode: false, tourPlaying: false, visualizationMode: loadModes[id] ?? state.visualizationMode,
            ...(loadModes[id] && loadModes[id] !== state.visualizationMode ? { journeyStep: 0, journeyRevision: state.journeyRevision + 1, animationPlaying: true } : {}),
            layers: loadModes[id] ? { ...state.layers, load_vector: true } : state.layers }
        : { touchCandidate: id, activeId: null, focusPoint: null }
    ),
  setPreset: (preset) =>
    set((state) => ({ preset, presetVersion: state.presetVersion + 1 })),
  toggleLayer: (layer) =>
    set((state) => ({ layers: { ...state.layers, [layer]: !state.layers[layer] },
      hoveredId: null, touchCandidate: null,
      ...(state.layers[layer] && state.activeId && structuralById[state.activeId]?.category === layer
        ? { activeId: null, focusPoint: null, activeDcr: null, activeFailureMode: null } : {})
    })),
  toggleXray: () => set((state) => ({ xray: !state.xray })),
  setFreePanX: (freePanX) => set({ freePanX }),
  setFreePanY: (freePanY) => set({ freePanY }),
  resetFreePan: () => set({ freePanX: 0, freePanY: 1.8 }),
  setPlaygroundParam: (key, value) =>
    set((state) => {
      const playgroundInputError = parameterError({ [key]: value });
      if (playgroundInputError) return { playgroundInputError };
      return {
      playgroundScenario: "custom",
      playgroundInputError: null,
      playgroundParams: { ...state.playgroundParams, [key]: value,
        ...(key === "bars" || key === "rebarCount" ? { bars: value, rebarCount: value } : {}) }
    }; }),
  setPlaygroundParams: (params) =>
    set((state) => {
      const playgroundInputError = parameterError(params);
      if (playgroundInputError) return { playgroundInputError };
      const bars = params.bars ?? params.rebarCount;
      return { playgroundInputError: null,
        playgroundParams: { ...state.playgroundParams, ...params, ...(bars !== undefined ? { bars, rebarCount: bars } : {}) }
      };
    }),
  setPlaygroundScenario: (scenario) => set({ playgroundScenario: scenario }),
  applyPlaygroundScenario: (playgroundScenario, overrides) => set(() => {
    const playgroundInputError = parameterError(overrides);
    if (playgroundInputError) return { playgroundInputError };
    const bars = overrides.bars ?? overrides.rebarCount ?? initialPlaygroundParams.bars;
    return { playgroundScenario, playgroundInputError: null,
      playgroundParams: { ...initialPlaygroundParams, ...overrides, bars, rebarCount: bars },
      activeDcr: null, activeFailureMode: null };
  }),
  setActiveDcr: (activeDcr, activeFailureMode = null) =>
    set({ activeDcr, activeFailureMode }),
  isPlaygroundActive: false,
  setPlaygroundActive: (isPlaygroundActive) => set({ isPlaygroundActive }),
  resetPlayground: () =>
    set({
      playgroundScenario: "normal",
      playgroundParams: { ...initialPlaygroundParams },
      playgroundInputError: null,
      activeDcr: null,
      activeFailureMode: null,
      isPlaygroundActive: false
    })
}));
