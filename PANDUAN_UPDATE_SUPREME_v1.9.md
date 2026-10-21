# AuditAtlas v1.9 – Update keterangan Audit SUPREME

## Perubahan

- Menghapus tombol **Ekspor hasil (CSV)** pada halaman **Jelajahi Klausul**.
- Mengganti label konteks **PDF sumber 2018** menjadi **Audit sumber 2018**.
- Menghapus blok panjang **Acuan yang dipakai dalam pembaruan ini**.
- Memasukkan **Acuan Pelaksanaan** dan **Summary** baru berikut 8 uraian proses sebagaimana redaksi dari pemilik website.
- Tidak mengubah database 191 ekspektasi yang sebelumnya ditelusuri dari PDF SUPREME tahun 2018.
- Mempertahankan fitur **Ekspor peta (CSV)** pada menu Peta Audit (tombol berbeda dari yang diminta dihapus).

### Pembedaan sumber
Bagian acuan 2023 mengikuti redaksi yang diberikan pemilik website. PDF SUPREME yang dianalisis untuk entri 191 ekspektasi adalah sumber 2018 dan tidak digunakan sebagai bukti kesamaan isi dengan standar/protokol 2023. Catatan singkat tetap muncul di akhir Summary.

## Cara memasang

1. Ekstrak ZIP pembaruan.
2. Unggah **index.html** dan **script.js** ke root branch `main` repository GitHub, timpa file lama.
3. Tunggu `Actions -> pages build and deployment` selesai (centang hijau).
4. Buka halaman website dengan refresh keras (Ctrl+Shift+R), pilih **Jelajahi Klausul → Audit SUPREME**.
5. Pastikan tombol **Ekspor hasil (CSV)** tidak ada dan bagian **Acuan Pelaksanaan** dan **Summary** baru tampil.

Jangan unggah PDF internal ke repository yang bersifat publik tanpa izin.
