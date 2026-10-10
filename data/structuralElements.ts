export interface CivilVariable {
  symbol: string;
  meaning: string;
  unit: string;
}

export interface CivilFormula {
  title: string;
  expression: string;
  description: string;
  variables: CivilVariable[];
  clauseReference: string;
}

export interface CivilCalculationStep {
  stepNumber: number;
  label: string;
  formula: string;
  substitution: string;
  result: string;
  note?: string;
}

export interface CivilWorkedExample {
  title: string;
  problemStatement: string;
  givenParameters: Record<string, string>;
  steps: CivilCalculationStep[];
  conclusion: string;
  safetyCheck: {
    demand: string;
    capacity: string;
    ratio: string;
    status: "AMAN (OK)" | "PERLU PERKUATAN" | "BELUM DIEVALUASI" | "MEMENUHI PEMERIKSAAN CONTOH" | "TIDAK MEMENUHI PEMERIKSAAN CONTOH";
  };
}

export interface CalculatorParamConfig {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description?: string;
}

export interface CivilCalculatorConfig {
  type: string;
  title: string;
  description: string;
  params: CalculatorParamConfig[];
  resultLabel: string;
  resultUnit: string;
}

export interface CivilElementData {
  id: string;
  meshName: string;
  name: string;
  technicalTerm: string;
  category: "superstructure" | "substructure" | "load_vector";
  subcategory: "structural_member" | "static_load" | "dynamic_load";
  structuralRole: string;
  loadPathSequence: number;
  connectedElements: string[];
  evaluationParameters: {
    dimensions: string;
    materialGrade: string;
    geometrySystem: string;
  };
  details: {
    mechanism: string;
    criticalRisk: string;
    standardReference: string;
  };
  governingFormulas?: CivilFormula[];
  workedExample?: CivilWorkedExample;
  calculator?: CivilCalculatorConfig;
}

export const structuralElements: CivilElementData[] = [
  {
    "id": "elem-balok",
    "meshName": "Mesh_Balok",
    "name": "Balok (Beam)",
    "technicalTerm": "Flexural Structural Member",
    "category": "superstructure",
    "subcategory": "structural_member",
    "structuralRole": "Menerima beban gravitasi dari pelat lantai dan menyalurkannya sebagai beban lentur dan geser ke kolom.",
    "loadPathSequence": 2,
    "connectedElements": [
      "elem-kolom"
    ],
    "evaluationParameters": {
      "dimensions": "Balok Induk 300 mm x 600 mm, Bentang Bersih Ln = 6.0 m",
      "materialGrade": "f'c 30 MPa, Baja Tulangan Longitudinal Fy 420 MPa, Sengkang Fyt 280 MPa",
      "geometrySystem": "Sistem Rangka Pemikul Momen Khusus (SRPMK)"
    },
    "details": {
      "mechanism": "Menahan kombinasi momen lentur negatif (tarik atas di tumpuan), momen positif (tarik bawah di lapangan), serta gaya geser kritis di sekeliling muka kolom.",
      "criticalRisk": "Keruntuhan getas geser diagonal mendadak sebelum tulangan leleh dan retak lentur berlebih melebihi batas lendutan izin.",
      "standardReference": "SNI 2847:2019 Pasal 9 (Balok) & Pasal 18.6 (Balok SRPMK)"
    },
    "governingFormulas": [
      {
        "title": "Kapasitas Momen Lentur Nominal (Mn)",
        "expression": "Mn = As · fy · (d - a / 2) / 10⁶",
        "description": "Kapasitas lentur balok persegi bertulang tunggal dengan baja tarik telah leleh. Gunakan mm, mm² dan MPa; pembagian 10⁶ mengubah N·mm menjadi kN·m. Regangan menentukan faktor φ.",
        "variables": [
          {
            "symbol": "Mn",
            "meaning": "Kapasitas momen lentur nominal balok",
            "unit": "kNm"
          },
          {
            "symbol": "As",
            "meaning": "Luas total penampang tulangan baja tarik",
            "unit": "mm²"
          },
          {
            "symbol": "fy",
            "meaning": "Kuat leleh baja tulangan longitudinal",
            "unit": "MPa"
          },
          {
            "symbol": "d",
            "meaning": "Tinggi efektif penampang balok (h - selimut - d_sengkang - d_b/2)",
            "unit": "mm"
          },
          {
            "symbol": "a",
            "meaning": "Tinggi blok tegangan tekan beton (a = As·fy / (0.85·f'c·b))",
            "unit": "mm"
          }
        ],
        "clauseReference": "SNI 2847:2019 Pasal 22.2"
      },
      {
        "title": "Kuat Geser Beton & Tulangan Geser (Vn)",
        "expression": "Vn = [0.17·λ·√(f'c)·bw·d + Av·fyt·d/s] / 1000",
        "description": "Kontribusi beton dan sengkang untuk penampang dengan asumsi yang sesuai ketentuan geser; hasil N dibagi 1000 menjadi kN. Pada SRPMK, syarat desain kapasitas dapat mengharuskan Vc = 0; rumus umum ini bukan pemeriksaan seismik lengkap.",
        "variables": [
          {
            "symbol": "Vc",
            "meaning": "Kuat geser nominal disumbangkan oleh beton",
            "unit": "kN"
          },
          {
            "symbol": "Vs",
            "meaning": "Kuat geser nominal disumbangkan oleh sengkang/begel",
            "unit": "kN"
          },
          {
            "symbol": "bw",
            "meaning": "Lebar badan penampang balok",
            "unit": "mm"
          },
          {
            "symbol": "Av",
            "meaning": "Luas penampang total kaki sengkang dalam satu sengkang",
            "unit": "mm²"
          },
          {
            "symbol": "s",
            "meaning": "Spasi jarak antar sengkang searah longitudinal",
            "unit": "mm"
          },
          {
            "symbol": "λ",
            "meaning": "Faktor modifikasi beton ringan; contoh beton normal λ = 1",
            "unit": "-"
          },
          {
            "symbol": "fyt",
            "meaning": "Kuat leleh tulangan geser",
            "unit": "MPa"
          },
          {
            "symbol": "d",
            "meaning": "Tinggi efektif penampang",
            "unit": "mm"
          }
        ],
        "clauseReference": "SNI 2847:2019 Pasal 22.5"
      },
      {
        "title": "Batas Rasio Tulangan Daktail SRPMK",
        "expression": "ρ_min = max[0.25·√(f'c)/fy, 1.4/fy] ≤ ρ ≤ 0.025",
        "description": "Batas penulangan longitudinal balok SRPMK, memakai f'c dan fy dalam MPa. Pemenuhan rasio saja belum membuktikan penampang terkendali tarik; periksa regangan, penyaluran, geser dan detailing.",
        "variables": [
          {
            "symbol": "ρ",
            "meaning": "Rasio tulangan tarik (As / (bw · d))",
            "unit": "-"
          },
          {
            "symbol": "ρ_min",
            "meaning": "Rasio penulangan minimum pencegah retak getas seketika (SNI 2847:2019 Pasal 9.6.1.2)",
            "unit": "-"
          },
          {
            "symbol": "ρ_max",
            "meaning": "Batas rasio maksimum (0.025) pada balok SRPMK; daktilitas juga memerlukan pemeriksaan regangan, kekangan, penyaluran dan detail penulangan",
            "unit": "-"
          }
        ],
        "clauseReference": "SNI 2847:2019 Pasal 9.6.1.2 & 18.6.3.1"
      }
    ],
    "workedExample": {
      "title": "Pemeriksaan Kapasitas Lentur Balok Induk B1 (300 x 600 mm)",
      "problemStatement": "Evaluasi kapasitas momen rencana φMn balok 300×600 mm, bentang 6 m, tulangan tarik satu lapis 4D22, selimut 40 mm, sengkang D10, beton f'c = 30 MPa dan fy = 420 MPa. Demand Mu = 225 kNm diberikan dari analisis terpisah; bentang saja tidak menentukan Mu.",
      "givenParameters": {
        "Dimensi Balok": "b = 300 mm, h = 600 mm",
        "Tinggi Efektif (d)": "600 - 40 - 10 - 22/2 = 539 mm",
        "Luas Tulangan (As)": "4 D22 = 4 × (π/4 × 22²) = 1520.5 mm²",
        "Mutu Material": "f'c = 30 MPa, fy = 420 MPa, β1 = 0.835714",
        "Beban Momen Rencana (Mu)": "225.0 kNm"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung blok tegangan tekan dan sumbu netral",
          "formula": "a = As·fy/(0.85·f'c·b); c = a/β1",
          "substitution": "As = 4×π×22²/4 = 1520.5308 mm²; a = 1520.5308×420/(0.85×30×300)",
          "result": "a = 83.48 mm; c = 99.89 mm",
          "note": "Perhitungan menyimpan presisi penuh sebelum pembulatan hasil."
        },
        {
          "stepNumber": 2,
          "label": "Periksa regangan baja tarik untuk faktor φ",
          "formula": "εt = 0.003·(d-c)/c",
          "substitution": "εt = 0.003×(539-99.89)/99.89",
          "result": "εt ≈ 0.01319 > 0.005; φ = 0.90",
          "note": "Baja tarik telah leleh dan penampang terkendali tarik; rasio ρ = 0.00940 juga berada antara ρmin = 0.00333 dan 0.025."
        },
        {
          "stepNumber": 3,
          "label": "Hitung momen nominal",
          "formula": "Mn = As·fy·(d-a/2)/10⁶",
          "substitution": "Mn = 1520.5308×420×(539-83.4801/2)/10⁶",
          "result": "Mn = 317.56 kNm"
        },
        {
          "stepNumber": 4,
          "label": "Hitung momen rencana dan perbandingan demand",
          "formula": "φMn = 0.90·Mn; DCR = Mu/φMn",
          "substitution": "φMn = 0.90×317.5616; DCR = 225/285.8054",
          "result": "φMn = 285.81 kNm; DCR = 0.79"
        }
      ],
      "conclusion": "Contoh memenuhi pemeriksaan lentur positif dengan Mu = 225 kNm dan φMn = 285.81 kNm. Hasil ini belum memeriksa geser, lentur negatif, lendutan, joint, penyaluran maupun seluruh detailing SRPMK.",
      "safetyCheck": {
        "demand": "225.00 kNm",
        "capacity": "285.81 kNm",
        "ratio": "0.79",
        "status": "MEMENUHI PEMERIKSAAN CONTOH"
      }
    },
    "calculator": {
      "type": "beam_moment",
      "title": "Kalkulator Kapasitas Lentur Balok (φMn)",
      "description": "Ubah jumlah tulangan tarik D22 dan mutu beton pada balok b=300 mm, h=600 mm. Batang tarik disusun otomatis dalam lapis dengan jarak bersih geometris minimum max(25 mm, diameter batang); d memakai pusat luas seluruh batang tarik. Dua batang atas konstruktif pada ilustrasi tidak dihitung sebagai As tarik. Penyusunan ini belum memeriksa ukuran agregat, penyaluran, maupun seluruh detail SNI.",
      "params": [
        {
          "key": "bars",
          "label": "Jumlah Tulangan Tarik (D22)",
          "unit": "buah",
          "min": 2,
          "max": 8,
          "step": 1,
          "defaultValue": 4
        },
        {
          "key": "fc",
          "label": "Mutu Beton (f'c)",
          "unit": "MPa",
          "min": 20,
          "max": 50,
          "step": 5,
          "defaultValue": 30
        },
        {
          "key": "beamSpan",
          "label": "Bentang Balok (L)",
          "unit": "m",
          "min": 3,
          "max": 10,
          "step": 0.5,
          "defaultValue": 6,
          "description": "Dipakai untuk contoh demand lentur gravitasi, bukan verifikasi portal lengkap."
        }
      ],
      "resultLabel": "Kuat Momen Desain (φMn)",
      "resultUnit": "kNm"
    }
  },
  {
    "id": "elem-kolom",
    "meshName": "Mesh_Kolom",
    "name": "Kolom (Column)",
    "technicalTerm": "Compression Structural Member",
    "category": "superstructure",
    "subcategory": "structural_member",
    "structuralRole": "Penyangga utama beban aksial tekan vertikal dan momen lentur dari seluruh lantai di atasnya.",
    "loadPathSequence": 3,
    "connectedElements": [
      "elem-pondasi",
      "elem-dinding-basement"
    ],
    "evaluationParameters": {
      "dimensions": "Kolom Persegi 600 mm x 600 mm, Tinggi Tingkat Bersih Lu = 3.6 m",
      "materialGrade": "f'c 35 MPa, Baja Tulangan Pokok Fy 420 MPa, Sengkang Pengekang Fy 280 MPa",
      "geometrySystem": "Strong-Column Weak-Beam Philosophy (Kaidah Kolom Kuat - Balok Lemah)"
    },
    "details": {
      "mechanism": "Menahan kombinasi gaya aksial tekan tinggi dan momen dwisumbu (biaxial bending). Pada desain seismik, hierarki kapasitas di sambungan diarahkan agar pelelehan lentur lebih banyak terjadi pada balok. Pemeriksaan ini mengurangi risiko mekanisme tingkat akibat pelelehan kolom, tetapi bukan jaminan urutan sendi plastis pada semua kondisi.",
      "criticalRisk": "Keruntuhan getas aksial (crushing), tekuk tulangan longitudinal (buckling) akibat sengkang terlepas, dan kegagalan sambungan joint lewatan gempa.",
      "standardReference": "SNI 2847:2019 Pasal 10 (Kolom) & Pasal 18.7 (Kolom SRPMK)"
    },
    "governingFormulas": [
      {
        "title": "Kapasitas Aksial Rencana Maksimum (φPn,max)",
        "expression": "φPn,max = 0.80·φ·[0.85·f'c·(Ag-Ast)+fy·Ast]/1000",
        "description": "Batas aksial rencana maksimum kolom bersengkang: Pn,max = 0.80P0 dan φ = 0.65 untuk tekan terkendali. MPa×mm² menghasilkan N, dibagi 1000 menjadi kN. Ini batas atas diagram interaksi, bukan kapasitas pada momen tertentu.",
        "variables": [
          {
            "symbol": "φPn,max",
            "meaning": "Kapasitas beban aksial tekan rencana maksimum",
            "unit": "kN"
          },
          {
            "symbol": "Ag",
            "meaning": "Luas bruto penampang kolom (b × h)",
            "unit": "mm²"
          },
          {
            "symbol": "Ast",
            "meaning": "Luas total baja tulangan longitudinal kolom",
            "unit": "mm²"
          },
          {
            "symbol": "f'c",
            "meaning": "Kuat tekan silinder beton 28 hari",
            "unit": "MPa"
          },
          {
            "symbol": "fy",
            "meaning": "Kuat leleh tulangan longitudinal",
            "unit": "MPa"
          }
        ],
        "clauseReference": "SNI 2847:2019 Pasal 22.4.2"
      },
      {
        "title": "Filosofi Kolom Kuat - Balok Lemah (Strong-Column Weak-Beam)",
        "expression": "∑ Mnc ≥ 1.2 · ∑ Mnb",
        "description": "Pada sambungan yang diwajibkan memenuhi SCWB, jumlah kuat lentur nominal kolom minimum 1,2 kali jumlah kuat lentur nominal balok, dengan gaya aksial kolom yang relevan. Tujuannya mengurangi mekanisme tingkat akibat pelelehan kolom. Ketidakberaturan kekakuan soft-story memerlukan pemeriksaan tersendiri; rasio ini tidak menjamin gedung bebas keruntuhan.",
        "variables": [
          {
            "symbol": "∑ Mnc",
            "meaning": "Jumlah kuat lentur nominal kolom (atas dan bawah joint)",
            "unit": "kNm"
          },
          {
            "symbol": "∑ Mnb",
            "meaning": "Jumlah kuat lentur nominal balok (kiri dan kanan joint)",
            "unit": "kNm"
          }
        ],
        "clauseReference": "SNI 2847:2019 Pasal 18.7.3.2"
      },
      {
        "title": "Beban Tekuk Kritis Euler (Pcr)",
        "expression": "Pcr = (π² · EI) / (k · Lu)²",
        "description": "Menghitung batas stabilitas elastis kolom panjang terhadap fenomena tekuk lateral (buckling).",
        "variables": [
          {
            "symbol": "Pcr",
            "meaning": "Beban tekuk kritis Euler",
            "unit": "kN"
          },
          {
            "symbol": "EI",
            "meaning": "Kekakuan lentur efektif kolom beton bertulang terretak",
            "unit": "kNm²"
          },
          {
            "symbol": "k",
            "meaning": "Faktor panjang efektif tumpuan kolom",
            "unit": "-"
          },
          {
            "symbol": "Lu",
            "meaning": "Panjang kolom tanpa sokongan lateral",
            "unit": "m"
          }
        ],
        "clauseReference": "SNI 2847:2019 Pasal 6.6.4.4"
      }
    ],
    "workedExample": {
      "title": "Pemeriksaan Kapasitas Tekan Aksial Kolom K1 (600 x 600 mm)",
      "problemStatement": "Hitung kapasitas aksial tekan desain maksimum (φPn,max) untuk kolom interior lantai 1 ukuran 600x600 mm dengan tulangan 12 D25, f'c = 35 MPa, fy = 420 MPa, dan periksa terhadap beban terfaktor Pu = 4850 kN.",
      "givenParameters": {
        "Dimensi Kolom": "b = 600 mm, h = 600 mm, Ag = 360,000 mm²",
        "Tulangan Pokok": "12 D25, Ast = 12 × (π/4 × 25²) = 5890.5 mm²",
        "Rasio Tulangan (ρg)": "5890.5 / 360,000 = 1.64% (Kolom SRPMK: 1%–6%)",
        "Mutu Bahan": "f'c = 35 MPa, fy = 420 MPa",
        "Beban Aksial Terfaktor (Pu)": "4850.0 kN"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung luas beton neto (Ac = Ag - Ast)",
          "formula": "Ac = Ag - Ast",
          "substitution": "Ac = 360,000 - 5890.5",
          "result": "Ac = 354,109.5 mm²"
        },
        {
          "stepNumber": 2,
          "label": "Hitung kapasitas aksial konsentris nominal murni (P0)",
          "formula": "P0 = [0.85·f'c·(Ag-Ast)+fy·Ast]/1000",
          "substitution": "P0 = [0.85×35×354109.5138 + 420×5890.4862]/1000",
          "result": "P0 = 10534.7580 + 2474.0042 = 13008.7622 kN"
        },
        {
          "stepNumber": 3,
          "label": "Terapkan batas kapasitas aksial maksimum kolom bersengkang",
          "formula": "Pn,max = 0.80 · P0",
          "substitution": "Pn,max = 0.80×13008.7622 kN",
          "result": "Pn,max = 10,407.01 kN"
        },
        {
          "stepNumber": 4,
          "label": "Terapkan faktor reduksi kekuatan tekan terkendali tekan (φ = 0.65)",
          "formula": "φPn,max = 0.65 · Pn,max",
          "substitution": "φPn,max = 0.65 × 10407.0097996 kN",
          "result": "φPn,max = 6,764.56 kN"
        }
      ],
      "conclusion": "Pu = 4850 kN berada di bawah batas atas φPn,max = 6764.56 kN (rasio 0.72), dan ρg = 1.64% memenuhi rentang 1%–6% untuk kolom SRPMK. Kapasitas pada kombinasi aksial–momen dwisumbu, kelangsingan, geser dan detailing belum diperiksa.",
      "safetyCheck": {
        "demand": "4850.00 kN",
        "capacity": "6764.56 kN",
        "ratio": "0.72",
        "status": "MEMENUHI PEMERIKSAAN CONTOH"
      }
    },
    "calculator": {
      "type": "column_axial",
      "title": "Kalkulator Beban Aksial Kolom (φPn,max)",
      "description": "Hitung kekuatan batas aksial desain kolom 600x600 mm dengan variasi jumlah tulangan D25 dan mutu beton.",
      "params": [
        {
          "key": "columnRebarCount",
          "label": "Jumlah Tulangan D25",
          "unit": "batang",
          "min": 8,
          "max": 16,
          "step": 2,
          "defaultValue": 12
        },
        {
          "key": "fc",
          "label": "Mutu Beton f'c",
          "unit": "MPa",
          "min": 25,
          "max": 55,
          "step": 5,
          "defaultValue": 35
        },
        {
          "key": "columnPu",
          "label": "Beban Aksial Terfaktor (Pu)",
          "unit": "kN",
          "min": 1000,
          "max": 10000,
          "step": 250,
          "defaultValue": 4850
        }
      ],
      "resultLabel": "Kapasitas Aksial Rencana (φPn,max)",
      "resultUnit": "kN"
    }
  },
  {
    "id": "elem-dinding-geser",
    "meshName": "Mesh_DindingGeser",
    "name": "Dinding Geser (Shear Wall)",
    "technicalTerm": "Structural Shear Wall / Core Wall",
    "category": "superstructure",
    "subcategory": "structural_member",
    "structuralRole": "Elemen pengaku lateral vertikal dengan kekakuan tinggi terhadap deformasi gempa dan angin.",
    "loadPathSequence": 2,
    "connectedElements": [
      "elem-pondasi"
    ],
    "evaluationParameters": {
      "dimensions": "Tebal tw = 300 mm, Panjang lw = 4000 mm, Tinggi Total Dinding hw = 16.0 m",
      "materialGrade": "Beton bertulang mutu tinggi f'c 35 MPa, Pembesian 2 Tirai Fy 420 MPa",
      "geometrySystem": "Sistem Ganda (Dual System) / Dinding Struktur Khusus Cantilever"
    },
    "details": {
      "mechanism": "Membatasi simpangan antar-lantai (inter-story drift) akibat gaya horisontal gempa melalui kekakuan lentur dan gesernya yang masif, menyalurkan geser dasar langsung ke pondasi rakit/tiang.",
      "criticalRisk": "Crushing beton pada tepi luar akibat kompresi batas lentur tinggi, retak geser diagonal menerus, dan slip sambungan konstruksi (sliding shear).",
      "standardReference": "SNI 2847:2019 Pasal 18.10 (Dinding Struktur Khusus) & SNI 1726:2019"
    },
    "governingFormulas": [
      {
        "title": "Kuat Geser Nominal Dinding Geser (Vn)",
        "expression": "Vn = min{Acv·[αc·λ·√(f'c)+ρt·fy], 0.83·Acv·√(f'c)}/1000",
        "description": "Untuk satu penampang dinding: αc = 0.25 bila hw/lw ≤ 1.5; αc = 0.17 bila ≥ 2; interpolasi linier di antaranya. Acv dalam mm² dan f'c, fy dalam MPa; bagi 1000 menjadi kN. Batas total beberapa segmen dinding dan faktor φ seismik perlu diperiksa terpisah.",
        "variables": [
          {
            "symbol": "Vn",
            "meaning": "Kuat geser nominal penampang dinding struktur (kN)",
            "unit": "kN"
          },
          {
            "symbol": "Acv",
            "meaning": "Luas penampang bruto geser beton (tw · lw)",
            "unit": "mm²"
          },
          {
            "symbol": "αc",
            "meaning": "Koefisien rasio kelangsingan dinding geser",
            "unit": "-"
          },
          {
            "symbol": "ρt",
            "meaning": "Rasio tulangan transversal horizontal (Av / (s · tw))",
            "unit": "-"
          },
          {
            "symbol": "f'c",
            "meaning": "Kuat tekan beton",
            "unit": "MPa"
          }
        ],
        "clauseReference": "SNI 2847:2019 Pasal 18.10.4.1 & 18.10.4.4"
      },
      {
        "title": "Pemeriksaan Kebutuhan Boundary Element (Elemen Pembatas Ujung)",
        "expression": "σmax = 1000·Pu/Ag + 10⁶·Mu·y/Ig > 0.20·f'c",
        "description": "Salah satu jalur pemeriksaan kebutuhan elemen pembatas khusus melalui tegangan elastis pada penampang bruto: Pu dalam kN, Mu dalam kNm, y dalam mm, Ag dalam mm² dan Ig dalam mm⁴ menghasilkan MPa. Jalur berbasis perpindahan serta kondisi penerapannya juga harus ditinjau.",
        "variables": [
          {
            "symbol": "σ_max",
            "meaning": "Tegangan tekan maksimum serat beton terluar",
            "unit": "MPa"
          },
          {
            "symbol": "Pu",
            "meaning": "Gaya aksial terfaktor yang bekerja pada dinding",
            "unit": "kN"
          },
          {
            "symbol": "Mu",
            "meaning": "Momen guling lentur terfaktor pada dasar dinding",
            "unit": "kNm"
          },
          {
            "symbol": "Ig",
            "meaning": "Momen inersia penampang bruto dinding (tw · lw³ / 12)",
            "unit": "mm⁴"
          },
          {
            "symbol": "Ag",
            "meaning": "Luas penampang bruto dinding",
            "unit": "mm²"
          },
          {
            "symbol": "y",
            "meaning": "Jarak serat terluar dari pusat penampang",
            "unit": "mm"
          }
        ],
        "clauseReference": "SNI 2847:2019 Pasal 18.10.6.3"
      }
    ],
    "workedExample": {
      "title": "Analisis Kuat Geser Rencana Dinding Geser Khusus (300 x 4000 mm)",
      "problemStatement": "Evaluasi kuat geser rencana (φVn) shear wall tebal 300 mm, panjang 4000 mm, tinggi 16 m dengan pembesian horizontal 2 lapis D13 jarak 150 mm (f'c = 35 MPa, fy = 420 MPa), terhadap gaya geser dasar rencana Vu = 2250 kN.",
      "givenParameters": {
        "Geometri Dinding": "tw = 300 mm, lw = 4000 mm, hw = 16000 mm",
        "Rasio Aspek (hw / lw)": "16000 / 4000 = 4.0 ≥ 2.0 → nilai αc = 0.17",
        "Luas Geser (Acv)": "300 × 4000 = 1,200,000 mm²",
        "Tulangan Horizontal": "2 lapis D13-150, Av = 2×π×13²/4 = 265.4646 mm²",
        "Rasio Tulangan (ρt)": "265.4646/(300×150) = 0.00589921 ≥ 0.0025",
        "Gaya Geser Rencana (Vu)": "2250.0 kN",
        "Faktor Reduksi (φ)": "0.60 konservatif untuk contoh seismik; perbandingan dengan geser saat kapasitas lentur nominal belum tersedia"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung kontribusi beton",
          "formula": "Vc = Acv·αc·λ·√(f'c)/1000",
          "substitution": "Vc = 1200000×0.17×1×√35/1000",
          "result": "Vc = 1206.88 kN"
        },
        {
          "stepNumber": 2,
          "label": "Hitung kontribusi tulangan horizontal",
          "formula": "Vs = Acv·ρt·fy/1000",
          "substitution": "Vs = 1200000×0.00589921×420/1000",
          "result": "Vs = 2973.20 kN"
        },
        {
          "stepNumber": 3,
          "label": "Hitung nominal dan batas penampang dinding",
          "formula": "Vn = min(Vc+Vs, 0.83·Acv·√(f'c)/1000)",
          "substitution": "Vn = min(4180.0836, 5892.4155)",
          "result": "Vn = 4180.08 kN",
          "note": "Batas ini untuk satu penampang dinding; kapasitas sistem beberapa segmen diperiksa tersendiri."
        },
        {
          "stepNumber": 4,
          "label": "Gunakan faktor reduksi seismik konservatif",
          "formula": "φVn = 0.60·Vn; DCR = Vu/φVn",
          "substitution": "φVn = 0.60×4180.0836; DCR = 2250/2508.0501",
          "result": "φVn = 2508.05 kN; DCR = 0.90",
          "note": "φ = 0.75 tidak otomatis berlaku; pemilihan bergantung pemeriksaan kekuatan lentur dan geser seismik sesuai ketentuan faktor reduksi."
        }
      ],
      "conclusion": "Contoh memenuhi perbandingan geser Vu = 2250 kN terhadap φVn = 2508.05 kN (rasio 0.90), dengan φ = 0.60 konservatif. Kapasitas lentur–aksial, elemen pembatas, geser sambungan, drift serta detailing sistem belum dievaluasi.",
      "safetyCheck": {
        "demand": "2250.00 kN",
        "capacity": "2508.05 kN",
        "ratio": "0.90",
        "status": "MEMENUHI PEMERIKSAAN CONTOH"
      }
    },
    "calculator": {
      "type": "shear_wall",
      "title": "Kalkulator Kapasitas Geser Dinding (φVn)",
      "description": "Kapasitas geser penampang tunggal dengan αc sesuai aspek dinding, batas Vn, dan φ = 0.60 konservatif untuk contoh seismik.",
      "params": [
        {
          "key": "spacing",
          "label": "Spasi Tulangan D13 2 Lapis",
          "unit": "mm",
          "min": 100,
          "max": 250,
          "step": 25,
          "defaultValue": 150
        },
        {
          "key": "fc",
          "label": "Mutu Beton f'c",
          "unit": "MPa",
          "min": 25,
          "max": 50,
          "step": 5,
          "defaultValue": 35
        },
        {
          "key": "shearDemand",
          "label": "Gaya Geser Terfaktor (Vu)",
          "unit": "kN",
          "min": 500,
          "max": 5000,
          "step": 250,
          "defaultValue": 2250
        }
      ],
      "resultLabel": "Kuat Geser Rencana (φVn)",
      "resultUnit": "kN"
    }
  },
  {
    "id": "elem-pelat-lantai",
    "meshName": "Mesh_PelatLantai",
    "name": "Pelat Lantai (Slab)",
    "technicalTerm": "Floor Diaphragm",
    "category": "superstructure",
    "subcategory": "structural_member",
    "structuralRole": "Menerima beban gravitasi dan menyalurkan gaya lateral sebagai diafragma; asumsi kaku memerlukan pemeriksaan.",
    "loadPathSequence": 1,
    "connectedElements": [
      "elem-balok",
      "elem-dinding-geser"
    ],
    "evaluationParameters": {
      "dimensions": "Panel Lantai Bentang 4.0 m x 6.0 m, Tebal Pelat h = 140 mm",
      "materialGrade": "Beton Bertulang f'c 25 MPa, Tulangan Wiremesh / Rebar Fy 420 MPa",
      "geometrySystem": "Sistem Pelat Dua Arah Terbantu Balok Tepi (Two-Way Beam-Supported Slab)"
    },
    "details": {
      "mechanism": "Menyalurkan beban gravitasi melalui aksi pelat ke balok penumpu. Distribusi amplop adalah pendekatan statika pembelajaran; klasifikasi diafragma kaku, semi-kaku atau fleksibel harus sesuai geometri, bukaan dan kekakuan bidang.",
      "criticalRisk": "Lendutan jangka panjang berlebih (deflection) akibat rangkak beton, retak lentur lebar, dan keruntuhan geser pons (punching shear) di sekitar perletakan.",
      "standardReference": "SNI 2847:2019 Pasal 7 & 8 (Pelat) & Pasal 18.12 (Diafragma Seismik)"
    },
    "governingFormulas": [
      {
        "title": "Tebal Pelat Minimum Kontrol Lendutan (h_min)",
        "expression": "αfm > 2: hmin = max[ln(0.8+fy/1400)/(36+9β),90 mm]; 0.2 < αfm ≤ 2: hmin = max[ln(0.8+fy/1400)/(36+5β(αfm-0.2)),125 mm]",
        "description": "Pelat dua arah dengan balok pada semua sisi dan kondisi tepi sesuai ketentuan. αfm adalah rata-rata rasio kekakuan lentur balok terhadap jalur pelat. Tentukan dari kekakuan lentur balok dan jalur pelat pada tiap arah panel, lalu ambil rata-ratanya; gunakan dimensi penampang dan modulus elastisitas material yang sesuai. Jika data kekakuan belum tersedia, gunakan nilai asumsi yang dinyatakan jelas, bukan menebaknya dari tebal pelat saja. Jika αfm ≤ 0.2, gunakan ketentuan pelat tanpa balok interior; tepi tak menerus juga memerlukan pemeriksaan tambahan. Ini batas empiris tebal, bukan jaminan seluruh kinerja lendutan.",
        "variables": [
          {
            "symbol": "h_min",
            "meaning": "Tebal minimum pelat lantai untuk kontrol defleksi",
            "unit": "mm"
          },
          {
            "symbol": "ln",
            "meaning": "Panjang bentang bersih dalam arah panjang",
            "unit": "mm"
          },
          {
            "symbol": "β",
            "meaning": "Rasio bentang bersih panjang terhadap bentang bersih pendek (ln_long / ln_short)",
            "unit": "-"
          },
          {
            "symbol": "fy",
            "meaning": "Kuat leleh tulangan baja",
            "unit": "MPa"
          },
          {
            "symbol": "αfm",
            "meaning": "Rata-rata rasio kekakuan lentur balok terhadap jalur pelat pada tepi panel",
            "unit": "-"
          }
        ],
        "clauseReference": "SNI 2847:2019 ketentuan pelat dua arah dengan balok; prinsip sepadan ACI 318M-14 8.3.1.2"
      },
      {
        "title": "Beban Terfaktor Gravitasi Permukaan (qu)",
        "expression": "qu = max(1.4qD, 1.2qD+1.6qL)",
        "description": "Kombinasi dasar kekuatan batas untuk memadukan beban mati struktur dan finishing (qD) dengan beban hidup terdistribusi merata (qL).",
        "variables": [
          {
            "symbol": "qu",
            "meaning": "Kombinasi beban terfaktor batas per satuan luas",
            "unit": "kN/m²"
          },
          {
            "symbol": "qD",
            "meaning": "Beban mati total (berat sendiri pelat + beban mati tambahan/finishing)",
            "unit": "kN/m²"
          },
          {
            "symbol": "qL",
            "meaning": "Beban hidup rencana fungsi hunian/kantor",
            "unit": "kN/m²"
          }
        ],
        "clauseReference": "SNI 1727:2020 Pasal 2.3 & SNI 2847:2019 Pasal 5.3"
      }
    ],
    "workedExample": {
      "title": "Verifikasi Tebal Minimum dan Beban Desain Pelat Lantai Dua Arah",
      "problemStatement": "Periksa tebal 140 mm untuk panel interior dengan balok pada semua sisi, bentang sumbu 4×6 m, bentang bersih 3.7×5.7 m, αfm = 2.1 > 2, fy = 420 MPa; hitung beban gravitasi kantor. Ini pemeriksaan tebal empiris dan beban, bukan desain tulangan.",
      "givenParameters": {
        "Dimensi Panel": "Bentang sumbu 4.0 m × 6.0 m",
        "Bentang Bersih (ln)": "Arah panjang ln = 6.0 - 0.3 = 5.7 m = 5700 mm; Arah pendek = 3.7 m",
        "Rasio Bentang (β)": "5.7/3.7 = 1.54054054",
        "Beban Mati (qD)": "Pelat 140 mm (0.14 × 24 = 3.36 kN/m²) + Finishing (1.50 kN/m²) = 4.86 kN/m²",
        "Beban Hidup (qL)": "Minimum fungsi ruang kantor = 2.40 kN/m²",
        "Kekakuan Balok–Pelat": "αfm = 2.1 (asumsi diberikan); panel interior tanpa tepi tak menerus"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung batas empiris tebal untuk αfm > 2",
          "formula": "hmin = max[ln(0.8+fy/1400)/(36+9β),90]",
          "substitution": "hmin = max[5700×1.1/(36+9×5700/3700),90]",
          "result": "hmin = 125.74 mm < 140 mm",
          "note": "Memenuhi cabang tebal ini; tulangan, geser, retak dan lendutan dengan kondisi lain belum diperiksa."
        },
        {
          "stepNumber": 2,
          "label": "Hitung amplop beban gravitasi terfaktor",
          "formula": "qu = max(1.4qD,1.2qD+1.6qL)",
          "substitution": "qu = max(1.4×4.86,1.2×4.86+1.6×2.4) = max(6.804,9.672)",
          "result": "qu = 9.672 kN/m²"
        },
        {
          "stepNumber": 3,
          "label": "Hitung beban panel berdasarkan luas sumbu",
          "formula": "Wpanel = qu·lx·ly",
          "substitution": "Wpanel = 9.672×4×6",
          "result": "Wpanel = 232.128 kN"
        }
      ],
      "conclusion": "Tebal 140 mm memenuhi batas empiris 125.74 mm untuk asumsi αfm > 2 dan panel interior. Beban terfaktor qu = 9.672 kN/m², total panel 232.128 kN. Hasil belum membuktikan kapasitas lentur/geser maupun kinerja lengkap pelat.",
      "safetyCheck": {
        "demand": "125.74 mm (hmin)",
        "capacity": "140.00 mm (h_ada)",
        "ratio": "0.90",
        "status": "MEMENUHI PEMERIKSAAN CONTOH"
      }
    },
    "calculator": {
      "type": "slab_thickness",
      "title": "Kalkulator Tebal Minimum Pelat (h_min)",
      "description": "Batas empiris tebal pelat dua arah dengan balok; pilih αfm untuk cabang rumus yang sesuai. Cabang αfm ≤ 0.2 memerlukan ketentuan lain.",
      "params": [
        {
          "key": "span",
          "label": "Bentang Bersih Terpanjang (ln)",
          "unit": "m",
          "min": 3,
          "max": 8,
          "step": 0.5,
          "defaultValue": 5.7
        },
        {
          "key": "ratio",
          "label": "Rasio Bentang (β = ly/lx)",
          "unit": "-",
          "min": 1,
          "max": 2,
          "step": 0.1,
          "defaultValue": 1.5405405405405406
        },
        {
          "key": "alphaFm",
          "label": "Rasio Kekakuan Rata-rata (αfm)",
          "unit": "-",
          "min": 0,
          "max": 5,
          "step": 0.1,
          "defaultValue": 2.1
        }
      ],
      "resultLabel": "Tebal Minimum Pelat (h_min)",
      "resultUnit": "mm"
    }
  },
  {
    "id": "elem-dinding-basement",
    "meshName": "Mesh_DindingBasement",
    "name": "Dinding Basement (Retaining Wall)",
    "technicalTerm": "Earth Retaining Substructure Wall",
    "category": "substructure",
    "subcategory": "structural_member",
    "structuralRole": "Menahan tekanan tanah lateral kondisi diam pada basement terkekang serta tekanan hidrostatis air tanah.",
    "loadPathSequence": 4,
    "connectedElements": [
      "elem-pondasi"
    ],
    "evaluationParameters": {
      "dimensions": "Tebal Dinding tb = 350 mm, Kedalaman Galian Basement H = 4.0 m",
      "materialGrade": "Beton f'c 30 MPa; mutu kedap air dan durabilitas ditentukan oleh kelas paparan dan rancangan campuran",
      "geometrySystem": "Dinding Penahan Tanah Tertahan Kaku Pelat Lantai (Propped Retaining Wall)"
    },
    "details": {
      "mechanism": "Bekerja sebagai pelat vertikal satu arah yang tertumpu pada pelat lantai dasar atas dan pelat pondasi rakit bawah, memikul kombinasi tegangan lateral tanah efektif dan tekanan hidrostatis air pori.",
      "criticalRisk": "Kebocoran rembesan air tanah melalui cold joint/retak susut beton, deformasi geser lateral tanah, dan korosi tulangan akibat penetrasi air sulfat/klorida.",
      "standardReference": "SNI 8460:2017 Pasal 11.4.1–11.4.2 (Tekanan Tanah Lateral)"
    },
    "governingFormulas": [
      {
        "title": "Koefisien Tekanan Tanah Diam / At-Rest (K0)",
        "expression": "K0 = 1 - sin(ϕ')",
        "description": "Pendekatan Jaky untuk tanah normally consolidated; dipakai bila dinding terkekang tidak bergerak cukup untuk mengembangkan kondisi aktif. Tanah overconsolidated, pemadatan dan sejarah tegangan dapat memerlukan K0 berbeda.",
        "variables": [
          {
            "symbol": "K0",
            "meaning": "Koefisien tekanan tanah dalam kondisi diam (at-rest)",
            "unit": "-"
          },
          {
            "symbol": "ϕ'",
            "meaning": "Sudut geser dalam efektif tanah timbunan",
            "unit": "derajat"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
      },
      {
        "title": "Distribusi Tegangan Lateral Total pada Kedalaman z",
        "expression": "σh(z) = K0·[q + γ·min(z,zw) + (γsat-γw)·max(0,z-zw)] + γw·max(0,z-zw)",
        "description": "Tanah homogen di atas dan di bawah muka air dengan z, zw ≥ 0. Tegangan efektif mencakup lapisan di atas air, dan tekanan air hanya muncul di bawah muka air. Berat volume γ dipakai di atas muka air, γsat di bawahnya.",
        "variables": [
          {
            "symbol": "σh",
            "meaning": "Tegangan lateral total horisontal",
            "unit": "kPa"
          },
          {
            "symbol": "q",
            "meaning": "Beban surcharge merata di atas permukaan tanah (kendaraan/beban kerja)",
            "unit": "kPa"
          },
          {
            "symbol": "γ",
            "meaning": "Berat volume tanah basah di atas muka air tanah",
            "unit": "kN/m³"
          },
          {
            "symbol": "γ'",
            "meaning": "Berat volume efektif/apung tanah di bawah MAT (γsat - γw)",
            "unit": "kN/m³"
          },
          {
            "symbol": "γw",
            "meaning": "Berat volume air tanah (9.81 kN/m³)",
            "unit": "kN/m³"
          },
          {
            "symbol": "zw",
            "meaning": "Kedalaman muka air tanah rencana dari permukaan",
            "unit": "m"
          },
          {
            "symbol": "γ, γsat",
            "meaning": "Berat volume tanah di atas muka air dan berat volume jenuh di bawah muka air",
            "unit": "kN/m³"
          },
          {
            "symbol": "z",
            "meaning": "Kedalaman titik dari permukaan tanah",
            "unit": "m"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
      }
    ],
    "workedExample": {
      "title": "Kalkulasi Tekanan Lateral Total pada Dinding Basement H = 4.0 m",
      "problemStatement": "Hitung tekanan lateral total pada dasar dinding basement sedalam 4 m dengan beban surcharge lalu lintas q = 10 kPa, sudut geser tanah ϕ' = 30°, berat volume tanah basah γ = 18 kN/m³, berat volume jenuh γsat = 20 kN/m³, dan muka air tanah di kedalaman 2.0 m.",
      "givenParameters": {
        "Geometri Dinding": "Tinggi H = 4.0 m, Tebal tb = 350 mm",
        "Parameter Tanah": "ϕ' = 30°, γ = 18 kN/m³ (z = 0 s/d 2 m), γsat = 20 kN/m³ (z = 2 s/d 4 m)",
        "Kondisi Air Tanah": "Muka air tanah di zw = 2.0 m → γ' = 20 - 9.81 = 10.19 kN/m³",
        "Surcharge Jalan (q)": "10.0 kPa merata di permukaan"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung koefisien tekanan tanah diam (K0)",
          "formula": "K0 = 1 - sin(ϕ')",
          "substitution": "K0 = 1 - sin(30°) = 1 - 0.50",
          "result": "K0 = 0.50"
        },
        {
          "stepNumber": 2,
          "label": "Hitung tegangan vertikal efektif pada dasar dinding (z = 4.0 m)",
          "formula": "σ'v = q + (γ · zw) + (γ' · (H - zw))",
          "substitution": "σ'v = 10 + (18 × 2.0) + (10.19 × (4.0 - 2.0)) = 10 + 36 + 20.38",
          "result": "σ'v = 66.38 kPa"
        },
        {
          "stepNumber": 3,
          "label": "Hitung tegangan lateral efektif tanah (σ'h)",
          "formula": "σ'h = K0 · σ'v",
          "substitution": "σ'h = 0.50 × 66.38",
          "result": "σ'h = 33.19 kPa"
        },
        {
          "stepNumber": 4,
          "label": "Hitung tekanan pori hidrostatis air tanah (u) dan tekanan lateral total (σh)",
          "formula": "u = γw · (H - zw) ; σh = σ'h + u",
          "substitution": "u = 9.81 × (4.0 - 2.0) = 19.62 kPa ; σh = 33.19 + 19.62",
          "result": "σh = 52.81 kPa"
        }
      ],
      "conclusion": "Tekanan lateral total dasar = 52.81 kPa; 19.62 kPa berasal dari air. Ini hasil pembebanan, belum kapasitas dinding. Analisis tumpuan, lentur, geser, retak, detailing dan kedap air harus dilakukan untuk menentukan kecukupan dinding.",
      "safetyCheck": {
        "demand": "52.81 kPa (Tekanan Desain)",
        "capacity": "Belum dihitung",
        "ratio": "—",
        "status": "BELUM DIEVALUASI"
      }
    },
    "calculator": {
      "type": "retaining_wall",
      "title": "Kalkulator Tekanan Lateral Basement",
      "description": "Hitung intensitas tekanan lateral dasar dinding basement berdasarkan kedalaman galian dan kedalaman muka air tanah.",
      "params": [
        {
          "key": "height",
          "label": "Tinggi Dinding Basement (H)",
          "unit": "m",
          "min": 3,
          "max": 7,
          "step": 0.5,
          "defaultValue": 4
        },
        {
          "key": "waterDepth",
          "label": "Kedalaman Muka Air (zw)",
          "unit": "m",
          "min": 0.5,
          "max": 5,
          "step": 0.5,
          "defaultValue": 2
        }
      ],
      "resultLabel": "Tekanan Total Lateral Dasar (σh)",
      "resultUnit": "kPa"
    }
  },
  {
    "id": "elem-pondasi",
    "meshName": "Mesh_Pondasi",
    "name": "Pondasi (Foundation)",
    "technicalTerm": "Deep / Shallow Foundation System",
    "category": "substructure",
    "subcategory": "structural_member",
    "structuralRole": "Elemen penerima akhir seluruh beban struktur atas untuk disalurkan secara aman ke lapisan tanah keras.",
    "loadPathSequence": 5,
    "connectedElements": [],
    "evaluationParameters": {
      "dimensions": "Pile Cap Tebal 1200 mm, 4 Titik Tiang Spun Pile Ø500 mm Panjang 18 m",
      "materialGrade": "Beton Mutu Tinggi f'c 35 MPa Tahan Sulfat, Baja Tulangan Fy 420 MPa",
      "geometrySystem": "Pondasi Tiang Pancang Kelompok (Piled Footing Foundation)"
    },
    "details": {
      "mechanism": "Menahan kombinasi gaya aksial gravitasi tekan, momen guling lateral akibat gempa/angin, serta gaya angkat apung hidrostatik (uplift) melalui tahanan ujung tiang (end bearing) dan gesekan selimut tanah (skin friction).",
      "criticalRisk": "Penurunan diferensial tidak seragam (differential settlement), keruntuhan geser pons pada pile cap, dan kegagalan daya dukung batas tanah.",
      "standardReference": "SNI 8460:2017 Bab 9 (Pondasi Dangkal & Dalam) & SNI 2847:2019"
    },
    "governingFormulas": [
      {
        "title": "Beban Aksial Tiang Maksimum pada Kelompok Tiang (P_pile,max)",
        "expression": "P_pile = (Pv / n) ± (My · x / ∑ x²) ± (Mx · y / ∑ y²)",
        "description": "Distribusi elastis beban aksial tiang dengan pile cap kaku, tiang berkekakuan aksial sama, dan sumbu utama simetris melalui pusat kelompok (∑xy = 0). Untuk pemeriksaan terhadap Qa izin, Pv dan M harus kombinasi beban layan yang konsisten, termasuk berat pile cap bila berlaku.",
        "variables": [
          {
            "symbol": "P_pile",
            "meaning": "Beban aksial yang diterima oleh tiang tertentu",
            "unit": "kN"
          },
          {
            "symbol": "Pv",
            "meaning": "Beban vertikal total kolom yang masuk ke pile cap",
            "unit": "kN"
          },
          {
            "symbol": "n",
            "meaning": "Jumlah total tiang pancang dalam kelompok",
            "unit": "buah"
          },
          {
            "symbol": "Mx, My",
            "meaning": "Momen layan terhadap sumbu utama kelompok; konsisten dengan kapasitas izin",
            "unit": "kNm"
          },
          {
            "symbol": "x, y",
            "meaning": "Koordinat jarak tiang dari titik berat kelompok tiang",
            "unit": "m"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 9.7.1.1 (Kelompok Tiang); distribusi elastis pile cap kaku"
      },
      {
        "title": "Daya Dukung Izin Tiang Tunggal (Qa)",
        "expression": "Qa = (Qp + Qs) / SF = (qp · Ap + ∑ fs · As) / SF",
        "description": "Model kapasitas izin dari tahanan ujung dan selimut. Faktor keamanan, metode evaluasi, uji beban dan efisiensi kelompok ditentukan sesuai kondisi geoteknik; jangan membandingkan Qa izin dengan beban terfaktor kekuatan.",
        "variables": [
          {
            "symbol": "Qa",
            "meaning": "Kapasitas daya dukung izin tiang tunggal",
            "unit": "kN"
          },
          {
            "symbol": "Qp",
            "meaning": "Tahanan ujung nominal tiang (end bearing capacity)",
            "unit": "kN"
          },
          {
            "symbol": "Qs",
            "meaning": "Tahanan gesek selimut nominal tiang (skin friction)",
            "unit": "kN"
          },
          {
            "symbol": "SF",
            "meaning": "Faktor keamanan geoteknik (Safety Factor)",
            "unit": "-"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 9.7.1 (Fondasi Tiang)"
      }
    ],
    "workedExample": {
      "title": "Verifikasi Daya Dukung Kelompok Tiang Pancang 4-Pile Cap",
      "problemStatement": "Pile cap kaku menumpu empat tiang berkekakuan sama pada grid simetris 1.5×1.5 m. Beban layan total Pv = 4000 kN (termasuk berat pile cap yang relevan) dan Mx = 200 kNm. Bandingkan Pmax dengan Qa = 1200 kN yang diberikan dari evaluasi geoteknik terpisah; Qa tidak dihitung pada contoh ini.",
      "givenParameters": {
        "Konfigurasi Tiang": "n = 4 tiang, spasi s = 1.5 m, koordinat y = ± 0.75 m",
        "Statika Momen Inersia Tiang": "∑ y² = 4 × (0.75)² = 4 × 0.5625 = 2.25 m²",
        "Beban Aksial Masuk (Pv)": "4000 kN, beban layan total",
        "Momen Lentur Masuk (Mx)": "200 kNm, momen layan pada kombinasi yang sama",
        "Kapasitas Izin Tiang (Qa)": "1200 kN, data eksternal evaluasi/uji geoteknik untuk kombinasi layan ini"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung komponen beban aksial rata-rata per tiang (Pv / n)",
          "formula": "P_avg = Pv / n",
          "substitution": "P_avg = 4000 / 4",
          "result": "P_avg = 1000.00 kN"
        },
        {
          "stepNumber": 2,
          "label": "Hitung tambahan beban aksial akibat momen guling (ΔP_momen)",
          "formula": "ΔP = (Mx · y_max) / ∑ y²",
          "substitution": "ΔP = (200 × 0.75) / 2.25",
          "result": "ΔP = 150 / 2.25 = 66.67 kN"
        },
        {
          "stepNumber": 3,
          "label": "Hitung beban maksimum tiang terluar (P_max)",
          "formula": "P_max = P_avg + ΔP",
          "substitution": "P_max = 1000.00 + 66.67",
          "result": "P_max = 1066.67 kN"
        }
      ],
      "conclusion": "Pmax = 1066.67 kN ≤ Qa yang diberikan = 1200 kN (rasio 0.89), sehingga contoh memenuhi pemeriksaan aksial satu tiang terberat. Pmin = 933.33 kN. Efisiensi kelompok, penurunan, lateral, tarik, struktur tiang dan pile cap belum dievaluasi.",
      "safetyCheck": {
        "demand": "1066.67 kN",
        "capacity": "1200.00 kN",
        "ratio": "0.89",
        "status": "MEMENUHI PEMERIKSAAN CONTOH"
      }
    },
    "calculator": {
      "type": "pile_capacity",
      "title": "Kalkulator Beban Tiang Maksimum",
      "description": "Distribusi beban layan ke empat tiang simetris dengan pile cap kaku, spasi 1.5 m dan kekakuan tiang sama; bukan perhitungan Qa.",
      "params": [
        {
          "key": "pileServiceLoad",
          "label": "Beban Aksial Layan Total (Pv)",
          "unit": "kN",
          "min": 2000,
          "max": 6000,
          "step": 250,
          "defaultValue": 4000
        },
        {
          "key": "momentM",
          "label": "Momen Layan Kelompok (Mx)",
          "unit": "kNm",
          "min": 0,
          "max": 600,
          "step": 50,
          "defaultValue": 200
        }
      ],
      "resultLabel": "Beban Tiang Terberat (P_max)",
      "resultUnit": "kN"
    }
  },
  {
    "id": "load-gravitasi",
    "meshName": "Vector_Gravitasi",
    "name": "Beban Gravitasi",
    "technicalTerm": "Dead & Live Gravity Loads",
    "category": "load_vector",
    "subcategory": "static_load",
    "structuralRole": "Kombinasi beban mati sendiri struktur (DL) dan beban hidup pengguna/perabot gedung (LL).",
    "loadPathSequence": 0,
    "connectedElements": [
      "elem-pelat-lantai"
    ],
    "evaluationParameters": {
      "dimensions": "Beban Mati Finishing q_SIDL = 1.5 kN/m², Beban Hidup Dasar Kantor L0 = 2.4 kN/m²",
      "materialGrade": "Kombinasi Pembebanan LRFD SNI 1727:2020",
      "geometrySystem": "Distribusi vertikal searah percepatan gravitasi bumi (g = 9.81 m/s²)"
    },
    "details": {
      "mechanism": "Beban gravitasi menekan pelat lantai ke arah bawah secara terus-menerus, memicu momen lentur lapangan pada pelat dan balok, serta gaya aksial tekan kumulatif yang semakin membesar pada kolom lantai bawah.",
      "criticalRisk": "Overloading akibat perubahan fungsi ruang tanpa evaluasi struktur dan akumulasi beban runtuh progresif (progressive collapse).",
      "standardReference": "SNI 1727:2020 Bab 3 (Beban Mati) & Bab 4 (Beban Hidup)"
    },
    "governingFormulas": [
      {
        "title": "Kombinasi Pembebanan Terfaktor Batas (LRFD)",
        "expression": "U1 = 1.4 · D ; U2 = 1.2 · D + 1.6 · L + 0.5 · (Lr atau R)",
        "description": "Persamaan kombinasi pembebanan terfaktor dasar untuk memastikan struktur memiliki margin keamanan yang memadai terhadap variabilitas beban mati dan beban hidup.",
        "variables": [
          {
            "symbol": "D",
            "meaning": "Beban mati nominal (berat sendiri elemen + finishing permanen)",
            "unit": "kN/m²"
          },
          {
            "symbol": "L",
            "meaning": "Beban hidup nominal penghuni dan barang bergerak",
            "unit": "kN/m²"
          },
          {
            "symbol": "Lr",
            "meaning": "Beban hidup atap nominal pekerja dan peralatan",
            "unit": "kN/m²"
          }
        ],
        "clauseReference": "SNI 1727:2020 Pasal 2.3.2 & SNI 2847:2019 Pasal 5.3.1"
      },
      {
        "title": "Reduksi Beban Hidup Kolom (Live Load Reduction)",
        "expression": "L = min{L0, L0·max[0.25+4.57/√(KLL·AT), batas]}",
        "description": "Untuk KLL·AT ≥ 37.16 m² dan penggunaan yang diizinkan: batas = 0.50 untuk satu lantai, 0.40 untuk dua lantai atau lebih. Beban hidup berat, area berkumpul dan fungsi tertentu memiliki pembatasan reduksi tambahan; tanpa kelayakan ini gunakan L0.",
        "variables": [
          {
            "symbol": "L",
            "meaning": "Beban hidup desain tereduksi",
            "unit": "kN/m²"
          },
          {
            "symbol": "L0",
            "meaning": "Beban hidup nominal acuan SNI",
            "unit": "kN/m²"
          },
          {
            "symbol": "K_LL",
            "meaning": "Faktor elemen pemikul beban hidup (kolom interior = 4)",
            "unit": "-"
          },
          {
            "symbol": "AT",
            "meaning": "Luas lantai tributari kumulatif yang dipikul kolom",
            "unit": "m²"
          }
        ],
        "clauseReference": "SNI 1727:2020 Pasal 4.7.1"
      },
      {
        "title": "Beban Orang dan Beban Hidup Desain",
        "expression": "qL,aktual = N·m·9.81/(1000A)+qperabot; Ldesain = max(qL,aktual,L0)",
        "description": "Massa per orang dan beban bergerak adalah asumsi simulasi. Beban minimum kantor L0 = 2.4 kN/m² merupakan minimum desain, bukan kapasitas lantai atau izin jumlah penghuni. Allowance tambahan untuk partisi sesuai SNI 1727:2020 Pasal 4.3.2 belum diperiksa; hasil max(qL,aktual,L0) tidak menyatakan seluruh ketentuan beban partisi terpenuhi. Konversi orang setara tidak menilai beban terpusat, pola kerumunan, evakuasi maupun kekuatan struktur.",
        "variables": [
          {
            "symbol": "N",
            "meaning": "Jumlah orang dalam simulasi",
            "unit": "orang"
          },
          {
            "symbol": "m",
            "meaning": "Massa asumsi per orang; contoh 70 kg",
            "unit": "kg"
          },
          {
            "symbol": "A",
            "meaning": "Luas lantai untuk pendekatan distribusi merata",
            "unit": "m²"
          },
          {
            "symbol": "qperabot",
            "meaning": "Beban bergerak asumsi simulasi; allowance partisi menurut SNI diperiksa tersendiri",
            "unit": "kN/m²"
          },
          {
            "symbol": "L0",
            "meaning": "Beban hidup minimum desain sesuai fungsi ruang",
            "unit": "kN/m²"
          }
        ],
        "clauseReference": "SNI 1727:2020 Tabel 4.3-1 (Beban Hidup Minimum)"
      }
    ],
    "workedExample": {
      "title": "Beban Orang dan Amplop Beban Gravitasi Lantai Kantor",
      "problemStatement": "Lantai kantor 192 m² menerima 300 orang dengan massa asumsi 70 kg/orang dan beban perabot/partisi bergerak asumsi 1.0 kN/m². Gunakan beban hidup minimum kantor 2.4 kN/m² dan beban mati D = 4.86 kN/m². Hitung beban skenario sederhana; allowance partisi yang diwajibkan SNI 1727:2020 Pasal 4.3.2 dan kapasitas struktur belum diperiksa.",
      "givenParameters": {
        "Luas Lantai": "192 m²",
        "Jumlah Orang": "300 orang",
        "Massa Asumsi": "70 kg/orang; g = 9.81 m/s²",
        "Perabot Bergerak": "1.0 kN/m²",
        "Beban Hidup Minimum Kantor": "2.4 kN/m²",
        "Beban Mati D": "4.86 kN/m²"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Konversi massa orang menjadi gaya",
          "formula": "P = N·m·g/1000",
          "substitution": "P = 300×70×9.81/1000",
          "result": "P = 206.01 kN"
        },
        {
          "stepNumber": 2,
          "label": "Hitung intensitas beban aktual",
          "formula": "qL,aktual = P/A+qperabot",
          "substitution": "qL,aktual = 206.01/192+1.0",
          "result": "qL,aktual = 2.07297 kN/m²",
          "note": "Secara aritmetika, 391 orang setara sekitar 2.4 kN/m² bersama perabot ini; angka itu bukan batas aman okupansi."
        },
        {
          "stepNumber": 3,
          "label": "Terapkan beban hidup minimum desain",
          "formula": "Ldesain = max(qL,aktual,L0)",
          "substitution": "Ldesain = max(2.07296875,2.4)",
          "result": "Ldesain = 2.40 kN/m²"
        },
        {
          "stepNumber": 4,
          "label": "Hitung amplop kombinasi gravitasi sederhana",
          "formula": "qu = max(1.4D,1.2D+1.6Ldesain)",
          "substitution": "qu = max(1.4×4.86,1.2×4.86+1.6×2.4)",
          "result": "qu = max(6.804,9.672) = 9.672 kN/m²",
          "note": "Kombinasi lain tetap diperlukan bila ada beban atap, air, angin, gempa atau kondisi relevan."
        }
      ],
      "conclusion": "Pada skenario sederhana ini, Ldesain = 2.4 kN/m² dan qu = 9.672 kN/m². Allowance partisi menurut SNI 1727:2020 Pasal 4.3.2 perlu diperiksa terpisah dan dapat menambah beban desain. Beban minimum standar adalah input desain, bukan kapasitas lantai. Keselamatan struktur maupun kapasitas okupansi belum dievaluasi.",
      "safetyCheck": {
        "demand": "9.672 kN/m² (qu)",
        "capacity": "Belum dihitung",
        "ratio": "—",
        "status": "BELUM DIEVALUASI"
      }
    },
    "calculator": {
      "type": "gravity_reduction",
      "title": "Kalkulator Beban Hidup dan Gravitasi Terfaktor",
      "description": "Hitung skenario beban orang/bergerak merata, minimum kantor dan amplop qu. Massa orang dan perabot/partisi adalah asumsi; allowance partisi SNI 4.3.2 belum diperiksa dan hasil tidak menentukan okupansi aman.",
      "params": [
        {
          "key": "occupantCount",
          "label": "Jumlah Orang / Penghuni (N)",
          "unit": "orang",
          "min": 0,
          "max": 600,
          "step": 25,
          "defaultValue": 300
        },
        {
          "key": "personWeight",
          "label": "Berat Rata-rata per Orang",
          "unit": "kg/orang",
          "min": 50,
          "max": 90,
          "step": 5,
          "defaultValue": 70
        },
        {
          "key": "floorArea",
          "label": "Luas Lantai Gedung",
          "unit": "m²",
          "min": 96,
          "max": 384,
          "step": 24,
          "defaultValue": 192
        },
        {
          "key": "partitionFurniture",
          "label": "Beban Perabot & Partisi",
          "unit": "kN/m²",
          "min": 0.5,
          "max": 1.5,
          "step": 0.1,
          "defaultValue": 1
        },
        {
          "key": "slabThickness",
          "label": "Tebal Pelat",
          "unit": "mm",
          "min": 100,
          "max": 250,
          "step": 10,
          "defaultValue": 140
        },
        {
          "key": "deadLoadSidl",
          "label": "Beban Mati Tambahan (SIDL)",
          "unit": "kN/m²",
          "min": 0.5,
          "max": 5,
          "step": 0.1,
          "defaultValue": 1.5
        },
        {
          "key": "minimumLiveLoad",
          "label": "Beban Hidup Minimum Fungsi Ruang",
          "unit": "kN/m²",
          "min": 2.4,
          "max": 10,
          "step": 0.1,
          "defaultValue": 2.4,
          "description": "Minimum kantor 2.4 kN/m²; kelas, koridor dan ruang berkumpul memiliki nilai berbeda."
        }
      ],
      "resultLabel": "Beban Gravitasi Terfaktor (qu)",
      "resultUnit": "kN/m²"
    }
  },
  {
    "id": "load-angin",
    "meshName": "Vector_Angin",
    "name": "Beban Angin",
    "technicalTerm": "Lateral Wind Pressure",
    "category": "load_vector",
    "subcategory": "dynamic_load",
    "structuralRole": "Tekanan dan hisapan udara luar pada fasad gedung bertingkat.",
    "loadPathSequence": 0,
    "connectedElements": [
      "elem-pelat-lantai",
      "elem-kolom"
    ],
    "evaluationParameters": {
      "dimensions": "Kecepatan Angin Dasar V = 35 m/s (126 km/jam), Kategori Eksposur B (Kawasan Perkotaan)",
      "materialGrade": "Tekanan Angin Nominal SNI 1727:2020",
      "geometrySystem": "Sistem Penahan Gaya Angin Utama (MWFRS) Arah Lateral"
    },
    "details": {
      "mechanism": "Angin menabrak dinding fasad bangunan menghasilkan tekanan positif di sisi datang (windward) dan hisapan negatif di sisi belakang (leeward) serta atap, yang kemudian diteruskan oleh pelat lantai ke sistem rangka utama.",
      "criticalRisk": "Vortex shedding yang memicu getaran resonansi dinamis, simpangan puncak gedung (sway drift), dan pelepasan kaca fasad gedung.",
      "standardReference": "SNI 1727:2020 Bab 26 s/d 31 (Beban Angin Bangunan Gedung)"
    },
    "governingFormulas": [
      {
        "title": "Tekanan Kecepatan Angin (qz)",
        "expression": "qz = 0.613 · Kz · Kzt · Kd · Ke · V²",
        "description": "Menghitung tekanan dinamis fluida udara pada ketinggian z dari tanah berdasarkan kecepatan angin dasar dan parameter topografi serta eksposur lingkungan.",
        "variables": [
          {
            "symbol": "qz",
            "meaning": "Tekanan kecepatan angin pada elevasi z",
            "unit": "N/m²"
          },
          {
            "symbol": "Kz",
            "meaning": "Koefisien eksposur tekanan kecepatan fungsi ketinggian",
            "unit": "-"
          },
          {
            "symbol": "Kzt",
            "meaning": "Faktor topografi (bukit/lereng curam)",
            "unit": "-"
          },
          {
            "symbol": "Kd",
            "meaning": "Faktor arah angin (0.85 untuk gedung utama)",
            "unit": "-"
          },
          {
            "symbol": "Ke",
            "meaning": "Faktor elevasi permukaan tanah",
            "unit": "-"
          },
          {
            "symbol": "V",
            "meaning": "Kecepatan angin dasar rencana 3-detik gust",
            "unit": "m/s"
          }
        ],
        "clauseReference": "SNI 1727:2020 Persamaan 26.10-1"
      },
      {
        "title": "Tekanan Angin Desain Fasad Bersih (p)",
        "expression": "p = q·G·Cp - qi·(GCpi)",
        "description": "Tekanan netto satu permukaan dengan q dan koefisien sesuai prosedur MWFRS. Tekanan leeward lazimnya memakai qh; Cp bergantung bentuk/aspek bangunan. Contoh dua sisi mengasumsikan qz = qh dan tekanan internal saling meniadakan untuk gaya global, bukan desain kelongsong.",
        "variables": [
          {
            "symbol": "p",
            "meaning": "Tekanan desain angin per meter persegi fasad",
            "unit": "N/m²"
          },
          {
            "symbol": "G",
            "meaning": "Faktor efek hembusan angin (gust factor = 0.85 untuk gedung kaku)",
            "unit": "-"
          },
          {
            "symbol": "Cp",
            "meaning": "Koefisien tekanan eksternal sesuai geometri; contoh +0.8/-0.5 adalah asumsi",
            "unit": "-"
          },
          {
            "symbol": "q, qi",
            "meaning": "Tekanan kecepatan eksternal dan internal sesuai prosedur dan permukaan",
            "unit": "N/m²"
          },
          {
            "symbol": "GCpi",
            "meaning": "Koefisien gabungan tekanan internal sesuai klasifikasi ketertutupan",
            "unit": "-"
          }
        ],
        "clauseReference": "SNI 1727:2020 Persamaan 27.3-1"
      }
    ],
    "workedExample": {
      "title": "Beban Angin Tingkat dengan Koefisien Kecepatan Asumsi",
      "problemStatement": "Contoh idealisasi beban angin satu lantai: V = 35 m/s, Kz = 0.85 diberikan (bukan hasil penetapan eksposur lokasi), Kzt = Ke = 1, Kd = 0.85, G = 0.85, Cp datang = 0.8, Cp belakang = -0.5. Asumsikan qz = qh dan tekanan internal saling meniadakan untuk gaya global. Lebar fasad 16 m, tinggi tingkat 3.5 m.",
      "givenParameters": {
        "Kecepatan Angin (V)": "35 m/s",
        "Koefisien Kz (z = 15 m)": "0.85, nilai asumsi contoh; tentukan nilai proyek dari eksposur dan elevasi",
        "Faktor Arah (Kd)": "0.85",
        "Faktor Kzt & Ke": "1.00",
        "Geometri Lantai": "Tinggi lantai h = 3.5 m, Lebar fasad B = 16.0 m"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung tekanan kecepatan",
          "formula": "qz = 0.613·Kz·Kzt·Kd·Ke·V²",
          "substitution": "qz = 0.613×0.85×1×0.85×1×35²",
          "result": "qz = 542.5433 N/m² = 0.5425433 kPa"
        },
        {
          "stepNumber": 2,
          "label": "Hitung tekanan netto dua sisi dengan qz = qh",
          "formula": "pnet = qz·G·(Cp,datang-Cp,belakang)",
          "substitution": "pnet = 0.5425433×0.85×[0.8-(-0.5)]",
          "result": "pnet = 0.5995104 kPa"
        },
        {
          "stepNumber": 3,
          "label": "Hitung resultan tingkat",
          "formula": "Fw = pnet·B·h",
          "substitution": "Fw = 0.5995104×16×3.5",
          "result": "Fw = 33.57 kN"
        }
      ],
      "conclusion": "Beban lateral tingkat pada idealisasi ini = 33.57 kN. Kecepatan rencana, eksposur, qh, koefisien bentuk dan tekanan minimum perlu ditentukan untuk proyek nyata; kapasitas rangka, drift dan kelongsong belum diperiksa.",
      "safetyCheck": {
        "demand": "33.57 kN (Fw)",
        "capacity": "Belum dihitung",
        "ratio": "—",
        "status": "BELUM DIEVALUASI"
      }
    },
    "calculator": {
      "type": "wind_pressure",
      "title": "Kalkulator Tekanan Kecepatan Angin (qz)",
      "description": "Hitung tekanan angin dinamis dengan memvariasikan kecepatan angin rencana dan koefisien ketinggian.",
      "params": [
        {
          "key": "speed",
          "label": "Kecepatan Angin Rencana (V)",
          "unit": "m/s",
          "min": 25,
          "max": 50,
          "step": 2.5,
          "defaultValue": 35
        },
        {
          "key": "kz",
          "label": "Koefisien Ketinggian (Kz)",
          "unit": "-",
          "min": 0.7,
          "max": 1.3,
          "step": 0.05,
          "defaultValue": 0.85
        },
        {
          "key": "kzt",
          "label": "Faktor Topografi (Kzt)",
          "unit": "-",
          "min": 1,
          "max": 2.5,
          "step": 0.1,
          "defaultValue": 1
        },
        {
          "key": "kd",
          "label": "Faktor Arah (Kd)",
          "unit": "-",
          "min": 0.8,
          "max": 1,
          "step": 0.05,
          "defaultValue": 0.85
        },
        {
          "key": "ke",
          "label": "Faktor Elevasi (Ke)",
          "unit": "-",
          "min": 0.7,
          "max": 1.1,
          "step": 0.05,
          "defaultValue": 1
        }
      ],
      "resultLabel": "Tekanan Kecepatan (qz)",
      "resultUnit": "N/m²"
    }
  },
  {
    "id": "load-gempa",
    "meshName": "Vector_Gempa",
    "name": "Beban Gempa",
    "technicalTerm": "Seismic Lateral Force",
    "category": "load_vector",
    "subcategory": "dynamic_load",
    "structuralRole": "Gaya inersia horizontal akibat pergerakan akselerasi tanah saat gempa bumi.",
    "loadPathSequence": 0,
    "connectedElements": [
      "elem-pondasi",
      "elem-dinding-geser"
    ],
    "evaluationParameters": {
      "dimensions": "Spektrum Respons SDS = 0.708 g, SD1 = 0.507 g, Sistem SRPMK (R = 8, Cd = 5.5, Ie = 1.0)",
      "materialGrade": "Kategori Risiko II; Parameter Spektral Contoh, Penetapan KDS Memerlukan Data Situs",
      "geometrySystem": "Gaya Geser Dasar Seismik (Seismic Base Shear V)"
    },
    "details": {
      "mechanism": "Percepatan tanah akibat gelombang gempa mengguncang massa gedung, membangkitkan gaya inersia bolak-balik horizontal (F = m·a) yang bertranslasi dari level pondasi ke seluruh tingkat bangunan.",
      "criticalRisk": "Mekanisme keruntuhan tingkat lunak (soft-story collapse), ketidakstabilan P-Delta, dan likuifaksi tanah pendukung pondasi.",
      "standardReference": "SNI 1726:2019 Tata Cara Perencanaan Ketahanan Gempa untuk Struktur Bangunan Gedung"
    },
    "governingFormulas": [
      {
        "title": "Gaya Geser Dasar Seismik (V)",
        "expression": "V = Cs · W",
        "description": "Gaya geser horizontal lateral total pada dasar gedung yang dihasilkan dari perkalian koefisien respons seismik rencana (Cs) dengan berat seismik total efektif bangunan (W).",
        "variables": [
          {
            "symbol": "V",
            "meaning": "Gaya geser dasar seismik (Base Shear)",
            "unit": "kN"
          },
          {
            "symbol": "Cs",
            "meaning": "Koefisien respons seismik desain",
            "unit": "-"
          },
          {
            "symbol": "W",
            "meaning": "Berat seismik efektif total struktur gedung",
            "unit": "kN"
          }
        ],
        "clauseReference": "SNI 1726:2019 Pasal 7.8.1"
      },
      {
        "title": "Koefisien Respons Seismik Desain (Cs)",
        "expression": "Cs = max{Cs,min, min[SDS/(R/Ie), Cs,max]}; Cs,max = SD1/[T(R/Ie)] bila T ≤ TL, atau SD1·TL/[T²(R/Ie)] bila T > TL",
        "description": "Cs,min = max(0.044SDS·Ie,0.01); bila S1 ≥ 0.6, tambah batas minimum 0.5S1/(R/Ie). T adalah periode untuk gaya desain dengan pembatasan periode yang berlaku. Berlaku untuk prosedur gaya lateral ekivalen yang memenuhi persyaratan; ketentuan khusus situs tertentu perlu ditinjau.",
        "variables": [
          {
            "symbol": "SDS",
            "meaning": "Parameter percepatan spektrum respons desain periode pendek (0.2 detik)",
            "unit": "g"
          },
          {
            "symbol": "SD1",
            "meaning": "Parameter percepatan spektrum respons desain periode 1.0 detik",
            "unit": "g"
          },
          {
            "symbol": "T",
            "meaning": "Periode fundamental alami struktur gedung",
            "unit": "detik"
          },
          {
            "symbol": "R",
            "meaning": "Koefisien modifikasi respons sistem struktur (SRPMK = 8)",
            "unit": "-"
          },
          {
            "symbol": "Ie",
            "meaning": "Faktor keutamaan fungsi gedung (1.0 untuk hunian/kantor)",
            "unit": "-"
          },
          {
            "symbol": "SD1",
            "meaning": "Percepatan spektral desain pada periode 1 detik",
            "unit": "g"
          },
          {
            "symbol": "T, TL",
            "meaning": "Periode desain dan periode transisi panjang",
            "unit": "s"
          },
          {
            "symbol": "S1",
            "meaning": "Parameter spektral MCER 1 detik untuk batas minimum tambahan",
            "unit": "g"
          }
        ],
        "clauseReference": "SNI 1726:2019 Pasal 7.8.1.1 - 7.8.1.5"
      },
      {
        "title": "Distribusi Vertikal Gaya Gempa ke Tiap Lantai (Fx)",
        "expression": "Fx = Cvx · V = [wx · hx^k / ∑ (wi · hi^k)] · V",
        "description": "Distribusi gaya vertikal dengan eksponen k = 1 untuk T ≤ 0.5 s, k = 2 untuk T ≥ 2.5 s dan interpolasi linier di antaranya. Gunakan berat seismik efektif tiap tingkat; hx diukur dari dasar struktur.",
        "variables": [
          {
            "symbol": "Fx",
            "meaning": "Gaya lateral gempa pada lantai tingkat x",
            "unit": "kN"
          },
          {
            "symbol": "wx",
            "meaning": "Berat lantai tingkat x",
            "unit": "kN"
          },
          {
            "symbol": "hx",
            "meaning": "Ketinggian lantai tingkat x dari dasar tanah",
            "unit": "m"
          },
          {
            "symbol": "k",
            "meaning": "Eksponen fungsi periode T, antara 1 dan 2",
            "unit": "-"
          }
        ],
        "clauseReference": "SNI 1726:2019 Pasal 7.8.3"
      }
    ],
    "workedExample": {
      "title": "Gaya Geser Dasar Gedung Empat Lantai: Parameter Spektral Contoh",
      "problemStatement": "Hitung V pada W = 12000 kN, SDS = 0.708, SD1 = 0.507, S1 = 0.30, T = 0.60 s, TL = 6 s, R = 8 dan Ie = 1. Nilai spektral adalah asumsi pendidikan dan tidak mewakili semua lokasi Jakarta. Asumsikan metode gaya lateral ekivalen (ELF, Equivalent Lateral Force) diizinkan dan T telah memenuhi pembatasan periode.",
      "givenParameters": {
        "Berat Seismik (W)": "12,000.0 kN",
        "Percepatan Spektral (SDS)": "0.708 g",
        "Faktor Modifikasi (R)": "8.0 (SRPMK)",
        "Faktor Keutamaan (Ie)": "1.0 (Kategori Risiko II)",
        "SD1 dan S1": "SD1 = 0.507 g; S1 = 0.30 g",
        "Periode": "T = 0.60 s; TL = 6 s"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung koefisien dasar dan batas atas",
          "formula": "Cs,awal = SDS/(R/Ie); Cs,max = SD1/[T(R/Ie)]",
          "substitution": "Cs,awal = 0.708/8; Cs,max = 0.507/(0.6×8)",
          "result": "Cs,awal = 0.0885; Cs,max = 0.105625",
          "note": "T ≤ TL sehingga memakai cabang SD1/T."
        },
        {
          "stepNumber": 2,
          "label": "Periksa batas minimum dan pilih Cs",
          "formula": "Cs,min = max(0.044SDS·Ie,0.01); Cs = max(Cs,min,min(Cs,awal,Cs,max))",
          "substitution": "Cs,min = max(0.044×0.708×1,0.01) = 0.031152",
          "result": "Cs = 0.0885",
          "note": "S1 = 0.30 < 0.60 sehingga batas 0.5S1/(R/Ie) tidak berlaku."
        },
        {
          "stepNumber": 3,
          "label": "Hitung geser dasar",
          "formula": "V = Cs·W",
          "substitution": "V = 0.0885×12000",
          "result": "V = 1062.00 kN"
        }
      ],
      "conclusion": "Demand geser dasar contoh = 1062 kN. Distribusi gaya tingkat, kombinasi beban, analisis dinamik bila diperlukan, drift, torsional, P-Delta dan kapasitas elemen belum dihitung. Nilai demand saja tidak menyatakan gedung aman.",
      "safetyCheck": {
        "demand": "1062.00 kN (Gaya Geser Dasar V)",
        "capacity": "Belum dihitung",
        "ratio": "—",
        "status": "BELUM DIEVALUASI"
      }
    },
    "calculator": {
      "type": "seismic_shear",
      "title": "Kalkulator Gaya Geser Gempa (Base Shear V)",
      "description": "Hitung V dengan batas atas fungsi periode dan batas minimum koefisien respons seismik (Cs), termasuk syarat S1 ≥ 0.6. Parameter spektral situs dan sistem adalah masukan; metode gaya lateral ekivalen (ELF, Equivalent Lateral Force) hanya dapat digunakan jika diizinkan dan pembatasan periode T terpenuhi.",
      "params": [
        {
          "key": "weight",
          "label": "Berat Total Gedung (W)",
          "unit": "kN",
          "min": 5000,
          "max": 25000,
          "step": 1000,
          "defaultValue": 12000
        },
        {
          "key": "sds",
          "label": "Percepatan Spektral (SDS)",
          "unit": "g",
          "min": 0.3,
          "max": 1.2,
          "step": 0.05,
          "defaultValue": 0.708
        },
        {
          "key": "sd1",
          "label": "Spektral 1 Detik (SD1)",
          "unit": "g",
          "min": 0.1,
          "max": 1.5,
          "step": 0.05,
          "defaultValue": 0.507
        },
        {
          "key": "period",
          "label": "Periode Desain (T)",
          "unit": "s",
          "min": 0.1,
          "max": 5,
          "step": 0.1,
          "defaultValue": 0.6
        },
        {
          "key": "tl",
          "label": "Periode Transisi (TL)",
          "unit": "s",
          "min": 2,
          "max": 12,
          "step": 1,
          "defaultValue": 6
        },
        {
          "key": "s1",
          "label": "Spektral MCER 1 Detik (S1)",
          "unit": "g",
          "min": 0.1,
          "max": 1.5,
          "step": 0.05,
          "defaultValue": 0.3
        },
        {
          "key": "responseR",
          "label": "Faktor Respons Sistem (R)",
          "unit": "-",
          "min": 1,
          "max": 8,
          "step": 0.5,
          "defaultValue": 8
        },
        {
          "key": "importanceIe",
          "label": "Faktor Keutamaan (Ie)",
          "unit": "-",
          "min": 1,
          "max": 1.5,
          "step": 0.25,
          "defaultValue": 1
        }
      ],
      "resultLabel": "Gaya Geser Dasar (V)",
      "resultUnit": "kN"
    }
  },
  {
    "id": "load-tekanan-tanah",
    "meshName": "Vector_TekananTanah",
    "name": "Tekanan Tanah",
    "technicalTerm": "Lateral Earth Pressure",
    "category": "load_vector",
    "subcategory": "static_load",
    "structuralRole": "Dorongan lateral dari massa tanah di sekeliling area basemen.",
    "loadPathSequence": 0,
    "connectedElements": [
      "elem-dinding-basement"
    ],
    "evaluationParameters": {
      "dimensions": "Kondisi Basement Terkekang: K0 = 0.50; alternatif Aktif Ka = 1/3; γ = 18 kN/m³",
      "materialGrade": "Parameter Tanah Granular: Sudut Geser Dalam ϕ = 30°, Kohesi c = 0",
      "geometrySystem": "Distribusi tekanan lateral segitiga linier bertambah seiring kedalaman"
    },
    "details": {
      "mechanism": "Tekanan lateral tanah mengikuti kondisi pergerakan dinding. Basement terkekang menggunakan kondisi diam; aktif memerlukan gerakan yang cukup menjauhi timbunan. Tekanan efektif tanah ditambah air secara terpisah.",
      "criticalRisk": "Pergeseran lateral dinding basement, momen lentur dasar berlebih, dan keretakan struktural akibat tekanan pasif yang tidak terantisipasi.",
      "standardReference": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
    },
    "governingFormulas": [
      {
        "title": "Tekanan Tanah Diam (At-Rest) Dinding Basemen Terkekang (p0)",
        "expression": "p'0 = K0·σ'v; K0 ≈ 1-sinϕ'",
        "description": "Pendekatan Jaky untuk tanah normally consolidated dan dinding terkekang. Pada contoh tanah kering homogen tanpa surcharge, σ'v = γz; di bawah muka air gunakan berat volume apung dan tambahkan tekanan air.",
        "variables": [
          {
            "symbol": "p0",
            "meaning": "Intensitas tekanan tanah lateral kondisi diam pada kedalaman z",
            "unit": "kPa"
          },
          {
            "symbol": "K0",
            "meaning": "Koefisien tekanan tanah diam (rumus empiris Jaky: 1 - sin ϕ)",
            "unit": "-"
          },
          {
            "symbol": "γ",
            "meaning": "Berat volume tanah timbunan jenuh/kering",
            "unit": "kN/m³"
          },
          {
            "symbol": "z",
            "meaning": "Kedalaman titik dari muka tanah asli",
            "unit": "m"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
      },
      {
        "title": "Koefisien Tekanan Tanah Aktif Rankine (Ka)",
        "expression": "Ka = tan²(45° - ϕ / 2) = (1 - sin ϕ) / (1 + sin ϕ)",
        "description": "Rankine untuk tanah nonkohesif, permukaan timbunan horizontal dan dinding vertikal licin yang bergerak cukup untuk kondisi aktif. Besar gerakan yang dibutuhkan bergantung jenis tanah; rumus ini tidak otomatis sesuai basement terkekang.",
        "variables": [
          {
            "symbol": "Ka",
            "meaning": "Koefisien tekanan tanah aktif Rankine",
            "unit": "-"
          },
          {
            "symbol": "ϕ",
            "meaning": "Sudut geser dalam efektif tanah",
            "unit": "derajat"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
      },
      {
        "title": "Resultan Gaya Dorong Lateral Total per Meter Dinding (P)",
        "expression": "P = 0.5 · K · γ · H²",
        "description": "Untuk tanah homogen tanpa air dan surcharge, resultan distribusi segitiga bekerja H/3 dari dasar. Surcharge yang diidealkan merata menambah KqH dengan titik tangkap H/2; air perlu dihitung terpisah.",
        "variables": [
          {
            "symbol": "P",
            "meaning": "Gaya lateral resultan per meter panjang dinding (Pa atau P0)",
            "unit": "kN/m"
          },
          {
            "symbol": "K",
            "meaning": "Koefisien tekanan tanah yang berlaku (Ka atau K0)",
            "unit": "-"
          },
          {
            "symbol": "γ",
            "meaning": "Berat volume tanah timbunan",
            "unit": "kN/m³"
          },
          {
            "symbol": "H",
            "meaning": "Tinggi total dinding penahan tanah",
            "unit": "m"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
      }
    ],
    "workedExample": {
      "title": "Hitungan Gaya Dorong Lateral Tanah pada Dinding Tinggi 4.0 m",
      "problemStatement": "Basement setinggi 4 m terkekang pelat lantai menahan tanah granular normally consolidated, γ = 18 kN/m³, ϕ = 30°, tanpa muka air dan surcharge. Hitung tekanan diam dan bandingkan dengan kondisi aktif sebagai alternatif untuk dinding yang boleh bergerak.",
      "givenParameters": {
        "Tinggi Dinding (H)": "4.0 m",
        "Berat Volume Tanah (γ)": "18.0 kN/m³",
        "Sudut Geser Dalam (ϕ)": "30°",
        "Kohesi Tanah (c)": "0 kPa (Tanah non-kohesif pasir berbutir)"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Pilih koefisien kondisi diam",
          "formula": "K0 = 1-sinϕ",
          "substitution": "K0 = 1-sin30°",
          "result": "K0 = 0.50",
          "note": "Alternatif Rankine aktif: Ka = (1-sin30°)/(1+sin30°) = 1/3, hanya jika gerakan dinding mencukupi."
        },
        {
          "stepNumber": 2,
          "label": "Hitung tekanan dasar",
          "formula": "p0 = K0·γ·H",
          "substitution": "p0 = 0.5×18×4",
          "result": "p0 = 36.00 kPa"
        },
        {
          "stepNumber": 3,
          "label": "Integrasikan resultan per meter dinding",
          "formula": "P0 = 0.5·K0·γ·H²",
          "substitution": "P0 = 0.5×0.5×18×4²",
          "result": "P0 = 72.00 kN/m",
          "note": "Titik tangkap H/3 = 1.3333 m; momen resultan terhadap dasar = 96 kNm/m, bukan otomatis momen lentur dinding dengan tumpuan atas dan bawah."
        }
      ],
      "conclusion": "Demand tanah diam basement = 72 kN/m, sedangkan alternatif aktif = 48 kN/m. Pemilihan K mengikuti gerakan dinding. Analisis tumpuan dan kapasitas dinding belum dilakukan; momen resultan 96 kNm/m bukan langsung momen penampang untuk dinding yang ditopang pelat.",
      "safetyCheck": {
        "demand": "72.00 kN/m (P0)",
        "capacity": "Belum dihitung",
        "ratio": "—",
        "status": "BELUM DIEVALUASI"
      }
    },
    "calculator": {
      "type": "earth_force",
      "title": "Kalkulator Tekanan Tanah Diam Basement",
      "description": "Default memakai K0 = 1-sinϕ untuk basement terkekang dan tanah normally consolidated tanpa air/surcharge. Pembanding Ka Rankine ditampilkan dengan syarat pergerakan dinding.",
      "params": [
        {
          "key": "phi",
          "label": "Sudut Geser Dalam (ϕ)",
          "unit": "derajat",
          "min": 25,
          "max": 40,
          "step": 1,
          "defaultValue": 30
        },
        {
          "key": "height",
          "label": "Tinggi Dinding (H)",
          "unit": "m",
          "min": 2.5,
          "max": 6,
          "step": 0.5,
          "defaultValue": 4
        }
      ],
      "resultLabel": "Gaya Tanah Diam (P0)",
      "resultUnit": "kN/m"
    }
  },
  {
    "id": "load-tekanan-air",
    "meshName": "Vector_TekananAir",
    "name": "Tekanan Air",
    "technicalTerm": "Hydrostatic & Uplift Water Pressure",
    "category": "load_vector",
    "subcategory": "static_load",
    "structuralRole": "Tekanan hidrostatis horizontal pada dinding dan gaya angkat apung (uplift) pada dasar pondasi.",
    "loadPathSequence": 0,
    "connectedElements": [
      "elem-dinding-basement",
      "elem-pondasi"
    ],
    "evaluationParameters": {
      "dimensions": "Tinggi Muka Air Tanah Terendam Hw = 3.0 m, Luas Tapak Dasar A_base = 300 m²",
      "materialGrade": "Berat Jenis Air γw = 9.81 kN/m³ (1.00 t/m³)",
      "geometrySystem": "Distribusi hidrostatis segitiga tegak lurus dan gaya apung Archimedes seragam di dasar"
    },
    "details": {
      "mechanism": "Air tanah memberikan tekanan lateral fluida murni tanpa friksi geser pada dinding penahan, serta gaya angkat vertikal ke atas (buoyancy force) pada dasar lantai basement yang dapat mengangkat seluruh gedung jika beban matinya tidak mencukupi.",
      "criticalRisk": "Kegagalan pengapungan gedung (buoyancy uplift failure), pelat dasar basement pecah terangkat, dan kebocoran rembesan bertekanan.",
      "standardReference": "SNI 8460:2017 Pasal 9.3.3–9.3.4 (Ketahanan terhadap Gaya Angkat)"
    },
    "governingFormulas": [
      {
        "title": "Tekanan Hidrostatis pada Kedalaman z (u)",
        "expression": "u = γw · zw",
        "description": "Tekanan fluida air bekerja merata ke segala arah tegak lurus bidang batas struktur dengan gradien linier seiring bertambahnya kedalaman muka air.",
        "variables": [
          {
            "symbol": "u",
            "meaning": "Tekanan hidrostatis air tanah",
            "unit": "kPa"
          },
          {
            "symbol": "γw",
            "meaning": "Berat volume air tanah (9.81 kN/m³)",
            "unit": "kN/m³"
          },
          {
            "symbol": "zw",
            "meaning": "Kedalaman titik ukur di bawah muka air tanah",
            "unit": "m"
          }
        ],
        "clauseReference": "Prinsip hidrostatis; SNI 8460:2017 Pasal 9.3.3–9.3.4 untuk ketahanan gaya angkat"
      },
      {
        "title": "Gaya Angkat Apung Total / Uplift (U)",
        "expression": "U = u_dasar · A_base = γw · Hw · A_base",
        "description": "Gaya apung Archimedes total yang mendorong seluruh dasar struktur gedung ke arah atas.",
        "variables": [
          {
            "symbol": "U",
            "meaning": "Gaya uplift vertikal total yang mendorong bangunan",
            "unit": "kN"
          },
          {
            "symbol": "Hw",
            "meaning": "Tinggi muka air tanah terendam diukur dari dasar pondasi",
            "unit": "m"
          },
          {
            "symbol": "A_base",
            "meaning": "Luas total bidang tapak dasar basement yang terendam",
            "unit": "m²"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 9.3.3–9.3.4"
      },
      {
        "title": "Faktor Keamanan Stabilitas Pengapungan (SF_uplift)",
        "expression": "SF = Wdead/U; pemeriksaan contoh: SF ≥ 1.50 dan Wdead ≥ 1.10U",
        "description": "SNI 8460:2017 9.3.3(b) mensyaratkan tahanan gaya angkat sekurangnya 1.5 kali gaya angkat. Pada 9.3.4(a), pendekatan berat pengimbang memakai SF ≥ 1.5 dan dapat memperhitungkan tahanan tambahan yang diizinkan; 9.3.4(b) mensyaratkan berat mati saja sekurangnya 1.1U. Gunakan muka air tertinggi; contoh tanpa tahanan angkur memakai target konservatif Wdead/U ≥ 1.5.",
        "variables": [
          {
            "symbol": "SF_uplift",
            "meaning": "Faktor keamanan terhadap bahaya terapung (anti-flotation SF)",
            "unit": "-"
          },
          {
            "symbol": "∑ W_dead",
            "meaning": "Berat sendiri total nominal bangunan (struktur + finishing tetap)",
            "unit": "kN"
          },
          {
            "symbol": "U",
            "meaning": "Gaya uplift total",
            "unit": "kN"
          }
        ],
        "clauseReference": "SNI 8460:2017 Pasal 9.3.3(b), 9.3.4(a)–(b)"
      }
    ],
    "workedExample": {
      "title": "Evaluasi Stabilitas Anti-Pengapungan (Anti-Flotation) Basement",
      "problemStatement": "Basement dengan tapak 300 m² menerima head air rencana tertinggi 3 m, Wdead = 13500 kN. Hitung uplift dan periksa syarat tahanan gaya angkat 1.5U serta minimum berat mati saja 1.1U, tanpa tahanan angkur/tiang tambahan.",
      "givenParameters": {
        "Luas Tapak Basement (A_base)": "300.0 m²",
        "Tinggi Air Terendam (Hw)": "3.0 m",
        "Berat Jenis Air (γw)": "9.81 kN/m³",
        "Total Berat Mati Gedung (W_dead)": "13,500.0 kN"
      },
      "steps": [
        {
          "stepNumber": 1,
          "label": "Hitung tekanan hidrostatis air pada dasar pondasi (u_dasar)",
          "formula": "u_dasar = γw · Hw",
          "substitution": "u_dasar = 9.81 × 3.0",
          "result": "u_dasar = 29.43 kPa"
        },
        {
          "stepNumber": 2,
          "label": "Hitung total gaya dorong angkat apung ke atas (Uplift Force U)",
          "formula": "U = u_dasar · A_base",
          "substitution": "U = 29.43 × 300.0",
          "result": "U = 8,829.00 kN"
        },
        {
          "stepNumber": 3,
          "label": "Hitung faktor keamanan terhadap bahaya terapung (SF_uplift)",
          "formula": "SF_uplift = W_dead / U",
          "substitution": "SF_uplift = 13,500 / 8,829",
          "result": "SF_uplift = 1.53"
        },
        {
          "stepNumber": 4,
          "label": "Periksa tahanan dan minimum berat mati",
          "formula": "Wdead ≥ 1.5U; Wdead ≥ 1.1U",
          "substitution": "1.5U = 1.5×8829 = 13243.5; 1.1U = 1.1×8829 = 9711.9",
          "result": "13500 ≥ 13243.5 kN dan 13500 ≥ 9711.9 kN",
          "note": "Rasio pemeriksaan konservatif = 1.5U/Wdead = 0.981; muka air dan berat harus sesuai kondisi rencana, termasuk konstruksi."
        }
      ],
      "conclusion": "SF = 13500/8829 = 1.529 memenuhi target 1.5 dan berat mati memenuhi 1.1U. Rasio kebutuhan tahanan 1.5U/Wdead = 0.981. Contoh memenuhi pemeriksaan global ini; kapasitas tarik, slab uplift, tahapan konstruksi dan kondisi muka air lain belum dievaluasi.",
      "safetyCheck": {
        "demand": "13243.50 kN (1.5U)",
        "capacity": "13500.00 kN (Wdead; tanpa angkur)",
        "ratio": "0.981",
        "status": "MEMENUHI PEMERIKSAAN CONTOH"
      }
    },
    "calculator": {
      "type": "water_uplift",
      "title": "Kalkulator Stabilitas Flotasi & Uplift Air",
      "description": "Hitung U, SF nominal, pemeriksaan tahanan 1.5U dan minimum berat mati 1.1U tanpa angkur. Tahapan konstruksi dan tahanan tambahan belum diperiksa.",
      "params": [
        {
          "key": "waterHead",
          "label": "Tinggi Muka Air Terendam (Hw)",
          "unit": "m",
          "min": 1,
          "max": 5,
          "step": 0.5,
          "defaultValue": 3
        },
        {
          "key": "deadWeight",
          "label": "Berat Mati Minimum Gedung",
          "unit": "kN",
          "min": 8000,
          "max": 20000,
          "step": 500,
          "defaultValue": 13500
        },
        {
          "key": "baseArea",
          "label": "Luas Tapak (A)",
          "unit": "m²",
          "min": 100,
          "max": 600,
          "step": 25,
          "defaultValue": 300
        },
        {
          "key": "targetSF",
          "label": "Target SF Berat Pengimbang",
          "unit": "-",
          "min": 1.5,
          "max": 2.5,
          "step": 0.1,
          "defaultValue": 1.5
        }
      ],
      "resultLabel": "Faktor Keamanan Apung (SF)",
      "resultUnit": "[-]"
    }
  }
];

export const structuralById = Object.fromEntries(
  structuralElements.map((item) => [item.id, item])
) as Record<string, CivilElementData>;
