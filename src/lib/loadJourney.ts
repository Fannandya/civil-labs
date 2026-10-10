import type { VisualizationMode } from "@/store/viewer";

export type JourneyMode = Exclude<VisualizationMode, "structure">;

export type LoadJourneyStage = {
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly elementIds: readonly string[];
};

export const JOURNEY_STAGE_SECONDS = 4;

/** Schematic equilibrium paths, not the travel time of physical forces. */
export const LOAD_JOURNEYS: Record<JourneyMode, readonly LoadJourneyStage[]> = {
  gravity: [
    { title: "Beban menuju lantai", shortTitle: "Beban", description: "Berat sendiri, penghuni, dan barang bekerja ke bawah pada lantai.", elementIds: ["load-gravitasi"] },
    { title: "Pelat membagi beban", shortTitle: "Pelat", description: "Pelat meneruskan beban ke balok penumpu. Garis menunjukkan satu jalur contoh pembagian beban.", elementIds: ["elem-pelat-lantai"] },
    { title: "Balok menuju kolom", shortTitle: "Balok", description: "Balok mengumpulkan beban dari pelat dan meneruskannya melalui reaksi pada kolom.", elementIds: ["elem-balok"] },
    { title: "Kolom menuju pondasi", shortTitle: "Kolom", description: "Gaya tekan dari lantai-lantai diteruskan sepanjang kolom ke pondasi.", elementIds: ["elem-kolom"] },
    { title: "Pondasi menuju tanah", shortTitle: "Pondasi", description: "Pondasi menyebarkan beban ke tanah. Reaksi tanah yang berlawanan arah menjaga keseimbangan.", elementIds: ["elem-pondasi"] }
  ],
  wind: [
    { title: "Angin menekan fasad", shortTitle: "Fasad", description: "Tekanan angin bekerja pada permukaan bangunan; panah menunjukkan contoh gaya lateral arah X.", elementIds: ["load-angin"] },
    { title: "Lantai mengumpulkan gaya", shortTitle: "Lantai", description: "Sambungan fasad meneruskan gaya ke lantai. Lantai bekerja sebagai diafragma yang menyalurkan gaya dalam bidangnya.", elementIds: ["elem-pelat-lantai"] },
    { title: "Sistem lateral menahan gaya", shortTitle: "Rangka", description: "Diafragma meneruskan gaya ke rangka dan dinding yang efektif pada arah beban. Jalur ini menyorot rangka arah X.", elementIds: ["elem-balok", "elem-kolom"] },
    { title: "Pondasi menyeimbangkan", shortTitle: "Pondasi", description: "Gaya geser dan momen guling diteruskan ke pondasi, lalu diimbangi reaksi tanah.", elementIds: ["elem-pondasi"] }
  ],
  seismic: [
    { title: "Tanah menggerakkan dasar", shortTitle: "Tanah", description: "Percepatan tanah menggerakkan pondasi dan menimbulkan respons dinamis pada struktur.", elementIds: ["load-gempa", "elem-pondasi"] },
    { title: "Massa lantai berinersia", shortTitle: "Massa lantai", description: "Massa tiap lantai menimbulkan gaya inersia. Panah menunjukkan satu arah gaya lateral ekuivalen, bukan urutan rambat gelombang.", elementIds: ["elem-pelat-lantai"] },
    { title: "Sistem lateral menerima gaya", shortTitle: "Rangka", description: "Diafragma menyalurkan gaya inersia ke sistem penahan lateral. Contoh arah X ini mengikuti rangka yang searah beban.", elementIds: ["elem-balok", "elem-kolom"] },
    { title: "Gaya kembali ke tanah", shortTitle: "Pondasi", description: "Rangka meneruskan gaya geser dan momen ke pondasi. Interaksi pondasi dan tanah melengkapi jalur keseimbangan.", elementIds: ["elem-pondasi"] }
  ],
  soil: [
    { title: "Tanah menekan dinding", shortTitle: "Tekanan", description: "Komponen tekanan tanah akibat berat sendiri bertambah dengan kedalaman. Panah yang lebih panjang menandakan tekanan lebih besar.", elementIds: ["load-tekanan-tanah"] },
    { title: "Dinding menerima tekanan", shortTitle: "Dinding", description: "Dinding basement menerima tekanan lateral dan menahannya melalui lentur serta geser.", elementIds: ["elem-dinding-basement"] },
    { title: "Tumpuan menerima reaksi", shortTitle: "Tumpuan", description: "Untuk contoh dinding yang ditumpu lantai dan dasar, gaya diteruskan melalui sambungan ke kedua tumpuan tersebut.", elementIds: ["elem-pelat-lantai", "elem-pondasi"] }
  ],
  water: [
    { title: "Cabang 1 · Tekanan dinding", shortTitle: "Lateral", description: "Air menekan dinding secara lateral. Tekanan hidrostatik bertambah dari muka air menuju dasar.", elementIds: ["load-tekanan-air", "elem-dinding-basement"] },
    { title: "Dinding menuju tumpuan", shortTitle: "Tumpuan", description: "Tekanan lateral diteruskan oleh dinding ke lantai dan dasar melalui reaksi tumpuan.", elementIds: ["elem-dinding-basement", "elem-pelat-lantai", "elem-pondasi"] },
    { title: "Cabang 2 · Uplift dasar", shortTitle: "Uplift", description: "Secara terpisah, tekanan air di bawah pelat dasar bekerja ke atas. Uplift bukan kelanjutan aliran gaya dari dinding.", elementIds: ["load-tekanan-air", "elem-pondasi"] },
    { title: "Berat menahan uplift", shortTitle: "Berat", description: "Berat struktur bekerja ke bawah untuk melawan uplift. Keseimbangan bergantung pada besar gaya; arah panah saja tidak menyatakan aman.", elementIds: ["elem-pondasi", "elem-kolom"] }
  ]
};
