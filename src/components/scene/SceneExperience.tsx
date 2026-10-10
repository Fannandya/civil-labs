"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowLeftRight, ArrowRight, Box, Droplets, Eye, Layers3, Pause, Play, Presentation, RotateCcw, ScanLine, Tags, Waves, Wind, X } from "lucide-react";
import { useViewerStore, VisualizationMode } from "@/store/viewer";
import { floorLoads, seismicBaseShear, soilAtRestForce, upliftStability, windVelocityPressure } from "@/lib/engineeringCalculations";
import { VECTOR_COLORS } from "./ScenePrimitives";
import { LoadJourneyPanel } from "./LoadJourneyPanel";

const lessons = [
  { id: "structure", label: "Struktur", icon: Box, color: "#53727c", title: "Kenali bagian bangunan", simple: "Pelat menerima beban lantai. Balok menyalurkannya ke kolom, lalu pondasi meneruskannya ke tanah. Klik satu elemen untuk melihat peran dan perhitungannya.", technical: "Maket rangka beton dengan dinding geser, dinding basemen, kepala kelompok tiang, dan empat tiang. Potongan membuka bagian dalam; tulangan ditampilkan sebagai ilustrasi susunan, bukan gambar pelaksanaan.", sequence: ["Pelat", "Balok", "Kolom", "Pondasi", "Tanah"] },
  { id: "gravity", label: "Gravitasi", icon: ArrowDown, color: VECTOR_COLORS.gravity, title: "Ikuti jalur beban menuju tanah", simple: "Berat orang, perabot, dan bangunan bekerja ke bawah. Sorotan bergantian menunjukkan jalur melalui pelat, balok, kolom, dan pondasi. Pada tahap terakhir, panah hijau menunjukkan arah reaksi tanah ke atas; kapasitas dukung tanah dan kecukupan pondasi tidak diperiksa di sini.", technical: "Panah merata menggambarkan qu = max(1,4D; 1,2D + 1,6L) pada lantai contoh. Pembagian area beban 45° adalah pendekatan geometris untuk panel dua arah. Jalur penyaluran bersifat konseptual; besar reaksi tiap tiang dan pembagian beban menurut kekakuan tidak dihitung dari diagram ini.", sequence: ["Beban lantai", "Pelat", "Balok", "Kolom", "Pondasi / tiang", "Tanah"] },
  { id: "wind", label: "Angin", icon: Wind, color: VECTOR_COLORS.wind, title: "Angin mendorong sisi bangunan", simple: "Panah mendatar memperlihatkan contoh dorongan angin pada sisi bangunan. Garis di luar bangunan membantu mengenali arah datang angin. Gaya pada fasad kemudian diteruskan melalui lantai dan sistem penahan gaya lateral menuju pondasi.", technical: "qz adalah tekanan kecepatan angin pada kondisi acuan. Panah seragam menunjukkan arah dan intensitas acuan yang sama, bukan profil tekanan fasad hasil perhitungan. Tekanan fasad, hisapan, tekanan internal, dan variasi elevasi memerlukan koefisien serta prosedur desain tambahan.", sequence: ["Angin", "Fasad", "Lantai", "Rangka / dinding", "Pondasi"] },
  { id: "seismic", label: "Gempa", icon: Waves, color: VECTOR_COLORS.seismic, title: "Tanah bergerak, massa menimbulkan gaya inersia", simple: "Saat tanah mengalami percepatan, massa lantai menimbulkan gaya inersia. Setiap panah tingkat menunjukkan contoh gaya lateral; panah lebih panjang berarti gaya tingkat yang lebih besar pada diagram ini.", technical: "Distribusi gaya statik ekuivalen (ELF) memakai empat berat tingkat yang sama. hx adalah tinggi tiap lantai dari dasar: 3,9; 7,8; 11,7; dan 15,6 m. Fx adalah gaya lateral pada tingkat tersebut; jumlahnya, ΣFx, sama dengan V (gaya geser dasar). Elevasi maket tetap skematis. Panah menunjukkan satu keadaan pembebanan; gerak tanah bukan rekaman gempa dan tidak menunjukkan periode atau respons dinamik gedung. SDS adalah parameter percepatan spektral desain.", sequence: ["Percepatan tanah", "Massa lantai", "Rangka / dinding", "Pondasi"] },
  { id: "soil", label: "Tanah", icon: Layers3, color: VECTOR_COLORS.soil, title: "Tekanan tanah bertambah terhadap kedalaman", simple: "Tanah di samping basemen mendorong dinding. Pada contoh tanah kering ini, tekanan nol di permukaan lalu meningkat ke bawah. Panah P₀ merangkum resultan tekanan tanah; titik kerjanya berada sepertiga tinggi dinding dari dasar.", technical: "Dinding terkekang memakai K₀ = 1 − sin φ′ untuk tanah homogen yang terkonsolidasi normal; γ = 18 kN/m³. K₀ adalah koefisien tekanan tanah saat diam, sedangkan σh adalah tekanan tanah mendatar: σh = K₀γz. P₀ = ½K₀γH² adalah resultan per meter panjang dinding dan bekerja H/3 dari dasar. Panjang panah resultan bukan skala pembanding panah tekanan. Diagram tidak memasukkan beban tambahan di permukaan maupun tekanan air. Lentur dinding diperbesar untuk peragaan.", sequence: ["Tanah", "Dinding basemen", "Tumpuan lantai / dasar"] },
  { id: "water", label: "Air tanah", icon: Droplets, color: VECTOR_COLORS.water, title: "Air menekan dinding dan mengangkat dasar", simple: "Tekanan air mulai dari nol di muka air tanah dan bertambah ke bawah. Panah mendatar menekan dinding, sedangkan panah ke atas di bawah pondasi menunjukkan gaya angkat air. Kedua contoh beban ini memakai masukan terpisah.", technical: "Tekanan lateral u = γwz memakai kedalaman muka air tanah (MAT) pada basemen. Gaya angkat U = γwhA memakai tinggi tekan air di bawah pondasi (h), yang dimasukkan terpisah. Rasio SF membandingkan berat struktur W dengan gaya angkat U dan hanya menunjukkan pemeriksaan tersebut; kapasitas pelat pondasi, angkur, serta tahap konstruksi perlu diperiksa tersendiri.", sequence: ["Muka air", "Tekanan lateral", "Gaya angkat dasar"] }
] as const;

const motionDescriptions: Record<Exclude<VisualizationMode, "structure">, string> = {
  gravity: "Pelat dan balok melendut ke bawah. Beban diperagakan bertambah, ditahan, lalu dilepas.",
  wind: "Bangunan melentur searah angin dengan hembusan yang berubah perlahan.",
  seismic: "Dasar bergerak bolak-balik dan lantai ikut bergoyang. Panah Fx menunjukkan satu arah pembebanan statik ekuivalen.",
  soil: "Dinding basemen melentur ke dalam di antara tumpuannya saat tekanan diperagakan bertambah.",
  water: "Tekanan air mendatar melenturkan dinding; gaya angkat air melenturkan pelat dasar ke atas di antara tumpuan tiang."
};

export function SceneExperienceControls({ onControlSelected }: { onControlSelected?: () => void }) {
  const mode = useViewerStore(s => s.visualizationMode);
  const setMode = useViewerStore(s => s.setVisualizationMode);
  const playing = useViewerStore(s => s.animationPlaying);
  const motionEnabled = useViewerStore(s => s.structuralMotionEnabled);
  const setMotionEnabled = useViewerStore(s => s.setStructuralMotionEnabled);
  const setPlaying = useViewerStore(s => s.setAnimationPlaying);
  const cutaway = useViewerStore(s => s.cutaway);
  const toggleCutaway = useViewerStore(s => s.toggleCutaway);
  const reinforcement = useViewerStore(s => s.showReinforcement);
  const toggleReinforcement = useViewerStore(s => s.toggleReinforcement);
  const labels = useViewerStore(s => s.showLabels);
  const toggleLabels = useViewerStore(s => s.toggleLabels);
  const exhibition = useViewerStore(s => s.exhibitionMode);
  const setExhibition = useViewerStore(s => s.setExhibitionMode);
  const setPreset = useViewerStore(s => s.setPreset);
  const journeyCycle = useViewerStore(s => s.journeyCycle);
  const previousCycle = useRef(journeyCycle);
  const tour = useViewerStore(s => s.tourPlaying);
  const setTour = useViewerStore(s => s.setTourPlaying);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (exhibition || !tour || !playing || reduced || mode !== "structure") return;
    const timer = window.setTimeout(() => {
      if (useViewerStore.getState().exhibitionMode) return;
      setMode("gravity"); setPreset("isometric");
    }, 14000);
    return () => clearTimeout(timer);
  }, [exhibition, tour, playing, reduced, mode, setMode, setPreset]);
  useEffect(() => {
    const completed = journeyCycle !== previousCycle.current;
    previousCycle.current = journeyCycle;
    if (exhibition || !completed || !tour || !playing || reduced || mode === "structure") return;
    const next = lessons[(lessons.findIndex(lesson => lesson.id === mode) + 1) % lessons.length].id;
    setMode(next); setPreset(next === "soil" || next === "water" ? "substructure" : "isometric");
  }, [exhibition, journeyCycle, tour, playing, reduced, mode, setMode, setPreset]);
  const choose = (next: VisualizationMode) => {
    setTour(false); setMode(next);
    setPreset(next === "soil" || next === "water" ? "substructure" : "isometric");
    onControlSelected?.();
  };
  return <div className="scene-experience-controls">
    <details className="control-category" open>
      <summary><Box size={15} />Simulasi struktur</summary>
      <div className="control-category-content lesson-selector" role="group" aria-label="Konteks visualisasi">
      {lessons.map(({ id, label, icon: Icon, color }) => <button key={id} type="button" className="lesson-button" aria-pressed={mode === id} onClick={() => choose(id)} style={{ "--lesson-color": color } as React.CSSProperties}>
        <Icon size={15} aria-hidden="true" /><span>{label}</span>
      </button>)}
      </div>
    </details>
    <details className="control-category" open>
      <summary><Activity size={15} />Gerak & tampilan</summary>
      <div className="control-category-content scene-tool-row" role="group" aria-label="Kontrol gerak dan tampilan">
        <button className="scene-tool" onClick={() => { setPlaying(!playing); onControlSelected?.(); }} disabled={reduced} title={reduced ? "Animasi dinonaktifkan sesuai preferensi kurangi gerakan" : "Putar atau jeda gerak struktur dan penanda arah gaya"} aria-label={playing && !reduced ? "Jeda animasi" : "Putar animasi"} aria-pressed={playing && !reduced}>{playing && !reduced ? <Pause size={14} /> : <Play size={14} />}<span>{reduced ? "Gerak dikurangi" : playing ? "Jeda" : "Putar"}</span></button>
        <button className="scene-tool" onClick={() => { setMotionEnabled(!motionEnabled); onControlSelected?.(); }} disabled={mode === "structure" || reduced} aria-pressed={motionEnabled && mode !== "structure" && !reduced} title="Bandingkan respons ilustratif dengan bentuk awal bangunan"><Activity size={14} />Gerak struktur</button>
        <button className="scene-tool" onClick={() => { toggleCutaway(); onControlSelected?.(); }} aria-pressed={cutaway}><ScanLine size={14} />Potongan</button>
        <button className="scene-tool" onClick={() => { toggleReinforcement(); onControlSelected?.(); }} aria-pressed={reinforcement}><Layers3 size={14} />Tulangan</button>
        <button className="scene-tool" onClick={() => { toggleLabels(); onControlSelected?.(); }} aria-pressed={labels}><Tags size={14} />Label</button>
        <button className="scene-tool" aria-pressed={tour} disabled={reduced} onClick={() => { setTour(!tour); if (!tour) { setMode("structure"); setPlaying(true); setPreset("isometric"); } onControlSelected?.(); }}><RotateCcw size={14} />{tour ? "Hentikan tur" : "Tur otomatis"}</button>
        <button className="scene-tool" aria-pressed={exhibition} onClick={() => { setExhibition(!exhibition); setPreset("isometric"); onControlSelected?.(); }} title="Perbesar area model untuk presentasi">{exhibition ? <X size={14} /> : <Presentation size={14} />}{exhibition ? "Keluar pameran" : "Mode pameran"}</button>
      </div>
    </details>
    {tour && <div className="tour-status" role="status">Tur {lessons.findIndex(lesson => lesson.id === mode) + 1} / {lessons.length} · {playing ? "Berpindah setelah satu rangkaian penjelasan. Pilih konteks untuk menghentikan tur." : "Dijeda. Tekan Putar untuk melanjutkan."}</div>}
  </div>;
}

export function SceneExperienceContent({ onControlSelected }: { onControlSelected?: () => void }) {
  const mode = useViewerStore(s => s.visualizationMode);
  const loadVisible = useViewerStore(s => s.layers.load_vector);
  const motionEnabled = useViewerStore(s => s.structuralMotionEnabled);
  const playing = useViewerStore(s => s.animationPlaying);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return <div className="scene-experience-content">
    <LoadJourneyPanel onControlSelected={onControlSelected} />
    {mode !== "structure" && loadVisible && <p className="scene-motion-caption" role="status">
      <Activity size={14} aria-hidden="true" />
      <span><strong>{reduced ? "Gerak dikurangi." : !motionEnabled ? "Bentuk awal." : playing ? "Respons struktur · diperbesar." : "Respons dijeda."}</strong>{" "}
      {reduced ? "Animasi struktur mengikuti preferensi perangkat. Tahap alur tetap dapat dipilih." : !motionEnabled ? "Aktifkan Gerak struktur untuk melihat ilustrasi respons terhadap beban." : motionDescriptions[mode]}
      {motionEnabled && !reduced && " Gerakan ilustratif; besar lendutan dan periode getar tidak dihitung."}</span>
    </p>}

  </div>;
}

export function SceneExplanation() {
  const mode = useViewerStore(s => s.visualizationMode);
  const params = useViewerStore(s => s.playgroundParams);
  const activeId = useViewerStore(s => s.activeId);
  const reinforcement = useViewerStore(s => s.showReinforcement);
  const loadLayer = useViewerStore(s => s.layers.load_vector);
  const motionEnabled = useViewerStore(s => s.structuralMotionEnabled);
  const [technical, setTechnical] = useState(false);
  const lesson = lessons.find(item => item.id === mode)!;
  let metric = "Maket struktur beton";
  if (mode === "gravity") metric = `D ${floorLoads(params).dead.toFixed(2)} + L ${floorLoads(params).liveDesign.toFixed(2)} kN/m²`;
  if (mode === "wind") metric = `qz ${(windVelocityPressure(params) / 1000).toFixed(3)} kPa`;
  if (mode === "seismic") metric = `V ${seismicBaseShear(params).shear.toFixed(0)} kN · ΣFx = V`;
  if (mode === "soil") metric = `K0 ${soilAtRestForce(params).k0.toFixed(2)} · P0 ${soilAtRestForce(params).force.toFixed(1)} kN/m`;
  if (mode === "water") metric = `Gaya angkat U ${upliftStability(params).uplift.toFixed(0)} kN`;
  return <section className="scene-explanation" aria-label="Penjelasan visualisasi">
    <div className="scene-explanation-heading">
      <h2><span style={{ backgroundColor: lesson.color }} />{lesson.title}</h2>
      <button className="explanation-level" aria-pressed={technical} onClick={() => setTechnical(!technical)}><Eye size={13} />{technical ? "Bahasa sederhana" : "Catatan teknik"}</button>
    </div>
    <p>{technical ? lesson.technical : lesson.simple}</p>
    {mode !== "structure" && loadLayer && <div className="scene-vector-key" aria-label="Cara membaca diagram beban">
      <span><ArrowRight size={14} aria-hidden="true" style={{ color: lesson.color }} />Panah: arah gaya</span>
      <span><i className="vector-key-field" aria-hidden="true" style={{ color: lesson.color }} />Bidang: pola pembebanan</span>
      <span><i className="vector-key-marker" aria-hidden="true" style={{ backgroundColor: lesson.color }} />Penanda bergerak: arah penyaluran</span>
      {motionEnabled && <span><i className="vector-key-reference" aria-hidden="true" />Garis putus: bentuk awal</span>}
    </div>}
    <div className="scene-explanation-footer">
      {mode === "water" ? <div className="water-path-branches" aria-label="Dua cabang pembebanan air">
        <div className="load-path-legend"><strong>Lateral</strong><span>Tekanan dinding</span><ArrowRight size={11} aria-hidden="true" /><span>Tumpuan</span></div>
        <div className="load-path-legend"><strong>Gaya angkat</strong><span>Air</span><ArrowLeftRight size={11} aria-hidden="true" /><span>Berat struktur</span></div>
      </div> : <div className="load-path-legend" aria-label="Urutan penyaluran gaya">{lesson.sequence.map((name, index) => <span key={name}>{index > 0 && <ArrowRight size={11} aria-hidden="true" />}{name}</span>)}</div>}
      <span className="scene-metric">{metric}</span>
    </div>
    <p className="scene-schematic-note">{mode === "structure" ? "Geometri maket bersifat skematis. " : "Baca besaran pada label; panjang panah bersifat relatif dalam kelompok yang sama. Panah alur mengikuti model; bidang tekanan menjadi diagram acuan. Gerak struktur diperbesar untuk pembelajaran. "}{reinforcement ? "Tulangan ilustratif; jumlah dan penjangkaran bukan detail desain. " : ""}{mode !== "structure" && !loadLayer ? "Lapisan vektor sedang disembunyikan. " : ""}{activeId ? "Hasil pemeriksaan terpisah tersedia pada panel elemen." : "Klik elemen untuk membuka materi dan kalkulator."}</p>
  </section>;
}
