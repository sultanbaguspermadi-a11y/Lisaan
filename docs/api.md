# Referensi API

Semua respons berupa JSON. Error selalu berbentuk `{ "error": { "code", "message", "fields"? } }`
dengan kode HTTP yang sesuai (400 validasi, 401 belum masuk, 404 tidak ditemukan, 429 terlalu banyak
permintaan, 500 kesalahan server tanpa detail internal).

Hanya entri berstatus **PUBLISHED** yang pernah dikembalikan oleh endpoint publik.

## Publik

| Endpoint                                  | Keterangan                                                                                                                                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/search?q&page&limit&major&lang` | Pencarian berperingkat. `q` 1–80 karakter, `limit` ≤ 50, `page` ≤ 200. Aksara Arab dicari di kata, aksara Latin di transliterasi dan arti. Tidak di-cache (bonus jurusan bergantung pada pengguna). |
| `GET /api/suggest?q&lang`                 | Autocomplete, maksimal 8 saran, bisa di-cache CDN (`s-maxage=60`).                                                                                                                                  |
| `GET /api/entries/{slug}`                 | Detail kata beserta arti, contoh, kategori, bentuk kata kerja. 404 bila Draft/Review/tidak ada.                                                                                                     |
| `GET /api/categories`                     | Kategori beserta jumlah entri Published.                                                                                                                                                            |
| `GET /api/majors`                         | Daftar jurusan.                                                                                                                                                                                     |
| `GET /api/word-of-day?lang`               | Kata hari ini (berganti 00.00 UTC).                                                                                                                                                                 |
| `GET /api/health`                         | 200 bila database terjangkau, 503 bila tidak.                                                                                                                                                       |

Batas laju (per IP, memori proses): `/api/suggest` 240/menit, `/api/search` 120/menit.

## Perlu login (cookie sesi Auth.js)

| Endpoint                        | Keterangan                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `GET/PUT /api/me/settings`      | Preferensi tampilan; PUT juga menyimpan jurusan akun.                                           |
| `POST/DELETE /api/me/favorites` | Body `{ "entryId" }`. Idempoten.                                                                |
| `GET/DELETE /api/me/history`    | Riwayat pencarian (maks. 50, satu baris per kueri).                                             |
| `GET /api/srs/due?lang`         | Kartu yang jatuh tempo; kartu baru (maks. 10) ditambahkan otomatis, jurusan diprioritaskan.     |
| `POST /api/srs/review`          | Body `{ "entryId", "quality": 1 \| 3 \| 4 \| 5 }` (Lupa, Sulit, Ingat, Mudah). Menerapkan SM-2. |

## Auth.js

`/api/auth/*` ditangani Auth.js v5 (sesi JWT, 30 hari). Registrasi dan login lewat form memakai
server action (`src/app/actions.ts`), bukan endpoint JSON.
