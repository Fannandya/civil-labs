# Laboratorium Visual Teknik Sipil

Aplikasi pembelajaran interaktif untuk mengeksplorasi elemen struktur gedung, jalur beban, simulasi visual, contoh kalkulator teknik sipil, dan kuis. Viewer memakai model 3D prosedural; angka, gerak, dan visualisasinya adalah contoh pendidikan, bukan analisis atau persetujuan desain untuk proyek nyata.

## Fitur

- Viewer 3D dengan preset kamera, panel kontrol, lapisan struktur, potongan, tulangan, dan label.
- Visualisasi jalur beban gravitasi, angin, gempa, tekanan tanah, dan tekanan air.
- Panel materi elemen, kalkulator contoh, dan glosarium yang dapat dicari.
- Kuis teknik sipil berisi 240 soal dengan pembahasan.

## Persyaratan

- Node.js **24.x**
- npm

## Menjalankan di komputer lokal

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000`.

## Perintah proyek

```bash
npm run lint
npm test
npm run quiz:audit
npm run build:webpack
npm run start
```

`npm run start` menjalankan hasil build produksi. Jalankan `npm run build:webpack` terlebih dahulu. Perintah `npm run build` tetap memakai build default Next.js.

Tes saat ini mencakup kalkulator, gerak struktur, viewer, susunan tulangan, isi glosarium, dan bank kuis.

## Deploy ke Vercel

1. Push repository ini ke GitHub, lalu import repository tersebut di Vercel.
2. Pilih framework **Next.js** dan root directory yang berisi `package.json`.
3. Gunakan install command `npm ci`.
4. Gunakan build command `npm run build:webpack`.
5. Biarkan output directory memakai nilai default Next.js dan pilih Node.js **24.x**.
6. Aplikasi saat ini tidak memerlukan environment variable.

Setelah deployment, buka `/` untuk viewer dan `/quiz` untuk kuis. Uji kedua alamat tersebut pada desktop dan perangkat yang akan dipakai untuk presentasi.

## Batasan materi

Kalkulator dan simulasi menyatakan asumsi serta pemeriksaan yang dicakup pada panel terkait. Model 3D dan animasinya bersifat skematis; keduanya bukan keluaran solver tegangan atau perpindahan. Aplikasi tidak menggantikan pemeriksaan standar, analisis struktur lengkap, maupun tinjauan insinyur.
