# Integrasi Audit SUPREME ke Audit Atlas

Target repository: https://github.com/albari-maker/audit-metadata-database

Pembaruan ini memakai dukungan **detailedOverview** yang sudah tersedia dalam `script.js`, sehingga database asli, filter, dan data jenis audit lain tidak perlu diubah.

## 1. Tambahkan 2 berkas baru ke root repository

- `supreme-overview.js`
- `supreme-overview.css`

## 2. Ubah hanya bagian pemanggilan aset di `<head>` file `index.html`

Cari bagian:

```html
<link rel="stylesheet" href="style.css?v=cdm-v14-20261016" />
<script src="audit-data.js?v=cdm-v14-20261016" defer></script>
<script src="script.js?v=cdm-v14-20261016" defer></script>
```

Ganti dengan:

```html
<link rel="stylesheet" href="style.css?v=cdm-v14-20261016" />
<link rel="stylesheet" href="supreme-overview.css?v=20261020" />
<script src="audit-data.js?v=cdm-v14-20261016" defer></script>
<script src="supreme-overview.js?v=20261020" defer></script>
<script src="script.js?v=cdm-v14-20261016" defer></script>
```

**Penting:** `supreme-overview.js` wajib berada **setelah** `audit-data.js` dan **sebelum** `script.js`; ketiganya memakai `defer` sehingga urutan eksekusi terjaga.

## 3. Simpan (Commit Changes) dan tes

1. Buka halaman GitHub Pages/website Audit Atlas.
2. Klik **Jelajahi klausul**.
3. Pilih **Audit SUPREME** dari filter "Jenis audit" atau tombol audit di sidebar.
4. Pastikan terdapat subjudul **Acuan Pelaksanaan** dan **Summary**, serta daftar **8 proses utama**.
5. Coba ISO 9001, ISO 14001, dan ISO 45001 untuk memastikan kategorinya tidak berubah.
6. Muat ulang keras (`Ctrl + Shift + R`) jika cache browser belum memperlihatkan pembaruan.

## Batasan dan verifikasi

- Materi SOP/nomor standar berasal dari teks yang diberikan pengguna dan belum dicocokkan dengan dokumen Pertamina/SIAP resmi.
- Tidak ada perubahan terhadap klausul/elemen/indikator audit dalam `audit-data.js`.
- Berkas hanya menyesuaikan tampilan ringkasan SUPREME; tidak membuat atau menyimpan bukti audit internal.
- Tautan GitHub Anda belum dimodifikasi secara langsung; unggah dan commit perubahan manual.
