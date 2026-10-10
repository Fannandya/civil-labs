"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookMarked,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FlaskConical,
  Gauge,
  GraduationCap,
  Info,
  Layers,
  Lightbulb,
  Maximize2,
  Scale,
  Search,
  ShieldCheck,
  Sliders,
  Users,
  X
} from "lucide-react";
import { CivilElementData, structuralById } from "../../data/structuralElements";
import {
  civilGlossaryData,
  glossaryByElementId
} from "../../data/civilGlossary";
import { SimulationScenario, useViewerStore } from "@/store/viewer";
import { beamReinforcementLayout, calculateEngineering, floorLoads } from "@/lib/engineeringCalculations";
import { matchesGlossarySearch } from "@/lib/glossarySearch";

type TabKey = "overview" | "formulas" | "example" | "calculator" | "playground" | "glossary";

const PRESET_SCENARIOS = [
  {
    id: "normal" as SimulationScenario,
    name: "Contoh Pembebanan",
    icon: "🛡️",
    badge: "ASUMSI CONTOH",
    desc: "Parameter awal untuk pembelajaran",
    params: {
      speed: 30,
      sds: 0.35,
      weight: 12000,
      waterDepth: 2.5,
      waterHead: 2.0,
      columnPu: 3200,
    pileServiceLoad: 3200,
      momentM: 120,
      bars: 4,
      fc: 30,
      spacing: 150,
      span: 5.7,
      ratio: 1.5,
      height: 4.0,
      phi: 32,
      floors: 3,
      tributaryArea: 36,
      occupantCount: 180,
      personWeight: 70,
      floorArea: 192,
      partitionFurniture: 1.0,
      slabThickness: 140,
      beamWidth: 300,
      beamDepth: 600,
      columnSize: 600,
      rebarCount: 4,
      rebarDiameter: 22,
      columnRebarCount: 12,
      deadLoadSidl: 1.5
    }
  },
  {
    id: "megathrust" as SimulationScenario,
    name: "Contoh SDS Tinggi",
    icon: "🌋",
    badge: "SDS CONTOH",
    desc: "SDS = 1,20 g sebagai ilustrasi percepatan spektral desain periode pendek; bukan parameter untuk lokasi proyek tertentu.",
    params: {
      speed: 30,
      sds: 1.20,
      weight: 14000,
      waterDepth: 2.5,
      waterHead: 2.0,
      columnPu: 4800,
    pileServiceLoad: 4800,
      momentM: 420,
      bars: 4,
      fc: 35,
      spacing: 250,
      span: 5.7,
      ratio: 1.5,
      height: 4.0,
      phi: 28,
      floors: 3,
      tributaryArea: 36,
      occupantCount: 180,
      personWeight: 70,
      floorArea: 192,
      partitionFurniture: 1.0,
      slabThickness: 150,
      beamWidth: 350,
      beamDepth: 650,
      columnSize: 700,
      rebarCount: 5,
      rebarDiameter: 22,
      columnRebarCount: 14,
      deadLoadSidl: 1.5
    }
  },
  {
    id: "cyclone" as SimulationScenario,
    name: "Contoh Angin Tinggi",
    icon: "🌪️",
    badge: "ANGIN 48 m/s",
    desc: "Kecepatan angin 172 km/jam",
    params: {
      speed: 48,
      sds: 0.40,
      weight: 12000,
      waterDepth: 2.0,
      waterHead: 2.5,
      columnPu: 3600,
    pileServiceLoad: 3600,
      momentM: 250,
      bars: 4,
      fc: 30,
      spacing: 150,
      span: 5.7,
      ratio: 1.5,
      height: 4.0,
      phi: 30,
      floors: 3,
      tributaryArea: 36,
      occupantCount: 140,
      personWeight: 70,
      floorArea: 192,
      partitionFurniture: 1.0,
      slabThickness: 140,
      beamWidth: 300,
      beamDepth: 600,
      columnSize: 600,
      rebarCount: 4,
      rebarDiameter: 22,
      columnRebarCount: 12,
      deadLoadSidl: 1.5
    }
  },
  {
    id: "flood" as SimulationScenario,
    name: "Banjir & Uplift",
    icon: "🌊",
    badge: "MUKA AIR TINGGI",
    desc: "Skenario muka air tanah tinggi untuk mengilustrasikan tekanan hidrostatik dan gaya angkat (uplift).",
    params: {
      speed: 25,
      sds: 0.35,
      weight: 11000,
      waterDepth: 0.8,
      waterHead: 4.2,
      columnPu: 3000,
    pileServiceLoad: 3000,
      momentM: 100,
      bars: 4,
      fc: 30,
      spacing: 150,
      span: 5.7,
      ratio: 1.5,
      height: 4.0,
      phi: 26,
      floors: 3,
      tributaryArea: 36,
      occupantCount: 60,
      personWeight: 70,
      floorArea: 192,
      partitionFurniture: 1.0,
      slabThickness: 140,
      beamWidth: 300,
      beamDepth: 600,
      columnSize: 600,
      rebarCount: 4,
      rebarDiameter: 22,
      columnRebarCount: 12,
      deadLoadSidl: 1.5
    }
  },
  {
    id: "overload" as SimulationScenario,
    name: "Kelebihan Beban",
    icon: "🏢",
    badge: "BEBAN CONTOH TINGGI",
    desc: "Skenario pembelajaran dengan beban ilustrasi tinggi dan dimensi struktur lebih ramping; bukan uji kapasitas nyata.",
    params: {
      speed: 30,
      sds: 0.50,
      weight: 16500,
      waterDepth: 2.0,
      waterHead: 2.5,
      columnPu: 5600,
    pileServiceLoad: 5600,
      momentM: 380,
      bars: 3,
      fc: 25,
      spacing: 200,
      span: 7.2,
      ratio: 1.2,
      height: 4.0,
      phi: 30,
      floors: 4,
      tributaryArea: 48,
      occupantCount: 480,
      personWeight: 75,
      floorArea: 192,
      partitionFurniture: 1.5,
      slabThickness: 120,
      beamWidth: 250,
      beamDepth: 450,
      columnSize: 450,
      rebarCount: 3,
      rebarDiameter: 22,
      columnRebarCount: 8,
      deadLoadSidl: 2.5
    }
  }
];

interface ElementEducationPanelProps {
  element: CivilElementData;
  initialTab?: TabKey;
  onSelectConnected: (id: string) => void;
  onClose: () => void;
  onOpenDeepDive: () => void;
}

export function ElementEducationPanel({
  element,
  initialTab,
  onSelectConnected,
  onClose,
  onOpenDeepDive
}: ElementEducationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? "overview");

  // Global playground store sync
  const playgroundParams = useViewerStore((s) => s.playgroundParams);
  const setPlaygroundParam = useViewerStore((s) => s.setPlaygroundParam);
  const applyPlaygroundScenario = useViewerStore((s) => s.applyPlaygroundScenario);
  const playgroundInputError = useViewerStore((s) => s.playgroundInputError);
  const currentScenario = useViewerStore((s) => s.playgroundScenario);
  const setActiveDcr = useViewerStore((s) => s.setActiveDcr);
  const setPlaygroundActive = useViewerStore((s) => s.setPlaygroundActive);

  // Configured defaults are merged with the shared state on every change.
  const calcParams = useMemo<Record<string, number>>(() => ({
    ...Object.fromEntries(element.calculator?.params.map((param) => [param.key, param.defaultValue]) ?? []),
    ...playgroundParams
  }), [element.calculator, playgroundParams]);

  const occupantCount = calcParams.occupantCount ?? 180;
  const personWeight = calcParams.personWeight ?? 70;
  const partitionFurniture = calcParams.partitionFurniture ?? 1;
  const slabThickness = calcParams.slabThickness ?? 140;
  const beamWidth = calcParams.beamWidth ?? 300;
  const beamDepth = calcParams.beamDepth ?? 600;
  const columnSize = calcParams.columnSize ?? 600;
  const rebarCount = calcParams.bars ?? calcParams.rebarCount ?? 4;
  const columnRebarCount = calcParams.columnRebarCount ?? 12;
  const deadLoadSidl = calcParams.deadLoadSidl ?? 1.5;
  const concreteFc = calcParams.fc ?? 30;
  const floorLoadState = useMemo(() => {
    if (activeTab !== "playground") return { data: null, error: null };
    try {
      return { data: floorLoads(calcParams), error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : "Masukan beban lantai tidak valid." };
    }
  }, [activeTab, calcParams]);
  const floorLoad = floorLoadState.data;
  const qDeadSw = floorLoad?.selfWeight ?? 0;
  const qDeadTotal = floorLoad?.dead ?? 0;
  const totalOccupantMassKg = floorLoad?.totalMass ?? 0;
  const qLiveTotal = floorLoad?.liveScenario ?? 0;
  const qLiveDesign = floorLoad?.liveDesign ?? 0;
  const quFactored = floorLoad?.factored ?? 0;
  const beamLayout = useMemo(() => {
    try { return beamReinforcementLayout(calcParams); }
    catch { return null; }
  }, [calcParams]);

  const otherParams = useMemo(() => {
    if (!element.calculator) return [];
    return element.calculator.params.filter(
      (p) =>
        p.key !== "occupantCount" &&
        p.key !== "personWeight" &&
        p.key !== "slabThickness" &&
        p.key !== "beamWidth" &&
        p.key !== "beamDepth" &&
        p.key !== "columnSize" &&
        p.key !== "bars" &&
        p.key !== "rebarCount" &&
        p.key !== "columnRebarCount" &&
        p.key !== "deadLoadSidl" &&
        p.key !== "fc"
    );
  }, [element.calculator]);

  // Glossary tab states
  const [glossaryScope, setGlossaryScope] = useState<"element" | "all">("element");
  const [glossarySearch, setGlossarySearch] = useState("");
  const [glossaryCategory, setGlossaryCategory] = useState<"all" | "simbol_rumus" | "konsep">("all");

  const handleParamChange = (key: string, value: number) => {
    setPlaygroundParam(key, value);
  };

  const applyScenario = (scId: SimulationScenario) => {
    const scenario = PRESET_SCENARIOS.find((item) => item.id === scId);
    if (!scenario) return;
    applyPlaygroundScenario(scId, { ...scenario.params, bars: scenario.params.rebarCount });
  };

  // Glossary filtered list
  const filteredGlossary = useMemo(() => {
    const base =
      glossaryScope === "element"
        ? glossaryByElementId(element.id)
        : civilGlossaryData;

    return base.filter((item) => {
      const matchesSearch = matchesGlossarySearch(item, glossarySearch);

      const matchesCat =
        glossaryCategory === "all" ||
        (glossaryCategory === "simbol_rumus" && item.category === "simbol_rumus") ||
        (glossaryCategory === "konsep" && item.category !== "simbol_rumus");

      return matchesSearch && matchesCat;
    });
  }, [element.id, glossaryScope, glossarySearch, glossaryCategory]);

  const calculatedResult = useMemo(() => (
    element.calculator ? calculateEngineering(element.calculator.type, calcParams) : null
  ), [element.calculator, calcParams]);
  const resultRatio = calculatedResult?.dcr ?? null;
  const resultStatusClass = resultRatio === null
    ? "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
    : resultRatio <= 1
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";

  // Synchronize active DCR with 3D canvas so element meshes reflect DCR color in real time
  useEffect(() => {
    if ((activeTab === "calculator" || activeTab === "playground") && calculatedResult) {
      setActiveDcr(calculatedResult.dcr, calculatedResult.failureMode);
    } else {
      setActiveDcr(null);
    }
  }, [activeTab, calculatedResult, setActiveDcr]);

  // Cleanup DCR color when panel unmounts
  useEffect(() => {
    return () => {
      setActiveDcr(null);
    };
  }, [setActiveDcr]);

  // Synchronize isPlaygroundActive flag for 3D scene (CurvedLoadPathSystem only in playground)
  useEffect(() => {
    setPlaygroundActive(activeTab === "playground");
    return () => {
      setPlaygroundActive(false);
    };
  }, [activeTab, setPlaygroundActive]);

  return (
    <div className="education-panel @container flex h-full min-h-0 min-w-0 flex-col text-[14px] leading-relaxed [overflow-wrap:anywhere] text-[var(--ink)]">
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="lowercase rounded border border-[var(--line)] bg-[var(--accent-soft)] px-2 py-0.5 text-[12px] font-semibold text-[var(--accent)]">
              {element.category.replace("_", " ").toUpperCase()}
            </span>
            <span className="text-[12px] text-[var(--muted)]">
              Elemen #{String(element.loadPathSequence).padStart(2, "0")}
            </span>
          </div>
          <h2 className="mt-2 break-words text-xl font-semibold text-[var(--ink)]">
            {element.name}
          </h2>
          <p className="mt-0.5 text-[14px] font-medium text-[var(--accent)]">
            {element.technicalTerm}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="hidden items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-[13px] font-medium text-[var(--ink)] transition sm:flex hover:border-[var(--line)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
          >
            <ArrowLeft size={13} />
            <span>Kembali</span>
          </button>
          <button
            aria-label="Tutup detail elemen"
            onClick={onClose}
            className="shrink-0 rounded-md p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)]"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="mt-3 flex shrink-0 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[14px] text-emerald-700">
        <FileCheck2 size={13} className="shrink-0" />
        <span className="font-medium">
          Rujukan materi: {element.details.standardReference}
        </span>
      </div>

      {/* Tab Navigation - Scrollable Horizontally */}
      <div
        role="tablist"
        aria-label="Materi elemen struktur"
        onKeyDown={(event) => {
          if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
          const tabs = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]')
          );
          const currentIndex = tabs.findIndex((tab) => tab === event.target);
          if (currentIndex < 0) return;
          event.preventDefault();
          const nextIndex = event.key === "Home"
            ? 0
            : event.key === "End"
            ? tabs.length - 1
            : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
          tabs[nextIndex].focus();
          tabs[nextIndex].click();
        }}
        className="scrollbar mt-4 flex max-w-full shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--line)] pb-1"
      >
        <button
          role="tab"
          id="education-tab-overview"
          aria-selected={activeTab === "overview"}
          tabIndex={activeTab === "overview" ? 0 : -1}
          aria-controls="education-tab-content"
          onClick={() => setActiveTab("overview")}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
            activeTab === "overview"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Info size={12} />
          <span>Ikhtisar</span>
        </button>
        <button
          role="tab"
          id="education-tab-formulas"
          aria-selected={activeTab === "formulas"}
          tabIndex={activeTab === "formulas" ? 0 : -1}
          aria-controls="education-tab-content"
          onClick={() => setActiveTab("formulas")}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
            activeTab === "formulas"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <BookOpen size={12} />
          <span>Rumus & SNI</span>
        </button>
        <button
          role="tab"
          id="education-tab-example"
          aria-selected={activeTab === "example"}
          tabIndex={activeTab === "example" ? 0 : -1}
          aria-controls="education-tab-content"
          onClick={() => setActiveTab("example")}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
            activeTab === "example"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <GraduationCap size={12} />
          <span>Studi kasus</span>
        </button>
        {element.calculator && (
          <button
            role="tab"
            id="education-tab-calculator"
            aria-selected={activeTab === "calculator"}
            tabIndex={activeTab === "calculator" ? 0 : -1}
            aria-controls="education-tab-content"
            onClick={() => setActiveTab("calculator")}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
              activeTab === "calculator"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Calculator size={12} />
            <span>Kalkulator</span>
          </button>
        )}
        <button
          role="tab"
          id="education-tab-playground"
          aria-selected={activeTab === "playground"}
          tabIndex={activeTab === "playground" ? 0 : -1}
          aria-controls="education-tab-content"
          onClick={() => setActiveTab("playground")}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
            activeTab === "playground"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Sliders size={12} className={activeTab === "playground" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
          <span>Playground 3D</span>
        </button>
        <button
          role="tab"
          id="education-tab-glossary"
          aria-selected={activeTab === "glossary"}
          tabIndex={activeTab === "glossary" ? 0 : -1}
          aria-controls="education-tab-content"
          onClick={() => setActiveTab("glossary")}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition ${
            activeTab === "glossary"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <BookMarked size={12} />
          <span>Glosarium</span>
        </button>
      </div>

      {/* Tab Content */}
      <div id="education-tab-content" role="tabpanel" tabIndex={0} aria-labelledby={`education-tab-${activeTab}`} className="scrollbar mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pb-2 pr-1">
        {playgroundInputError && (
          <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">
            {playgroundInputError} Nilai sebelumnya dipertahankan.
          </p>
        )}
        {activeTab === "playground" && floorLoadState.error && (
          <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-700">
            <p>Perhitungan beban lantai tidak tersedia: {floorLoadState.error}</p>
            <button type="button" onClick={() => applyScenario("normal")} className="mt-2 underline">Pulihkan parameter contoh</button>
          </div>
        )}
        {/* TAB 1: Ikhtisar & PERAN */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Structural Role */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[12px] font-semibold text-[var(--accent)]">
                  Peran & fungsi struktural
                </div>
              </div>
              <p className="mt-2 text-[14px] leading-[1.65] text-[var(--ink)]">
                {element.structuralRole}
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={onOpenDeepDive}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-[13px] font-medium text-[var(--accent)] transition hover:border-[var(--line)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]"
                >
                  <BookOpen size={12} />
                  <span>Baca Selengkapnya</span>
                </button>
              </div>
            </div>

            {/* Evaluation Parameters */}
            <div>
              <div className="mb-2 text-[12px] font-semibold text-[var(--muted)]">
                Parameter penampang & material
              </div>
              <div className="space-y-2">
                <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-2.5">
                  <div className="text-[12px] font-semibold text-[var(--muted)]">
                    Geometri & dimensi
                  </div>
                  <div className="mt-0.5 text-[14px] text-[var(--ink)]">
                    {element.evaluationParameters.dimensions}
                  </div>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-2.5">
                  <div className="text-[12px] font-semibold text-[var(--muted)]">
                    Mutu material / bahan
                  </div>
                  <div className="mt-0.5 text-[14px] text-[var(--ink)]">
                    {element.evaluationParameters.materialGrade}
                  </div>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-2.5">
                  <div className="text-[12px] font-semibold text-[var(--muted)]">
                    Sistem struktur
                  </div>
                  <div className="mt-0.5 text-[14px] text-[var(--ink)]">
                    {element.evaluationParameters.geometrySystem}
                  </div>
                </div>
              </div>
            </div>

            {/* Mechanism & Risk */}
            <div>
              <div className="mb-2 text-[12px] font-semibold text-[var(--muted)]">
                Mekanisme kerja & risiko kegagalan
              </div>
              <p className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3 text-[14px] leading-relaxed text-[var(--ink)]">
                {element.details.mechanism}
              </p>
              <div className="mt-2.5 rounded-md border border-rose-200 bg-rose-50 p-3">
                <div className="text-[12px] font-semibold text-rose-700">
                  Mode kegagalan kritis (critical failure mode)
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-rose-700">
                  {element.details.criticalRisk}
                </p>
              </div>
            </div>

            {/* Connected Elements */}
            {element.connectedElements.length > 0 && (
              <div className="border-t border-[var(--line)] pt-3">
                <div className="mb-2 text-[12px] font-semibold text-[var(--muted)]">
                  Alur transfer beban ke elemen berikutnya
                </div>
                <div className="flex flex-wrap gap-2">
                  {element.connectedElements.map((id) => (
                    <button
                      key={id}
                      onClick={() => onSelectConnected(id)}
                      className="flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-[13px] text-[var(--ink)] transition hover:border-[var(--line)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                    >
                      <span>{structuralById[id]?.name ?? id}</span>
                      <ChevronRight size={11} className="text-[var(--accent)]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RUMUS & STANDAR SNI */}
        {activeTab === "formulas" && (
          <div className="space-y-4">
            <div className="text-[14px] leading-relaxed text-[var(--muted)]">
              Berikut rumus dan asumsi pembelajaran. Perhatikan satuan, batas penerapan, dan rujukan masing-masing rumus:
            </div>

            {element.governingFormulas?.map((formula, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-md border border-[var(--line)] bg-[var(--panel)]"
              >
                {/* Formula Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5">
                  <div className="text-[14px] font-semibold text-[var(--ink)]">
                    {formula.title}
                  </div>
                  <span className="rounded border border-[var(--line)] bg-[var(--accent-soft)] px-2 py-0.5 text-[12px] font-medium text-[var(--accent)]">
                    {formula.clauseReference}
                  </span>
                </div>

                {/* Mathematical Expression Box */}
                <div className="border-y border-[var(--line)] bg-[var(--surface)] p-3 text-center">
                  <code className="whitespace-normal break-words font-mono text-[14px] font-semibold text-[var(--accent)]">
                    {formula.expression}
                  </code>
                </div>

                {/* Description */}
                <div className="p-3.5">
                  <p className="text-[14px] leading-relaxed text-[var(--muted)]">
                    {formula.description}
                  </p>

                  {/* Variables Table */}
                  <div className="mt-3">
                    <div className="text-[12px] font-semibold text-[var(--muted)]">
                      Notasi variabel & satuan
                    </div>
                    <div className="mt-1.5 divide-y divide-[var(--line)] rounded-md border border-[var(--line)] bg-[var(--surface)] text-[12px]">
                      {formula.variables.map((v, vIdx) => (
                        <div
                          key={vIdx}
                          className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5"
                        >
                          <div className="flex min-w-0 flex-1 items-baseline gap-2">
                            <span className="shrink-0 font-mono font-semibold text-[var(--accent)]">
                              {v.symbol}
                            </span>
                            <span className="min-w-0 flex-1 break-words text-[14px] text-[var(--ink)]">{v.meaning}</span>
                          </div>
                          <span className="shrink-0 text-[12px] text-[var(--muted)]">
                            [{v.unit}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CONTOH KASUS & PERHITUNGAN */}
        {activeTab === "example" && element.workedExample && (
          <div className="space-y-4">
            {/* Title & Statement */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--accent)]">
                <FlaskConical size={13} />
                <span>Contoh perhitungan dengan asumsi</span>
              </div>
              <h3 className="mt-1.5 text-[16px] font-semibold text-[var(--ink)]">
                {element.workedExample.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]">
                {element.workedExample.problemStatement}
              </p>
            </div>

            {/* Given Parameters */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-3.5">
              <div className="text-[12px] font-semibold text-[var(--muted)]">
                Data masukan rencana (given parameters)
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {Object.entries(element.workedExample.givenParameters).map(
                  ([k, val]) => (
                    <div
                      key={k}
                      className="rounded border border-[var(--line)] bg-[var(--panel)] p-2 text-[12px]"
                    >
                      <div className="text-[var(--muted)]">{k}</div>
                      <div className="mt-0.5 text-[14px] font-medium text-[var(--ink)]">
                        {val}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Step by Step Calculations */}
            <div className="space-y-2.5">
              <div className="text-[12px] font-semibold text-[var(--muted)]">
                Tahapan kalkulasi step-by-step
              </div>

              {element.workedExample.steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3 text-[14px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--accent-soft)] text-[12px] font-semibold text-[var(--accent)]">
                      {st.stepNumber}
                    </span>
                    <span className="font-semibold text-[var(--ink)]">{st.label}</span>
                  </div>
                  <div className="mt-2 break-words rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-1.5 font-mono text-[14px] text-[var(--ink)]">
                    {st.formula}
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--muted)]">
                    Substitusi: <code className="font-mono text-[var(--ink)]">{st.substitution}</code>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-1.5">
                    <span className="text-[12px] text-[var(--muted)]">Hasil:</span>
                    <span className="min-w-0 break-words text-[14px] font-semibold text-[var(--accent)]">
                      {st.result}
                    </span>
                  </div>
                  {st.note && (
                    <div className="mt-1 text-[12px] text-[var(--muted)]">
                      * {st.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Safety Check Status Card */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]">
                  <ShieldCheck size={14} />
                  <span>Hasil pemeriksaan contoh</span>
                </div>
                <span className="rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[12px] font-semibold text-[var(--accent)]">
                  {element.workedExample.safetyCheck.status}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2 @min-[22rem]:grid-cols-3 text-center text-[12px]">
                <div className="rounded border border-[var(--line)] bg-[var(--panel)] p-1.5">
                  <div className="text-[var(--muted)]">Beban (Demand)</div>
                  <div className="mt-0.5 font-semibold text-[var(--ink)]">
                    {element.workedExample.safetyCheck.demand}
                  </div>
                </div>
                <div className="rounded border border-[var(--line)] bg-[var(--panel)] p-1.5">
                  <div className="text-[var(--muted)]">Nilai pembanding</div>
                  <div className="mt-0.5 font-semibold text-[var(--accent)]">
                    {element.workedExample.safetyCheck.capacity}
                  </div>
                </div>
                <div className="rounded border border-[var(--line)] bg-[var(--panel)] p-1.5">
                  <div className="text-[var(--muted)]">Rasio pemeriksaan</div>
                  <div className="mt-0.5 font-semibold text-[var(--accent)]">
                    {element.workedExample.safetyCheck.ratio}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink)]">
                {element.workedExample.conclusion}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: Kalkulator parameter teknis */}
        {activeTab === "calculator" && element.calculator && (
          <div className="space-y-4">
            {/* Calculator Header Card */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--accent)]">
                <Calculator size={13} />
                <span>Kalkulator parameter teknis</span>
              </div>
              <h3 className="text-[16px] font-semibold text-[var(--ink)]">
                {element.calculator.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-[var(--muted)]">
                {element.calculator.description}
              </p>
            </div>

            {/* Parameter Inputs */}
            <div className="space-y-3 rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-[var(--muted)]">
                <span>Variabel desain elemen</span>
                <span className="text-[var(--accent)] font-semibold">
                  {element.calculator.params.length} parameter
                </span>
              </div>

              {element.calculator.params.map((param) => {
                const val = calcParams[param.key] ?? param.defaultValue;
                return (
                  <div key={param.key} className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                      <span className="text-[var(--ink)] font-medium">{param.label}</span>
                      <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                        {val} {param.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      aria-label={param.label}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={val}
                      onChange={(e) =>
                        handleParamChange(param.key, parseFloat(e.target.value))
                      }
                      className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                    />
                    <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                      <span>
                        Min: {param.min} {param.unit}
                      </span>
                      <span>
                        Max: {param.max} {param.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculated Output Result Box */}
            {calculatedResult && (
              <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4 text-center space-y-3">
                <div className="text-[12px] font-semibold text-[var(--accent)]">
                  {element.calculator.resultLabel}
                </div>
                <div className="break-words text-3xl font-semibold text-[var(--ink)]">
                  {calculatedResult.value}{" "}
                  <span className="text-sm font-normal text-[var(--accent)]">
                    {element.calculator.resultUnit}
                  </span>
                </div>
                <div className="text-[14px] text-[var(--ink)] bg-[var(--surface)] p-2.5 rounded-md border border-[var(--line)]">
                  {calculatedResult.secondary}
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${resultStatusClass}`}>
                  {resultRatio === null ? <Info size={12} /> : resultRatio <= 1 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  <span>{calculatedResult.status}</span>
                </div>
                <p className="text-left text-[12px] leading-relaxed text-[var(--muted)]">
                  {calculatedResult.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Playground 3D INTERAKTIF */}
        {activeTab === "playground" && floorLoad && (
          <div className="space-y-4">
            {/* Playground Header Card */}
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--accent)]">
                  <Sliders size={13} />
                  <span>Playground simulasi 3D</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[12px] font-semibold text-emerald-700">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Terhubung ke model 3D</span>
                </div>
              </div>
              <h3 className="text-[16px] font-semibold text-[var(--ink)]">
                Eksplorasi Pembebanan dan Pemeriksaan Contoh ({element.name})
              </h3>
              <p className="text-[14px] leading-relaxed text-[var(--muted)]">
                Perubahan slider memperbarui perhitungan contoh dan animasi beban. Warna model menunjukkan rasio pemeriksaan yang tersedia; gerakan dan vektor merupakan ilustrasi kualitatif, bukan hasil analisis tegangan atau perpindahan struktur.
              </p>
            </div>

            {/* PRIORITAS 3: SKENARIO SIMULASI EKSTREM (1-KLIK) */}
            <div className="space-y-2 rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[12px] font-semibold text-[var(--muted)]">
                  Skenario ilustrasi pembebanan (1-klik)
                </div>
                {currentScenario !== "normal" && (
                  <button
                    onClick={() => applyScenario("normal")}
                    className="text-[12px] font-semibold text-[var(--accent)] hover:underline"
                  >
                    Reset ke normal
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SCENARIOS.map((sc) => {
                  const isActive = currentScenario === sc.id;
                  return (
                    <button
                      key={sc.id}
                      aria-pressed={isActive}
                      onClick={() => applyScenario(sc.id)}
                      className={`flex flex-col rounded-md border p-3 text-left transition ${
                        isActive
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Activity size={16} aria-hidden="true" className="shrink-0 text-[var(--accent)]" />
                        <span className={`text-[13px] font-semibold ${isActive ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}>
                          {sc.name}
                        </span>
                      </div>
                      <span className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
                        {sc.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ratio gauges are only shown when a comparison was calculated. */}
            {calculatedResult && (
              <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <div className="flex items-center gap-1.5 font-semibold text-[var(--ink)]">
                    <Gauge size={14} className="text-[var(--accent)]" />
                    <span>{calculatedResult.dcr === null ? element.calculator?.resultLabel : calculatedResult.metricLabel}</span>
                  </div>
                  <span className={`font-semibold px-2 py-0.5 rounded border text-[14px] ${resultStatusClass}`}>
                    {calculatedResult.dcr === null
                      ? `${calculatedResult.value} ${element.calculator?.resultUnit ?? ""}`
                      : calculatedResult.dcr.toFixed(2)}
                  </span>
                </div>
                {calculatedResult.dcr !== null && (
                  <>
                    <div className="relative h-2.5 w-full rounded-full bg-[var(--surface)] overflow-hidden border border-[var(--line)]">
                      <div className="absolute inset-0 flex pointer-events-none opacity-20">
                        <div className="w-[71.4%] h-full bg-emerald-500 border-r border-emerald-400" />
                        <div className="flex-1 h-full bg-rose-500" />
                      </div>
                      <div
                        className={`h-full transition-all duration-300 ${calculatedResult.dcr <= 1 ? "bg-emerald-600" : "bg-rose-600"}`}
                        style={{ width: `${Math.min(100, (calculatedResult.dcr / 1.4) * 100)}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                      <span>0.00</span>
                      <span>1.00 (Batas pemeriksaan)</span>
                      <span className="text-rose-700">&gt; 1.00 (Melampaui pembanding)</span>
                    </div>
                  </>
                )}
                <p className="text-[14px] text-[var(--ink)]">{calculatedResult.secondary}</p>
                <p className="text-[12px] text-[var(--muted)]">{calculatedResult.status}</p>
                {calculatedResult.failureMode && (
                  <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-2.5 text-[12px] text-rose-700">
                    <AlertTriangle size={15} className="shrink-0 text-rose-700 mt-0.5" />
                    <div className="leading-relaxed">{calculatedResult.failureMode}</div>
                  </div>
                )}
              </div>
            )}

            {/* PRIORITAS 1: INTERACTIVE ENGINEERING CONTROLS & 3D LIVE BINDING */}

            {/* CARD 1: RINGKASAN KOMBINASI PEMBEBANAN LRFD (SNI 1727:2020 / SNI 2847:2019 Pasal 5.3) */}
            <div className="space-y-2.5 rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]">
                  <Scale size={13} />
                  <span>Kombinasi beban terfaktor D/L (LRFD)</span>
                </div>
                <span className="text-[12px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded border border-[var(--line)]">
                  qu = max(1.4D; 1.2D + 1.6L)
                </span>
              </div>

              {/* 3-Column Metric Box */}
              <div className="grid grid-cols-1 gap-2 @min-[22rem]:grid-cols-3 text-center text-[12px]">
                <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-2">
                  <div className="text-[var(--muted)] text-[12px]">Beban Mati (D)</div>
                  <div className="mt-0.5 font-semibold text-[var(--ink)]">{qDeadTotal.toFixed(2)} kN/m²</div>
                  <div className="text-[12px] text-[var(--muted)]">SW {qDeadSw.toFixed(1)} + SIDL {deadLoadSidl.toFixed(1)}</div>
                </div>
                <div className="rounded border border-[var(--line)] bg-[var(--surface)] p-2">
                  <div className="text-[var(--muted)] text-[12px]">Beban Hidup Desain (L)</div>
                  <div className="mt-0.5 font-semibold text-[var(--accent)]">{qLiveDesign.toFixed(2)} kN/m²</div>
                  <div className="text-[12px] text-[var(--muted)]">Skenario {qLiveTotal.toFixed(2)}; minimum {floorLoad.minimumLive.toFixed(2)}</div>
                </div>
                <div className="rounded border border-[var(--line)] bg-[var(--accent-soft)] p-2">
                  <div className="text-[var(--accent)] text-[12px] font-semibold">Ultimate (qu)</div>
                  <div className="mt-0.5 font-semibold text-[var(--accent)]">{quFactored.toFixed(2)} kN/m²</div>
                  <div className="text-[12px] text-[var(--accent)]">Maksimum dari dua kombinasi D/L yang ditampilkan</div>
                </div>
              </div>
              <p className="text-[12px] leading-relaxed text-[var(--muted)]">Ini contoh kombinasi dasar beban mati (D) dan beban hidup (L) dengan metode desain faktor beban dan tahanan (LRFD). Kombinasi pengaruh atap, angin, gempa, dan syarat proyek lainnya belum ditampilkan.</p>
            </div>

            {/* CARD 2: Kontrol beban hidup struktur (live load) */}
            <div className="space-y-3 rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]">
                  <Users size={13} />
                  <span>Kontrol beban hidup struktur (live load)</span>
                </div>
                <span className="text-[12px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded border border-[var(--line)]">
                  {occupantCount} orang ({(totalOccupantMassKg / 1000).toFixed(1)} ton)
                </span>
              </div>

              {/* Slider Jumlah Orang */}
              <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">Jumlah Orang / Okupansi (N)</span>
                  <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {occupantCount} orang
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Jumlah Orang / Okupansi (N)"
                  min={0}
                  max={600}
                  step={25}
                  value={occupantCount}
                  onChange={(e) => handleParamChange("occupantCount", parseFloat(e.target.value))}
                  className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                  <span>0 org (Kosong)</span>
                  <span className="text-[var(--accent)]">Contoh awal (180 org)</span>
                  <span className="text-rose-700">Minimum desain kantor {floorLoad.minimumLive.toFixed(2)} kN/m²</span>
                  <span>Maks (600 org)</span>
                </div>
              </div>

              {/* Slider Berat Rata-rata per Orang */}
              <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">Massa per Orang (Asumsi Contoh)</span>
                  <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {personWeight} kg/orang
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Massa per Orang (Asumsi Contoh)"
                  min={50}
                  max={90}
                  step={5}
                  value={personWeight}
                  onChange={(e) => handleParamChange("personWeight", parseFloat(e.target.value))}
                  className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                  <span>Min: 50 kg</span>
                  <span className="text-[var(--accent)]">Asumsi contoh: 70 kg</span>
                  <span>Max: 90 kg</span>
                </div>
              </div>

              {/* Slider Beban Partisi & Furnitur */}
              <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">Partisi Bergerak & Furnitur (Asumsi)</span>
                  <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {partitionFurniture.toFixed(2)} kN/m²
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Partisi Bergerak & Furnitur (Asumsi)"
                  min={0.5}
                  max={2.5}
                  step={0.25}
                  value={partitionFurniture}
                  onChange={(e) => handleParamChange("partitionFurniture", parseFloat(e.target.value))}
                  className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                  <span>Ringan: 0.50</span>
                  <span className="text-[var(--accent)]">Asumsi contoh: 1.00 kN/m²</span>
                  <span>Padat: 2.50</span>
                </div>
              </div>
            </div>

            {/* CARD 3: Kontrol beban mati struktur (dead load) */}
            <div className="space-y-3 rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ink)]">
                  <Layers size={13} />
                  <span>Kontrol beban mati struktur (dead load)</span>
                </div>
                <span className="text-[12px] font-semibold text-[var(--ink)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                  Total D: {qDeadTotal.toFixed(2)} kN/m²
                </span>
              </div>

              {/* Auto Display: Berat Sendiri Pelat Beton Bertulang (SW) */}
              <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">Berat Sendiri Pelat (q_SW = h_f × 24 kN/m³)</span>
                  <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {qDeadSw.toFixed(2)} kN/m²
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-[var(--muted)] leading-tight">
                  Tebal pelat saat ini {slabThickness} mm ({(slabThickness / 1000).toFixed(2)} m) × berat volume beton contoh 24.0 kN/m³. Otomatis tersinkronisasi dengan slider tebal pelat.
                </div>
              </div>

              {/* Slider Beban Tambahan Finishing & MEP (SIDL) */}
              <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">Beban Mati Tambahan / SIDL (Finishing + ME)</span>
                  <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {deadLoadSidl.toFixed(2)} kN/m²
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Beban Mati Tambahan / SIDL (Finishing + ME)"
                  min={0.5}
                  max={3.5}
                  step={0.25}
                  value={deadLoadSidl}
                  onChange={(e) => handleParamChange("deadLoadSidl", parseFloat(e.target.value))}
                  className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                  <span>Min: 0.50 (Bare)</span>
                  <span className="text-[var(--accent)]">SIDL: {deadLoadSidl.toFixed(2)} kN/m²</span>
                  <span>Max: 3.50 (MEP Padat)</span>
                </div>
              </div>
            </div>

            {/* CARD 4: KONSTRUKSI & SPESIFIKASI BETON BERTULANG (LIVE RESIZE 3D) */}
            <div className="space-y-3 rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]">
                  <Maximize2 size={13} />
                  <span>Konstruksi & spesifikasi beton (live resize 3D)</span>
                </div>
                <span className="text-[12px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded border border-[var(--line)]">
                  3D geometry sync
                </span>
              </div>
              <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                Eksplorasi pengaruh dimensi dan tulangan terhadap pemeriksaan elemen yang ditampilkan. Perubahan geometri 3D bersifat ilustratif; pemenuhan satu pemeriksaan tidak membuktikan keamanan seluruh struktur.
              </p>

              {/* Slider Tebal Pelat Lantai (h_f) */}
              <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">Tebal Pelat Lantai (h_f)</span>
                  <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {slabThickness} mm
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Tebal Pelat Lantai (h_f)"
                  min={100}
                  max={250}
                  step={10}
                  value={slabThickness}
                  onChange={(e) => handleParamChange("slabThickness", parseFloat(e.target.value))}
                  className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                  <span>Min: 100 mm</span>
                  <span className="text-[var(--accent)]">Contoh: 140 mm</span>
                  <span>Maks: 250 mm</span>
                </div>
              </div>

              {/* Slider Dimensi Balok: Lebar & Tinggi */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                    <span className="text-[var(--ink)] font-medium">Lebar Balok (b)</span>
                    <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-1.5 py-0.5 rounded text-[12px] border border-[var(--line)]">
                      {beamWidth} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Lebar Balok (b)"
                    min={200}
                    max={500}
                    step={25}
                    value={beamWidth}
                    onChange={(e) => handleParamChange("beamWidth", parseFloat(e.target.value))}
                    className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                  />
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                    <span>200</span>
                    <span className="text-[var(--accent)]">300</span>
                    <span>500 mm</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                    <span className="text-[var(--ink)] font-medium">Tinggi Balok (h)</span>
                    <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-1.5 py-0.5 rounded text-[12px] border border-[var(--line)]">
                      {beamDepth} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Tinggi Balok (h)"
                    min={350}
                    max={900}
                    step={50}
                    value={beamDepth}
                    onChange={(e) => handleParamChange("beamDepth", parseFloat(e.target.value))}
                    className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                  />
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                    <span>350</span>
                    <span className="text-[var(--accent)]">600</span>
                    <span>900 mm</span>
                  </div>
                </div>
              </div>

              {/* Slider Tulangan Balok (n batang D22) */}
              <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">Tulangan Tarik Balok (As)</span>
                  <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {rebarCount} batang D{calcParams.rebarDiameter ?? 22}
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Jumlah batang tulangan tarik balok"
                  min={2}
                  max={8}
                  step={1}
                  value={rebarCount}
                  onChange={(e) => handleParamChange("bars", parseFloat(e.target.value))}
                  className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                  <span>Min: 2 batang tarik</span>
                  <span className="text-[var(--accent)]">Contoh awal: 4 batang tarik</span>
                  <span>Max: 8 batang tarik</span>
                </div>
                <p className="text-[12px] leading-relaxed text-[var(--muted)]">
                  {beamLayout ? `${beamLayout.count} batang tarik disusun dalam ${beamLayout.rows} lapis; d dihitung dari titik beratnya. ` : "Susunan tulangan tidak tersedia. "}
                  Model menambahkan 2 batang atas konstruktif yang tidak dimasukkan ke As tarik atau kapasitas lentur positif.
                  Jarak bersih contoh memakai nilai terbesar dari 25 mm dan diameter batang; ukuran agregat dan detail penulangan lengkap belum diperiksa.
                  {beamLayout && !beamLayout.fits && " Susunan tidak muat dalam penampang; hasil kapasitas tidak berlaku."}
                </p>
              </div>

              {/* Slider Dimensi Kolom & Tulangan Kolom */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                    <span className="text-[var(--ink)] font-medium">Dimensi Kolom (c)</span>
                    <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-1.5 py-0.5 rounded text-[12px] border border-[var(--line)]">
                      {columnSize} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Dimensi Kolom (c)"
                    min={400}
                    max={900}
                    step={50}
                    value={columnSize}
                    onChange={(e) => handleParamChange("columnSize", parseFloat(e.target.value))}
                    className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                  />
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                    <span>400</span>
                    <span className="text-[var(--accent)]">600</span>
                    <span>900 mm</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                    <span className="text-[var(--ink)] font-medium">Tulangan Kolom</span>
                    <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-1.5 py-0.5 rounded text-[12px] border border-[var(--line)]">
                      {columnRebarCount} D25
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Tulangan Kolom"
                    min={8}
                    max={20}
                    step={2}
                    value={columnRebarCount}
                    onChange={(e) => handleParamChange("columnRebarCount", parseFloat(e.target.value))}
                    className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                  />
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                    <span>8D25</span>
                    <span className="text-[var(--accent)]">12D25</span>
                    <span>20D25</span>
                  </div>
                </div>
              </div>

              {/* Slider Mutu Kuat Tekan Beton (fc') */}
              <div className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="text-[var(--ink)] font-medium">Mutu Beton Kuat Tekan (f′c)</span>
                  <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                    f′c {concreteFc} MPa
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Mutu Beton Kuat Tekan (f'c)"
                  min={20}
                  max={50}
                  step={5}
                  value={concreteFc}
                  onChange={(e) => handleParamChange("fc", parseFloat(e.target.value))}
                  className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                  <span>20 MPa</span>
                  <span className="text-[var(--accent)]">30 MPa (Contoh)</span>
                  <span>50 MPa</span>
                </div>
              </div>
            </div>

            {/* Assumptions and excluded checks accompany the displayed result. */}
            <div className="space-y-2 rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]">
                  <ShieldCheck size={13} />
                  <span>Asumsi dan ruang lingkup pemeriksaan</span>
                </div>
                <span className={`text-[12px] font-semibold px-2 py-0.5 rounded border ${resultStatusClass}`}>
                  {resultRatio === null ? "Kapasitas belum dievaluasi" : resultRatio <= 1 ? "Memenuhi pemeriksaan contoh" : "Pembanding terlampaui"}
                </span>
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--ink)]">
                {calculatedResult?.notes ?? "Elemen ini belum memiliki perhitungan interaktif."}
              </p>
            </div>

            {/* Parameter struktural ELEMEN SPESIFIK */}
            {otherParams.length > 0 && (
              <div className="space-y-3 rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-[var(--muted)]">
                  <span>Parameter struktural ({element.name})</span>
                  <span className="text-[var(--accent)] font-semibold">
                    {otherParams.length} parameter
                  </span>
                </div>

                {otherParams.map((param) => {
                  const val = calcParams[param.key] ?? param.defaultValue;
                  return (
                    <div key={param.key} className="space-y-1.5 border-b border-[var(--line)] py-3 last:border-b-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                        <span className="text-[var(--ink)] font-medium">{param.label}</span>
                        <span className="font-semibold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)]">
                          {val} {param.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        aria-label={param.label}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={val}
                        onChange={(e) =>
                          handleParamChange(param.key, parseFloat(e.target.value))
                        }
                        className="h-7 w-full cursor-pointer accent-[var(--accent)]"
                      />
                      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
                        <span>
                          Min: {param.min} {param.unit}
                        </span>
                        <span>
                          Max: {param.max} {param.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* The animation illustrates behavior; it is not a displacement solution. */}
            {calculatedResult && (
              <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5 space-y-2">
                <div className="text-[12px] font-semibold text-[var(--muted)]">
                  Ringkasan hasil dan animasi 3D
                </div>
                <div className="text-[14px] leading-relaxed text-[var(--ink)]">
                  {calculatedResult.status}.
                  {calculatedResult.dcr !== null && (
                    <> {calculatedResult.metricLabel}: <span className="font-semibold text-[var(--accent)]">{calculatedResult.dcr.toFixed(2)}</span>.</>
                  )} Animasi vektor, perubahan ukuran, dan gerakan model bersifat kualitatif; tidak menunjukkan nilai tegangan, regangan, atau perpindahan hasil analisis struktur.
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Glosarium KATA & SIMBOL RUMUS */}
        {activeTab === "glossary" && (
          <div className="space-y-4">
            {/* Scope Switch & Search Bar */}
            <div className="space-y-2.5">
              <div className="flex rounded-md border border-[var(--line)] bg-[var(--panel)] p-1 text-[14px]">
                <button
                  onClick={() => setGlossaryScope("element")}
                  className={`flex-1 rounded-md py-1.5 font-medium transition ${
                    glossaryScope === "element"
                      ? "border border-[var(--line)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Istilah Elemen Ini ({glossaryByElementId(element.id).length})
                </button>
                <button
                  onClick={() => setGlossaryScope("all")}
                  className={`flex-1 rounded-md py-1.5 font-medium transition ${
                    glossaryScope === "all"
                      ? "border border-[var(--line)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  Semua Istilah Sipil ({civilGlossaryData.length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Cari simbol (f'c, phi) atau istilah (SRPMK)..."
                  aria-label="Cari istilah glosarium"
                  className="w-full rounded-md border border-[var(--line)] bg-[var(--panel)] py-2.5 pl-9 pr-3 text-[14px] text-[var(--ink)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--line)]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="scrollbar flex min-w-0 gap-1.5 overflow-x-auto whitespace-nowrap pb-1 text-[12px]">
                {(
                  [
                    { key: "all", label: "Semua" },
                    { key: "simbol_rumus", label: "Simbol Rumus" },
                    { key: "konsep", label: "Konsep Teknik" }
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setGlossaryCategory(cat.key)}
                    className={`shrink-0 rounded-md px-2.5 py-1 transition ${
                      glossaryCategory === cat.key
                        ? "border border-[var(--line)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                        : "border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Glossary Terms List */}
            <div className="space-y-3">
              {filteredGlossary.length === 0 ? (
                <div className="rounded-md border border-dashed border-[var(--line)] p-6 text-center text-xs text-[var(--muted)]">
                  Tidak ditemukan istilah yang sesuai. Coba ubah kata kunci atau beralih ke &ldquo;Semua Istilah Sipil&rdquo;.
                </div>
              ) : (
                filteredGlossary.map((term) => (
                  <div
                    key={term.id}
                    className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5 transition hover:border-[var(--line)]"
                  >
                    {/* Header: Term Name, Symbol, Unit */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        {term.symbol && (
                          <span className="rounded border border-[var(--line)] bg-[var(--accent-soft)] px-2 py-0.5 text-[14px] font-semibold text-[var(--accent)]">
                            {term.symbol}
                          </span>
                        )}
                        <h4 className="text-[16px] font-semibold text-[var(--ink)]">
                          {term.term}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px]">
                        {term.unit && (
                          <span className="text-[var(--muted)]">
                            [{term.unit}]
                          </span>
                        )}
                        {term.standardClause && (
                          <span className="rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[var(--muted)]">
                            {term.standardClause}
                          </span>
                        )}
                      </div>
                    </div>

                    {term.reading && (
                      <div className="mt-1 text-[12px] italic text-[var(--accent)]">
                        Cara baca: {term.reading}
                      </div>
                    )}

                    {/* Academic Definition */}
                    <div className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]">
                      <span className="mb-0.5 block text-[12px] font-semibold text-[var(--muted)]">
                        Definisi dan penjelasan:
                      </span>
                      {term.academicDefinition}
                    </div>

                    {/* Conceptual & Case Study Explanation */}
                    <div className="mt-2 rounded-md border border-[var(--line)] bg-[var(--surface)] p-2.5 text-[12px]">
                      <div className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--accent)] text-[12px]">
                        <Lightbulb size={11} />
                        <span>Interpretasi konseptual & studi kasus:</span>
                      </div>
                      <p className="text-[14px] leading-relaxed text-[var(--ink)]">
                        {term.conceptualExplanation}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
