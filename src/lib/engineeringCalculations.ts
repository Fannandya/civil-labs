/** SI teaching calculations. Assumptions and excluded checks are part of each result. */
export type EngineeringParams = Record<string, number>;
export type EngineeringResult = {
  value: string;
  secondary: string;
  status: string;
  dcr: number | null;
  failureMode: string | null;
  metricLabel: string;
  notes: string;
};
export const GRAVITY = 9.81;
export const WATER_UNIT_WEIGHT = 9.81; // kN/m³
export const CONCRETE_UNIT_WEIGHT = 24; // illustrative kN/m³, not a universal material constant
export const OFFICE_LIVE_LOAD_MINIMUM = 2.4; // kN/m²; office only, not classroom/corridor/assembly
export const UPLIFT_SAFETY_FACTOR = 1.5;

function input(params: EngineeringParams, key: string, fallback: number) {
  const value = params[key] ?? fallback;
  if (!Number.isFinite(value)) throw new RangeError(`${key} harus berupa angka berhingga.`);
  return value;
}
function positive(value: number, label: string) {
  if (value <= 0) throw new RangeError(`${label} harus lebih besar dari nol.`);
  return value;
}
function nonnegative(value: number, label: string) {
  if (value < 0) throw new RangeError(`${label} tidak boleh negatif.`);
  return value;
}
export function floorLoads(params: EngineeringParams) {
  const people = nonnegative(input(params, "occupantCount", 180), "Jumlah orang");
  const personMass = positive(input(params, "personWeight", 70), "Massa per orang");
  const area = positive(input(params, "floorArea", 192), "Luas lantai");
  const furniture = nonnegative(input(params, "partitionFurniture", 1), "Beban bergerak");
  const thickness = positive(input(params, "slabThickness", 140), "Tebal pelat");
  const sidl = nonnegative(input(params, "deadLoadSidl", 1.5), "SIDL");
  const minimumLive = nonnegative(input(params, "minimumLiveLoad", OFFICE_LIVE_LOAD_MINIMUM), "Beban hidup minimum");
  const totalMass = people * personMass;
  const occupantForce = totalMass * GRAVITY / 1000;
  const occupantLoad = occupantForce / area;
  const liveScenario = occupantLoad + furniture;
  const liveDesign = Math.max(liveScenario, minimumLive);
  const selfWeight = thickness / 1000 * CONCRETE_UNIT_WEIGHT;
  const dead = selfWeight + sidl;
  const factored = Math.max(1.4 * dead, 1.2 * dead + 1.6 * liveDesign);
  return { totalMass, occupantForce, occupantLoad, liveScenario, liveDesign, selfWeight, dead, factored, minimumLive };
}

/** Illustrative bar packing, not a complete code/aggregate-size detailing check. */
export function beamReinforcementLayout(params: EngineeringParams) {
  const width = positive(input(params, "beamWidth", 300), "Lebar balok");
  const height = positive(input(params, "beamDepth", 600), "Tinggi balok");
  const diameter = positive(input(params, "rebarDiameter", 22), "Diameter tulangan");
  const count = positive(input(params, "bars", input(params, "rebarCount", 4)), "Jumlah tulangan tarik");
  if (!Number.isInteger(count)) throw new RangeError("Jumlah tulangan tarik harus bilangan bulat.");
  const cover = nonnegative(input(params, "cover", 40), "Selimut beton");
  const stirrup = nonnegative(input(params, "stirrupDiameter", 10), "Diameter sengkang");
  const clearSpacing = Math.max(25, diameter);
  const edge = cover + stirrup + diameter / 2;
  const innerWidth = width - 2 * (cover + stirrup);
  const rowCapacity = Math.max(0, Math.floor((innerWidth + clearSpacing) / (diameter + clearSpacing)));
  const rows = rowCapacity > 0 ? Math.ceil(count / rowCapacity) : 0;
  const positions: [number, number][] = [];
  if (rows > 0) {
    const baseCount = Math.floor(count / rows);
    const remainder = count % rows;
    for (let row = 0; row < rows; row++) {
      const rowCount = baseCount + (row < remainder ? 1 : 0);
      for (let i = 0; i < rowCount; i++) {
        const x = rowCount === 1 ? 0 : -width / 2 + edge + i * (width - 2 * edge) / (rowCount - 1);
        positions.push([x, edge + row * (diameter + clearSpacing)]);
      }
    }
  }
  const centroid = positions.length ? positions.reduce((sum, [, y]) => sum + y, 0) / count : edge;
  const lastRow = edge + Math.max(0, rows - 1) * (diameter + clearSpacing);
  // Reserve two constructive top bars; these are excluded from tension As and capacity.
  const fits = rows > 0 && width >= 2 * edge + diameter + clearSpacing && height - edge - lastRow - diameter >= clearSpacing;
  return { width, height, diameter, count, clearSpacing, edge, rows, positions, centroid, fits };
}

export function beamFlexure(params: EngineeringParams) {
  const b = positive(input(params, "beamWidth", 300), "Lebar balok");
  const h = positive(input(params, "beamDepth", 600), "Tinggi balok");
  const fc = positive(input(params, "fc", 30), "f'c");
  const fy = positive(input(params, "fy", 420), "fy");
  const layout = beamReinforcementLayout(params);
  const { diameter, count: bars } = layout;
  const d = positive(h - layout.centroid, "Tinggi efektif");
  const dt = positive(h - layout.edge, "Jarak baja tarik terluar");
  const As = bars * Math.PI * diameter ** 2 / 4;
  const beta1 = Math.max(.65, Math.min(.85, .85 - .05 * (fc - 28) / 7));
  const a = As * fy / (.85 * fc * b);
  const c = a / beta1;
  const strain = .003 * (dt - c) / c;
  const yieldStrain = fy / 200000;
  const phi = Math.min(.9, Math.max(.65, .65 + .25 * (strain - yieldStrain) / (.005 - yieldStrain)));
  const nominal = As * fy * (d - a / 2) * 1e-6;
  const capacity = phi * nominal;
  const rho = As / (b * d);
  const rhoMin = Math.max(.25 * Math.sqrt(fc) / fy, 1.4 / fy);
  const valid = layout.fits && a < h && nominal > 0 && strain >= .004 && rho >= rhoMin && rho <= .025;
  return { d, dt, As, a, c, beta1, strain, yieldStrain, phi, nominal, capacity, rho, rhoMin, layout, valid };
}

export function columnAxial(params: EngineeringParams) {
  const size = positive(input(params, "columnSize", 600), "Dimensi kolom");
  const bars = positive(input(params, "columnRebarCount", 12), "Jumlah tulangan kolom");
  const fc = positive(input(params, "fc", 35), "f'c");
  const Ag = size ** 2;
  const Ast = bars * Math.PI * 25 ** 2 / 4;
  if (Ast >= Ag) throw new RangeError("Luas baja harus lebih kecil daripada penampang kolom.");
  const P0 = (.85 * fc * (Ag - Ast) + 420 * Ast) / 1000;
  const capacity = .8 * .65 * P0;
  const rho = Ast / Ag;
  return { P0, capacity, rho, valid: rho >= .01 && rho <= .06 };
}

export function shearWall(params: EngineeringParams) {
  const fc = positive(input(params, "fc", 35), "f'c");
  const spacing = positive(input(params, "spacing", 150), "Spasi tulangan");
  const height = positive(input(params, "wallHeight", 16), "Tinggi dinding");
  const length = positive(input(params, "wallLength", 4), "Panjang dinding");
  const thickness = positive(input(params, "wallThickness", 300), "Tebal dinding");
  const aspect = height / length;
  const alpha = aspect <= 1.5 ? .25 : aspect >= 2 ? .17 : .25 - .16 * (aspect - 1.5);
  const Acv = thickness * length * 1000;
  const rho = (2 * Math.PI * 13 ** 2 / 4) / (thickness * spacing);
  const rawNominal = Acv * (alpha * Math.sqrt(fc) + rho * 420) / 1000;
  const nominal = Math.min(rawNominal, .83 * Acv * Math.sqrt(fc) / 1000);
  // Conservative special-wall shear factor where flexural shear comparison is not supplied.
  const phi = .6;
  return { alpha, rho, rawNominal, nominal, phi, capacity: phi * nominal, valid: rho >= .0025 && spacing <= Math.min(length * 1000 / 5, 3 * thickness, 450) };
}

export function slabMinimumThickness(params: EngineeringParams) {
  const span = positive(input(params, "span", 5.7), "Bentang panjang");
  const ratio = positive(input(params, "ratio", 1.5), "Rasio bentang");
  const alpha = nonnegative(input(params, "alphaFm", 2.1), "Rasio kekakuan balok/pelat");
  const fy = positive(input(params, "fy", 420), "fy");
  if (ratio < 1 || ratio > 2 || alpha <= .2) return { minimum: null, ratio, alpha };
  const denominator = alpha > 2 ? 36 + 9 * ratio : 36 + 5 * ratio * (alpha - .2);
  const lowerBound = alpha > 2 ? 90 : 125;
  return { minimum: Math.max(lowerBound, span * 1000 * (.8 + fy / 1400) / denominator), ratio, alpha };
}

export function basementPressure(params: EngineeringParams) {
  const height = positive(input(params, "height", 4), "Tinggi dinding");
  const waterDepth = nonnegative(input(params, "waterDepth", 2), "Kedalaman muka air");
  const phi = input(params, "phi", 30);
  if (phi <= 0 || phi >= 90) throw new RangeError("Sudut geser harus di antara 0° dan 90°.");
  const k0 = 1 - Math.sin(phi * Math.PI / 180);
  const dryDepth = Math.min(height, waterDepth);
  const wetDepth = Math.max(0, height - waterDepth);
  const soil = k0 * (10 + 18 * dryDepth + (20 - WATER_UNIT_WEIGHT) * wetDepth);
  const water = WATER_UNIT_WEIGHT * wetDepth;
  return { k0, soil, water, total: soil + water };
}
export function pileReactions(params: EngineeringParams) {
  const axial = nonnegative(input(params, "pileServiceLoad", 4000), "Beban tekan layan");
  const moment = input(params, "momentM", 200);
  const average = axial / 4;
  const increment = Math.abs(moment) * .75 / (4 * .75 ** 2);
  return { average, increment, maximum: average + increment, minimum: average - increment };
}
export function windVelocityPressure(params: EngineeringParams) {
  const speed = nonnegative(input(params, "speed", 35), "Kecepatan angin");
  const kz = positive(input(params, "kz", .85), "Kz");
  const kzt = positive(input(params, "kzt", 1), "Kzt");
  const kd = positive(input(params, "kd", .85), "Kd");
  const ke = positive(input(params, "ke", 1), "Ke");
  return .613 * kz * kzt * kd * ke * speed ** 2; // Pa
}
export function seismicBaseShear(params: EngineeringParams) {
  const sds = nonnegative(input(params, "sds", .71), "SDS");
  const sd1 = nonnegative(input(params, "sd1", .507), "SD1");
  const period = positive(input(params, "period", .6), "T");
  const tl = positive(input(params, "tl", 6), "TL");
  const s1 = nonnegative(input(params, "s1", .3), "S1");
  const response = positive(input(params, "responseR", 8), "R");
  const importance = positive(input(params, "importanceIe", 1), "Ie");
  const weight = positive(input(params, "weight", 12000), "Berat seismik");
  const reduction = response / importance;
  const basic = sds / reduction;
  const upper = period <= tl ? sd1 / (period * reduction) : sd1 * tl / (period ** 2 * reduction);
  const minimum = Math.max(.044 * sds * importance, .01, s1 >= .6 ? .5 * s1 / reduction : 0);
  const cs = Math.max(minimum, Math.min(basic, upper));
  const exponent = period <= .5 ? 1 : period >= 2.5 ? 2 : 1 + (period - .5) / 2;
  return { cs, basic, upper, minimum, shear: cs * weight, exponent };
}
export function soilAtRestForce(params: EngineeringParams) {
  const phi = input(params, "phi", 30);
  if (phi <= 0 || phi >= 90) throw new RangeError("Sudut geser harus di antara 0° dan 90°.");
  const height = positive(input(params, "height", 4), "Tinggi dinding");
  const sine = Math.sin(phi * Math.PI / 180);
  const k0 = 1 - sine;
  const ka = (1 - sine) / (1 + sine);
  return { k0, ka, force: .5 * k0 * 18 * height ** 2, activeForce: .5 * ka * 18 * height ** 2, applicationHeight: height / 3 };
}
export function distributeSeismicForces(weights: number[], heights: number[], shear: number, exponent: number) {
  if (weights.length !== heights.length || weights.length === 0) throw new RangeError("Data berat dan tinggi tingkat harus berpasangan.");
  nonnegative(shear, "Gaya geser dasar");
  positive(exponent, "Eksponen distribusi");
  const terms = weights.map((weight, index) => positive(weight, "Berat tingkat") * positive(heights[index], "Tinggi tingkat") ** exponent);
  const total = terms.reduce((sum, term) => sum + term, 0);
  return terms.map((term) => shear * term / total);
}
export function upliftStability(params: EngineeringParams) {
  const head = nonnegative(input(params, "waterHead", 3), "Tinggi tekanan air");
  const weight = positive(input(params, "deadWeight", 13500), "Berat mati minimum");
  const area = positive(input(params, "baseArea", 300), "Luas dasar");
  const targetSF = input(params, "targetSF", UPLIFT_SAFETY_FACTOR);
  if (targetSF < UPLIFT_SAFETY_FACTOR) throw new RangeError("SF target pemeriksaan ini minimal 1,50.");
  const uplift = WATER_UNIT_WEIGHT * head * area;
  const sf = uplift === 0 ? Infinity : weight / uplift;
  return { uplift, sf, targetSF, ratio: targetSF * uplift / weight };
}

const loadOnly = (value: string, secondary: string, notes: string): EngineeringResult => ({
  value, secondary, status: "Hasil pembebanan; kapasitas belum diperiksa", dcr: null, failureMode: null, metricLabel: "Hasil pembebanan", notes
});
const checked = (value: string, secondary: string, ratio: number | null, notes: string, metricLabel = "Rasio demand/capacity (DCR)"): EngineeringResult => ({
  value, secondary, dcr: ratio, metricLabel, notes,
  status: ratio === null ? "Di luar asumsi perhitungan" : ratio <= 1 ? "Memenuhi pemeriksaan yang ditampilkan" : "Tidak memenuhi pemeriksaan yang ditampilkan",
  failureMode: ratio !== null && ratio > 1 ? "Nilai kebutuhan melampaui nilai pembanding. Evaluasi asumsi dan pemeriksaan lanjutan yang tercantum." : null
});

export function calculateEngineering(type: string, params: EngineeringParams): EngineeringResult | null {
  try {
    switch (type) {
      case "beam_moment": {
        const loads = floorLoads(params);
        const beam = beamFlexure(params);
        const b = input(params, "beamWidth", 300);
        const h = input(params, "beamDepth", 600);
        const span = positive(input(params, "beamSpan", 6), "Bentang balok");
        const wu = loads.factored * 3 + 1.2 * b / 1000 * Math.max(0, h - input(params, "slabThickness", 140)) / 1000 * CONCRETE_UNIT_WEIGHT;
        const demand = wu * span ** 2 / 8;
        return checked(beam.valid ? beam.capacity.toFixed(2) : "—", `Mu = ${demand.toFixed(2)} kNm; d = ${beam.d.toFixed(1)} mm; εt = ${beam.strain.toFixed(5)}; φ = ${beam.phi.toFixed(3)}`, beam.valid ? demand / beam.capacity : null,
          `Model lentur positif bertulang tunggal: ${beam.layout.count} batang tarik dalam ${beam.layout.rows} lapis, d dari centroid; εt dari baja tarik terluar (dt=${beam.dt.toFixed(1)} mm). Dua batang atas konstruktif pada ilustrasi tidak dihitung sebagai As. Susunan memakai jarak bersih contoh maks(25 mm, diameter), bukan pemeriksaan lengkap SNI/ukuran agregat. Mu memakai balok sendi–rol berbeban merata, lebar tributari 3 m; bukan analisis portal SRPMK. Rasio tulangan minimum/maksimum, kecukupan ruang contoh dan εt≥0,004 diperiksa. Geser, lendutan, penyaluran, detail penulangan dan kapasitas seismik belum diperiksa.`);
      }
      case "column_axial": {
        const column = columnAxial(params);
        const demand = nonnegative(input(params, "columnPu", 4850), "Pu");
        return checked(column.capacity.toFixed(2), `Pu = ${demand.toFixed(2)} kN; P0 = ${column.P0.toFixed(2)} kN; ρg = ${(column.rho * 100).toFixed(2)}%`, column.valid ? demand / column.capacity : null,
          "Kolom pendek bersengkang, 0,80×φ×P0 dengan φ=0,65; tulangan D25 dan fy=420 MPa. Rentang tulangan SRPMK 1–6% diperiksa. Pu adalah masukan terfaktor contoh. Ini batas aksial atas, bukan diagram interaksi P–M; momen dua arah, kelangsingan, joint dan detailing belum diperiksa.");
      }
      case "shear_wall": {
        const wall = shearWall(params);
        const demand = nonnegative(input(params, "shearDemand", 2250), "Vu");
        return checked(wall.capacity.toFixed(2), `Vu = ${demand.toFixed(1)} kN; Vn = ${wall.nominal.toFixed(2)} kN; αc=${wall.alpha.toFixed(3)}; ρt=${(wall.rho * 100).toFixed(3)}%; φ=0,60`, wall.valid ? demand / wall.capacity : null,
          "Dinding khusus, beton normal λ=1, dua tirai horizontal D13, fy=420 MPa. Batas individual 0,83√f'c Acv diterapkan; batas gabungan 0,66√f'c ΣAcv harus diperiksa terpisah. φ=0,60 dipakai konservatif karena pembanding geser pada kuat lentur belum tersedia; φ=0,75 bersyarat. Lentur-aksial, boundary element, tulangan vertikal dan detailing belum diperiksa.");
      }
      case "slab_thickness": {
        const slab = slabMinimumThickness(params);
        const actual = positive(input(params, "slabThickness", 140), "Tebal aktual");
        return checked(slab.minimum === null ? "—" : slab.minimum.toFixed(2), `h aktual = ${actual} mm; αfm=${slab.alpha.toFixed(2)}; β=${slab.ratio.toFixed(3)}`, slab.minimum === null ? null : slab.minimum / actual,
          "Panel interior dua arah dengan balok pada keempat sisi; ln adalah bentang bersih panjang, fy=420 MPa. 0,2<αfm≤2 memakai batas 125 mm; αfm>2 memakai batas 90 mm. αfm adalah masukan asumsi yang harus dihitung dari kekakuan balok/pelat. αfm≤0,2, β>2 dan panel tepi memerlukan prosedur lain. Ini aturan tebal empiris, bukan hasil analisis lendutan atau kapasitas lentur/geser.", "Rasio h minimum / h aktual");
      }
      case "retaining_wall": {
        const pressure = basementPressure(params);
        return loadOnly(pressure.total.toFixed(2), `Tanah efektif=${pressure.soil.toFixed(2)} kPa; air=${pressure.water.toFixed(2)} kPa; K0=${pressure.k0.toFixed(3)}`,
          "Tekanan di dasar dinding terkekang, tanah terkonsolidasi normal; γ=18 dan γsat=20 kN/m³, surcharge 10 kPa. waterDepth adalah kedalaman muka air dari permukaan; tekanan air nol di atasnya. Ketahanan lentur/geser dinding dan distribusi reaksi tumpuan belum dihitung.");
      }
      case "pile_capacity": {
        const pile = pileReactions(params);
        const allowable = positive(input(params, "pileAllowable", 1200), "Qa");
        return checked(pile.maximum.toFixed(2), `P rata-rata=${pile.average.toFixed(2)} kN; P minimum=${pile.minimum.toFixed(2)} kN; Qa=${allowable} kN`, pile.minimum < 0 ? null : pile.maximum / allowable,
          "Empat tiang berkekakuan sama, pile cap kaku, koordinat y=±0,75 m, satu momen Mx; Σy²=2,25 m². P dan M adalah beban layan, Qa masukan kapasitas izin dari geoteknik (belum ditentukan modul ini). Berat pile cap harus masuk P. Reaksi negatif membutuhkan kapasitas tarik tersendiri. Efisiensi kelompok, settlement, lateral dan kapasitas pile cap belum diperiksa.");
      }
      case "gravity_reduction": {
        const loads = floorLoads(params);
        return loadOnly(loads.factored.toFixed(3), `D=${loads.dead.toFixed(3)}; L skenario=${loads.liveScenario.toFixed(3)}; L desain=${loads.liveDesign.toFixed(3)} kN/m²`,
          "q orang=N×massa×9,81/(1000A), massa 70 kg hanya asumsi contoh. Distribusi seragam bukan batas okupansi/evakuasi. L desain=max(L skenario, minimum yang dimasukkan); contoh kantor 2,40 kN/m²; fungsi kelas/koridor/pertemuan memiliki beban berbeda. Furnitur/partisi bergerak adalah asumsi beban hidup; partisi permanen masuk beban mati dan jangan dihitung ganda. Allowance tambahan partisi menurut SNI 4.3.2 belum diperiksa; contoh ini tidak membuktikan pemenuhan pasal tersebut. qu=max(1,4D;1,2D+1,6L) untuk kasus gravitasi D/L ini, bukan seluruh kombinasi SNI. Kapasitas lantai belum diperiksa.");
      }
      case "wind_pressure": {
        const pressure = windVelocityPressure(params);
        return loadOnly(pressure.toFixed(2), `qz=${(pressure / 1000).toFixed(4)} kPa; V=${input(params, "speed", 35)} m/s`,
          "qz adalah tekanan kecepatan, bukan tekanan desain fasad p. Kzt=1, Kd=0,85, Ke=1 jika tidak diubah; Kz harus dipilih dari eksposur/elevasi. Untuk p diperlukan tekanan acuan, G/Cp/GCpi, kedua tanda tekanan internal serta prosedur MWFRS atau C&C yang sesuai. Kapasitas rangka/fasad belum diperiksa.");
      }
      case "seismic_shear": {
        const seismic = seismicBaseShear(params);
        return loadOnly(seismic.shear.toFixed(2), `Cs=${seismic.cs.toFixed(5)}; Cs min=${seismic.minimum.toFixed(5)}; Cs batas periode=${seismic.upper.toFixed(5)}; k=${seismic.exponent.toFixed(2)}`,
          "Metode: gaya lateral ekivalen (ELF, Equivalent Lateral Force) dengan batas bawah dan atas koefisien respons seismik (Cs); batas minimum tambahan berlaku bila S1 ≥ 0,6. Masukan: SDS (percepatan spektral desain periode pendek), SD1 (percepatan spektral desain periode 1 detik), S1 (parameter gempa maksimum yang dipertimbangkan berbasis risiko pada 1 detik), serta TL (periode transisi panjang) mengikuti lokasi contoh. Periode getar T harus memenuhi pembatasan standar; R adalah faktor modifikasi respons dan Ie faktor keutamaan gempa yang harus sesuai sistem dan kategori risiko. R = 8 tidak otomatis berlaku pada sistem ganda. Belum diperiksa: kelayakan metode ELF, kombinasi gempa, torsi, efek P–Δ (orde kedua), distribusi kekakuan, dan simpangan antar-lantai (drift). V adalah tuntutan gaya, bukan kapasitas struktur.");
      }
      case "earth_force": {
        const soil = soilAtRestForce(params);
        return loadOnly(soil.force.toFixed(2), `K0=${soil.k0.toFixed(3)}; titik tangkap=${soil.applicationHeight.toFixed(2)} m dari dasar; Pa aktif pembanding=${soil.activeForce.toFixed(2)} kN/m`,
          "Model basemen terkekang memakai K0, tanah kering homogen γ=18 kN/m³, timbunan datar, tanpa surcharge/air. Jaky untuk tanah terkonsolidasi normal; tanah overconsolidated memerlukan K0 lain. Ka Rankine hanya pembanding dinding yang dapat bergerak dengan asumsi yang sesuai. Air dan surcharge harus ditambahkan bila ada; kapasitas dinding belum diperiksa.");
      }
      case "water_uplift": {
        const uplift = upliftStability(params);
        return checked(Number.isFinite(uplift.sf) ? uplift.sf.toFixed(3) : "∞", `U=${uplift.uplift.toFixed(2)} kN; SF target=${uplift.targetSF.toFixed(2)}; luas=${input(params, "baseArea", 300)} m²`, uplift.ratio,
          "Head diukur dari dasar ke muka air rencana, tekanan hidrostatik seragam. Pemeriksaan konservatif berat mati minimum≥1,5U mengacu SNI 8460:2017 9.3.3(b)/9.3.4(a); 9.3.4(b) juga mensyaratkan berat mati minimum tanpa angkur≥1,1U. Contoh tidak memasukkan angkur; bila angkur digunakan kedua kondisi diperiksa. Pelat dasar/tiang tarik dan fase konstruksi perlu diperiksa terpisah.", `Rasio ${uplift.targetSF.toFixed(2)} U / berat mati minimum`);
      }
      default: return null;
    }
  } catch (error) {
    return { value: "—", secondary: error instanceof Error ? error.message : "Masukan tidak valid.", status: "Masukan tidak valid", dcr: null, failureMode: null, metricLabel: "Perhitungan tidak tersedia", notes: "Periksa satuan dan batas setiap masukan. Beberapa parameter boleh bernilai nol; ikuti rentang yang ditampilkan pada kontrol." };
  }
}
