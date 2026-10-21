# AuditAtlas v1.7 — Dokumen Dasar Audit CDM SKK Migas

## Apa yang ditambahkan

- Keterangan sumber PTK-018/SKKMA0000/2018/S0 Revisi II (4 Oktober 2018).
- Navigasi BAB III.10 pada halaman tercetak 58–61 / halaman PDF 68–71 (167 halaman PDF).
- Ringkasan subbutir 10.1.1, 10.1.2, 10.4.1, 10.5.1, dan 10.5.6.
- Catatan bahwa PTK merujuk ke buku referensi penilaian terpisah; tidak otomatis menjadi checklist indikator resmi.
- Deteksi otomatis keberadaan PDF: tombol “Baca BAB III.10” hanya muncul jika sumber PDF diunggah dengan izin.

## Pembaruan website GitHub (hanya dua file)

1. Ekstrak ZIP **AuditAtlas_v1.7_Update_Dasar_Audit_CDM.zip**.
2. Unggah `index.html` dan `script.js` ke **akar** repository `audit-metadata-database` pada branch `main`.
3. GitHub akan mengganti file bernama sama. Jangan menghapus `audit-data.js`, `audit-data.json`, `style.css`, README atau file lain.
4. Commit, tunggu GitHub Actions: `pages build and deployment` sukses.
5. Buka website, tekan Ctrl+Shift+R, lalu klik `Jelajahi Klausul` -> `CDM SKK Migas`.

## Jika dokumen PDF memang diizinkan dibagikan secara publik

PDF **tidak disertakan** dalam paket pembaruan ini. Jika Anda mempunyai izin untuk mempublikasikannya:

1. Salin dokumen `cdm skk migas.pdf` yang Anda miliki dan ubah namanya menjadi **PTK-018_SKK_Migas_Revisi_II.pdf**.
2. Unggah PDF itu ke **akar repository yang sama** (sejajar dengan `index.html`).
3. Saat PDF tersedia di GitHub Pages, tombol **Baca BAB III.10 pada PDF** akan muncul otomatis dan membuka `#page=68`.

Jika dokumen terbatas, jangan unggah PDF ke repository **Public** maupun GitHub Pages; cukup tampilkan metadata dan rujukan halaman dalam website, atau gunakan penyimpanan internal dengan kontrol akses yang sesuai.

### Catatan validasi

Berdasarkan file sumber PTK-018 Revisi II, BAB III.10 terdapat pada halaman cetak 58–61 (halaman PDF 68–71). Dalam 10.1.2, pembukanya menyebut “dua kategori besar”, tetapi rincian 10.1.2.1–10.1.2.3 memuat CDM, HRC, dan kesehatan kerja. Jangan mengubah kutipan asli agar perbedaan redaksi tetap transparan. Syarat penilaian rinci merujuk buku referensi yang disebut pada 10.1.4 dan 10.5.2, bukan otomatis menjadi klaim checklist resmi.
