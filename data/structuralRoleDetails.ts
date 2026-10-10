export interface CivilStructuralRoleDeepDive {
  fullTitle: string;
  primaryRoleSummary: string;
  coreFunctions: string[];
  criticalImportance: string;
  extremeEventResponse: string;
  fieldBestPractices: string[];
  conceptualAnalogy: string;
}

export const structuralRoleDeepDives: Record<string, CivilStructuralRoleDeepDive> = {
  "elem-balok": {
    "fullTitle": "Anatomi, Peran Mekanis, dan Filosofi Perancangan Balok Beton Bertulang",
    "primaryRoleSummary": "Balok (beam) adalah elemen struktur lentur horizontal yang bertugas mengumpulkan beban gravitasi dari pelat lantai (baik beban mati maupun beban hidup) dan menyalurkannya sebagai gaya geser serta momen lentur ke kolom-kolom penyangga di kedua ujungnya.",
    "coreFunctions": [
      "Menerima beban gravitasi dari pelat lantai (distribusi trapesium atau segitiga) dan memikulnya melalui aksi lentur penampang.",
      "Menyalurkan gaya geser melintang vertikal dan momen lentur ke kolom melalui sambungan balok-kolom yang kaku.",
      "Mengikat kolom-kolom vertikal membentuk portal rangka pemikul momen (moment frame) yang membatasi deformasi lateral bangunan.",
      "Menjadi lokasi pembentukan sendi plastis (plastic hinge) terencana pada Sistem Rangka Pemikul Momen Khusus (SRPMK) untuk mendisipasi energi gempa secara daktail."
    ],
    "criticalImportance": "Balok harus memenuhi syarat kekuatan, lendutan, retak, dan detail penulangan. Hierarki kolom kuat–balok lemah diperiksa dengan membandingkan jumlah kapasitas momen kolom dan balok pada sambungan balok-kolom, dengan memperhitungkan gaya aksial yang relevan. Pemenuhan syarat tersebut mengurangi risiko mekanisme tingkat, tetapi tidak menjamin bebas keruntuhan pada semua kondisi.",
    "extremeEventResponse": "Saat pembebanan siklik gempa kuat, sendi plastis terbentuk pada daerah ujung balok di dekat muka kolom. Baja tulangan tarik mengalami pelelehan bertahap bolak-balik dalam kondisi stabil tanpa kehancuran getas beton inti berkat pengekangan sengkang rapat. Aksi ini mendisipasi energi kinetik seismik melalui deformasi histeretik inelastis.",
    "fieldBestPractices": [
      "Pada zona ujung balok SRPMK (Sistem Rangka Pemikul Momen Khusus) sepanjang 2h, ketentuan detail penulangan membatasi jarak sengkang tertutup oleh min(d/4, 6db tulangan longitudinal terkecil, 150 mm). Periksa seluruh syarat sengkang dan posisi sengkang pertama dari muka tumpuan menurut standar yang berlaku.",
      "Kait gempa lazimnya 135° dengan ekor ≥ max(6db,75 mm) ke inti terkekang; db di sini adalah diameter batang pembentuk kait. Ada kondisi khusus yang perlu dirujuk pada standar.",
      "Sambungan lewatan tulangan lentur dilarang pada sambungan balok-kolom, dalam jarak 2h dari muka sambungan, dan di zona yang diperkirakan mengalami leleh akibat perpindahan inelastis. Sediakan pengekangan yang dipersyaratkan pada zona sambungan yang diizinkan."
    ],
    "conceptualAnalogy": "Mekanisme balok menyerupai gelagar jembatan menerus (continuous girder): mentransfer momen lentur negatif pada tumpuan dan momen lentur positif pada bentang lapangan, sekaligus bertindak sebagai pengikat horizontal (tie girder) antar-kolom yang mempertahankan keselarasan geometris portal struktur."
  },
  "elem-kolom": {
    "fullTitle": "Fungsi Primer, Filosofi Kestabilan, dan Desain Kapasitas Kolom Gedung",
    "primaryRoleSummary": "Kolom adalah elemen struktur tekan vertikal utama yang menanggung akumulasi seluruh beban mati dan hidup dari tiap lantai di atasnya dan menyalurkannya langsung ke pondasi.",
    "coreFunctions": [
      "Menopang seluruh beban aksial tekan gravitasi kumulatif dari atap hingga lantai basemen.",
      "Menahan momen lentur dwisumbu (biaxial bending) yang timbul akibat goyangan gempa dan tiupan angin kencang.",
      "Menjaga kestabilan geometris vertikal bangunan dan mencegah fenomena tekuk (buckling) pada gedung bertingkat.",
      "Mengurangi risiko mekanisme keruntuhan tingkat lunak melalui penerapan prinsip kolom kuat–balok lemah."
    ],
    "criticalImportance": "Keruntuhan satu kolom interior yang kritis dapat memicu keruntuhan berantai, ketika lantai-lantai di atasnya runtuh menimpa lantai di bawahnya. Karena itu, desain kapasitas mengatur agar kolom memiliki kapasitas lentur dan geser yang memadai dibandingkan balok.",
    "extremeEventResponse": "Desain kapasitas mengupayakan sendi plastis dominan pada balok dan menjaga kemampuan kolom memikul beban aksial. Pelelehan kolom tetap dapat terjadi pada lokasi tertentu, seperti dasar; analisis dan detail penulangan diperlukan, bukan asumsi bahwa semua kolom pasti elastis sampai seluruh balok leleh.",
    "fieldBestPractices": [
      "Kolom Sistem Rangka Pemikul Momen Khusus (SRPMK) memiliki rasio tulangan longitudinal 1%–6%. Pilih susunan yang memenuhi kapasitas, jarak bersih, penyaluran dan kemudahan pengecoran; rentang praktis bukan batas normatif tambahan.",
      "Panjang zona pengekangan lo pada ketentuan detail kolom khusus sekurangnya max(Lu/6, dimensi terbesar penampang, 450 mm). Syarat jarak dan luas tulangan transversal diperiksa tersendiri; rujuk ketentuan SNI/ACI yang dipakai.",
      "Gunakan pemadatan dan metode pengecoran yang sesuai untuk mencegah rongga sarang lebah pada beton, pemisahan campuran, dan pergeseran tulangan."
    ],
    "conceptualAnalogy": "Kolom menjadi penopang utama beban vertikal pada rangka gedung bertingkat. Jika satu kolom kritis kehilangan kestabilan, beban dapat berpindah tiba-tiba ke elemen di sekitarnya dan memicu keruntuhan berantai pada bagian struktur di atasnya."
  },
  "elem-dinding-geser": {
    "fullTitle": "Peran Kekakuan Lateral, Pengendalian Drift, dan Mitigasi Gempa Dinding Geser",
    "primaryRoleSummary": "Dinding geser (shear wall) adalah dinding beton bertulang masif yang menyediakan kekakuan lateral utama terhadap gaya gempa dan angin badai pada gedung tinggi.",
    "coreFunctions": [
      "Memikul bagian gaya lateral berdasarkan kekakuan, konfigurasi dan respons sistem; pada sistem ganda, rangka momen harus mampu memikul sekurangnya 25% gaya seismik desain sesuai ketentuan, bukan pembagian tetap 70–85% ke dinding.",
      "Membatasi drift menurut kategori risiko, sistem dan syarat SNI 1726:2019 Tabel 20; batas 2% bukan nilai universal.",
      "Melindungi elemen arsitektural non-struktural (dinding partisi, fasad kaca, jalur mekanikal, elektrikal dan plambing (MEP)) dari distorsi geser berlebihan.",
      "Penempatan dinding mempertimbangkan eksentrisitas pusat massa–kekakuan dan efek torsi; penempatan simetris membantu tetapi tidak menghapus torsi aksidental atau ketidakberaturan."
    ],
    "criticalImportance": "Pada gedung bertingkat menengah hingga tinggi, sistem portal rangka saja memiliki fleksibilitas lateral yang relatif besar. Kehadiran dinding geser menyediakan kekakuan lentur dan geser bidang yang masif, mereduksi defleksi lateral secara drastis serta mempertahankan integritas struktural global.",
    "extremeEventResponse": "Dinding geser berperilaku sebagai balok kantilever vertikal masif. Momen guling dasar dipikul oleh kopel gaya aksial pada boundary element di kedua ujung dinding, sementara gaya geser horizontal ditransfer melalui jaringan tulangan geser penampang dan matriks beton.",
    "fieldBestPractices": [
      "Periksa kebutuhan satu/dua tirai dan rasio tulangan minimum horizontal–vertikal sesuai tingkat geser, geometri dan ketentuan dinding khusus. Contoh ini memakai dua tirai dan batas rasio 0.0025; jangan menjadikannya aturan universal untuk semua dinding.",
      "Kebutuhan elemen pembatas khusus diperiksa memakai jalur tegangan atau perpindahan yang berlaku; ambang tekan 0.20f'c adalah bagian salah satu prosedur, bukan satu-satunya syarat.",
      "Pastikan permukaan sambungan pengecoran beton dikasarkan untuk mengurangi risiko keruntuhan geser gelincir."
    ],
    "conceptualAnalogy": "Dinding geser berperilaku sebagai balok kantilever vertikal berdimensi masif (deep vertical cantilever) yang tertanam pada sistem pondasi. Struktur ini menyediakan kekakuan lateral tinggi untuk membatasi simpangan antar-lantai (drift), memproteksi kolom portal dari deformasi inelastis lateral yang berlebihan."
  },
  "elem-pelat-lantai": {
    "fullTitle": "Aksi Diafragma Horizontal, Penyaluran Gravitasi, dan Distribusi Seismik Pelat Lantai",
    "primaryRoleSummary": "Pelat lantai memikul aktivitas ruang dan menyalurkan gaya dalam bidang sebagai diafragma; pemodelan kaku, semi-kaku atau fleksibel bergantung kondisi struktur.",
    "coreFunctions": [
      "Memikul beban mati sendiri, lapisan finishing arsitektur, dan beban hidup hunian fungsional secara langsung di setiap lantai.",
      "Mendistribusikan beban gravitasi ke balok penumpu melalui aksi pelat satu arah atau pelat dua arah (metode distribusi amplop).",
      "Mengikat sistem vertikal melalui transfer gaya bidang diafragma; kelayakan asumsi kaku perlu diperiksa terhadap geometri, bukaan dan kekakuan bidang.",
      "Mendistribusikan gaya lateral dengan mempertimbangkan kekakuan sistem, deformasi diafragma serta translasi dan rotasi torsional."
    ],
    "criticalImportance": "Ketebalan dan pembesian pelat lantai yang tidak memadai dapat mengakibatkan lendutan jangka panjang yang melampaui batas kenyamanan lendutan izin, serta meningkatkan kerentanan terhadap keruntuhan geser pons (punching shear) pada pertemuan kolom.",
    "extremeEventResponse": "Di bidang horizontalnya, pelat lantai bekerja menahan tegangan geser diafragma dan gaya aksial tarik/tekan saat menyalurkan gaya inersia gempa menuju kolom dan dinding geser penahan beban lateral.",
    "fieldBestPractices": [
      "Tentukan tebal minimum dari sistem pelat, bentang, fy, rasio kekakuan balok–pelat dan kondisi tepi; tidak ada tebal universal 120–140 mm untuk semua pelat dua arah. Periksa juga kapasitas, retak dan lendutan.",
      "Gunakan spacer dengan selimut sesuai kelas paparan, diameter tulangan dan ketentuan perlindungan; selimut 20 mm bukan syarat universal semua pelat.",
      "Terapkan curing sejak awal untuk mengendalikan kehilangan air dan perkembangan kekuatan. Metode dan durasi mengikuti campuran, suhu serta spesifikasi; tujuh hari bukan durasi universal semua beton."
    ],
    "conceptualAnalogy": "Pelat menahan beban gravitasi melalui lentur transversal, sekaligus menyalurkan gaya lateral melalui aksi diafragma dalam bidang. Distribusi ke rangka dan dinding mengikuti model kekakuan serta efek torsi yang sesuai."
  },
  "elem-dinding-basement": {
    "fullTitle": "Ketahanan Tekanan Tanah Lateral, Tekanan Hidrostatis, dan Kedap Air Dinding Basemen",
    "primaryRoleSummary": "Dinding basemen adalah dinding penahan tanah bawah permukaan yang menahan tekanan lateral tanah dan rembesan air tanah.",
    "coreFunctions": [
      "Menahan dorongan lateral tanah aktif atau diam serta beban tambahan di permukaan tanah, seperti lalu lintas jalan.",
      "Menahan tekanan hidrostatis air pori tanah saat musim hujan atau muka air tanah naik.",
      "Menjadi dinding kedap air yang melindungi ruang parkir bawah tanah, ruang mesin mekanikal, elektrikal dan plambing (MEP), serta generator set (genset) dari banjir rembesan.",
      "Menyalurkan reaksi tumpuan horizontal ke pelat lantai dasar atas dan pelat pondasi rakit bawah."
    ],
    "criticalImportance": "Kegagalan penahan pada dinding basemen berisiko memicu ketidakstabilan lereng galian di sekitarnya, menimbulkan penurunan tanah pada badan jalan atau bangunan sekitar, serta menyebabkan kebocoran hidraulik masif pada ruang sub-struktur.",
    "extremeEventResponse": "Gempa menambah tekanan tanah dinamis. Metode Mononobe–Okabe mengasumsikan dinding dapat bergerak dan kondisi tanah tertentu; basemen yang terkekang dan tidak cukup bergerak untuk mencapai kondisi aktif memerlukan pendekatan interaksi tanah–struktur yang sesuai.",
    "fieldBestPractices": [
      "Rancang beton dan perlindungan kedap air menurut kelas paparan, tekanan air serta pengendalian retak. Nilai w/c maksimum ditetapkan dari ketentuan durabilitas yang berlaku, bukan universal 0.45.",
      "Pilih waterstop dan detail sambungan konstruksi/gerak sesuai tekanan air serta pergerakan; integral waterproofing bukan pengganti waterstop atau pengendalian retak.",
      "Drainase dapat mengurangi tekanan air bila keandalannya terjamin; tetap periksa kondisi tersumbat, pemeliharaan dan muka air rencana. Jangan menghilangkan tekanan air tanpa dasar operasi yang dapat dibuktikan."
    ],
    "conceptualAnalogy": "Dinding basemen merupakan bagian permanen dari struktur bawah yang menahan tanah. Dinding ini memikul resultan tekanan lateral tanah aktif atau diam dan tekanan hidrostatik air tanah, serta membantu menyalurkan gaya dari struktur atas ke sistem pondasi."
  },
  "elem-pondasi": {
    "fullTitle": "Kapasitas Geoteknik, Penyaluran Beban Akhir, dan Mitigasi Penurunan Pondasi",
    "primaryRoleSummary": "Pondasi menerima resultan struktur atas dan menyalurkannya ke lapisan tanah atau batuan pendukung dengan memenuhi kapasitas, penurunan dan kestabilan.",
    "coreFunctions": [
      "Menyalurkan kombinasi beban aksial vertikal, momen guling, dan gaya geser dasar gedung ke lapisan tanah pendukung.",
      "Membatasi penurunan total dan diferensial menurut sistem struktur, fungsi serta kondisi tanah; angka 25–50 mm bukan batas universal.",
      "Membatasi penurunan yang berbeda antarbagian pondasi (penurunan diferensial) agar tidak memicu perubahan bentuk dan retak miring pada struktur.",
      "Menahan gaya angkat air dan gaya lateral gempa pada dasar bangunan melalui kelompok tiang pancang."
    ],
    "criticalImportance": "Pondasi merupakan komponen sub-struktur kritis yang sulit diakses setelah konstruksi. Perbaikan, penguatan atau penggantian bagian pondasi dapat dilakukan dengan kajian geoteknik dan struktur serta metode pekerjaan khusus. Kegagalan kapasitas dukung tanah atau penurunan diferensial yang berlebihan dapat mengakibatkan kerusakan integritas struktural permanen pada seluruh elemen gedung di atasnya.",
    "extremeEventResponse": "Kelompok tiang pondasi mengalami kombinasi beban aksial siklik, gaya geser lateral, dan momen lentur di dekat kepala tiang. Pondasi juga perlu dirancang dengan mempertimbangkan risiko likuifaksi pada lapisan pasir jenuh.",
    "fieldBestPractices": [
      "Rencanakan investigasi geoteknik (bor, uji penetrasi standar (SPT), uji penetrasi kerucut (CPT) dan uji laboratorium) sampai kedalaman yang menjelaskan lapisan terpengaruh dan mekanisme dukung. Nilai N-SPT > 50 bukan syarat universal semua fondasi.",
      "Pile Integrity Test (PIT) menilai indikasi integritas tiang. Uji beban statis menilai respons beban–penurunan; Pile Driving Analyzer (PDA) adalah uji dinamik regangan tinggi untuk interpretasi kapasitas, bukan uji beban statis. Pilih program pengujian sesuai kondisi proyek.",
      "Desain kepala kelompok tiang (pile cap) mencakup lentur atau model batang tekan-tarik (strut-and-tie), geser satu atau dua arah, penyaluran tulangan, dan detail penulangan sesuai geometri serta posisi tiang. Momen kolom membuat beban tiap tiang berbeda."
    ],
    "conceptualAnalogy": "Pondasi menjadi antarmuka tanah–struktur, menyalurkan aksial, lateral dan momen ke lapisan pendukung. Kapasitas, penurunan, pengaruh kelompok serta kondisi konstruksi menentukan kelayakan; tidak semua pondasi harus mencapai batuan atau N-SPT tertentu."
  },
  "load-gravitasi": {
    "fullTitle": "Karakteristik Beban Mati, Beban Hidup, dan Filosofi Penyaluran Gravitasi",
    "primaryRoleSummary": "Beban gravitasi adalah beban vertikal ke bawah yang bekerja secara permanen (Dead Load) dan transien (Live Load) akibat percepatan gravitasi bumi.",
    "coreFunctions": [
      "Menentukan berat sendiri elemen struktural (beton bertulang = 24 kN/m³) dan lapisan arsitektur (spesi, keramik, plafon, MEP).",
      "Mengakomodasi beban fungsi ruangan (penghuni, mebel, arsip kantor, kendaraan parkir).",
      "Memicu akumulasi gaya aksial tekan vertikal yang membesar secara kumulatif dari lantai atas ke lantai bawah.",
      "Menjadi penstabil alami terhadap bahaya guling dan gaya angkat air."
    ],
    "criticalImportance": "Ketelitian estimasi beban mati material dan pembebanan hidup fungsional sangat menentukan keandalan struktur. Modifikasi fungsi ruang tanpa kajian ulang struktur (misal peralihan fungsi kantor menjadi ruang arsip padat) dapat memicu kelebihan beban yang mereduksi faktor keselamatan penampang.",
    "extremeEventResponse": "Meskipun bekerja statik searah gravitasi, beban aksial P yang bekerja melalui simpangan lateral Δ akibat gempa menimbulkan efek orde kedua P-Delta (P–Δ), yang menambah momen lentur pada kolom portal.",
    "fieldBestPractices": [
      "Gunakan kombinasi beban sesuai metode desain faktor beban dan ketahanan (LRFD) dalam SNI 1727:2020. Contohnya, 1.4D untuk kondisi beban mati saja dan 1.2D + 1.6L untuk salah satu kombinasi gravitasi; kombinasi yang berlaku bergantung pada semua beban dan kondisi yang diperiksa.",
      "Terapkan koefisien reduksi beban hidup kumulatif untuk elemen kolom dan pondasi multi-lantai sesuai ketentuan standar SNI."
    ],
    "conceptualAnalogy": "Beban gravitasi mengikuti jalur transfer beban terintegrasi (tributary load path): beban gravitasi pelat disalurkan bertahap ke balok anak, balok induk, dan kolom vertikal, kemudian terakumulasi secara bertingkat hingga diserap oleh pondasi dan strata tanah pendukung."
  },
  "load-angin": {
    "fullTitle": "Dinamika Tekanan Fasad, Efek Ketinggian, dan Respons Bangunan terhadap Angin",
    "primaryRoleSummary": "Beban angin adalah gaya lateral dinamis fluida udara yang menabrak fasad bangunan dan menghasilkan tekanan positif di sisi depan serta hisapan negatif di sisi belakang dan atap.",
    "coreFunctions": [
      "Memberikan tekanan dorong pada dinding yang menghadap arah datang angin.",
      "Menciptakan tekanan hisap pada dinding sisi belakang dan samping gedung.",
      "Menghasilkan gaya hisap ke atas pada permukaan atap datar.",
      "Memicu getaran harmonik melintang akibat pelepasan pusaran udara bolak-balik (vortex shedding) pada gedung tinggi langsing."
    ],
    "criticalImportance": "Pada gedung tinggi atau bangunan dengan atap bentang lebar, angin dapat menentukan pemeriksaan batas layan, terutama kenyamanan getaran penghuni dan lendutan selubung bangunan.",
    "extremeEventResponse": "Fluktuasi tekanan angin ekstrem dapat menyebabkan kelelahan material pada sambungan penambat fasad dan gaya hisap lokal tinggi di sudut atap atau parapet.",
    "fieldBestPractices": [
      "Perhitungkan profil kenaikan kecepatan angin terhadap elevasi struktur (koefisien Kz sesuai kategori kekasaran medan eksposur).",
      "Pertimbangkan optimasi aerodinamika bentuk denah bangunan (seperti sudut membulat atau bukaan angin terencana) guna mereduksi fenomena getaran lintas-angin."
    ],
    "conceptualAnalogy": "Beban angin bekerja pada selubung bangunan. Kecepatan angin yang berubah terhadap ketinggian dapat menimbulkan tekanan pada sisi yang menghadap angin, tekanan hisap pada sisi belakang, serta getaran lintas-angin akibat pelepasan pusaran."
  },
  "load-gempa": {
    "fullTitle": "Mekanisme Inersia Seismik, Gaya Geser Dasar, dan Filosofi Desain Kapasitas",
    "primaryRoleSummary": "Beban gempa adalah gaya inersia bolak-balik lateral yang timbul akibat percepatan getaran tanah pada dasar struktur gedung (F = m · a).",
    "coreFunctions": [
      "Mengguncang massa lantai gedung secara horizontal dan menimbulkan gaya geser dasar. Dalam metode gaya lateral ekivalen (Equivalent Lateral Force/ELF), V = Cs · W.",
      "Menuntut struktur untuk menyerap dan membuang energi seismik melalui siklus deformasi inelastis bolak-balik.",
      "Menguji daktilitas sambungan balok-kolom dan dinding geser.",
      "Memicu simpangan lateral (drift) yang harus dibatasi agar gedung tidak mengalami keruntuhan tingkat lunak."
    ],
    "criticalImportance": "Struktur bangunan di wilayah seismik aktif perlu dirancang berdasarkan kinerja gempa. Detail penulangan yang tidak mendukung daktilitas dan konfigurasi struktur yang tidak beraturan dapat memicu kegagalan getas saat gempa kuat.",
    "extremeEventResponse": "Filosofi perancangan gempa tidak menuntut struktur tetap elastis tanpa kerusakan saat gempa maksimum yang dipertimbangkan (Maximum Considered Earthquake/MCE). Kerusakan inelastis dapat terjadi; sasaran Life Safety (keselamatan jiwa) dan Collapse Prevention (pencegahan keruntuhan) menggambarkan tingkat kinerja dengan batas kerusakan yang berbeda, bukan jaminan bangunan tetap tanpa kerusakan.",
    "fieldBestPractices": [
      "Pilih sistem struktur berkeuletan yang sesuai dengan kategori desain seismik dan standar. Sistem Rangka Pemikul Momen Khusus (SRPMK), misalnya, memiliki faktor modifikasi respons R sesuai sistem yang ditetapkan standar; jangan menganggap satu nilai berlaku pada semua konfigurasi.",
      "Gunakan desain kapasitas: hitung demand geser yang berkaitan dengan kapasitas momen ujung (beserta beban gravitasi), lalu bandingkan dengan kapasitas geser dalam satuan yang sama. Kapasitas geser kN tidak dapat langsung dibandingkan dengan momen kNm."
    ],
    "conceptualAnalogy": "Beban gempa merupakan beban inersia massa struktur sesuai Hukum II Newton (Finersia = m · a). Saat permukaan tanah bergetar, kelembaman massa tiap lantai bangunan melawan percepatan dasar tersebut sehingga timbul gaya geser tingkat (story shear) yang harus diserap secara daktail oleh sistem penahan lateral."
  },
  "load-tekanan-tanah": {
    "fullTitle": "Mekanika Tanah Lateral, Teori Baji Longsor, dan Tekanan Aktif/Diam",
    "primaryRoleSummary": "Tekanan tanah adalah dorongan ke arah samping dari tanah timbunan di sekeliling dinding penahan basemen.",
    "coreFunctions": [
      "Pada tanah homogen tanpa beban tambahan di permukaan atau air, tekanan efektif bertambah linier dengan kedalaman. Lapisan tanah, air, beban tambahan, dan pemadatan dapat mengubah diagram tekanan.",
      "Menekan dinding basemen sesuai kondisi diam bila dinding terkekang; teori aktif Rankine/Coulomb hanya digunakan bila gerakan dinding dan asumsi tanah memenuhi.",
      "Menimbulkan gaya dalam dinding yang bergantung pada distribusi tekanan dan kondisi tumpuan; momen dasar dari resultan tekanan tidak otomatis sama dengan momen lentur dinding yang ditopang pelat.",
      "Menjadi penahan pasif di bagian kaki pondasi yang melawan gaya geser lateral gedung."
    ],
    "criticalImportance": "Ketidaktepatan analisis tekanan tanah lateral dapat memicu deformasi lentur berlebih atau keretakan pada dinding basemen, yang berpotensi menimbulkan penurunan tanah pada area sekitar dan merusak jaringan utilitas bawah tanah.",
    "extremeEventResponse": "Tekanan lateral dinamis harus mengikuti kondisi gerakan dinding dan tanah. Mononobe–Okabe hanya dapat dipakai bila asumsi dinding aktif yang dapat bergerak terpenuhi; basemen terkekang memerlukan metode tekanan dinamis yang sesuai.",
    "fieldBestPractices": [
      "Untuk basemen terkekang pada tanah yang belum pernah menerima tegangan efektif lebih tinggi (normally consolidated), pendekatan Jaky K₀ ≈ 1−sinϕ dapat dipertimbangkan. Rasio konsolidasi berlebih (OCR), sejarah tegangan, dan pemadatan perlu diperiksa; kondisi aktif memerlukan gerakan dinding yang cukup.",
      "Perhitungkan beban tambahan di permukaan (q), misalnya lalu lintas kendaraan atau beban konstruksi di atas tanah uruk.",
      "Gunakan material timbunan berbutir (granular backfill) dengan permeabilitas baik yang dipadatkan lapis demi lapis disertai sistem drainase terpasang."
    ],
    "conceptualAnalogy": "Tekanan lateral berasal dari tegangan efektif dan kondisi gerakan dinding. Distribusi segitiga adalah idealisasi untuk tanah homogen tanpa beban tambahan di permukaan atau air; tekanan total juga mencakup kontribusi air dan beban permukaan yang sesuai."
  },
  "load-tekanan-air": {
    "fullTitle": "Prinsip Hidrostatis Air Tanah, Bahaya Pengapungan, dan Gaya Angkat",
    "primaryRoleSummary": "Tekanan air bekerja merata ke segala arah pada kedalaman yang sama. Tekanan ini mendorong dinding bawah tanah ke samping dan dasar pondasi ke atas.",
    "coreFunctions": [
      "Menghasilkan tekanan air yang bekerja tegak lurus pada dinding luar basemen tanpa gaya gesek tangensial.",
      "Menciptakan gaya angkat vertikal pada dasar pondasi rakit akibat tekanan muka air tanah.",
      "Mengurangi kapasitas geser tanah efektif (prinsip tegangan efektif Terzaghi: sigma' = sigma - u).",
      "Memicu bahaya kebocoran rembesan bertekanan tinggi pada retakan beton dan sambungan konstruksi."
    ],
    "criticalImportance": "Tekanan air tanah penting dalam perancangan basemen. Jika berat struktur tidak cukup menahan tekanan air rencana, gaya angkat dapat melampaui berat bangunan dan memicu kegagalan stabilitas apung yang merusak sistem pondasi.",
    "extremeEventResponse": "Gunakan muka air rencana tertinggi serta kondisi konstruksi saat berat struktur masih kecil. Gaya angkat ditahan berat permanen dan, bila diperlukan, tahanan angkur/tiang yang benar-benar dihitung; beban hidup tidak otomatis boleh menjadi penstabil.",
    "fieldBestPractices": [
      "Periksa jalur ketahanan gaya angkat SNI 8460:2017 9.3.3–9.3.4. Pendekatan berat pengimbang memakai SF minimum 1.5, dan pemeriksaan berat mati saja memakai minimum 1.1U; kombinasi beban/tahanan harus dinilai terpisah.",
      "Bila berat mandiri struktur tidak memadai, pasang tiang penahan tarik (tension piles) atau sistem angkur tanah (ground tension anchors).",
      "Rancang pelat pondasi rakit dengan ketebalan dan rasio tulangan yang memadai untuk memikul momen lentur akibat tekanan air yang bekerja dari bawah."
    ],
    "conceptualAnalogy": "Gaya angkat air berasal dari tekanan hidrostatik pada dasar basemen. Stabilitas diperiksa dengan kombinasi beban dan tahanan sesuai standar; faktor keamanan 1,25 bukan ketentuan umum yang dapat menggantikan syarat SNI 8460:2017."
  }
};
