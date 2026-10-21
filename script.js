(() => {
  'use strict';
  const DATA = window.AUDIT_DATA;
  if (!DATA || !Array.isArray(DATA.clauses)) {
    document.querySelector('.content').innerHTML = '<div class="empty-state"><h2>Database tidak ditemukan</h2><p>Pastikan file audit-data.js diunggah pada folder yang sama dengan index.html.</p></div>';
    return;
  }
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const countMap = Object.fromEntries(DATA.profiles.map(p => [p.id,DATA.clauses.filter(x=>x.audit===p.id).length]));
  const profileMap = Object.fromEntries(DATA.profiles.map(p=>[p.id,p]));
  const key = 'audit-atlas-progress-v1';
  const possible = ['Belum dicek','Dalam proses','Siap','Perlu konfirmasi'];
  let statuses = {};
  try { statuses = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch(_e) { statuses = {}; }
  let activePage='beranda',activeAudit='all',shown=18, filtered=[],toastTimer;
  const getStatus = (item) => possible.includes(statuses[item.id]) ? statuses[item.id] : 'Belum dicek';
  const hStat = (s) => s === 'Utama' ? 'HC utama' : s === 'Pendukung' ? 'HC pendukung' : 'Tidak langsung';
  const saveStatus = (id,value) => {
    if(!possible.includes(value))return;
    if(value==='Belum dicek')delete statuses[id]; else statuses[id]=value;
    try{localStorage.setItem(key,JSON.stringify(statuses));}catch(_e){toast('Penyimpanan browser tidak tersedia; status hanya bertahan selama halaman terbuka.');}
    updateStats();applyFilters();
  };
  const normalize = (s) => String(s??'').toLocaleLowerCase('id-ID').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const debounce = (f,ms=150) => {let t;return (...args) => {clearTimeout(t);t=setTimeout(()=>f(...args),ms);};};
  const toast = (str) => {const el=$('#toast');el.textContent=str;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000);};
  function updateStats(){
    $('#stat-audits').textContent=DATA.profiles.length;
    $('#stat-clauses').textContent=DATA.clauses.length;
    $('#stat-terms').textContent=DATA.glossary.length;
    $('#stat-progress').textContent=DATA.clauses.filter(x=>getStatus(x)==='Siap').length;
  }
  function buildNavigation(){
    $('#sidebar-audits').innerHTML=DATA.profiles.map(p=>`<button class="sidebar-audit-button" data-audit="${esc(p.id)}"><i class="side-audit-dot" style="background:${esc(p.color)}"></i><span>${esc(p.name)}</span></button>`).join('');
    $('#audit-grid').innerHTML=DATA.profiles.map(p=>`<button class="audit-card" data-audit="${esc(p.id)}" aria-label="Lihat ${esc(p.name)}"><div class="audit-head"><span class="audit-icon" style="background:${esc(p.color)}14;color:${esc(p.color)}">${esc({'users':'♙','award':'◇','leaf':'❀','shield':'✚','clipboard':'▤','hard-hat':'⚒','activity':'◉','zap':'ϟ','layers':'▥','messages':'◌','briefcase':'▣'}[p.icon]||'◈')}</span><span class="audit-count">${countMap[p.id]} TOPIK</span></div><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p><div class="audit-footer"><span>${esc(p.label)}</span><b>↗</b></div></button>`).join('');
    $('#audit-select').innerHTML = `<option value="all">Semua jenis audit</option>${DATA.profiles.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} (${countMap[p.id]})</option>`).join('')}`;
    $('#sources-list').innerHTML=DATA.profiles.map(p=>`<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer" title="Rujukan publik: ${esc(p.name)}">${esc(p.name)} <span>↗</span></a>`).join('');
    $('.primary-nav').addEventListener('click',(e)=>{const b=e.target.closest('[data-page], [data-audit]'); if(!b)return; if(b.dataset.audit)openAudit(b.dataset.audit);else navigate(b.dataset.page);});
    document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',(e)=>{if(b.closest('.primary-nav'))return;e.preventDefault();navigate(b.dataset.page);}));
    document.querySelectorAll('.audit-card').forEach(b=>b.addEventListener('click',()=>openAudit(b.dataset.audit)));
  }
  function navigate(page,hash=true){
    if(!['beranda','jelajahi','peta','glosarium','panduan'].includes(page))page='beranda';
    activePage=page;
    document.querySelectorAll('.page').forEach(e=>e.classList.toggle('hidden',e.id!=='page-'+page));
    document.querySelectorAll('.nav-link[data-page]').forEach(e=>e.classList.toggle('active',e.dataset.page===page));
    $('#breadcrumb-current').textContent = ({beranda:'Ringkasan',jelajahi:'Jelajahi klausul',peta:'Peta audit',glosarium:'Glosarium',panduan:'Cara menggunakan'})[page];
    if(hash && location.hash!==`#${page}`){history.replaceState(null,'',`#${page}`);}
    $('#sidebar').classList.remove('open');$('#mobile-overlay').classList.remove('visible');
    window.scrollTo({top:0,behavior:'instant'});
    if(page==='jelajahi')applyFilters();if(page==='peta')renderPeta();
  }
  function openAudit(id){
    if(!profileMap[id])return;
    activeAudit=id;
    $('#audit-select').value=id;
    $('#search-input').value='';$('#hc-select').value='all';$('#readiness-select').value='all';
    refreshGroups();navigate('jelajahi');
  }
  function refreshGroups(){
    const c=$('#group-select');let last=c.value;
    const arr=[...new Set(DATA.clauses.filter(i=>activeAudit==='all'||i.audit===activeAudit).map(i=>i.group))].sort((a,b)=>a.localeCompare(b,'id'));
    c.innerHTML='<option value="all">Semua kelompok</option>'+arr.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
    c.value=arr.includes(last)?last:'all';
  }
  // Dokumen acuan CDM hanya akan dapat dibuka jika pemilik website sendiri
  // mengunggah berkas PDF berizin ke folder utama GitHub Pages.
  const cdmReferencePdf = './PTK-018_SKK_Migas_Revisi_II.pdf';
  async function updateCdmReferenceAvailability(){
    const links=document.querySelectorAll('[data-cdm-source-link]');
    const notes=document.querySelectorAll('[data-cdm-source-status]');
    if(!links.length && !notes.length)return;
    let found=false;
    try {
      const response=await fetch(cdmReferencePdf,{method:'HEAD',cache:'no-store'});
      found=response.ok && (response.headers.get('content-type')||'').toLowerCase().includes('pdf');
    } catch(_e) {found=false;}
    links.forEach(link=>{link.hidden=!found;});
    notes.forEach(note=>{
      note.textContent=found
        ? 'Dokumen PDF tersedia pada website. Silakan buka BAB III.10 (halaman PDF 68–71).'
        : 'Dokumen PDF belum dipublikasikan pada website. Ringkasan dan nomor halaman di bawah sudah dapat digunakan sebagai panduan. Unggah berkas sumber hanya jika memiliki izin distribusi publik.';
    });
  }
  function context(){
    const el=$('#audit-context');const p=profileMap[activeAudit];if(!p){el.classList.add('hidden');return;}
    el.classList.remove('hidden');
    // Keterangan khusus CDM SKK Migas - pembaruan v1.4.
    // Teks ini dipakai sebagai ringkasan publik, bukan pengganti naskah PTK resmi.
    if (p.id === 'cdm') {
      const overview = {
        title: 'CDM SKK Migas',
        reference: 'Pedoman Tata Kerja SKK Migas Nomor: PTK-018/SKKMA0000/2018/S0 Revisi 2 tentang Pengelolaan Sumber Daya Manusia Kontraktor Kontrak Kerja Sama.',
        chapter: 'BAB III.10: Evaluasi Kinerja Pengelolaan SDM KKKS.',
        scope: 'Pengelolaan SDM ini mencakup: Organization, Development, Compensation & Benefit, Industrial Relations, dan Medical.',
        summary: 'Evaluasi Kinerja Pengelolaan SDM KKKS adalah evaluasi tahunan yang dilakukan oleh Fungsi Pengelola SDM (FPSDM) SKK Migas terhadap kinerja pengelolaan SDM di KKKS Produksi dengan menerapkan prinsip yang objektif dan transparan.',
        introduction: 'Evaluasi kinerja ini dikelompokkan ke dalam pilar utama, yaitu:',
        pillars: [
          ['Career Development Monitoring (CDM)', 'Meliputi aktivitas perencanaan tenaga kerja, pengelolaan kinerja, pengelolaan kompetensi, pengelolaan posisi kunci, serta pengelolaan kompensasi dan benefit.'],
          ['Human Resource Compliance (HRC)', 'Meliputi aktivitas Rencana Penggunaan Tenaga Kerja (RPTK), pengelolaan Tenaga Kerja Asing (TKA), dan hubungan industrial.'],
          ['Occupational Health (Kesehatan Kerja)', 'Meliputi pemantauan dan pengelolaan program kesehatan kerja pekerja.']
        ]
      };
      el.innerHTML = `
        <div class="context-head"><h3>${esc(overview.title)}</h3></div>
        <div class="overview-section">
          <h4>Acuan Pelaksanaan</h4>
          <p>${esc(overview.reference)} ${esc(overview.chapter)}</p>
        </div>
        <div class="overview-section">
          <h4>Summary</h4>
          <p>${esc(overview.scope)}</p>
          <p>${esc(overview.summary)}</p>
          <p>${esc(overview.introduction)}</p>
          <ol class="overview-pillars">
            ${overview.pillars.map(([name, description]) => `<li><strong>${esc(name)}:</strong> ${esc(description)}</li>`).join('')}
          </ol>
        </div>
        <div class="overview-section cdm-doc-panel">
          <h4>Dokumen Dasar Audit CDM SKK Migas</h4>
          <p class="cdm-doc-lead">Rujukan langsung berdasarkan berkas PTK yang diperiksa, bukan hanya tautan berita atau rangkuman umum.</p>
          <dl class="cdm-doc-meta">
            <div><dt>Nomor pedoman</dt><dd>PTK-018/SKKMA0000/2018/S0</dd></div>
            <div><dt>Revisi dan tanggal</dt><dd>Revisi II · 4 Oktober 2018</dd></div>
            <div><dt>Judul</dt><dd>Pengelolaan Sumber Daya Manusia Kontraktor Kontrak Kerja Sama</dd></div>
            <div><dt>Bagian relevan</dt><dd>BAB III Angka 10, Evaluasi Kinerja Pengelolaan SDM KKKS</dd></div>
            <div><dt>Lokasi dalam dokumen</dt><dd>Halaman tercetak 58–61 · Halaman PDF 68–71 dari 167</dd></div>
          </dl>
          <h5>Poin penting yang ditemukan di dokumen</h5>
          <ul class="cdm-doc-findings">
            <li><strong>10.1.1:</strong> Evaluasi tahunan terhadap KKKS Produksi dengan prinsip objektif dan transparan (PDF hlm. 68).</li>
            <li><strong>10.1.2.1–10.1.2.3:</strong> CDM, Human Resource Compliance, dan Kesehatan Kerja (PDF hlm. 69).</li>
            <li><strong>10.4.1:</strong> Laporan kinerja periode tahun sebelumnya disampaikan pada kuartal pertama tahun berjalan (PDF hlm. 70).</li>
            <li><strong>10.5.1:</strong> Pelaporan menggunakan standar kebutuhan data pada Lampiran 37 (PDF hlm. 70).</li>
            <li><strong>10.5.6:</strong> Evaluasi dan pelaporan berkala tindak lanjut perbaikan pada setiap semester tahun berikutnya (PDF hlm. 71).</li>
          </ul>
          <p class="cdm-doc-caution"><strong>Catatan sumber:</strong> Butir 10.1.2 menyebut “dua kategori besar”, sedangkan butir 10.1.2.1–10.1.2.3 merinci tiga komponen. Ringkasan ini mengikuti tiga subbutir tersebut. Butir 10.1.4 dan 10.5.2 juga merujuk pada buku referensi penilaian kinerja pengelolaan SDM KKKS; untuk indikator rinci, sumber tambahan itu perlu diperoleh dan diperiksa.</p>
          <div class="cdm-doc-action">
            <p data-cdm-source-status role="status">Memeriksa ketersediaan dokumen PDF...</p>
            <a data-cdm-source-link hidden class="cdm-doc-button" href="${cdmReferencePdf}#page=68" target="_blank" rel="noopener noreferrer">↗ Baca BAB III.10 pada PDF (hlm. 68)</a>
          </div>
        </div>`;
      updateCdmReferenceAvailability();
      return;
    }
    // Audit SUPREME - pengantar dari redaksi pengguna (v1.9).
    // Indeks 191 ekspektasi yang ditelusuri tetap bersumber dari PDF tahun 2018.
    if (p.id === 'supreme') {
      const overview = {
        processes: [
          ['Leadership and Accountability (Kepemimpinan dan Akuntabilitas)', 'Penilaian terhadap komitmen dan keterlibatan pimpinan dalam penerapan sistem manajemen HSSE, pelaksanaan pengawasan, akuntabilitas terhadap pencapaian kinerja, serta penguatan budaya keselamatan di lingkungan perusahaan.'],
          ['Policy and Objectives (Kebijakan dan Sasaran)', 'Penilaian terhadap penetapan, penerapan, dan komunikasi kebijakan HSSE, kesesuaian dengan peraturan perundang-undangan dan persyaratan yang berlaku, serta perumusan sasaran dan target kinerja HSSE yang terukur.'],
          ['Organization, Responsibilities, Resources, and Documents (Organisasi, Tanggung Jawab, Sumber Daya, dan Dokumen)', 'Penilaian terhadap kejelasan struktur organisasi dan pembagian tanggung jawab, kecukupan sumber daya, pengelolaan kompetensi dan pelatihan pekerja, efektivitas komunikasi, serta pengelolaan dan pengendalian dokumen HSSE.'],
          ['Risk Management (Manajemen Risiko)', 'Penilaian terhadap pelaksanaan identifikasi bahaya, analisis dan evaluasi risiko, penetapan langkah pengendalian, pemantauan efektivitas pengendalian, serta pengelolaan risiko residual dalam kegiatan operasional perusahaan.'],
          ['Planning and Procedures (Perencanaan dan Prosedur)', 'Penilaian terhadap penyusunan rencana kerja HSSE, penetapan prosedur dan instruksi kerja, perencanaan pengelolaan perubahan (Management of Change), pengelolaan integritas aset, ketentuan sistem izin kerja aman, serta perencanaan kesiapsiagaan dan tanggap darurat.'],
          ['Implementation and Operational Control (Implementasi dan Pengendalian Operasional)', 'Penilaian terhadap pelaksanaan prosedur dan pengendalian HSSE dalam kegiatan operasional, pengawasan keselamatan kerja, pengelolaan keselamatan kontraktor, penerapan sistem izin kerja aman, pelaksanaan pengendalian perubahan, serta kesiapsiagaan dan penanganan kondisi darurat.'],
          ['Assurance: Monitoring, Measurement, and Audit (Jaminan: Pemantauan, Pengukuran, dan Audit)', 'Penilaian terhadap pelaksanaan pemantauan dan pengukuran kinerja HSSE, pencapaian indikator kinerja, pelaporan dan investigasi insiden, penanganan ketidaksesuaian, pelaksanaan audit internal, serta verifikasi efektivitas tindakan korektif dan tindak lanjut hasil audit.'],
          ['Management Review (Tinjauan Manajemen)', 'Penilaian terhadap pelaksanaan tinjauan manajemen atas kinerja dan efektivitas sistem manajemen HSSE, pencapaian sasaran, hasil audit dan evaluasi kepatuhan, penetapan keputusan serta tindak lanjut perbaikan, dan penguatan peningkatan berkelanjutan dalam pengelolaan risiko operasional.']
        ]
      };
      el.innerHTML = `
        <div class="context-head"><h3>Audit SUPREME</h3><span class="context-tag">Audit sumber 2018</span></div>
        <div class="overview-section">
          <h4>Acuan Pelaksanaan</h4>
          <p>Pertamina Standard Nomor PS-S-023-440-2023 tentang <em>SUPREME (Sustainability Pertamina Expectations for Management Excellence)</em>, yang merupakan pembaruan dari Pertamina Standard Nomor PS-Sy-0001-15-2019. Pelaksanaan audit mengacu pada Pedoman Implementasi SUPREME dan <em>SUPREME Internal Audit Protocol</em> (SIAP) sebagai panduan penilaian penerapan sistem manajemen <em>Health, Safety, Security, and Environment</em> (HSSE) di lingkungan Pertamina.</p>
        </div>
        <div class="overview-section">
          <h4>Summary</h4>
          <p>Audit SUPREME merupakan audit sistem manajemen internal Pertamina yang dilaksanakan untuk mengevaluasi kesesuaian dan efektivitas penerapan sistem manajemen <em>Health, Safety, Security, and Environment</em> (HSSE) dalam pengelolaan risiko operasional, pemenuhan ketentuan yang berlaku, pencegahan kecelakaan kerja, serta keberlanjutan kegiatan operasional perusahaan.</p>
          <p>Pelaksanaan audit dilakukan melalui pemeriksaan dokumen, wawancara, dan observasi lapangan untuk memastikan kesesuaian antara persyaratan sistem manajemen HSSE dengan implementasinya. Hasil audit menjadi dasar penetapan rekomendasi, tindakan korektif, dan peningkatan berkelanjutan (<em>continuous improvement</em>) terhadap kinerja HSSE perusahaan.</p>
          <p><strong>Evaluasi SUPREME dikelompokkan ke dalam 8 proses utama, yaitu:</strong></p>
          <ol class="overview-pillars">${overview.processes.map(([name,description]) => `<li><strong>${esc(name)}:</strong> ${esc(description)}</li>`).join('')}</ol>
          <p class="small-warning">Catatan sumber: bagian acuan pelaksanaan dan ringkasan di atas menggunakan redaksi yang diberikan pemilik website. Data ekspektasi bernomor dalam daftar pencarian tetap diindeks dari PDF SUPREME tahun 2018; kesesuaiannya dengan standar dan protokol 2023 belum diverifikasi.</p>
        </div>`;
      return;
    }
    // Pembaruan keterangan Audit PSAIMS v1.6 (teks supplied by user; acuan tetap perlu dikonfirmasi dengan dokumen resmi).
    if (p.id === 'psaims') {
      const overview = {
        "title": "AUDIT PSAIMS (Process Safety and Asset Integrity Management System)",
        "reference": "Pedoman PT Pertamina Hulu Energi (PHE) Nomor: A8-004/PHE04000/2021-S9 Revisi 0 tentang Process Safety and Asset Integrity Management System (PSAIMS), sebagai acuan penerapan sistem manajemen keselamatan proses dan integritas aset di lingkungan Pertamina Hulu Energi Subholding Upstream. Pelaksanaan audit mengacu pada ketentuan dan elemen PSAIMS yang ditetapkan perusahaan untuk memastikan keandalan fasilitas operasi serta pencegahan kecelakaan besar (Major Accident).",
        "summary": [
                "Audit PSAIMS merupakan audit sistem manajemen keselamatan proses dan integritas aset yang dilakukan untuk mengevaluasi kesesuaian dan efektivitas penerapan Process Safety and Asset Integrity Management System dalam mengidentifikasi, mengendalikan, serta memitigasi risiko kecelakaan besar pada kegiatan operasional minyak dan gas bumi.",
                "Audit dilakukan melalui pemeriksaan dokumen, wawancara dengan personel terkait, serta verifikasi langsung di lapangan untuk memastikan pengendalian risiko, keandalan peralatan, pemenuhan standar teknis, dan penerapan prosedur keselamatan proses.",
                "Hasil audit digunakan untuk mengidentifikasi ketidaksesuaian, menentukan rekomendasi perbaikan, serta meningkatkan keandalan operasi secara berkelanjutan guna mencapai Zero Major Accident dan Safe & Reliable Operation."
        ],
        "introduction": "Evaluasi PSAIMS pada kerangka Pertamina Hulu Energi Subholding Upstream dikelompokkan ke dalam 4 pilar utama yang mencakup 15 elemen, yaitu:",
        "pillars": [
                [
                        "Pemenuhan Peraturan dan Standar (Regulatory and Standards Compliance)",
                        "Meliputi Elemen 1, Izin Operasi, yang mencakup pemenuhan perizinan kegiatan operasional; serta Elemen 2, Pemenuhan Standar Teknis, yang mencakup penerapan regulasi, persyaratan teknis, standar industri, dan ketentuan keselamatan fasilitas."
                ],
                [
                        "Memahami dan Mengomunikasikan Risiko Keselamatan Proses (Understanding and Communicating Process Safety Risks)",
                        "Meliputi Elemen 3, Informasi Keselamatan Proses; Elemen 4, Analisis Bahaya Proses; Elemen 5, Komunikasi dan Kesadaran Keselamatan Proses; serta Elemen 6, Kompetensi Keselamatan Proses. Pilar ini berfokus pada identifikasi potensi bahaya, penilaian risiko, penyampaian informasi keselamatan, serta pengembangan kompetensi pekerja."
                ],
                [
                        "Operasi dan Pemeliharaan Fasilitas (Facility Operation and Maintenance)",
                        "Meliputi Elemen 7, Kesiapan Operasi dan Start-Up; Elemen 8, Pengendalian Operasi; Elemen 9, Integritas dan Keandalan Peralatan; Elemen 10, Manajemen Perubahan Fasilitas; serta Elemen 11, Kesiapan Menghadapi Kecelakaan Besar. Pilar ini mencakup pengendalian kegiatan operasi, inspeksi dan pemeliharaan peralatan, pengelolaan perubahan fasilitas, serta kesiapsiagaan menghadapi keadaan darurat."
                ],
                [
                        "Belajar dari Pengalaman (Learning from Experience)",
                        "Meliputi Elemen 12, Investigasi Kecelakaan Proses; Elemen 13, Belajar dari Kejadian; Elemen 14, Audit Keselamatan Proses dan Integritas Aset; serta Elemen 15, Pengukuran Kinerja Keselamatan Proses dan Integritas Aset. Pilar ini berfokus pada evaluasi kejadian, identifikasi akar penyebab, pelaksanaan audit, pemantauan indikator kinerja, dan tindakan perbaikan berkelanjutan."
                ]
        ]
};
      el.innerHTML = `
        <div class="context-head"><h3>${esc(overview.title)}</h3></div>
        <div class="overview-section">
          <h4>Acuan Pelaksanaan</h4>
          <p>${esc(overview.reference)}</p>
        </div>
        <div class="overview-section">
          <h4>Summary</h4>
          ${overview.summary.map(text => `<p>${esc(text)}</p>`).join('')}
          <p>${esc(overview.introduction)}</p>
          <ol class="overview-pillars">
            ${overview.pillars.map(([name, description]) => `<li><strong>${esc(name)}:</strong> ${esc(description)}</li>`).join('')}
          </ol>
        </div>`;
      return;
    }
    if (p.detailedOverview) {
      const d = p.detailedOverview;
      const pillars = (d.pillars || []).map(x =>
        `<li><strong>${esc(x.name)}:</strong> ${esc(x.description)}</li>`
      ).join('');
      el.innerHTML = `<div class="context-head"><h3>${esc(p.name)}</h3></div>
        <div class="overview-section">
          <h4>${esc(d.referenceHeading)}</h4>
          <p>${esc(d.reference)}</p>
          <p><strong>${esc(d.chapter)}</strong></p>
        </div>
        <div class="overview-section">
          <h4>${esc(d.summaryHeading)}</h4>
          <p>${esc(d.scope)}</p>
          <p>${esc(d.summary)}</p>
          <p>${esc(d.introPillars)}</p>
          <ol class="overview-pillars">${pillars}</ol>
        </div>`;
      return;
    }
    el.innerHTML=`<div class="context-head"><h3>${esc(p.name)}</h3><span class="context-tag">${esc(p.confidence)}</span></div><p><strong>Apa ini?</strong> ${esc(p.short)}<br><strong>Tujuan:</strong> ${esc(p.purpose)}</p><div class="context-meta"><span class="tiny-badge">${esc(p.version)}</span><span class="tiny-badge">PIC umum: ${esc(p.audience)}</span></div><p class="small-warning">⚠ ${esc(p.warning)}</p>`;
  }
  function applyFilters(){
    if(activePage!=='jelajahi')return;
    const search=normalize($('#search-input').value).trim();
    const hc=$('#hc-select').value,group=$('#group-select').value,ready=$('#readiness-select').value;
    const words=search.split(/\s+/).filter(Boolean);
    filtered=DATA.clauses.filter(i=>{
      if(activeAudit!=='all' && i.audit!==activeAudit)return false;
      if(hc!=='all' && i.hc!==hc)return false;
      if(group!=='all' && i.group!==group)return false;
      if(ready!=='all' && getStatus(i)!==ready)return false;
      if(words.length){const hay=normalize([profileMap[i.audit].name, profileMap[i.audit].label,i.code,i.title,i.description,i.group,i.pic,i.hc,i.referenceText||'',...i.evidence,...i.metadata].join(' '));if(!words.every(w=>hay.includes(w)))return false;}
      return true;
    });
    // SUPREME: tampilkan Proses 1, lalu ekspektasi 1.1..1.30, dst.
    // Jika mencari kode eksak (misalnya 2.1), dahulukan hasil tersebut.
    if(activeAudit==='supreme'){
      const order=(item)=>{
        const m=String(item.code).match(/^([1-8])(?:\.(\d+))?$/);
        return m ? Number(m[1])*1000 + (m[2]===undefined?0:Number(m[2])) : 99999;
      };
      filtered.sort((a,b)=>{
        const exactA=normalize(a.code)===search ? 1 : 0;
        const exactB=normalize(b.code)===search ? 1 : 0;
        return exactB-exactA || order(a)-order(b);
      });
    }
    context();
    $('#result-count').textContent=filtered.length+' topik';
    $('#active-filter-summary').textContent=(activeAudit==='all'?'Semua audit':profileMap[activeAudit].name)+(words.length?' · Kata kunci: '+search:'');
    $('#empty-state').classList.toggle('hidden',filtered.length>0);
    renderResults();
  }
  function renderResults(){
    const visible=filtered.slice(0,shown);
    $('#result-list').innerHTML=visible.map(i=>{
      const p=profileMap[i.audit];const status=getStatus(i);
      return `<button class="result-card" data-item="${esc(i.id)}"><span class="result-code">${esc(i.code)}</span><div class="result-body"><div class="result-badges"><span>${esc(p.name)}</span><span>${esc(i.group)}</span><span class="status">${esc(hStat(i.hc))}</span></div><h3>${esc(i.title)}</h3><p>${esc(i.description)}</p></div><div class="result-end"><span>${esc(status)}</span><b>↗</b></div></button>`;
    }).join('');
    $('#load-more').classList.toggle('hidden',filtered.length<=shown);
    document.querySelectorAll('.result-card').forEach(x=>x.addEventListener('click',()=>openItem(x.dataset.item)));
  }
  function openItem(id){
    const i=DATA.clauses.find(x=>x.id===id);if(!i)return;
    const p=profileMap[i.audit];
    const list=i.evidence.map(x=>`<li>${esc(x)}</li>`).join('');
    const supreme2018=i.sourceType==='supreme-2018';
    const isExpectation=supreme2018 && /^\d+\.\d+$/.test(i.code);
    const evidenceSection=isExpectation
      ? `<h3>03 / Penelusuran bukti</h3><p>Butir ini merupakan ringkasan singkat dari PDF SUPREME 2018, bukan checklist auditor. Jenis eviden spesifik harus dikonfirmasi melalui protokol audit terbaru dan fungsi pemilik proses.</p>`
      : `<h3>03 / Contoh dokumen yang bisa ditelusuri</h3><p>Contoh awal, bukan daftar wajib. Sesuaikan dengan protokol, ruang lingkup, dan izin distribusi.</p><ul>${list}</ul>`;
    const sourceSection=supreme2018
      ? `<h3>05 / Rujukan dokumen sumber</h3><p><strong>SUPREME 2018</strong> · ${esc(i.referenceText||'Proses yang relevan dalam PDF SUPREME 2018.')}.</p><p>Rujukan ini dipetakan dari PDF <em>supreme.pdf</em> yang diunggah. PDF tidak dipublikasikan otomatis melalui website. Nomor butir dan halamannya dapat digunakan untuk menelusuri dokumen yang sah secara internal.</p><p class="small-warning">Belum diverifikasi kesesuaiannya dengan Pertamina Standard 2023 maupun SUPREME Internal Audit Protocol (SIAP) yang berlaku.</p>`
      : p.id==='cdm'
        ? `<h3>05 / Dasar informasi</h3><p><strong>PTK-018/SKKMA0000/2018/S0 Revisi II.</strong> Untuk dasar pengaturan evaluasi SDM, lihat BAB III.10 pada halaman PDF 68–71. Penjelasan subtopik dalam database tetap merupakan pemetaan tematik, bukan pengganti buku referensi penilaian kinerja KKKS.</p><p data-cdm-source-status role="status">Memeriksa ketersediaan PDF sumber...</p><p><a data-cdm-source-link hidden class="dialog-source" href="${cdmReferencePdf}#page=68" target="_blank" rel="noopener noreferrer">Lihat dokumen PTK, BAB III.10 ↗</a></p>`
        : `<h3>05 / Dasar informasi</h3><p><a class="dialog-source" href="${esc(i.source)}" target="_blank" rel="noopener noreferrer">Lihat sumber umum terkait (bukan verifikasi klausul) ↗</a></p><p class="small-warning">${esc(p.warning)}</p>`;
    const root = i.code.match(/^(?:[4-9]|10)(?=\.)/);
    const path=root?`${esc(p.name)} → ${esc(i.group)} → ${esc(i.code)}`:`${esc(p.name)} → ${esc(i.group)} → ${esc(i.code)}`;
    $('#dialog-content').innerHTML=`<div class="dialog-kicker">KLAUSUL / ELEMEN AUDIT</div><h2 id="dialog-title">${esc(i.title)}</h2><p class="dialog-subtitle">${path}</p><div class="dialog-badges"><span>${esc(p.version)}</span><span>${esc(hStat(i.hc))}</span><span>${esc(i.status)}</span></div><div class="dialog-section"><h3>01 / Penjelasan sederhana</h3><p>${esc(i.description)}</p></div><div class="dialog-section"><h3>02 / Pertanyaan panduan pemeriksaan</h3><p>${esc(i.question)}</p></div><div class="dialog-section">${evidenceSection}</div><div class="dialog-section"><h3>04 / Pemilik proses dan metadata</h3><p><strong>PIC umum:</strong> ${esc(i.pic)}<br><strong>Keterlibatan HC:</strong> ${esc(i.hc)}<br><strong>Sumber pemetaan:</strong> ${esc(i.origin)}${i.referenceText?'<br><strong>Referensi yang tercantum dalam tabel:</strong> '+esc(i.referenceText):''}</p><div class="dialog-badges">${i.metadata.slice(0,8).map(t=>`<span>#${esc(t)}</span>`).join('')}</div></div><div class="dialog-section">${sourceSection}</div><div class="dialog-status"><strong>Checklist pribadi</strong><p>Tidak dikirim ke server. Status disimpan hanya dalam browser pada perangkat ini dan tidak menjadi bukti audit formal.</p><label><span class="sr-only">Status kesiapan</span><select id="detail-status">${possible.map(s=>`<option ${getStatus(i)===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label></div>`;
    if(p.id==='cdm') updateCdmReferenceAvailability();
    $('#detail-status').addEventListener('change',(e)=>{saveStatus(i.id,e.target.value);toast('Status lokal diperbarui: '+e.target.value);});
    const dialog=$('#detail-dialog');if(!dialog.open)dialog.showModal();
  }
  function renderGlossary(){
    const term=normalize($('#glossary-search').value);
    const elems=DATA.glossary.filter(x=>normalize(x.term+' '+x.meaning).includes(term));
    $('#glossary-list').innerHTML=elems.map(x=>`<article class="glossary-item"><strong>${esc(x.term)}</strong><p>${esc(x.meaning)}</p></article>`).join('')||'<p>Tidak ditemukan. Coba istilah lain.</p>';
  }
  function reset(){
    activeAudit='all';shown=18;
    $('#search-input').value='';$('#audit-select').value='all';$('#hc-select').value='all';$('#readiness-select').value='all';refreshGroups();$('#group-select').value='all';applyFilters();
  }
  const csvSafe = v => { let t=String(v??'');if(/^[\s]*[=+\-@]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"'; };
  function renderPeta(){
    const sel=$('#peta-audit-select'), search=normalize($('#peta-search').value.trim());
    const words=search.split(/\s+/).filter(Boolean);
    const entries=(DATA.framework||[]).filter(f=>{
      if(sel.value!=='all'&&f.audit!==sel.value)return false;
      const hay=normalize([profileMap[f.audit].name,f.audit_as_tertuang,f.group,f.reference,...f.indicators,...f.evidence,...f.tags].join(' '));
      return words.every(w=>hay.includes(w));
    });
    $('#peta-result-count').textContent=entries.length+' kelompok besar';
    $('#peta-empty').classList.toggle('hidden',entries.length>0);
    $('#peta-list').innerHTML=entries.map(f=>`<details class="peta-card"><summary><span class="peta-number">${String(f.position).padStart(2,'0')}</span><span class="peta-labels"><small>${esc(profileMap[f.audit].name)} · ${esc(f.level)}</small><strong>${esc(f.group)}</strong><span>${esc(f.reference)} · ${f.audit==='supreme'?'Dari PDF SUPREME 2018':'Perlu verifikasi'}</span></span><span class="peta-chevron">⌄</span></summary><div class="peta-detail"><div class="peta-detail-col"><h3>Indikator penilaian (dari tabel)</h3><ul>${f.indicators.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="peta-detail-col"><h3>Contoh dokumen eviden (dari tabel)</h3><ul>${f.evidence.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="peta-detail-full"><p><strong>Referensi tercantum:</strong> ${esc(f.reference)}. <strong>Peran:</strong> ${esc(f.pic)}.</p><p class="peta-validation">ⓘ ${esc(f.validation)}</p><div class="peta-tags">${f.tags.slice(0,9).map(t=>`<span>#${esc(t)}</span>`).join('')}</div><button class="btn btn-outline peta-to-detail" data-peta-audit="${esc(f.audit)}">Jelajahi topik lebih rinci →</button></div></div></details>`).join('');
    document.querySelectorAll('.peta-to-detail').forEach(b=>b.addEventListener('click',()=>openAudit(b.dataset.petaAudit)));
  }
  function exportPetaCsv(){
    const rows=[['Jenis Audit','Kelompok Besar','Referensi pada tabel (belum diverifikasi)','Indikator','Eviden','Status Validasi'],...(DATA.framework||[]).map(f=>[profileMap[f.audit].name,f.group,f.reference,f.indicators.join('; '),f.evidence.join('; '),f.validation])];
    const blob=new Blob(['\uFEFF'+rows.map(row=>row.map(csvSafe).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='audit-atlas-peta-kelompok-besar.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Peta audit diekspor');
  }
  function init(){
    buildNavigation();updateStats();refreshGroups();renderGlossary();
    $('#peta-audit-select').innerHTML='<option value="all">Semua jenis audit</option>'+DATA.profiles.filter(p=>(DATA.framework||[]).some(f=>f.audit===p.id)).map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    $('#peta-audit-select').addEventListener('change',renderPeta);$('#peta-search').addEventListener('input',debounce(renderPeta));$('#peta-export').addEventListener('click',exportPetaCsv);renderPeta();
    $('#audit-select').addEventListener('change',e=>{activeAudit=e.target.value;shown=18;refreshGroups();applyFilters();});
    $('#hc-select').addEventListener('change',()=>{shown=18;applyFilters();});
    $('#group-select').addEventListener('change',()=>{shown=18;applyFilters();});
    $('#readiness-select').addEventListener('change',()=>{shown=18;applyFilters();});
    $('#search-input').addEventListener('input',debounce(()=>{shown=18;applyFilters();}));
    $('#glossary-search').addEventListener('input',debounce(renderGlossary));
    $('#reset-filters').addEventListener('click',reset);$('#empty-reset').addEventListener('click',reset);
    $('#load-more').addEventListener('click',()=>{shown+=18;renderResults();});
    $('#dialog-close').addEventListener('click',()=>$('#detail-dialog').close());
    $('#detail-dialog').addEventListener('click',e=>{if(e.target===$('#detail-dialog'))$('#detail-dialog').close();});
    $('#open-search').addEventListener('click',()=>{navigate('jelajahi');$('#search-input').focus();});
    document.addEventListener('keydown',e=>{if(e.key==='/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'') && !$('#detail-dialog').open){e.preventDefault();navigate('jelajahi');$('#search-input').focus();}});
    $('#menu-toggle').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#mobile-overlay').classList.add('visible');});
    $('#mobile-overlay').addEventListener('click',()=>{$('#sidebar').classList.remove('open');$('#mobile-overlay').classList.remove('visible');});
    window.addEventListener('hashchange',()=>navigate(location.hash.slice(1),false));
    navigate(location.hash.slice(1)||'beranda',false);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
