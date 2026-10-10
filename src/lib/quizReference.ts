import type { QuizQuestion } from "./quiz";

const elementReferences: Record<string, [string, string]> = {
  BLK: ["elem-balok", "Balok: peran, rumus dan contoh lentur"],
  KLM: ["elem-kolom", "Kolom: aksial dan hierarki kapasitas"],
  DGS: ["elem-dinding-geser", "Dinding geser: gaya lateral dan kekangan"],
  PLT: ["elem-pelat-lantai", "Pelat lantai: pembebanan dan ketebalan"],
  BSM: ["elem-dinding-basement", "Dinding basement: tanah dan air"],
  PND: ["elem-pondasi", "Pondasi: penyaluran gaya ke tanah"],
  GRV: ["load-gravitasi", "Beban gravitasi: penghuni dan kombinasi"],
  ANG: ["load-angin", "Beban angin: tekanan dan gaya tingkat"],
  GMP: ["load-gempa", "Beban gempa: spektrum dan metode ELF"],
  TNH: ["load-tekanan-tanah", "Tekanan tanah: diam dan aktif"],
  AIR: ["load-tekanan-air", "Tekanan air dan stabilitas uplift"],
};

const glossaryGroups: Record<string, [number, string, string][]> = {
  SIM: [
    [2, "sym-fc", "Kuat tekan beton f′c"], [4, "sym-fy", "Kuat leleh tulangan fy"],
    [6, "sym-phi", "Faktor reduksi kekuatan φ"], [8, "sym-mn", "Momen nominal dan momen rencana"],
    [10, "sym-a", "Blok tegangan tekan"], [12, "sym-d", "Tinggi efektif penampang"],
    [14, "sym-vc-vs", "Kontribusi beton dan sengkang terhadap geser"],
    [16, "sym-p0-pn", "Kapasitas aksial kolom"], [18, "sym-pcr", "Beban kritis Euler"],
    [20, "sym-rho", "Rasio tulangan"], [22, "sym-k0-ka", "Koefisien tekanan tanah"],
    [24, "sym-v-shear", "Gaya geser dasar gempa"], [26, "sym-cs", "Koefisien respons seismik"],
    [28, "sym-r-seismic", "Faktor modifikasi respons R"], [30, "sym-qz", "Tekanan kecepatan angin"],
    [32, "sym-u-uplift", "Tekanan air dan gaya angkat"], [34, "sym-sf", "Faktor keamanan"],
    [36, "sym-dcr", "Rasio demand terhadap kapasitas"], [37, "sym-mu", "Momen lentur terfaktor"],
    [38, "term-shear-wall", "Dinding geser"], [39, "sym-cs", "Koefisien respons seismik"],
    [40, "sym-u-uplift", "Tekanan dan gaya resultan"],
  ],
  BBN: [[2, "term-mwfrs", "Sistem utama penahan gaya angin"],
    [4, "term-vortex-shedding", "Pelepasan pusaran angin"], [6, "term-lrfd", "Kombinasi beban LRFD"],
    [8, "term-occupant-load", "Beban penghuni" ]],
  STR: [[3, "term-srpmk", "Rangka pemikul momen khusus"], [6, "term-sendi-plastis", "Sendi plastis"],
    [9, "term-strong-column", "Hierarki kolom kuat–balok lemah"], [12, "term-daktilitas", "Daktilitas"],
    [15, "term-geser-pons", "Geser pons"], [18, "term-diafragma-kaku", "Diafragma kaku"],
    [21, "term-under-reinforced", "Regangan tarik dan rasio tulangan"]],
  RGM: [[3, "term-shear-wall", "Dinding geser"], [6, "term-boundary-element", "Elemen batas dinding"],
    [9, "term-interstory-drift", "Simpangan antar tingkat"], [12, "term-soft-story", "Tingkat lunak"],
    [15, "term-base-shear", "Geser dasar gempa"]],
  GEO: [[3, "term-at-rest-pressure", "Tekanan tanah diam"], [6, "term-pile-cap", "Pile cap"],
    [9, "term-differential-settlement", "Penurunan diferensial"], [12, "term-end-skin", "Tahanan ujung dan selimut tiang"],
    [15, "term-tegangan-efektif", "Tegangan efektif tanah"], [18, "term-surcharge", "Beban surcharge"],
    [21, "term-flotation", "Stabilitas terhadap pengapungan"], [24, "term-waterstop", "Sambungan kedap air"]],
};

export function quizReferenceFor(question: Pick<QuizQuestion, "id" | "topicId">): { href: string; label: string } {
  const element = elementReferences[question.topicId];
  if (element) return { href: `/?element=${element[0]}`, label: element[1] };
  const number = Number(question.id.split("-").at(-1));
  const group = glossaryGroups[question.topicId]?.find(([last]) => number <= last);
  if (group) return { href: `/?glossary=${group[1]}`, label: group[2] };
  return { href: "/", label: "Laboratorium visual teknik sipil" };
}
