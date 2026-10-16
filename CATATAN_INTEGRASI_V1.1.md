# AuditAtlas 1.1: Integrasi peta audit

## Perubahan
- Sumber: tabel Markdown yang diberikan pengguna, 24 baris kelompok awal.
- Terdapat 32 peta kelompok besar setelah empat kelompok ISO SMT dipisah untuk masing-masing ISO 9001, ISO 14001, dan ISO 45001.
- Total 182 entri topik di menu Jelajahi Klausul (150 entri lama + 32 ringkasan tematik).
- Menu baru **Peta audit (umum → khusus)** dapat ditelusuri menggunakan filter, dan diekspor CSV.
- Tabel sumber berstatus **belum diverifikasi**; kode PTK, pasal, pengelompokan elemen, OSHA/CCPS, dan kode ISO bukan kutipan resmi.
- Baris ringkasan dibedakan dengan kode `PETA 01`, `PETA 02`, dst, bukan kode klausul resmi.
- Berkas tidak berisi bukti audit asli atau informasi pribadi.

## Memasang di GitHub
1. Ekstrak file ZIP di komputer.
2. Unggah isi ZIP ke **root** repository `albari-maker/audit-metadata-database`, dengan file `index.html` di root, bukan di dalam subfolder.
3. Jika GitHub menawarkan penggantian nama file yang sudah ada, pertahankan nama yang sama dan buat commit untuk menimpa versi sebelumnya.
4. Pastikan Settings → Pages → Deploy from a branch → `main` → `/(root)`, simpan jika berubah.
5. Tunggu deployment selesai dan buka URL GitHub Pages. Tekan Ctrl+Shift+R agar browser memperbarui cache.
6. Pertahankan `README.md` lama atau perbarui isinya secara terpisah.

## Disclaimer
Website bersifat publik dan edukatif. Pastikan file lain yang telah diunggah ke repository (termasuk XLSX pemetaan internal) diizinkan untuk dibuka publik. Checklist pribadi disimpan di localStorage browser, bukan database/server.
