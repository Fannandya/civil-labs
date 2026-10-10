"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { LOAD_JOURNEYS } from "@/lib/loadJourney";
import { useViewerStore } from "@/store/viewer";
import { VECTOR_COLORS } from "./ScenePrimitives";

export function LoadJourneyPanel({ onControlSelected }: { onControlSelected?: () => void }) {
  const mode = useViewerStore(s => s.visualizationMode);
  const step = useViewerStore(s => s.journeyStep);
  const playing = useViewerStore(s => s.animationPlaying);
  const visible = useViewerStore(s => s.layers.load_vector);
  const params = useViewerStore(s => s.playgroundParams);
  const layers = useViewerStore(s => s.layers);
  const selectStep = useViewerStore(s => s.setJourneyStep);
  const restart = useViewerStore(s => s.restartJourney);
  if (mode === "structure" || !visible) return null;
  const stages = LOAD_JOURNEYS[mode];
  const index = Math.min(step, stages.length - 1);
  const stage = stages[index];
  const noLoad = mode === "wind" && (params.speed ?? 35) <= 0
    ? "Kecepatan angin nol. Jalur beban tidak ditampilkan; tahapan yang berganti hanya penjelasan konseptual."
    : mode === "water" && index < 2 && (params.waterDepth ?? 2) >= (params.height ?? 4)
    ? "Muka air berada pada atau lebih dalam dari dasar dinding contoh. Tekanan lateral air pada dinding nol."
    : mode === "water" && index === 2 && (params.waterHead ?? 3) === 0
    ? "Tinggi tekan air di bawah pondasi nol. Tidak ada gaya angkat air pada dasar."
    : null;

  return <section className="load-journey-panel" aria-label="Panduan alur beban" style={{ "--journey-color": VECTOR_COLORS[mode] } as React.CSSProperties}>
    <div className="load-journey-heading">
      <p><strong>Ikuti alur beban</strong><span>Tahap {index + 1} dari {stages.length}</span></p>
      <div className="load-journey-actions">
        <button type="button" disabled={index === 0} onClick={() => { selectStep(index - 1); onControlSelected?.(); }} aria-label="Tahap beban sebelumnya" title="Tahap sebelumnya"><ChevronLeft size={16} /></button>
        <button type="button" onClick={() => { restart(); onControlSelected?.(); }} aria-label="Ulangi alur beban dari awal" title="Ulangi dari awal"><RotateCcw size={14} /></button>
        <button type="button" disabled={index === stages.length - 1} onClick={() => { selectStep(index + 1); onControlSelected?.(); }} aria-label="Tahap beban berikutnya" title="Tahap berikutnya"><ChevronRight size={16} /></button>
      </div>
    </div>
    <ol className="load-journey-steps" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
      {stages.map((item, i) => <li key={item.title}>
        <button type="button" onClick={() => { selectStep(i); onControlSelected?.(); }} aria-current={i === index ? "step" : undefined} title={item.title} aria-label={`Tahap ${i + 1}: ${item.title}. Pilih untuk menjeda pada tahap ini.`}>
          <span className="load-journey-number">{i + 1}</span><span>{item.shortTitle}</span>
        </button>
      </li>)}
    </ol>
    <p className="load-journey-description" aria-live={playing ? "off" : "polite"}><strong>{stage.title}.</strong> {noLoad ?? stage.description}</p>
    {(!layers.superstructure || !layers.substructure) && <p className="load-journey-description">Aktifkan kedua lapisan struktur untuk mengikuti seluruh jalur.</p>}
    <p className="load-journey-hint">Pilih tahap untuk menelaah jalurnya. Sorotan menunjukkan urutan penjelasan konseptual, bukan waktu rambat gaya. Gaya pada struktur bekerja bersamaan.</p>
  </section>;
}
