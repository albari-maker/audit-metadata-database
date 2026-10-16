# Cara memasang AuditAtlas di GitHub Pages

Repository: https://github.com/albari-maker/audit-metadata-database

## Penting sebelum mengunggah

- Versi website ini adalah panduan **publik**, bukan repositori rekaman atau bukti audit internal.
- File `.xlsx` yang sudah ada di repository publik **tidak otomatis menjadi aman** hanya karena website tidak menampilkannya. Periksa izin publikasi file asli. Jika tidak berizin, hapus dari repository publik dan tangani pula riwayat/revisi, cache, dan salinan publik sesuai kebijakan perusahaan.
- Jangan masukkan data pekerja, remunerasi, kesehatan, dokumen kontrak, detail operasi sensitif atau bukti internal ke `audit-data.json`, `audit-data.js`, maupun repositori publik.

## 1. Siapkan file

Unduh ZIP, lalu **Extract All / Ekstrak Semua**. Jangan unggah ZIP sebagai satu file: GitHub Pages tidak membukanya otomatis.

Unggah isi hasil ekstraksi ke **folder utama (root)** repository `audit-metadata-database` melalui:

https://github.com/albari-maker/audit-metadata-database/upload/main

File utama:

- `index.html` (halaman utama)
- `style.css` (desain)
- `script.js` (pencarian dan checklist)
- `audit-data.js` (database untuk website, bisa dibuka offline)
- `audit-data.json` (database JSON untuk penyuntingan)
- `CARA_PASANG_WEBSITE.md` (petunjuk ini)
- `.nojekyll` (opsional, konfigurasi GitHub Pages)

`README.md` dan workbook lama yang sudah ada tidak perlu ditimpa.

Klik **Commit changes** dan tunggu proses selesai.

## 2. Aktifkan GitHub Pages

Buka:

https://github.com/albari-maker/audit-metadata-database/settings/pages

Di **Build and deployment**:

1. `Source`: **Deploy from a branch**.
2. `Branch`: **main**.
3. `Folder`: **/(root)**.
4. Klik **Save**.

Tunggu hingga deployment sukses. Cek tab **Actions** jika ada masalah.

Alamat situs yang diharapkan setelah deployment sukses:

https://albari-maker.github.io/audit-metadata-database/

> Alamat di atas adalah alamat konvensional GitHub Pages. Situs baru benar-benar tersedia setelah Anda mengunggah file, mengaktifkan Pages, dan deployment berhasil.

## 3. Coba fiturnya

- Buka menu **Jelajahi klausul**.
- Cari kata `kompetensi` atau `7.2`.
- Pilih audit `ISO 9001`.
- Buka topik dan lihat hierarki, penjelasan, serta contoh bukti.
- Tandai status `Dalam proses` / `Siap`.
- Ekspor hasil filter ke **CSV**, lalu buka file CSV di Excel.

Checklist hanya tersimpan di `localStorage` browser masing-masing, tidak dikirim ke GitHub dan tidak tersinkron antar pengguna.

## 4. Cara mengubah atau menambah data

- Ubah entri di `audit-data.json`, kemudian salin JSON yang sama ke `audit-data.js` dengan format `window.AUDIT_DATA = <ISI JSON>;`.
- Lebih mudah dan lebih aman menggunakan script generator dalam proses pengembangan untuk menjaga kedua file konsisten.
- Harus memuat `profiles`, `clauses`, dan `glossary` dalam format sesuai data contoh.
- Pastikan link sumber benar, kode klausul diperiksa berdasarkan **edisi standar yang digunakan**, dan status validasi ditulis secara jujur.
- Hindari mengutip teks penuh standar ISO berlisensi dan dokumen perusahaan yang tidak boleh dipublikasikan.

## Batasan teknis versi ini

Website statis HTML/CSS/JavaScript, tidak menggunakan server maupun login. Pencarian cepat dan filter diproses langsung di browser; tidak ada database backend atau pengaturan hak akses per pengguna. GitHub Pages publik **bukan tempat mengunggah eviden rahasia**.

## Verifikasi rujukan

- ISO 9001:2026: https://www.iso.org/standard/9001
- ISO 14001:2026: https://www.iso.org/standard/14001
- ISO 45001:2018/Amd 1:2024: https://www.iso.org/standard/88428.html
- ISO 50001:2018: https://www.iso.org/standard/69426.html
- Dokumen SUPREME Pertamina (rujukan publik): https://www.pertamina.com/Media/File/Energia-51-17-Desember-2018.pdf
- Panduan GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
