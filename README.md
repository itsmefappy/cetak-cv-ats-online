# ATSResume Builder

Aplikasi web pembuat CV ATS-friendly berbasis Vanilla JS. Tidak butuh build step atau login.

## Jalankan

Buka `index.html` langsung di browser modern. Untuk pengalaman terbaik, jalankan static server:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Fitur

- Split-screen editor dan live A4 preview.
- Dua template: `Classic Single-Column` dan `Modern Clean Header`.
- ATS-safe: single column, HTML text asli, semantic headings, standard lists.
- Native `window.print()` untuk simpan PDF teks asli.
- Auto-save via `localStorage`.
- Data contoh profesional.
- Tambah, hapus, dan ubah urutan pengalaman, pendidikan, proyek/sertifikasi.
- ATS checklist meter dan tips.
- Impor/Ekspor JSON.
- Responsive edit/preview tabs di mobile.
- Referensi schema database di `schema.sql`.

## PDF

Klik **Unduh PDF**, lalu pilih printer **Save as PDF**. Output memakai `@page { size: A4 }` dan tidak memakai canvas/image, sehingga teks dapat diseleksi, disalin, dan dibaca parser ATS.

## Catatan

- Tailwind CDN dipakai untuk utilitas kecil; layout utama berada di `css/app.css`.
- `schema.sql` memakai sintaks MySQL 8.0+; ubah `AUTO_INCREMENT` dan `ON UPDATE` bila target PostgreSQL.
- Data lokal tersimpan di browser yang sama. Ekspor JSON untuk backup lintas perangkat.
