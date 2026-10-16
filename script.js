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
  function context(){
    const el=$('#audit-context');const p=profileMap[activeAudit];if(!p){el.classList.add('hidden');return;}
    el.classList.remove('hidden');
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
    const root = i.code.match(/^(?:[4-9]|10)(?=\.)/);
    const path=root?`${esc(p.name)} → ${esc(i.group)} → ${esc(i.code)}`:`${esc(p.name)} → ${esc(i.group)} → ${esc(i.code)}`;
    $('#dialog-content').innerHTML=`<div class="dialog-kicker">KLAUSUL / ELEMEN AUDIT</div><h2 id="dialog-title">${esc(i.title)}</h2><p class="dialog-subtitle">${path}</p><div class="dialog-badges"><span>${esc(p.version)}</span><span>${esc(hStat(i.hc))}</span><span>${esc(i.status)}</span></div><div class="dialog-section"><h3>01 / Penjelasan sederhana</h3><p>${esc(i.description)}</p></div><div class="dialog-section"><h3>02 / Pertanyaan panduan pemeriksaan</h3><p>${esc(i.question)}</p></div><div class="dialog-section"><h3>03 / Contoh dokumen yang bisa ditelusuri</h3><p>Bukan daftar wajib; sesuaikan dengan protokol, ruang lingkup, dan persetujuan pengendali dokumen.</p><ul>${list}</ul></div><div class="dialog-section"><h3>04 / Pemilik proses dan metadata</h3><p><strong>PIC umum:</strong> ${esc(i.pic)}<br><strong>Keterlibatan HC:</strong> ${esc(i.hc)}<br><strong>Sumber pemetaan:</strong> ${esc(i.origin)}${i.referenceText?'<br><strong>Referensi yang tercantum dalam tabel:</strong> '+esc(i.referenceText):''}</p><div class="dialog-badges">${i.metadata.slice(0,8).map(t=>`<span>#${esc(t)}</span>`).join('')}</div></div><div class="dialog-section"><h3>05 / Dasar informasi</h3><p><a class="dialog-source" href="${esc(i.source)}" target="_blank" rel="noopener noreferrer">Lihat sumber umum terkait (bukan verifikasi klausul) ↗</a></p><p class="small-warning">${esc(p.warning)}</p></div><div class="dialog-status"><strong>Checklist pribadi</strong><p>Tidak dikirim ke server. Status disimpan hanya dalam browser pada perangkat ini dan tidak menjadi bukti audit formal.</p><label><span class="sr-only">Status kesiapan</span><select id="detail-status">${possible.map(s=>`<option ${getStatus(i)===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label></div>`;
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
  function exportCsv(){
    const columns=['Jenis Audit','Kode Klausul','Kelompok Umum','Nama Topik','Penjelasan Sederhana','PIC Perkiraan','Peran HC','Contoh Bukti','Status Lokal','Status Verifikasi','Sumber URL'];
    const lines=[columns,...filtered.map(x=>[profileMap[x.audit].name,x.code,x.group,x.title,x.description,x.pic,x.hc,x.evidence.join('; '),getStatus(x),x.status,x.source])];
    const blob=new Blob(['\uFEFF'+lines.map(row=>row.map(csvSafe).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='audit-atlas-hasil-filter.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(`${filtered.length} topik diekspor ke CSV`);
  }

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
    $('#peta-list').innerHTML=entries.map(f=>`<details class="peta-card"><summary><span class="peta-number">${String(f.position).padStart(2,'0')}</span><span class="peta-labels"><small>${esc(profileMap[f.audit].name)} · ${esc(f.level)}</small><strong>${esc(f.group)}</strong><span>${esc(f.reference)} · Belum diverifikasi</span></span><span class="peta-chevron">⌄</span></summary><div class="peta-detail"><div class="peta-detail-col"><h3>Indikator penilaian (dari tabel)</h3><ul>${f.indicators.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="peta-detail-col"><h3>Contoh dokumen eviden (dari tabel)</h3><ul>${f.evidence.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="peta-detail-full"><p><strong>Referensi tercantum:</strong> ${esc(f.reference)}. <strong>Peran:</strong> ${esc(f.pic)}.</p><p class="peta-validation">⚠ ${esc(f.validation)}</p><div class="peta-tags">${f.tags.slice(0,9).map(t=>`<span>#${esc(t)}</span>`).join('')}</div><button class="btn btn-outline peta-to-detail" data-peta-audit="${esc(f.audit)}">Jelajahi topik lebih rinci →</button></div></div></details>`).join('');
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
    $('#export-csv').addEventListener('click',exportCsv);
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
