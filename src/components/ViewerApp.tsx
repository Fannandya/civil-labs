"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDown, ArrowLeftRight, BookMarked, Box, Check, ChevronRight, ClipboardList,
  ChevronsLeftRight, ChevronsUpDown, Layers3, Maximize2, MousePointer2,
  RotateCcw, ScanEye, Sliders, X
} from "lucide-react";
import { structuralById, structuralElements } from "../../data/structuralElements";
import { CameraPreset, useViewerStore } from "@/store/viewer";
import { ElementEducationPanel } from "@/components/ElementEducationPanel";
import { GlobalGlossaryModal } from "@/components/GlobalGlossaryModal";
import { SceneExperienceContent, SceneExperienceControls, SceneExplanation } from "@/components/scene/SceneExperience";
import { StructuralRoleModal } from "@/components/StructuralRoleModal";
import { SceneErrorBoundary } from "@/components/SceneErrorBoundary";
import { LOAD_JOURNEYS } from "@/lib/loadJourney";

const StructureCanvas = dynamic(
  () => import("@/components/StructureScene").then((module) => module.StructureCanvas),
  { ssr: false }
);
const presets: { id: CameraPreset; label: string; short: string }[] = [
  { id: "isometric", label: "Tampilan isometrik", short: "Isometrik" },
  { id: "front", label: "Tampak depan", short: "Depan" },
  { id: "top", label: "Tampak atas", short: "Atas" },
  { id: "substructure", label: "Detail struktur bawah", short: "Pondasi" },
  { id: "free", label: "Kamera bebas", short: "Bebas" }
];
const sceneLayers = [
  { key: "superstructure", label: "Struktur atas", color: "#98a6ad" },
  { key: "substructure", label: "Struktur bawah", color: "#697f87" },
  { key: "load_vector", label: "Vektor beban", color: "#426b8a" }
] as const;

export default function ViewerApp() {
  const [graphicsStatus, setGraphicsStatus] = useState<"loading" | "ready" | "lost" | "error">("loading");
  const [sceneAttempt, setSceneAttempt] = useState(0);
  const [restoreContext, setRestoreContext] = useState<(() => void) | null>(null);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [initialGlossaryId, setInitialGlossaryId] = useState<string | null>(null);
  const [deepDiveElementId, setDeepDiveElementId] = useState<string | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const controlsToggleRef = useRef<HTMLButtonElement>(null);
  const controlsCloseRef = useRef<HTMLButtonElement>(null);
  const controlsSidebarRef = useRef<HTMLElement>(null);
  const wasControlsOpen = useRef(false);
  const deepDiveElement = deepDiveElementId ? structuralById[deepDiveElementId] : null;
  const visualizationMode = useViewerStore((s) => s.visualizationMode);
  const journeyStep = useViewerStore((s) => s.journeyStep);
  const setJourneyStep = useViewerStore((s) => s.setJourneyStep);
  const exhibition = useViewerStore((s) => s.exhibitionMode);
  const setExhibition = useViewerStore((s) => s.setExhibitionMode);
  const activeId = useViewerStore((s) => s.activeId);
  const hoveredId = useViewerStore((s) => s.hoveredId);
  const touchCandidate = useViewerStore((s) => s.touchCandidate);
  const layers = useViewerStore((s) => s.layers);
  const xray = useViewerStore((s) => s.xray);
  const currentPreset = useViewerStore((s) => s.preset);
  const freePanX = useViewerStore((s) => s.freePanX);
  const freePanY = useViewerStore((s) => s.freePanY);
  const setFreePanX = useViewerStore((s) => s.setFreePanX);
  const setFreePanY = useViewerStore((s) => s.setFreePanY);
  const resetFreePan = useViewerStore((s) => s.resetFreePan);
  const select = useViewerStore((s) => s.select);
  const setPreset = useViewerStore((s) => s.setPreset);
  const toggleLayer = useViewerStore((s) => s.toggleLayer);
  const toggleXray = useViewerStore((s) => s.toggleXray);
  const handleContextLost = useCallback((restore: () => void) => {
    setRestoreContext(() => restore);
    setGraphicsStatus("lost");
  }, []);
  const handleContextRestored = useCallback(() => {
    setGraphicsStatus("ready");
    setRestoreContext(null);
  }, []);
  const handleReady = useCallback(() => setGraphicsStatus("ready"), []);
  const handleGraphicsError = useCallback(() => setGraphicsStatus("error"), []);
  const retryGraphics = useCallback(() => {
    setGraphicsStatus("loading");
    setRestoreContext(null);
    setSceneAttempt(attempt => attempt + 1);
  }, []);
  const closeControls = useCallback(() => setControlsOpen(false), []);
  const closeControlsAfterSelection = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) closeControls();
  }, [closeControls]);
  const active = activeId ? structuralById[activeId] : null;
  const hovered = hoveredId || touchCandidate ? structuralById[hoveredId || touchCandidate || ""] : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const state = useViewerStore.getState();
      if (event.key === "Escape" && state.exhibitionMode) { state.setExhibitionMode(false); return; }
      if (event.key === "Escape" && controlsOpen) { closeControls(); return; }
      if (event.key === "Tab" && controlsOpen && window.matchMedia("(max-width: 767px)").matches) {
        const focusable = controlsSidebarRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [href], summary, [tabindex]:not([tabindex="-1"])');
        if (focusable?.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, button, a, [contenteditable=true], [role=dialog]")) return;
      if (event.code === "Space") { event.preventDefault(); state.setAnimationPlaying(!state.animationPlaying); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [controlsOpen, closeControls]);

  useEffect(() => {
    if (controlsOpen && window.matchMedia("(max-width: 767px)").matches) controlsCloseRef.current?.focus();
  }, [controlsOpen]);
  useEffect(() => {
    if (wasControlsOpen.current && !controlsOpen && !exhibition) controlsToggleRef.current?.focus();
    wasControlsOpen.current = controlsOpen;
  }, [controlsOpen, exhibition]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const query = new URLSearchParams(window.location.search);
      const elementId = query.get("element");
      if (elementId && structuralById[elementId]) { select(elementId); setControlsOpen(true); }
      if (query.get("glossary")) { setInitialGlossaryId(query.get("glossary")); setExhibition(false); setGlossaryModalOpen(true); }
    });
    return () => cancelAnimationFrame(frame);
  }, [select, setExhibition]);

  const nextTraceStage = visualizationMode === "structure" ? null : LOAD_JOURNEYS[visualizationMode][journeyStep + 1];

  const sceneControls = (
    <>
      <div className="sidebar-section">
        <h2 className="sidebar-heading"><Layers3 size={16} className="text-[var(--muted)]" />Lapisan model</h2>
        <div className="mt-3">
          {sceneLayers.map((layer) => (
            <button key={layer.key} onClick={() => { toggleLayer(layer.key); closeControlsAfterSelection(); }} aria-pressed={layers[layer.key]} className="layer-button">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: layer.color, opacity: layers[layer.key] ? 1 : .35 }} />
              <span className="flex-1">{layer.label}</span>
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${layers[layer.key] ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)]"}`}>
                {layers[layer.key] && <Check size={11} />}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-[var(--muted)]">Pilih elemen struktur atau vektor beban untuk meninjau peran dan rumusnya.</p>
        <button onClick={() => { setJourneyStep(journeyStep + 1); closeControlsAfterSelection(); }} disabled={!nextTraceStage} className="ui-button mt-4 w-full text-left" title="Lanjutkan tahap penjelasan pada Ikuti alur beban">
          {nextTraceStage ? <><ArrowDown size={14} className="shrink-0" /><span>Berikut: {nextTraceStage.title}</span></> : <span>{visualizationMode === "structure" ? "Pilih simulasi beban untuk mengikuti alur" : "Alur selesai"}</span>}
        </button>
        <p className="mt-4 text-[13px] leading-relaxed text-[var(--muted)]">Gunakan “Ikuti alur beban” di sidebar untuk memilih atau mengulangi tahap. Tahap merupakan urutan penjelasan; cabang gaya bekerja bersamaan.</p>
      </div>
      <nav className="sidebar-section" aria-label="Pilih elemen model">
        <h2 className="sidebar-heading mb-3"><Box size={16} className="text-[var(--muted)]" />Elemen model</h2>
        {structuralElements.map((item, index) => (
          <div key={item.id}>
            {(index === 0 || item.category === "load_vector" && structuralElements[index - 1]?.category !== "load_vector") && (
              <p className="mb-1 mt-3 px-2.5 text-xs font-medium text-[var(--muted)]">{item.category === "load_vector" ? "Vektor beban" : "Elemen struktur"}</p>
            )}
            <button onClick={() => { select(item.id); closeControlsAfterSelection(); }} aria-pressed={activeId === item.id} className="element-button">
              <span>{item.name}</span><ChevronRight size={13} className="shrink-0 text-[var(--muted)]" />
            </button>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <main className="min-h-screen bg-[var(--bg-root)] text-[var(--ink)]">
      <header className={`lms-header ${exhibition ? "viewer-header-hidden" : ""}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2.5"><span className="text-lg font-semibold tracking-tight">Fakultas Teknik</span><span className="hidden text-[13px] text-[var(--muted)] sm:inline">Learning Lab</span></div>
            <p className="truncate text-xs text-[var(--muted)] sm:text-[13px]">Laboratorium visual teknik sipil <span className="hidden lg:inline">/ Struktur & pembebanan</span></p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/quiz" aria-label="Buka halaman kuis" title="Kuis teknik sipil" className="ui-button viewer-quiz-link"><ClipboardList size={15} /><span>Kuis</span></Link>
          <button aria-label="Buka simulasi 3D" title="Simulasi 3D" onClick={() => select("load-gravitasi")} className="ui-button ui-button-primary"><Sliders size={15} /><span className="hidden md:inline">Simulasi 3D</span></button>
          <button aria-label="Buka kamus sipil" title="Kamus sipil" onClick={() => setGlossaryModalOpen(true)} className="ui-button"><BookMarked size={15} /><span className="hidden md:inline">Kamus sipil</span></button>
          <button aria-label="Mode presentasi" title="Mode presentasi" onClick={() => { setPreset("isometric"); setExhibition(true); }} className="ui-button"><Maximize2 size={15} /><span>Full</span></button>
          <button aria-label="Atur ulang tampilan" title="Atur ulang tampilan" onClick={() => { select(null); setPreset("isometric"); }} className="ui-button"><RotateCcw size={15} /><span className="hidden lg:inline">Atur ulang tampilan</span></button>
        </div>
      </header>

      <section className={`viewer-workspace ${active && !deepDiveElementId ? "has-selection" : ""} ${controlsOpen && !exhibition ? "controls-open" : ""} ${exhibition ? "exhibition-mode" : ""}`} aria-label="Penampil analisis struktur">
      <aside ref={controlsSidebarRef} id="viewer-controls-sidebar" className={`scene-sidebar scrollbar ${controlsOpen && !exhibition ? "controls-sidebar-open" : ""}`} aria-label="Kontrol tampilan" aria-hidden={exhibition || !controlsOpen}>
        <div className="sidebar-topbar">
          <h2>Kontrol tampilan</h2>
          <button ref={controlsCloseRef} type="button" className="sidebar-close" onClick={closeControls} aria-label="Tutup panel kontrol"><X size={18} /></button>
        </div>
        <div className="scene-sidebar-controls">
          <details className="control-category" open>
            <summary><Maximize2 size={15} />Kamera</summary>
            <div className="control-category-content camera-controls" role="group" aria-label="Tampilan kamera">
              <div className="camera-presets">
                {presets.map((preset) => (
                  <button key={preset.id} onClick={() => { setPreset(preset.id); closeControlsAfterSelection(); }} title={preset.label} aria-label={preset.label} aria-pressed={currentPreset === preset.id} className="camera-button">{preset.short}</button>
                ))}
              </div>
              <button type="button" aria-label="Aktifkan tampilan tembus pandang (X-Ray)" title="Membuat elemen tampak tembus agar bagian dalam bangunan terlihat." aria-pressed={xray} onClick={() => { toggleXray(); closeControlsAfterSelection(); }} className="camera-button"><ScanEye size={15} />Tembus pandang</button>
              {currentPreset === "free" && <>
                <div className="free-camera-control">
                  <div className="free-camera-heading"><ChevronsUpDown size={14} />Geser vertikal (Y)<output>{freePanY >= 0 ? "+" : ""}{freePanY.toFixed(2)}</output></div>
                  <div className="free-camera-floors">{[{ label: "Atap", y: 4.35 }, { label: "Lt 3", y: 3.05 }, { label: "Lt 2", y: 1.75 }, { label: "Lt 1", y: .45 }, { label: "Pondasi", y: -2.20 }].map((floor) => <button key={floor.label} onClick={() => { setFreePanY(floor.y); closeControlsAfterSelection(); }} aria-pressed={Math.abs(freePanY - floor.y) < .25} className="camera-button">{floor.label}</button>)}</div>
                  <input type="range" min={-2.8} max={4.5} step={.05} value={freePanY} onChange={(e) => setFreePanY(parseFloat(e.target.value))} className="free-camera-elevation" aria-label="Geser kamera vertikal pada koordinat model Y" />
                  <button onClick={() => { setFreePanY(1.8); closeControlsAfterSelection(); }} title="Atur ulang posisi vertikal kamera" className="free-camera-reset">Atur ulang Y</button>
                </div>
                <div className="free-camera-control">
                  <div className="free-camera-heading"><ChevronsLeftRight size={14} />Geser horizontal (X)<output>{freePanX >= 0 ? "+" : ""}{freePanX.toFixed(2)}</output></div>
                  <input type="range" min={-6} max={6} step={.05} value={freePanX} onChange={(e) => setFreePanX(parseFloat(e.target.value))} className="free-camera-pan" aria-label="Geser kamera horizontal pada koordinat model X" />
                  <button onClick={() => { resetFreePan(); closeControlsAfterSelection(); }} title="Atur ulang posisi kamera" className="free-camera-reset">Atur ulang</button>
                </div>
                <p className="text-xs leading-relaxed text-[var(--muted)]">Angka memakai satuan koordinat model, bukan meter.</p>
              </>}
            </div>
          </details>
          <SceneExperienceControls onControlSelected={closeControlsAfterSelection} />
          <SceneExperienceContent onControlSelected={closeControlsAfterSelection} />
          {sceneControls}
        </div>
        <SceneExplanation />
      </aside>
      {controlsOpen && !exhibition && <button type="button" className="controls-backdrop" onClick={closeControls} aria-label="Tutup panel kontrol" />}
        <div className="viewer-stage">
          {!exhibition && <button ref={controlsToggleRef} type="button" className="viewer-controls-toggle" aria-controls="viewer-controls-sidebar" aria-expanded={controlsOpen} onClick={() => setControlsOpen(!controlsOpen)}><Sliders size={15} />{controlsOpen ? "Sembunyikan kontrol" : "Tampilkan kontrol"}</button>}
          <div className="viewport-canvas">
            <SceneErrorBoundary key={sceneAttempt} onError={handleGraphicsError}>
              <Suspense fallback={<div className="absolute inset-0 grid place-items-center" role="status">Memuat tampilan 3D…</div>}>
                <StructureCanvas onReady={handleReady} onContextLost={handleContextLost} onContextRestored={handleContextRestored} />
              </Suspense>
            </SceneErrorBoundary>
            {graphicsStatus === "loading" && <div className="pointer-events-none absolute inset-0 grid place-items-center" role="status"><p className="rounded-md bg-white/90 px-4 py-3 text-sm">Memuat tampilan 3D…</p></div>}
            {exhibition && <button type="button" className="pov-controls-toggle" onClick={() => { setExhibition(false); setControlsOpen(true); }} aria-label="Tampilkan kontrol tampilan">
              <Sliders size={15} /><span>Tampilkan kontrol</span>
            </button>}
            {hovered && !active && !exhibition && (
              <div className="hovered-element-tooltip pointer-events-none absolute z-20 max-w-[calc(100%-32px)] rounded-md border border-white/15 bg-white px-3 py-2 text-[var(--ink)] shadow-lg">
                <div className="text-xs text-[var(--muted)]">{hovered.category.replace("_", " ")}</div>
                <div className="mt-1 text-sm font-medium">{hovered.name}</div>
              </div>
            )}
            {(graphicsStatus === "lost" || graphicsStatus === "error") && (
              <div className="absolute inset-0 z-[120] grid place-items-center bg-[#12151a]/95 p-5">
                <div className="max-w-md rounded-lg border border-[var(--line)] bg-[var(--panel)] p-7 text-center">
                  <ArrowLeftRight size={24} className="mx-auto text-[var(--accent)]" />
                  <h2 className="mt-4 text-xl font-semibold">{graphicsStatus === "lost" ? "Tampilan 3D terhenti" : "Tampilan 3D belum dapat dibuka"}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{graphicsStatus === "lost" ? "Konteks grafis terputus." : "Peramban atau perangkat belum berhasil membuat tampilan WebGL, atau adegan mengalami kesalahan."} Pilihan materi dan parameter tetap tersimpan. Anda dapat mencoba lagi atau membaca materi melalui sidebar.</p>
                  {graphicsStatus === "lost" && <button onClick={() => restoreContext?.()} className="ui-button mt-5">Pulihkan konteks grafis</button>}
                  <button onClick={retryGraphics} className="ui-button ui-button-primary mt-3">Coba ulang tampilan 3D</button>
                  <button onClick={() => { setExhibition(false); setControlsOpen(true); }} className="ui-button mt-3">Buka materi di sidebar</button>
                  <Link href="/quiz" className="ui-button mt-3">Buka kuis</Link>
                </div>
              </div>
            )}
          </div>
          <div className="viewport-status">
            <div className="flex flex-wrap items-center gap-3">
              {currentPreset === "free" ? <><span className="font-medium text-[var(--accent)]">Kamera bebas</span><span>Seret model untuk memutar; gunakan penggeser untuk menggeser kamera.</span></> : <><span className="flex items-center gap-1.5"><MousePointer2 size={13} />Seret untuk memutar</span><span className="flex items-center gap-1.5"><Maximize2 size={13} />Gulir untuk memperbesar atau memperkecil</span></>}
            </div>
            <div className="flex items-center gap-2" role="status"><span className={`h-1.5 w-1.5 rounded-full ${graphicsStatus === "ready" ? "bg-emerald-600" : "bg-amber-600"}`} /><span>{{ loading: "Memuat grafis 3D…", ready: "Grafis 3D siap", lost: "Grafis 3D terhenti", error: "Grafis 3D tidak tersedia" }[graphicsStatus]}</span><span className="hidden xl:inline">· Model pembelajaran · 11 elemen</span></div>
          </div>
        </div>
      </section>

      <Dialog.Root modal={false} open={!!active && !deepDiveElementId} onOpenChange={(open) => { if (!open) select(null); }}>
        <Dialog.Portal>
          {active && (
            <Dialog.Content aria-label="Detail elemen" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} className="element-drawer scrollbar">
              <Dialog.Title className="sr-only">{active.name}</Dialog.Title>
              <Dialog.Description className="sr-only">Informasi, rumus, dan simulasi elemen {active.name}.</Dialog.Description>
              <ElementEducationPanel key={active.id} element={active} initialTab={active.category === "load_vector" ? "playground" : "overview"} onSelectConnected={select} onClose={() => select(null)} onOpenDeepDive={() => setDeepDiveElementId(active.id)} />
            </Dialog.Content>
          )}
        </Dialog.Portal>
      </Dialog.Root>
      <GlobalGlossaryModal open={glossaryModalOpen} onOpenChange={setGlossaryModalOpen} initialEntryId={initialGlossaryId} />
      {deepDiveElement && (
        <StructuralRoleModal element={deepDiveElement} open={!!deepDiveElement} onOpenChange={(open) => { if (!open) setDeepDiveElementId(null); }} onBack={() => setDeepDiveElementId(null)} />
      )}
    </main>
  );
}
