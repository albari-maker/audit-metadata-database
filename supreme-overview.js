/*
 * Audit Atlas — pembaruan ringkasan Audit SUPREME (20 Oktober 2026)
 * Pemuatan: audit-data.js -> supreme-overview.js -> script.js
 * Tidak mengubah klausa, data eviden, atau fungsi pencarian existing.
 * Referensi disusun dari materi pengguna; validasi versi standar/SIAP resmi
 * tetap diperlukan sebelum dipakai sebagai dasar audit formal.
 */
(() => {
  'use strict';
  const data = window.AUDIT_DATA;
  if (!data || !Array.isArray(data.profiles)) {
    console.warn('[SUPREME] audit-data.js belum tersedia.');
    return;
  }

  const profile = data.profiles.find(p => p.id === 'supreme' || /^audit\s+supreme$/i.test(String(p.name || '').trim()));
  if (!profile) {
    console.warn('[SUPREME] Profil Audit SUPREME tidak ditemukan dalam AUDIT_DATA.profiles.');
    return;
  }

  // script.js mendukung detailedOverview secara native, jadi tidak perlu
  // mengganti fungsi render, filter, menu, atau klausul.
  profile.detailedOverview = {
    referenceHeading: 'Acuan Pelaksanaan',
    reference: 'Pertamina Standard Nomor PS-S-023-440-2023 tentang SUPREME (Sustainability Pertamina Expectations for Management Excellence), yang merupakan pembaruan dari Pertamina Standard Nomor PS-Sy-0001-15-2019. Pelaksanaan audit mengacu pada Pedoman Implementasi SUPREME dan SUPREME Internal Audit Protocol (SIAP) sebagai panduan penilaian penerapan sistem manajemen HSSE di lingkungan Pertamina.',
    chapter: 'Rujukan penilaian: Pedoman Implementasi SUPREME dan SUPREME Internal Audit Protocol (SIAP).',
    summaryHeading: 'Summary',
    scope: 'Audit SUPREME merupakan audit sistem manajemen internal Pertamina untuk mengevaluasi penerapan Health, Safety, Security, and Environment (HSSE) secara terstruktur dan sistematis dalam mengelola risiko operasional, memastikan kepatuhan terhadap ketentuan yang berlaku, mencegah kecelakaan kerja, serta mendukung keberlanjutan bisnis perusahaan.',
    summary: 'Audit dilakukan melalui pemeriksaan dokumen, wawancara, dan observasi lapangan untuk menilai kesesuaian serta efektivitas implementasi sistem manajemen HSSE. Hasil audit digunakan sebagai dasar penyusunan rekomendasi dan tindakan perbaikan berkelanjutan (continuous improvement).',
    introPillars: 'Evaluasi SUPREME dikelompokkan ke dalam 8 proses utama, yaitu:',
    pillars: [
      {
        name: 'Leadership and Accountability (Kepemimpinan dan Akuntabilitas)',
        description: 'Meliputi komitmen pimpinan, keterlibatan manajemen, pengawasan pelaksanaan HSSE, pengukuran kinerja, serta pengembangan budaya keselamatan kerja.'
      },
      {
        name: 'Policy and Objectives (Kebijakan dan Sasaran)',
        description: 'Meliputi penetapan kebijakan HSSE, kepatuhan terhadap peraturan perundang-undangan, serta penyusunan sasaran dan target kinerja HSSE perusahaan.'
      },
      {
        name: 'Organization, Responsibilities, Resources, and Documents (Organisasi, Tanggung Jawab, Sumber Daya, dan Dokumen)',
        description: 'Meliputi struktur organisasi, pembagian tanggung jawab, penyediaan sumber daya, pengelolaan kompetensi dan pelatihan pekerja, komunikasi, serta pengendalian dokumen HSSE.'
      },
      {
        name: 'Risk Management (Manajemen Risiko)',
        description: 'Meliputi identifikasi bahaya, penilaian risiko, penetapan tindakan pengendalian, pemantauan risiko, serta pengelolaan risiko residual dalam kegiatan operasional perusahaan.'
      },
      {
        name: 'Planning and Procedures (Perencanaan dan Prosedur)',
        description: 'Meliputi penyusunan rencana kerja HSSE, prosedur dan instruksi kerja, pengelolaan perubahan (Management of Change), integritas aset, sistem izin kerja aman, serta perencanaan tanggap darurat.'
      },
      {
        name: 'Implementation and Operational Control (Implementasi dan Pengendalian Operasional)',
        description: 'Meliputi penerapan prosedur HSSE, pengawasan kegiatan operasional, pengelolaan keselamatan kontraktor, pelaksanaan izin kerja aman, pengendalian perubahan, serta kesiapsiagaan dan pelaksanaan tanggap darurat.'
      },
      {
        name: 'Assurance: Monitoring, Measurement, and Audit (Jaminan: Pemantauan, Pengukuran, dan Audit)',
        description: 'Meliputi pemantauan kinerja HSSE, pengukuran pencapaian indikator, pelaporan dan investigasi insiden, penanganan ketidaksesuaian, pelaksanaan audit internal, serta pemantauan tindakan perbaikan.'
      },
      {
        name: 'Management Review (Tinjauan Manajemen)',
        description: 'Meliputi evaluasi hasil penerapan sistem manajemen HSSE oleh manajemen, peninjauan pencapaian sasaran, evaluasi hasil audit, penetapan tindak lanjut, serta peningkatan berkelanjutan terhadap efektivitas pengendalian risiko.'
      }
    ]
  };

  // Deskripsi kartu/metadata konsisten dengan isi baru; yang lain tetap.
  profile.short = 'Audit internal sistem manajemen HSSE Pertamina untuk mengelola risiko operasional, kepatuhan, dan perbaikan berkelanjutan.';
  profile.purpose = 'Memahami acuan, metode pemeriksaan, serta delapan proses utama Audit SUPREME.';
})();
