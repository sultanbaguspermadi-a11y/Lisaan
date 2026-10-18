# Lisaan · Kamus Arab–Indonesia untuk siswa SMK

Kamus saku berbasis web untuk siswa SMK Muhammadiyah Pencongan (RPL, AKT, TBKR, TSM): cari kata Arab
**dengan atau tanpa harakat**, dengan huruf Latin, atau dengan kata Indonesia; kata dari jurusan
pengguna tampil lebih awal. Dilengkapi favorit, riwayat, flashcard SM-2, dan pengaturan tampilan
(tema, font Arab, ukuran, harakat, bahasa ID/AR/EN dengan RTL penuh).

Stack: Next.js 16 (App Router) · React 19 · TypeScript 6 strict · Tailwind CSS 4 · PostgreSQL 16 ·
Prisma 7 · Auth.js v5 · TanStack Query · Vitest.

## Status: apa yang sudah ada dan yang belum

Proyek ini dibangun bertahap (lihat rencana 8 fase). Isi zip ini = **Fase 1–3 dan 5 selesai**:

| Fase                                                                           | Status   |
| ------------------------------------------------------------------------------ | -------- |
| 1 Fondasi (skema, migrasi, seed 140 kata, layout responsif, tema, RTL)         | ✅       |
| 2 Kamus inti (pencarian berperingkat, autocomplete, detail kata, kategori)     | ✅       |
| 3 Akun (daftar/masuk, Google opsional, favorit, riwayat, pengaturan sinkron)   | ✅       |
| 5 Belajar (flashcard SM-2)                                                     | ✅       |
| 4 Admin/CMS (CRUD, alur Draft→Review→Published, impor CSV/Excel, upload media) | ❌ belum |
| 5 Kuis, streak/XP/badge                                                        | ❌ belum |
| 6 Offline & PWA (service worker, IndexedDB, sync delta)                        | ❌ belum |
| 7 Alat guru (kelas, tugas, moderasi usulan)                                    | ❌ belum |
| 8 Pengerasan (e2e Playwright, audit axe, uji performa)                         | ❌ belum |

Kolom `role` (STUDENT/TEACHER/EDITOR/ADMIN) dan status entri (DRAFT/REVIEW/PUBLISHED) sudah ada di
database, tetapi **belum ada UI** untuk mengubahnya. Hingga CMS dibuat:

- Ubah peran lewat SQL: `UPDATE "User" SET role = 'ADMIN' WHERE email = '...';`
- Tambah/ubah kata lewat `prisma/seed-data.ts` lalu `npm run db:seed` (aman dijalankan ulang).

## Mulai cepat

Butuh Node.js ≥ 22.12 dan PostgreSQL 16.

### A. Docker (paling mudah)

```bash
cp .env.example .env            # isi AUTH_SECRET: openssl rand -base64 32
docker compose up --build       # db + migrasi + aplikasi di http://localhost:3000
docker compose --profile seed run --rm seed   # isi 140 kata contoh (sekali saja)
```

### B. Lokal

```bash
cp .env.example .env            # isi DATABASE_URL dan AUTH_SECRET
npm install                     # juga menjalankan `prisma generate`
npm run db:migrate              # menerapkan prisma/migrations (termasuk ekstensi pg_trgm)
npm run db:seed
npm run dev                     # http://localhost:3000
```

Database lokal cepat: `docker compose up db`.
Untuk mengubah skema saat mengembangkan: `npm run db:migrate:dev`.

## Variabel lingkungan

| Variabel                               | Wajib              | Keterangan                                                                                     |
| -------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                         | ya                 | Connection string PostgreSQL.                                                                  |
| `AUTH_SECRET`                          | ya                 | Minimal 32 karakter acak. Aplikasi menolak start tanpanya.                                     |
| `AUTH_TRUST_HOST`                      | di hosting sendiri | `true` bila di belakang proxy/VPS/Docker.                                                      |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | tidak              | Isi keduanya untuk mengaktifkan tombol Google. Redirect URI: `{URL}/api/auth/callback/google`. |
| `NEXT_PUBLIC_SITE_NAME`                | tidak              | Nama situs pada judul halaman.                                                                 |

## Skrip

| Perintah                              | Fungsi                                               |
| ------------------------------------- | ---------------------------------------------------- |
| `npm run dev` / `build` / `start`     | Pengembangan / build produksi / jalankan hasil build |
| `npm run lint` · `typecheck` · `test` | ESLint · tsc strict · Vitest (unit + integrasi)      |
| `npm run db:migrate` · `db:seed`      | Terapkan migrasi · isi data contoh                   |
| `npm run format`                      | Prettier                                             |

Tes integrasi butuh database yang sudah di-migrate dan di-seed (memakai `DATABASE_URL`); tanpa itu
mereka dilewati otomatis. Total saat ini: 57 tes.

## Cara kerja pencarian

1. Kueri dinormalisasi oleh `src/lib/arabic/normalize.ts` (fungsi yang sama dipakai saat menyimpan
   kata): harakat dan tatweel dibuang; alif (أ إ آ ٱ → ا), ta marbuta (ة → ه), alif maqsura (ى → ي)
   disamakan; Latin dibuang diakritiknya dan tanda hamza/‘ain.
2. Aksara Arab → dicari di kata; aksara Latin → dicari di transliterasi **dan** arti.
3. Peringkat: persis 100 > awalan 80 > mengandung 60 > fuzzy (trigram, ambang 0,25); arti persis 95,
   dan bonus +8 untuk kata di kategori jurusan pengguna. Indeks GIN trigram dibuat di migrasi.
4. Selalu difilter `status = 'PUBLISHED'` (ada tes yang memastikan Draft/Review tidak bocor).

## Struktur

```
prisma/            schema, migrasi SQL, seed (+ seed-data.ts)
src/app/           halaman (App Router), route API di app/api, server action di actions.ts
src/components/    komponen UI (klien) dan shell (server)
src/lib/           normalisasi Arab, SM-2, auth, i18n (id/en/ar), prefs, rate limit, validasi
src/server/        akses data per domain: search, entries, favorites, history, srs
tests/             unit/ dan integration/
docs/api.md        referensi API
```

Preferensi tampilan disimpan di satu cookie (`lisaan_prefs`) sehingga server merender tema, bahasa,
dan arah teks yang benar sejak byte pertama (tanpa kilatan). Untuk pengguna yang masuk, preferensi
juga disinkronkan ke akun.

## Keamanan: yang diterapkan dan batasannya

- Kata sandi di-hash Argon2id (`@node-rs/argon2`); verifikasi waktu-konstan terhadap hash palsu
  untuk email tak terdaftar.
- Semua input divalidasi Zod; query SQL mentah memakai parameter terikat dan karakter `%`/`_`
  dari pengguna di-escape.
- Otorisasi dicek di server pada setiap endpoint dan halaman terlindungi; pengguna dibaca dari
  database, bukan dari token.
- Redirect pasca-login hanya ke path internal (`safeNext`).
- Header: CSP, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy, `frame-ancestors 'none'`.
- Rate limit login (per IP dan per email), registrasi, pencarian, dan saran.

Batasan yang perlu Anda tahu:

- CSP memakai `'unsafe-inline'` untuk script karena hidrasi Next. Pengerasan lanjutan: CSP bernonce
  lewat `proxy.ts`.
- Rate limit disimpan di memori proses: efektif untuk satu instance (VPS/Docker); di serverless
  tiap instance punya hitungan sendiri. Pakai penyimpanan terpusat (mis. Upstash) bila perlu.
- Endpoint yang mengubah data memakai cookie sesi `SameSite=Lax` dan body JSON; belum ada token
  CSRF tambahan.
- Tidak ada verifikasi email dan reset kata sandi (butuh SMTP; belum dibuat).

## Deploy

- **Vercel + Neon**: set `DATABASE_URL`, `AUTH_SECRET` di Vercel; jalankan `npm run db:migrate`
  dan `npm run db:seed` sekali terhadap database Neon dari mesin lokal. Ekstensi `pg_trgm` tersedia di Neon.
- **VPS/Docker**: `docker compose up --build` di balik reverse proxy HTTPS; set `AUTH_TRUST_HOST=true`.

## Validasi konten (penting)

Data di `prisma/seed-data.ts` (kata, harakat, transliterasi, arti, bentuk kata kerja, jamak, contoh
kalimat) adalah **data contoh dan belum ditinjau guru bahasa Arab**. Minta guru memeriksanya
sebelum dipakai siswa, terutama istilah teknis jurusan (mis. padanan "anggaran/neraca",
"kopling", "kap mesin") yang bisa berbeda antar kamus.
