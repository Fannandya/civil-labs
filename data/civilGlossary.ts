export interface CivilGlossaryTerm {
  id: string;
  term: string;
  symbol?: string;
  reading?: string;
  aliases?: string[];
  category: "simbol_rumus" | "struktur_beton" | "rekayasa_gempa" | "geoteknik_pondasi" | "beban_gedung";
  academicDefinition: string;
  conceptualExplanation: string;
  unit?: string;
  relatedElementIds: string[];
  standardClause?: string;
}

export const civilGlossaryData: CivilGlossaryTerm[] = [
  {
    "id": "sym-fc",
    "term": "Kuat Tekan Silinder Beton (f'c)",
    "symbol": "f'c",
    "reading": "f-aksen-c (Concrete Compressive Strength)",
    "category": "simbol_rumus",
    "academicDefinition": "Kuat tekan beton yang disyaratkan dalam desain, ditentukan melalui benda uji silinder standar pada umur uji yang ditetapkan (umumnya 28 hari). Nilai f'c bukan otomatis nilai satu hasil uji maupun kuat tekan rata-rata f'cr.",
    "conceptualExplanation": "Nilai f'c menjadi parameter perancangan penampang. Mutu campuran rata-rata yang ditargetkan f'cr biasanya lebih tinggi untuk mengakomodasi variasi hasil produksi; penerimaan beton dinilai dari ketentuan pengujian, bukan satu silinder saja.",
    "unit": "MPa (N/mm²)",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "elem-dinding-geser",
      "elem-pelat-lantai",
      "elem-dinding-basement",
      "elem-pondasi"
    ],
    "standardClause": "SNI 2847:2019 Pasal 2.2"
  },
  {
    "id": "sym-fy",
    "term": "Kuat Leleh Baja Tulangan (fy)",
    "symbol": "fy",
    "reading": "f-y (Steel Yield Strength)",
    "category": "simbol_rumus",
    "academicDefinition": "Tegangan batas di mana baja tulangan mulai mengalami deformasi plastis permanen tanpa pertambahan tegangan yang signifikan.",
    "conceptualExplanation": "Tegangan leleh baja menjadi masukan keseimbangan penampang. Pemilihan mutu baja tidak dengan sendirinya menjamin daktilitas: regangan, sifat baja, rasio tulangan, penyaluran dan detailing juga menentukan perilaku.",
    "unit": "MPa (N/mm²)",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "elem-dinding-geser",
      "elem-pelat-lantai",
      "elem-dinding-basement",
      "elem-pondasi"
    ],
    "standardClause": "SNI 2847:2019 Pasal 2.2"
  },
  {
    "id": "sym-phi",
    "aliases": ["phi", "fi", "phi kekuatan", "faktor reduksi"],
    "term": "Faktor Reduksi Kekuatan (φ)",
    "symbol": "φ",
    "reading": "fi (Faktor Reduksi Kekuatan Rencana)",
    "category": "simbol_rumus",
    "academicDefinition": "Faktor pengali kekuatan nominal untuk menghasilkan kekuatan rencana. Nilainya bergantung mode keruntuhan dan ketentuan: contoh φ = 0.90 untuk terkendali tarik, 0.65 untuk tekan kolom bersengkang, serta 0.75 untuk geser umum dengan pengecualian seismik.",
    "conceptualExplanation": "Regangan tarik menentukan faktor reduksi lentur/aksial. Untuk geser seismik tertentu, φ = 0.60 dapat berlaku bila kekuatan geser tidak memenuhi perbandingan dengan gaya pada kapasitas lentur; jangan menggunakan φ = 0.75 tanpa memeriksa kondisi penerapan.",
    "unit": "-",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "elem-dinding-geser",
      "elem-pelat-lantai",
      "elem-pondasi"
    ],
    "standardClause": "SNI 2847:2019 Pasal 21.2"
  },
  {
    "id": "sym-mn",
    "term": "Kapasitas Momen Lentur Nominal (Mn)",
    "symbol": "Mn",
    "reading": "M-n (Nominal Moment Capacity)",
    "category": "simbol_rumus",
    "academicDefinition": "Momen lentur maksimum teoritis yang dapat ditahan oleh penampang elemen beton bertulang sebelum mengalami keruntuhan.",
    "conceptualExplanation": "Momen perlawanan internal penampang yang dibentuk oleh kopel gaya tekan beton dan gaya tarik baja tulangan (C = T). Nilai Mn merepresentasikan batas atas daya pikul momen balok murni sebelum direduksi oleh faktor kekuatan φ.",
    "unit": "kNm",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "elem-pelat-lantai"
    ],
    "standardClause": "SNI 2847:2019 Pasal 22.2"
  },
  {
    "id": "sym-mu",
    "term": "Momen Lentur Terfaktor (Mu)",
    "symbol": "Mu",
    "reading": "M-u (Ultimate / Factored Moment)",
    "category": "simbol_rumus",
    "academicDefinition": "Momen lentur yang dihasilkan dari kombinasi beban terfaktor (misal 1.2 DL + 1.6 LL) yang bekerja pada elemen struktur.",
    "conceptualExplanation": "Momen lentur amplifikasi terfaktor yang diperoleh dari analisis mekanika struktur statik atau dinamik. Kriteria desain batas kekuatan mensyaratkan kapasitas rencana penampang selalu melampaui momen terfaktor (φMn ≥ Mu).",
    "unit": "kNm",
    "relatedElementIds": [
      "elem-balok",
      "elem-pelat-lantai",
      "load-gravitasi"
    ],
    "standardClause": "SNI 2847:2019 Pasal 5.3"
  },
  {
    "id": "sym-a",
    "term": "Tinggi Blok Tegangan Tekan Whitney (a)",
    "symbol": "a",
    "reading": "a (Kedalaman Blok Tegangan Ekivalen)",
    "category": "simbol_rumus",
    "academicDefinition": "Tinggi blok tegangan tekan beton berbentuk persegi panjang ekivalen dengan intensitas 0.85 f'c yang menggantikan distribusi tegangan parabola nyata.",
    "conceptualExplanation": "Penyederhanaan matematis model Whitney untuk mengkuantifikasi resultan gaya tekan beton penampang (C = 0.85 · f'c · a · b). Kedalaman blok 'a' terhubung langsung dengan posisi garis netral 'c' melalui faktor pengali β1 (a = β1 · c).",
    "unit": "mm",
    "relatedElementIds": [
      "elem-balok"
    ],
    "standardClause": "SNI 2847:2019 Pasal 22.2.2.4"
  },
  {
    "id": "sym-d",
    "term": "Tinggi Efektif Penampang (d)",
    "symbol": "d",
    "reading": "d (Effective Depth)",
    "category": "simbol_rumus",
    "academicDefinition": "Jarak dari serat tekan terluar beton sampai ke titik berat penampang tulangan baja tarik.",
    "conceptualExplanation": "Parameter lengan momen efektif penampang. Semakin besar nilai d pada dimensi penampang yang sama (misal penataan tulangan satu lapis dibanding dua lapis), semakin besar kapasitas momen lentur yang dihasilkan dengan jumlah tulangan tarik yang sama.",
    "unit": "mm",
    "relatedElementIds": [
      "elem-balok",
      "elem-pelat-lantai"
    ],
    "standardClause": "SNI 2847:2019 Pasal 2.2"
  },
  {
    "id": "sym-vn",
    "term": "Kuat Geser Nominal (Vn)",
    "symbol": "Vn",
    "reading": "V-n (Nominal Shear Strength)",
    "category": "simbol_rumus",
    "academicDefinition": "Kapasitas total penampang untuk menahan gaya geser melintang yang merupakan jumlahan kontribusi beton (Vc) dan tulangan sengkang (Vs).",
    "conceptualExplanation": "Batas tahanan penampang terhadap keretakan tarik diagonal (diagonal tension crack). Karena keruntuhan geser bersifat getas tanpa deformasi awal yang signifikan, kapasitas geser nominal (Vn) harus dirancang melampaui gaya geser yang berkaitan dengan pembentukan sendi plastis lentur.",
    "unit": "kN",
    "relatedElementIds": [
      "elem-balok",
      "elem-dinding-geser"
    ],
    "standardClause": "SNI 2847:2019 Pasal 22.5"
  },
  {
    "id": "sym-vc-vs",
    "term": "Kontribusi Geser Beton (Vc) & Sengkang (Vs)",
    "symbol": "Vc & Vs",
    "reading": "V-c (Kuat Geser Beton) & V-s (Kuat Geser Sengkang)",
    "category": "simbol_rumus",
    "academicDefinition": "Vc adalah kontribusi beton terhadap kekuatan geser nominal melalui beberapa mekanisme, sedangkan Vs adalah kontribusi tulangan melintang yang melintasi retak.",
    "conceptualExplanation": "Geser diteruskan melalui zona beton tekan, transfer pada retak, aksi pasak tulangan dan tulangan melintang sesuai model desain. Vc bukan hanya ikatan agregat, dan retak tidak otomatis mengalihkan seluruh geser ke sengkang. Ketentuan seismik dapat mengharuskan Vc diambil nol.",
    "unit": "kN",
    "relatedElementIds": [
      "elem-balok",
      "elem-dinding-geser"
    ],
    "standardClause": "SNI 2847:2019 Pasal 22.5"
  },
  {
    "id": "sym-p0-pn",
    "aliases": ["P0 kolom", "Pn kolom"],
    "term": "Kapasitas Aksial Kolom (P0, Pn, Pn,max)",
    "symbol": "P0, Pn, Pn,max",
    "reading": "P-nol & P-n (Axial Compressive Strength)",
    "category": "simbol_rumus",
    "academicDefinition": "P0 adalah kuat aksial nominal tekan konsentris. Pn adalah kuat aksial nominal pada titik diagram interaksi untuk momen tertentu. Pn,max adalah batas maksimum aksial yang diizinkan.",
    "conceptualExplanation": "Diagram interaksi P–M menggambarkan kapasitas kombinasi aksial dan momen. Batas nominal Pn,max = 0.80P0 untuk kolom bersengkang atau 0.85P0 untuk spiral tidak berarti setiap kondisi momen memiliki kapasitas sebesar batas tersebut. Kekuatan rencana juga dikalikan φ sesuai regangan.",
    "unit": "kN",
    "relatedElementIds": [
      "elem-kolom"
    ],
    "standardClause": "SNI 2847:2019 Pasal 22.4.2"
  },
  {
    "id": "sym-pcr",
    "term": "Beban Tekuk Kritis Euler (Pcr)",
    "symbol": "Pcr",
    "reading": "P-kritis (Critical Buckling Load)",
    "category": "simbol_rumus",
    "academicDefinition": "Beban tekuk elastis teoritis untuk kolom ideal yang lurus, langsing, homogen, elastis, dan memiliki kondisi tumpuan tertentu.",
    "conceptualExplanation": "Pcr = π²EI / (kL)² adalah batas tekuk dalam model Euler ideal, bukan kapasitas desain kolom nyata. Eksentrisitas, ketidaksempurnaan, perilaku material, kelangsingan dan efek orde kedua (P-Delta) perlu diperhitungkan dalam desain.",
    "unit": "kN",
    "relatedElementIds": [
      "elem-kolom"
    ],
    "standardClause": "SNI 2847:2019 Pasal 6.6.4.4"
  },
  {
    "id": "sym-rho",
    "term": "Rasio Penulangan (ρ)",
    "symbol": "ρ",
    "reading": "ro (Reinforcement Ratio)",
    "category": "simbol_rumus",
    "academicDefinition": "Perbandingan antara luas penampang tulangan baja (As) terhadap luas efektif penampang beton (b × d atau Ag).",
    "conceptualExplanation": "Balok memakai ρ = As/(b·d), kolom memakai ρg = Ast/Ag, dan dinding memakai rasio tulangan per arah. Kolom SRPMK memiliki batas longitudinal 1%–6%; rentang praktis yang lebih sempit dapat dipilih untuk kemudahan konstruksi, bukan sebagai pengganti batas normatif.",
    "unit": "- (atau %)",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "elem-dinding-geser"
    ],
    "standardClause": "SNI 2847:2019 Pasal 18.7.4.1"
  },
  {
    "id": "sym-k0-ka",
    "term": "Koefisien Tekanan Tanah (K0, Ka)",
    "symbol": "K0, Ka",
    "reading": "K-nol (Tekanan Diam) & K-a (Tekanan Aktif)",
    "category": "simbol_rumus",
    "academicDefinition": "Rasio tegangan horizontal efektif terhadap tegangan vertikal efektif. K0 berlaku pada kondisi tanpa deformasi lateral; Ka berlaku ketika gerakan dinding cukup untuk mengembangkan keadaan aktif.",
    "conceptualExplanation": "Jaky K0 ≈ 1-sinϕ untuk tanah normally consolidated. Rankine Ka = (1-sinϕ)/(1+sinϕ) memakai asumsi tanah nonkohesif, timbunan datar dan dinding licin. Di bawah muka air, tekanan total adalah tekanan efektif tanah ditambah tekanan air.",
    "unit": "-",
    "relatedElementIds": [
      "elem-dinding-basement",
      "load-tekanan-tanah"
    ],
    "standardClause": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
  },
  {
    "id": "sym-v-shear",
    "term": "Gaya Geser Dasar Gempa (V)",
    "symbol": "V",
    "reading": "V (Seismic Base Shear)",
    "category": "simbol_rumus",
    "academicDefinition": "Resultan gaya lateral seismik pada dasar struktur yang mewakili respons inersia bangunan terhadap gerakan tanah.",
    "conceptualExplanation": "V adalah resultan gaya pada dasar struktur dan nilainya bergantung pada metode analisis seismik yang digunakan. Gaya tingkat kemudian disalurkan melalui sistem struktur dan pondasi.",
    "unit": "kN",
    "relatedElementIds": [
      "load-gempa",
      "elem-kolom",
      "elem-dinding-geser",
      "elem-pondasi"
    ],
    "standardClause": "SNI 1726:2019 Pasal 7.8.1"
  },
  {
    "id": "sym-cs",
    "term": "Koefisien Respons Seismik (Cs)",
    "symbol": "Cs",
    "reading": "C-s (Seismic Response Coefficient)",
    "category": "simbol_rumus",
    "academicDefinition": "Koefisien percepatan gempa tak berdimensi yang dikalikan dengan berat seismik total gedung (W) untuk memperoleh gaya geser dasar (V = Cs · W).",
    "conceptualExplanation": "Cs menentukan gaya lateral ekivalen dari berat seismik efektif. Rumus awal SDS/(R/Ie) dibatasi fungsi SD1, periode T, TL dan minimum tertentu, termasuk syarat S1 ≥ 0.6. Cs berasal dari respons spektral dan sistem struktur, bukan langsung percepatan puncak tanah PGA.",
    "unit": "-",
    "relatedElementIds": [
      "load-gempa"
    ],
    "standardClause": "SNI 1726:2019 Pasal 7.8.1.1"
  },
  {
    "id": "sym-r-seismic",
    "term": "Faktor Modifikasi Respons Seismik (R)",
    "symbol": "R",
    "reading": "R (Response Modification Factor)",
    "category": "simbol_rumus",
    "academicDefinition": "Faktor pembagi gaya elastis gempa yang mencerminkan kemampuan sistem struktur untuk menyerap energi gempa melalui perilaku daktail paska-elastis.",
    "conceptualExplanation": "Faktor modifikasi respons struktur terhadap aksi seismik. Pemilihan sistem struktur berkeuletan penuh (seperti SRPMK dengan R = 8) memungkinkan perancangan elemen dengan gaya lateral elastis tereduksi karena struktur dirancang mampu mendisipasi energi gempa melalui deformasi inelastis yang stabil.",
    "unit": "-",
    "relatedElementIds": [
      "load-gempa",
      "elem-balok",
      "elem-kolom"
    ],
    "standardClause": "SNI 1726:2019 Tabel 12"
  },
  {
    "id": "sym-qz",
    "term": "Tekanan Kecepatan Angin (qz)",
    "symbol": "qz",
    "reading": "q-z (Velocity Pressure at height z)",
    "category": "simbol_rumus",
    "academicDefinition": "Tekanan angin dinamis pada ketinggian z di atas tanah yang dipengaruhi oleh kecepatan angin dasar, kekasaran permukaan tanah, dan faktor arah.",
    "conceptualExplanation": "Tekanan kecepatan qz = 0.613KzKztKdKeV² dalam N/m² untuk V dalam m/s. Kz ditentukan kategori eksposur dan elevasi, sedangkan tekanan desain permukaan juga memerlukan koefisien eksternal/internal. qz bukan langsung gaya maupun tekanan netto fasad.",
    "unit": "N/m² (atau kPa)",
    "relatedElementIds": [
      "load-angin"
    ],
    "standardClause": "SNI 1727:2020 Pasal 26.10"
  },
  {
    "id": "sym-u-uplift",
    "term": "Tekanan Pori & Gaya Angkat Air (u, U)",
    "symbol": "u, U",
    "reading": "u (Tekanan Hidrostatis) & U (Gaya Uplift Hidrostatik)",
    "category": "simbol_rumus",
    "academicDefinition": "u adalah tekanan fluida air pori tanah; U adalah total gaya angkat apung Archimedes yang mendorong pelat pondasi ke atas.",
    "conceptualExplanation": "Tekanan u = γw·head dan gaya U = u·A berlaku pada dasar dengan head seragam. Pemeriksaan stabilitas mengikuti kombinasi beban dan jalur tahanan yang relevan pada SNI 8460:2017 9.3.3–9.3.4; berat pengimbang memakai SF minimum 1.5, sedangkan pemeriksaan berat mati saja memiliki ketentuan 1.1U.",
    "unit": "kPa & kN",
    "relatedElementIds": [
      "load-tekanan-air",
      "elem-dinding-basement",
      "elem-pondasi"
    ],
    "standardClause": "SNI 8460:2017 Pasal 9.3.3–9.3.4"
  },
  {
    "id": "sym-sf",
    "term": "Faktor Keamanan (Safety Factor / SF)",
    "symbol": "SF",
    "reading": "S-F (Safety Factor)",
    "category": "simbol_rumus",
    "academicDefinition": "Rasio tahanan terhadap demand yang didefinisikan untuk suatu mode pemeriksaan tertentu, umumnya memakai besaran nominal/layan yang konsisten.",
    "conceptualExplanation": "SF geoteknik bergantung jenis fondasi, beban, metode evaluasi dan uji. SF tidak sama dengan faktor reduksi φ maupun DCR kekuatan; kapasitas izin geoteknik dibandingkan dengan beban layan, sedangkan kapasitas struktur terfaktor dibandingkan dengan demand terfaktor.",
    "unit": "-",
    "relatedElementIds": [
      "elem-pondasi",
      "load-tekanan-air",
      "load-tekanan-tanah"
    ],
    "standardClause": "SNI 8460:2017 Bab 9"
  },
  {
    "id": "sym-dcr",
    "term": "Demand-Capacity Ratio (DCR)",
    "symbol": "DCR",
    "reading": "D-C-R (Rasio Kebutuhan terhadap Kapasitas Rencana)",
    "category": "simbol_rumus",
    "academicDefinition": "Perbandingan demand dengan kapasitas untuk mode, satuan, kombinasi beban dan dasar desain yang sama. DCR ≤ 1 memenuhi hanya pemeriksaan yang dihitung.",
    "conceptualExplanation": "DCR tidak membuktikan keselamatan menyeluruh. Lendutan, drift, retak, stabilitas, kelelahan, detailing dan pemeriksaan lain tetap diperlukan. Tidak ada rentang DCR universal 0.85–0.95 yang menjamin desain optimal.",
    "unit": "-",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "elem-dinding-geser",
      "elem-pondasi"
    ],
    "standardClause": "SNI 2847:2019 & SNI 1726:2019"
  },
  {
    "id": "term-srpmk",
    "term": "SRPMK (Sistem Rangka Pemikul Momen Khusus)",
    "reading": "S-R-P-M-K (Special Moment Resisting Frame)",
    "category": "struktur_beton",
    "academicDefinition": "Sistem struktur rangka beton bertulang di mana balok dan kolom didesain dengan detail penulangan khusus berkeuletan tinggi untuk menahan gaya gempa kuat tanpa mengalami keruntuhan getas.",
    "conceptualExplanation": "Klasifikasi sistem struktur penahan gaya gempa berkeuletan penuh pada zona seismik tinggi (KDS D, E, F). Desain SRPMK menerapkan pembatasan spasi sengkang rapat, pengekangan inti beton, serta detailing sambungan lewatan di luar zona plastis agar struktur mampu berdeformasi inelastis stabil saat gempa rencana.",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "load-gempa"
    ],
    "standardClause": "SNI 2847:2019 Pasal 18.6 s/d 18.8"
  },
  {
    "id": "term-sendi-plastis",
    "term": "Sendi Plastis (Plastic Hinge)",
    "category": "struktur_beton",
    "academicDefinition": "Zona terbatas pada ujung elemen lentur di mana baja tulangan telah leleh dan beton mengalami deformasi plastis berputar yang mendisipasi energi gempa.",
    "conceptualExplanation": "Mekanisme disipasi energi seismik yang direncanakan secara terfokus pada ujung-ujung balok. Dengan memusatkan deformasi inelastis pada balok, integritas aksial kolom utama tetap terjaga selama siklus pembebanan bolak-balik (cyclic loading).",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "load-gempa"
    ],
    "standardClause": "SNI 2847:2019 Pasal 18.6.4"
  },
  {
    "id": "term-strong-column",
    "term": "Strong-Column Weak-Beam (Kolom Kuat - Balok Lemah)",
    "category": "struktur_beton",
    "academicDefinition": "Prinsip perancangan seismik yang mensyaratkan jumlah kuat lentur nominal kolom pada joint pertemuan minimum 1.2 kali jumlah kuat lentur nominal balok (∑Mnc ≥ 1.2 ∑Mnb).",
    "conceptualExplanation": "Hierarki desain kapasitas untuk mengurangi kecenderungan mekanisme tingkat akibat sendi plastis pada kolom. Pemeriksaan jumlah momen nominal di joint memperhitungkan gaya aksial kolom yang relevan; syarat ini tidak menjamin semua kolom tetap elastis atau bangunan bebas kegagalan.",
    "relatedElementIds": [
      "elem-kolom",
      "elem-balok",
      "load-gempa"
    ],
    "standardClause": "SNI 2847:2019 Pasal 18.7.3.2"
  },
  {
    "id": "term-daktilitas",
    "term": "Daktilitas (Ductility)",
    "category": "struktur_beton",
    "academicDefinition": "Kemampuan struktur atau material untuk mengalami deformasi inelastis besar bolak-balik melampaui batas lelehnya tanpa mengalami kehilangan kekuatan yang signifikan.",
    "conceptualExplanation": "Daktilitas memungkinkan deformasi inelastis dan redistribusi gaya, serta disipasi energi bila detailing mendukung. Perilaku daktail tidak menjamin tanda peringatan yang dapat diamati maupun waktu evakuasi sebelum keruntuhan.",
    "relatedElementIds": [
      "elem-balok",
      "elem-kolom",
      "elem-dinding-geser",
      "load-gempa"
    ],
    "standardClause": "SNI 1726:2019 Pasal 2.1"
  },
  {
    "id": "term-geser-pons",
    "term": "Geser Pons (Punching Shear / Two-Way Shear)",
    "category": "struktur_beton",
    "academicDefinition": "Keruntuhan geser dua arah yang terjadi ketika kolom menembus pelat lantai atau pondasi rakit dalam bentuk kerucut/piramida terpotong akibat konsentrasi tegangan lokal.",
    "conceptualExplanation": "Mekanisme keruntuhan geser kritis pada sistem pelat nir-balok (flat plate) atau pile cap pondasi. Konsentrasi tegangan geser di sekeliling perimeter kolom dianalisis pada penampang kritis berjarak d/2 dari muka kolom dan dimitigasi dengan penebalan drop panel atau penambahan sengkang geser pelat.",
    "relatedElementIds": [
      "elem-pelat-lantai",
      "elem-pondasi"
    ],
    "standardClause": "SNI 2847:2019 Pasal 22.6"
  },
  {
    "id": "term-diafragma-kaku",
    "term": "Diafragma Kaku (Rigid Floor Diaphragm)",
    "category": "struktur_beton",
    "academicDefinition": "Asumsi analisis bahwa deformasi bidang diafragma dapat diabaikan dibanding deformasi sistem vertikal; distribusi lateral mengikuti kekakuan dan pengaruh torsional.",
    "conceptualExplanation": "Kekakuan bidang, rasio geometri, bukaan besar dan ketidakberaturan menentukan kelayakan asumsi diafragma kaku. Pelat monolitik tidak otomatis kaku; model semi-kaku/fleksibel diperlukan bila deformasi bidang berarti. Distribusi mencakup translasi dan rotasi, bukan hanya pembagian menurut kekakuan tanpa torsi.",
    "relatedElementIds": [
      "elem-pelat-lantai",
      "load-gempa",
      "load-angin"
    ],
    "standardClause": "SNI 2847:2019 Pasal 18.12"
  },
  {
    "id": "term-under-reinforced",
    "term": "Penampang Terkendali Tarik (Tension-Controlled)",
    "category": "struktur_beton",
    "academicDefinition": "Penampang dengan regangan tarik neto εt pada kekuatan nominal mencapai batas terkendali tarik yang berlaku; untuk ketentuan acuan ini εt ≥ 0.005 sehingga φ = 0.90.",
    "conceptualExplanation": "Tulangan leleh ketika εt ≥ εy = fy/Es; terkendali tarik memerlukan regangan lebih tinggi. Untuk fy = 420 MPa dan Es = 200000 MPa, εy ≈ 0.0021, sehingga baja telah leleh pada εt = 0.003 tetapi penampang belum terkendali tarik penuh. Under-reinforced berarti baja leleh sebelum kehancuran beton, dan tidak otomatis memenuhi batas tension-controlled penuh.",
    "relatedElementIds": [
      "elem-balok",
      "elem-pelat-lantai"
    ],
    "standardClause": "SNI 2847:2019 Pasal 21.2.2"
  },
  {
    "id": "term-shear-wall",
    "term": "Dinding Geser (Shear Wall / Core Wall)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Elemen struktural beton bertulang vertikal berkekakuan lentur dan geser masif yang dirancang untuk memikul gaya lateral gempa dan angin pada bangunan tinggi.",
    "conceptualExplanation": "Subsistem penahan gaya lateral utama pada gedung bertingkat menengah hingga tinggi. Keberadaan dinding geser mereduksi deformasi lentur portal rangka secara signifikan, sehingga mengontrol simpangan lateral dan memproteksi komponen non-struktural fasad dan partisi.",
    "relatedElementIds": [
      "elem-dinding-geser",
      "load-gempa",
      "load-angin"
    ],
    "standardClause": "SNI 2847:2019 Pasal 18.10"
  },
  {
    "id": "term-boundary-element",
    "term": "Boundary Element (Elemen Pembatas Ujung)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Zona perkuatan khusus pada tepi ujung penampang dinding geser yang diberi sengkang pengekang tertutup rapat untuk menahan tegangan tekan batas lentur tinggi.",
    "conceptualExplanation": "Daerah pengekangan lokal pada ujung kritis dinding geser struktural. Saat dinding menerima momen guling gempa, serat terluar mengalami kombinasi tegangan tekan aksial dan lentur ekstrem yang memerlukan kekangan sengkang seismik guna mencegah spalling beton dan tekuk tulangan longitudinal.",
    "relatedElementIds": [
      "elem-dinding-geser"
    ],
    "standardClause": "SNI 2847:2019 Pasal 18.10.6"
  },
  {
    "id": "term-interstory-drift",
    "term": "Simpangan Antar-Lantai (Inter-story Drift)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Selisih perpindahan lateral antara dua tingkat berdekatan akibat respons gempa. Batas Δa bergantung kategori risiko, sistem dan kondisi struktur pada SNI 1726:2019 Tabel 20; 2% tidak berlaku universal.",
    "conceptualExplanation": "Simpangan desain memperhitungkan amplifikasi perpindahan yang disyaratkan, termasuk Cd/Ie pada metode yang relevan. Pemeriksaan drift membatasi kerusakan dan membantu penilaian stabilitas P-Delta; batas untuk bangunan tertentu dapat lebih ketat dari 0.020hsx.",
    "relatedElementIds": [
      "elem-dinding-geser",
      "elem-kolom",
      "load-gempa"
    ],
    "standardClause": "SNI 1726:2019 Pasal 7.8.6 dan Tabel 20"
  },
  {
    "id": "term-soft-story",
    "term": "Tingkat Lunak (Soft-Story Irregularity)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Ketidakteraturan tingkat lunak: kekakuan lateral suatu tingkat kurang dari 70% tingkat di atasnya, atau kurang dari 80% rata-rata kekakuan tiga tingkat di atasnya.",
    "conceptualExplanation": "Kerentanan seismik yang sering terjadi pada gedung dengan lantai dasar terbuka (open-ground floor atau pilotis) untuk area komersial/parkir tanpa dinding pengisi. Konsentrasi perpindahan inelastis terakumulasi pada kolom lantai dasar, memicu mekanisme keruntuhan tingkat.",
    "relatedElementIds": [
      "elem-kolom",
      "load-gempa"
    ],
    "standardClause": "SNI 1726:2019 Tabel 14 (Ketidakberaturan Vertikal)"
  },
  {
    "id": "term-mwfrs",
    "term": "MWFRS (Main Wind Force Resisting System)",
    "category": "beban_gedung",
    "academicDefinition": "Kumpulan elemen struktural utama yang bekerja sama secara terpadu untuk menyalurkan seluruh beban angin yang bekerja pada gedung menuju ke pondasi.",
    "conceptualExplanation": "Sistem penahan beban angin primer gedung. Berbeda dengan komponen sekunder dan kelongsong (components and cladding) yang menahan tekanan angin lokal, MWFRS memikul gaya aerodinamika global total dari keseluruhan amplop bangunan.",
    "relatedElementIds": [
      "load-angin",
      "elem-kolom",
      "elem-pelat-lantai"
    ],
    "standardClause": "SNI 1727:2020 Bab 27 & 28"
  },
  {
    "id": "term-vortex-shedding",
    "term": "Pelepasan Pusaran Angin (Vortex Shedding)",
    "category": "beban_gedung",
    "academicDefinition": "Fenomena fluida dinamis di mana aliran angin di sekeliling gedung tinggi membentuk pusaran pusaran udara bolak-balik yang menimbulkan gaya getar tegak lurus arah angin.",
    "conceptualExplanation": "Ketidakstabilan aerodinamika pada bangunan langsing (tall slender buildings). Pelepasan pusaran vortex secara periodik dapat menimbulkan gaya eksitasi lintas-angin (across-wind excitation); jika frekuensi pusaran selaras dengan frekuensi alami gedung, dapat terjadi resonansi dinamis yang signifikan.",
    "relatedElementIds": [
      "load-angin"
    ],
    "standardClause": "SNI 1727:2020 Bab 31"
  },
  {
    "id": "term-lrfd",
    "term": "LRFD (Desain Faktor Beban dan Ketahanan)",
    "category": "beban_gedung",
    "symbol": "qu",
    "unit": "kN/m²",
    "academicDefinition": "Metode desain batas terfaktor di mana beban nominal dikalikan dengan faktor beban (load factors) untuk memastikan margin keamanan memadai terhadap variabilitas beban mati dan hidup.",
    "conceptualExplanation": "LRFD adalah metode desain yang membandingkan efek beban terfaktor dengan kuat rencana. Kombinasi 1.2D + 1.6L merupakan salah satu contoh kombinasi gravitasi dalam SNI 1727:2020, bukan rumus universal untuk semua kondisi; kombinasi yang dipakai bergantung pada beban dan keadaan yang diperiksa.",
    "relatedElementIds": [
      "load-gravitasi",
      "elem-pelat-lantai",
      "elem-balok",
      "elem-kolom"
    ],
    "standardClause": "SNI 1727:2020 Pasal 2.3.2 & SNI 2847:2019 Pasal 5.3"
  },
  {
    "id": "term-occupant-load",
    "term": "Beban Orang dan Beban Hidup Minimum",
    "category": "beban_gedung",
    "symbol": "qL,org",
    "unit": "kN/m²",
    "academicDefinition": "Beban gravitasi orang per luas lantai diperkirakan qorang = N·m·g/(1000A), dengan massa m sebagai asumsi simulasi, bukan standar nasional 70 kg/orang.",
    "conceptualExplanation": "Beban hidup kantor 2.4 kN/m² adalah minimum desain, bukan kapasitas izin penghuni. Untuk contoh A = 192 m², m = 70 kg dan beban bergerak asumsi 1 kN/m², 391 orang hanya merupakan kesetaraan aritmetika sekitar 2.4 kN/m². Allowance partisi SNI 1727:2020 Pasal 4.3.2 belum dievaluasi pada skenario ini. Beban terpusat, pola kerumunan, kemampuan struktur dan jalur evakuasi menentukan penilaian okupansi terpisah.",
    "relatedElementIds": [
      "load-gravitasi",
      "elem-pelat-lantai"
    ],
    "standardClause": "SNI 1727:2020 Tabel 4.3-1"
  },
  {
    "id": "term-base-shear",
    "term": "Contoh Gaya Geser Dasar dengan Metode ELF",
    "category": "rekayasa_gempa",
    "symbol": "V",
    "unit": "kN",
    "academicDefinition": "Dalam metode gaya lateral ekivalen (Equivalent Lateral Force/ELF), gaya geser dasar rencana dihitung sebagai V = Cs·W, dengan Cs koefisien respons seismik dan W berat seismik efektif.",
    "conceptualExplanation": "Ini adalah cara menghitung V untuk metode ELF, bukan definisi umum satu-satunya bagi gaya geser dasar. Distribusi gaya ke tingkat dan pemeriksaan struktur mengikuti ketentuan analisis yang digunakan.",
    "relatedElementIds": [
      "load-gempa",
      "elem-dinding-geser",
      "elem-kolom",
      "elem-pondasi"
    ],
    "standardClause": "SNI 1726:2019 Pasal 7.8.1"
  },
  {
    "id": "term-at-rest-pressure",
    "aliases": ["p0 tanah", "P0 tanah", "tekanan tanah diam"],
    "term": "Tekanan Tanah Diam (p₀)",
    "category": "geoteknik_pondasi",
    "symbol": "p₀ = K₀σ′ᵥ",
    "unit": "kPa",
    "academicDefinition": "Tekanan tanah lateral efektif pada kondisi diam, yaitu keadaan tanpa regangan lateral tanah; dalam model sederhana nilainya p₀ = K₀σ′ᵥ, dengan K₀ koefisien tekanan tanah diam dan σ′ᵥ tegangan vertikal efektif.",
    "conceptualExplanation": "K₀ adalah koefisien tak berdimensi, sedangkan p₀ adalah tekanan yang memiliki satuan. Untuk tanah normally consolidated, pendekatan Jaky K₀ ≈ 1−sinϕ dapat digunakan dengan asumsi yang sesuai. OCR, sejarah tegangan dan pemadatan dapat mengubah K₀. Nilai tekanan total juga perlu memasukkan tekanan air pori bila ada.",
    "relatedElementIds": [
      "load-tekanan-tanah",
      "elem-dinding-basement"
    ],
    "standardClause": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
  },
  {
    "id": "term-pile-cap",
    "term": "Pile Cap (Kepala Tiang Pondasi)",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Blok beton bertulang yang mengikat kepala kelompok tiang dan menyalurkan beban aksial, momen dan geser kolom. Beban tiang tidak selalu merata; momen menyebabkan tiang menerima beban berbeda.",
    "conceptualExplanation": "Elemen transfer struktural masif yang dirancang menggunakan model strut-and-tie atau metode lentur-geser dua arah (punching shear), memastikan gaya aksial dan momen lentur dari kolom disalurkan secara terukur ke konfigurasi kelompok tiang pondasi.",
    "relatedElementIds": [
      "elem-pondasi",
      "elem-kolom"
    ],
    "standardClause": "SNI 2847:2019 Pasal 13.4"
  },
  {
    "id": "term-differential-settlement",
    "term": "Penurunan Diferensial (Differential Settlement)",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Perbedaan penurunan vertikal antara satu titik pondasi dengan pondasi di sebelahnya yang menimbulkan tegangan sekunder tinggi pada balok dan kolom di atasnya.",
    "conceptualExplanation": "Disparitas deformasi tanah vertikal antar-titik pondasi yang umumnya diakibatkan oleh stratigrafi tanah yang bervariasi atau beban kolom yang tidak seimbang. Penurunan diferensial menimbulkan distorsi sudut (angular distortion) yang berisiko memicu keretakan struktural dan kegagalan fungsional arsitektural.",
    "relatedElementIds": [
      "elem-pondasi"
    ],
    "standardClause": "SNI 8460:2017 Pasal 9.2.4 (Penurunan)"
  },
  {
    "id": "term-end-skin",
    "term": "End Bearing vs Skin Friction Tiang",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Tahanan ujung berasal dari tanah atau batuan di bawah ujung tiang, sedangkan tahanan selimut berasal dari interaksi geser antara badan tiang dan lapisan sekelilingnya.",
    "conceptualExplanation": "Keduanya bergantung stratigrafi, konstruksi dan perpindahan yang diperlukan untuk mobilisasi. Ujung tiang dapat bertumpu pada tanah padat/kaku, tidak harus batuan. Gesekan negatif akibat penurunan tanah memberi tambahan demand dan harus ditinjau terpisah.",
    "relatedElementIds": [
      "elem-pondasi"
    ],
    "standardClause": "SNI 8460:2017 Pasal 9.7.1"
  },
  {
    "id": "term-tegangan-efektif",
    "term": "Tegangan Efektif Tanah (Effective Stress σ')",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Tegangan yang diteruskan melalui titik-titik kontak antar butiran partikel tanah (σ' = σ - u), yang mengontrol kuat geser dan penurunan tanah.",
    "conceptualExplanation": "Prinsip dasar mekanika tanah Terzaghi. Peningkatan tekanan air pori (u) akibat kenaikan muka air tanah atau gempa mereduksi tegangan efektif (σ'), yang secara langsung menurunkan kuat geser tanah dan dapat memicu penurunan kapasitas daya dukung pondasi atau fenomena likuifaksi.",
    "relatedElementIds": [
      "elem-dinding-basement",
      "load-tekanan-tanah",
      "load-tekanan-air"
    ],
    "standardClause": "SNI 8460:2017; prinsip tegangan efektif dan tekanan lateral Bab 11"
  },
  {
    "id": "term-surcharge",
    "term": "Beban Surcharge (q)",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Beban tambahan di atas permukaan tanah di belakang dinding penahan (seperti lalu lintas jalan raya, gedung tetangga, atau tumpukan material proyek).",
    "conceptualExplanation": "Untuk idealisasi surcharge q yang merata dan cukup luas, tambahan tekanan lateral Δσh = K · q dianggap konstan terhadap kedalaman; resultannya K · q · H bekerja di H/2. Beban strip, garis, titik, atau bangunan tetangga yang terbatas tidak otomatis mengikuti distribusi ini: posisi, luas, dan penyebaran tegangan harus diperhitungkan dengan metode yang sesuai.",
    "relatedElementIds": [
      "elem-dinding-basement",
      "load-tekanan-tanah"
    ],
    "standardClause": "SNI 8460:2017 Pasal 11.4.1–11.4.2"
  },
  {
    "id": "term-flotation",
    "term": "Bahaya Pengapungan / Flotasi (Buoyancy Failure)",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Kondisi kegagalan batas di mana gaya angkat apung air tanah ke atas (uplift) lebih besar daripada berat mati total gedung terpasang, menyebabkan bangunan terangkat.",
    "conceptualExplanation": "Analisis stabilitas struktur basemen terhadap muka air tanah tertinggi. Pada kondisi basemen dalam dengan struktur atas bertingkat rendah, berat mandiri struktur tidak mencukupi untuk melawan gaya angkat Archimedes, sehingga dibutuhkan sistem angkur penahan tarik (tension piles atau ground anchors).",
    "relatedElementIds": [
      "load-tekanan-air",
      "elem-dinding-basement",
      "elem-pondasi"
    ],
    "standardClause": "SNI 8460:2017 Pasal 9.3.3–9.3.4"
  },
  {
    "id": "term-waterstop",
    "term": "Waterstop & Integral Waterproofing",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Waterstop adalah pita PVC/karet atau sistem hidrofilik pada sambungan beton untuk membatasi rembesan. Integral waterproofing adalah bahan/cara memperbaiki kedap air massa beton; keduanya memiliki fungsi berbeda.",
    "conceptualExplanation": "Pemilihan waterstop mengikuti tipe sambungan, gerakan, tekanan air dan rincian pemasangan. Integral waterproofing tidak menggantikan pengendalian retak, curing, mutu pengecoran dan perlindungan sambungan; istilah cold joint menunjukkan sambungan yang tidak terencana/bermasalah, bukan semua construction joint.",
    "relatedElementIds": [
      "elem-dinding-basement",
      "load-tekanan-air"
    ],
    "standardClause": "Detail kedap air dan sambungan sesuai rancangan; SNI 8460:2017 ketentuan struktur bawah tanah"
  },
  {
    "id": "term-mat",
    "term": "Muka Air Tanah (MAT)",
    "symbol": "MAT",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Elevasi permukaan air tanah di bawah permukaan tanah pada kondisi pengukuran atau kondisi rencana tertentu.",
    "conceptualExplanation": "Elevasi MAT dapat berubah menurut musim, drainase, pemompaan dan kondisi lokasi. Untuk basement dan pondasi, gunakan muka air rencana yang relevan; tekanan air dihitung terpisah dari tekanan efektif tanah.",
    "relatedElementIds": ["elem-dinding-basement", "elem-pondasi", "load-tekanan-air"]
  },
  {
    "id": "term-elf",
    "term": "Metode Gaya Lateral Ekivalen (ELF)",
    "symbol": "ELF",
    "category": "rekayasa_gempa",
    "academicDefinition": "Metode analisis seismik yang merepresentasikan pengaruh gempa dengan gaya lateral statik ekivalen yang didistribusikan ke tingkat bangunan.",
    "conceptualExplanation": "ELF adalah singkatan Equivalent Lateral Force. Penerapannya memiliki syarat dan batas menurut standar; gaya geser dasar pada metode ini dihitung dari koefisien respons seismik dan berat seismik efektif.",
    "relatedElementIds": ["load-gempa", "elem-kolom", "elem-dinding-geser"]
  },
  {
    "id": "term-sds",
    "term": "Percepatan Spektral Desain Periode Pendek (SDS)",
    "symbol": "SDS",
    "category": "rekayasa_gempa",
    "academicDefinition": "Parameter percepatan spektral desain pada rentang periode pendek yang digunakan dalam penentuan respons seismik desain.",
    "conceptualExplanation": "SDS merupakan parameter spektrum desain yang dipengaruhi bahaya gempa dan kondisi situs. Nilai ini bukan percepatan puncak tanah (PGA) dan digunakan bersama parameter spektrum serta faktor sistem struktur yang relevan.",
    "unit": "g",
    "relatedElementIds": ["load-gempa"]
  },
  {
    "id": "term-pdelta",
    "term": "Efek P-Delta",
    "symbol": "P–Δ",
    "category": "struktur_beton",
    "academicDefinition": "Efek orde kedua ketika gaya aksial P bekerja melalui perpindahan lateral Δ sehingga menambah momen pada elemen atau tingkat struktur.",
    "conceptualExplanation": "Efek P-Delta dapat memperbesar momen dan simpangan. Besarnya perlu dievaluasi sesuai model, tingkat beban, kekakuan dan ketentuan desain; istilah ini tidak berarti kapasitas kolom dapat ditentukan hanya dari rumus Euler.",
    "relatedElementIds": ["elem-kolom", "load-gravitasi", "load-gempa"]
  },
  {
    "id": "term-ocr",
    "term": "Rasio Overconsolidation (OCR)",
    "symbol": "OCR",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Perbandingan tekanan prakonsolidasi maksimum yang pernah dialami tanah terhadap tegangan vertikal efektif saat ini.",
    "conceptualExplanation": "OCR ≈ 1 menunjukkan tanah normally consolidated (belum pernah mengalami tegangan efektif lebih besar), sedangkan OCR > 1 menunjukkan tanah overconsolidated. Sejarah tegangan dapat memengaruhi kekuatan, penurunan dan koefisien tekanan tanah diam K₀.",
    "unit": "-",
    "relatedElementIds": ["elem-dinding-basement", "load-tekanan-tanah"]
  },
  {
    "id": "term-liquefaction",
    "term": "Likuifaksi",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Kehilangan sebagian besar kuat dan kekakuan tanah jenuh lepas akibat kenaikan tekanan air pori selama pembebanan siklik, umumnya akibat gempa.",
    "conceptualExplanation": "Potensi dan dampaknya bergantung pada jenis tanah, kepadatan, tegangan, muka air dan gerakan gempa. Evaluasi dapat mencakup penurunan, penyebaran lateral serta perubahan kapasitas pondasi; tanah berpasir jenuh saja tidak cukup untuk menyimpulkan terjadi likuifaksi.",
    "relatedElementIds": ["elem-pondasi", "load-gempa"]
  },
  {
    "id": "term-mononobe-okabe",
    "term": "Metode Mononobe–Okabe",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Perluasan pendekatan baji Coulomb untuk memperkirakan tekanan tanah lateral seismik pada dinding penahan yang dapat bergerak hingga kondisi aktif.",
    "conceptualExplanation": "Metode ini bergantung pada asumsi geometri, kondisi tanah, percepatan gempa dan gerakan dinding. Dinding basement yang terkekang dapat memerlukan metode lain atau analisis interaksi tanah–struktur.",
    "relatedElementIds": ["elem-dinding-basement", "load-tekanan-tanah"]
  },
  {
    "id": "term-pit-pile",
    "term": "PIT (Pile Integrity Test / Uji Integritas Tiang)",
    "symbol": "PIT",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Uji dinamik regangan rendah yang menggunakan respons gelombang pada tiang untuk menilai indikasi panjang dan integritas struktural tiang.",
    "conceptualExplanation": "PIT membantu mendeteksi indikasi perubahan penampang atau cacat, tetapi tidak secara langsung memberikan kapasitas dukung seperti uji beban. Hasilnya perlu ditafsirkan bersama data konstruksi dan kondisi tiang.",
    "relatedElementIds": ["elem-pondasi"]
  },
  {
    "id": "term-pda-pile",
    "term": "PDA (Pile Driving Analyzer / Uji Dinamik Regangan Tinggi)",
    "symbol": "PDA",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Pengujian tiang dengan sensor regangan dan percepatan saat tumbukan untuk mengukur respons dinamik dan memperkirakan kapasitas melalui analisis yang sesuai.",
    "conceptualExplanation": "PDA adalah uji dinamik, bukan uji beban statis. Interpretasi kapasitas bergantung pada kualitas data, kondisi pengujian dan metode analisis; kebutuhan verifikasi ditentukan oleh rancangan pengujian proyek.",
    "relatedElementIds": ["elem-pondasi"]
  },
  {
    "id": "term-strut-and-tie",
    "term": "Model Strut-and-Tie (Strut dan Tie)",
    "category": "struktur_beton",
    "academicDefinition": "Model idealisasi aliran gaya pada daerah diskontinuitas beton sebagai batang tekan (strut), batang tarik (tie) dan nodal zone.",
    "conceptualExplanation": "Model ini digunakan untuk menelusuri jalur gaya pada daerah seperti pile cap, konsol dan pertemuan elemen. Kapasitas strut, tie, nodal zone, penyaluran dan detailing harus diperiksa sesuai ketentuan desain.",
    "relatedElementIds": ["elem-pondasi", "elem-balok", "elem-kolom"]
  },
  {
    "id": "term-mce-performance",
    "term": "Gempa Maksimum yang Dipertimbangkan (Maximum Considered Earthquake/MCE) dan Sasaran Kinerja LS/CP",
    "symbol": "MCE; LS; CP",
    "category": "rekayasa_gempa",
    "academicDefinition": "MCE (Maximum Considered Earthquake/gempa maksimum yang dipertimbangkan) adalah tingkat gerakan gempa maksimum menurut standar terkait. LS (Life Safety/keselamatan jiwa) dan CP (Collapse Prevention/pencegahan keruntuhan) adalah sasaran kinerja yang membatasi tingkat kerusakan dan risiko keruntuhan.",
    "conceptualExplanation": "Makna dan definisi gerakan MCE bergantung pada standar yang digunakan. Sasaran LS membatasi ancaman terhadap jiwa meski kerusakan dapat terjadi; CP mengizinkan kerusakan lebih berat dengan tujuan mempertahankan kestabilan global dan mencegah keruntuhan. Istilah ini tidak berarti bangunan tetap tanpa kerusakan.",
    "relatedElementIds": ["load-gempa", "elem-kolom", "elem-balok", "elem-dinding-geser"]
  },
  {
    "id": "term-sd1",
    "term": "Percepatan Spektral Desain Periode 1 Detik (SD1)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Parameter percepatan spektral desain pada periode satu detik, yang mempertimbangkan bahaya gempa dan kondisi situs.",
    "conceptualExplanation": "SD1 bersama periode T menentukan bagian spektrum periode lebih panjang dan batas koefisien Cs. Nilai ini tidak sama dengan S1: S1 adalah parameter bahaya sebelum penyesuaian situs dan pembentukan spektrum desain.",
    "unit": "g",
    "relatedElementIds": [
      "load-gempa"
    ],
    "symbol": "SD1"
  },
  {
    "id": "term-s1",
    "term": "Percepatan Spektral Terpetakan Periode 1 Detik (S1)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Parameter percepatan spektral bahaya gempa terpetakan pada periode satu detik, sebelum penyesuaian pengaruh situs untuk spektrum desain.",
    "conceptualExplanation": "Dalam contoh ELF, S1 ≥ 0,6 memicu pemeriksaan batas minimum tambahan Cs = 0,5 S1/(R/Ie). Ambang ini tidak menggantikan batas lain maupun persyaratan pemilihan metode analisis.",
    "unit": "g",
    "relatedElementIds": [
      "load-gempa"
    ],
    "symbol": "S1"
  },
  {
    "id": "term-tl",
    "term": "Periode Transisi Panjang (TL)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Periode transisi panjang yang menentukan perubahan bentuk cabang periode panjang spektrum respons desain.",
    "conceptualExplanation": "Pada batas atas Cs metode ELF, T ≤ TL memakai SD1/[T(R/Ie)]; T > TL memakai SD1 TL/[T²(R/Ie)]. TL adalah parameter lokasi, bukan periode alami gedung T.",
    "unit": "s",
    "relatedElementIds": [
      "load-gempa"
    ],
    "symbol": "TL"
  },
  {
    "id": "term-ie",
    "term": "Faktor Keutamaan Gempa (Ie)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Faktor terkait kategori risiko bangunan yang digunakan dalam penentuan pengaruh gempa desain dan pemeriksaan terkait.",
    "conceptualExplanation": "Ie tidak dipilih agar gaya menjadi kecil. Nilainya mengikuti fungsi dan kategori risiko bangunan; contoh proyek memakai Ie = 1,0 untuk kategori risiko II.",
    "unit": "-",
    "relatedElementIds": [
      "load-gempa"
    ],
    "symbol": "Ie"
  },
  {
    "id": "term-cd",
    "term": "Faktor Pembesaran Defleksi (Cd)",
    "category": "rekayasa_gempa",
    "academicDefinition": "Faktor sistem struktur untuk memperkirakan simpangan desain inelastis dari simpangan hasil analisis elastis akibat gaya gempa desain.",
    "conceptualExplanation": "Dalam pemeriksaan simpangan yang relevan, δ = Cd δe/Ie. Cd berbeda dari R: Cd berhubungan dengan simpangan, sedangkan R memodifikasi gaya desain. Pemeriksaan drift tetap mempertimbangkan batas dan ketentuan metode analisis.",
    "unit": "-",
    "relatedElementIds": [
      "load-gempa",
      "elem-kolom",
      "elem-dinding-geser"
    ],
    "symbol": "Cd"
  },
  {
    "id": "term-tributary-area",
    "term": "Area Tributari",
    "category": "beban_gedung",
    "academicDefinition": "Luas daerah lantai atau atap yang bebannya dialokasikan ke suatu elemen penumpu menurut idealisasi jalur beban.",
    "conceptualExplanation": "Beban permukaan q dikalikan area tributari A menghasilkan gaya qA. Penentuan area mengikuti arah bentang, susunan penumpu dan model distribusi; pembagian geometris sederhana tidak berlaku untuk semua sistem pelat.",
    "unit": "m²",
    "relatedElementIds": [
      "load-gravitasi",
      "elem-pelat-lantai",
      "elem-balok",
      "elem-kolom"
    ],
    "symbol": "Atrib",
    "aliases": [
      "tributary area",
      "luas tributari"
    ]
  },
  {
    "id": "term-load-path",
    "term": "Jalur Beban",
    "category": "beban_gedung",
    "academicDefinition": "Rangkaian hubungan penyaluran gaya dari tempat beban bekerja melalui elemen struktur sampai pondasi dan tanah.",
    "conceptualExplanation": "Jalur dapat bercabang: pelat dapat menyalurkan gaya ke beberapa balok, kolom atau dinding. Diagram pembelajaran bukan urutan tunggal semua elemen; sambungan, kompatibilitas dan keseimbangan diperlukan agar jalur tetap kontinu.",
    "unit": "-",
    "relatedElementIds": [
      "load-gravitasi",
      "load-angin",
      "load-gempa",
      "elem-pondasi"
    ],
    "aliases": [
      "load path",
      "alur beban"
    ]
  },
  {
    "id": "sym-friction-angle",
    "term": "Sudut Geser Dalam Tanah (ϕ)",
    "category": "geoteknik_pondasi",
    "academicDefinition": "Parameter sudut dalam kriteria kuat geser tanah yang mewakili kontribusi friksi pada tegangan efektif.",
    "conceptualExplanation": "Pada contoh tanah nonkohesif, ϕ digunakan dalam Ka Rankine dan perkiraan K0 Jaky dengan asumsi masing-masing. Simbol ϕ untuk sudut tanah berbeda fungsi dari faktor reduksi kekuatan beton φ; jangan memasukkan nilai faktor reduksi ke rumus tekanan tanah.",
    "unit": "°",
    "relatedElementIds": [
      "load-tekanan-tanah",
      "elem-dinding-basement"
    ],
    "symbol": "ϕ",
    "aliases": [
      "varphi",
      "phi tanah",
      "phi geser",
      "fi tanah"
    ]
  }
];

export const glossaryByCategory = {
  simbol_rumus: civilGlossaryData.filter((t) => t.category === "simbol_rumus"),
  struktur_beton: civilGlossaryData.filter((t) => t.category === "struktur_beton"),
  rekayasa_gempa: civilGlossaryData.filter((t) => t.category === "rekayasa_gempa"),
  geoteknik_pondasi: civilGlossaryData.filter((t) => t.category === "geoteknik_pondasi"),
  beban_gedung: civilGlossaryData.filter((t) => t.category === "beban_gedung")
};

export const glossaryByElementId = (elementId: string): CivilGlossaryTerm[] => {
  return civilGlossaryData.filter((t) => t.relatedElementIds.includes(elementId));
};
