# AuditAtlas v1.5 — Pembaruan Ringkasan Audit SUPREME

## Perubahan
- Mengganti kotak penjelasan Audit SUPREME dengan **Acuan Pelaksanaan**, **Summary**, dan penjabaran **8 proses utama** sesuai naskah revisi pengguna.
- Menghilangkan teks lama **Perlu validasi**, **Apa ini?**, **Tujuan**, dan peringatan kuning **hanya dari kotak penjelasan SUPREME**.
- Keterangan CDM SKK Migas versi 1.4 **tetap dipertahankan**.
- Seluruh data dan menu audit lainnya tidak berubah. Catatan verifikasi umum tetap muncul pada website.
- Versi script di `index.html` diubah untuk menghindari cache browser.

## Cara memasang di GitHub
1. Ekstrak ZIP.
2. Buka https://github.com/albari-maker/audit-metadata-database/upload/main
3. Unggah **hanya** `index.html` dan `script.js` dari paket ini ke **root** repository. Jika situs Anda sudah dimodifikasi di luar paket v1.4, bandingkan dahulu agar perubahan lain tidak tertimpa.
4. Klik **Commit changes**.
5. Pastikan hasil deploy berhasil di https://github.com/albari-maker/audit-metadata-database/actions
6. Buka https://albari-maker.github.io/audit-metadata-database/ lalu tekan Ctrl+Shift+R (atau gunakan InPrivate).
7. Klik **Jelajahi klausul** → pilih **Audit SUPREME** di filter **Jenis audit**, lalu pastikan muncul delapan proses.

## File yang tidak perlu diunggah ulang
`style.css`, `audit-data.js`, `audit-data.json`, `README.md`, serta database Excel.

## Catatan keandalan sumber
Uraian dan rujukan SUPREME mengikuti teks yang diberikan pengguna; belum diverifikasi terhadap Pertamina Standard dan protokol internal resmi. AuditAtlas merupakan panduan edukatif, bukan daftar pemeriksaan normatif.
