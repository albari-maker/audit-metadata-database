/* Audit v3.19 - Editor Evidence: links and visible labels.
 * Public site reads only audit-evidence-links.js. Editor drafts never publish automatically.
 * All input is treated as text; URLs must be HTTPS and open with noreferrer/noopener.
 */
(() => {
  'use strict';
  const EDITOR = new URLSearchParams(location.search).get('editor') === '1';
  const STORAGE_KEY = 'audit-evidence-draft-v319';
  const OUTPUT_FILE = 'audit-evidence-links.js';
  const published = (window.AUDIT_EVIDENCE_LINKS && typeof window.AUDIT_EVIDENCE_LINKS === 'object' && !Array.isArray(window.AUDIT_EVIDENCE_LINKS))
    ? window.AUDIT_EVIDENCE_LINKS : {};
  let drafts = {};
  if(EDITOR){
    try {const val=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');if(val && typeof val==='object' && !Array.isArray(val))drafts=val;} catch(_e) {}
  }
  const el = (id) => document.getElementById(id);
  const escape = (v) => String(v ?? '').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const makeKey=(parent,section,index)=>`${parent}::${section}::${index}`;
  function normalizeURL(value){
    const input=String(value||'').trim();
    if(!input)return '';
    if(input.length>2048)return '';
    try {const u=new URL(input);if(u.protocol==='https:')return u.href;} catch(_e) {}
    return '';
  }
  const hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  function entry(parent,section,index,initialText){
    const key=makeKey(parent,section,index);
    const data=EDITOR && hasOwn(drafts,key)?drafts[key]:published[key];
    if(!data || typeof data!=='object')return {text:String(initialText??''),url:''};
    return {text:typeof data.text==='string'?data.text:String(initialText??''),url:normalizeURL(data.url)};
  }
  const entryText=(parent,section,index,original)=>entry(parent,section,index,original).text;
  function markupFor(parent,section,index,original){
    const key=makeKey(parent,section,index), data=entry(parent,section,index,original);
    const label=escape(data.text||String(original||''));
    const content=data.url
      ? `<a class="evidence-folder-link" href="${escape(data.url)}" target="_blank" rel="noopener noreferrer" title="Buka folder atau dokumen evidence di tab baru">${label} <span aria-hidden="true">↗</span></a>`
      : `<span class="evidence-item-text">${label}</span>`;
    const controls=EDITOR ? `<button class="evidence-edit-btn" type="button" data-evidence-key="${escape(key)}" aria-label="Edit teks dan tautan evidence ${label}">✎ Edit link</button>` : '';
    return `<li class="evidence-record" data-evidence-record="${escape(key)}"><div class="evidence-record-inner">${content}${controls}</div></li>`;
  }
  function renderList(parent,section,records){
    if(!Array.isArray(records))return '<ul></ul>';
    return `<ul class="evidence-linked-list">${records.map((v,i)=>markupFor(parent,section,i,v)).join('')}</ul>`;
  }
  // Use updated evidence labels in autocomplete and search indexing.
  function renderSearchText(parent,section,records){
    return (records||[]).map((original,index)=>entryText(parent,section,index,original));
  }
  const exportAction = () => EDITOR ? '<button type="button" class="evidence-inline-export" data-evidence-export>↓ Unduh File Link Evidence</button>' : '';
  window.AuditEvidence={renderList,entryText,renderSearchText,exportAction};
  function readOriginal(key){
    const match=/^(.*?)::(.*?)::(\d+)$/.exec(key);
    if(!match)return null;
    const [,parentId,section,indexRaw]=match,index=Number(indexRaw);
    const data=window.AUDIT_DATA;
    const parent=(data?.clauses||[]).find(x=>x.id===parentId) || (data?.supremeExpectations2018||[]).find(x=>x.id===parentId);
    if(!parent)return null;
    const records=section==='general'?parent.evidence:parent.auditorDetail?.find(x=>x.code===section)?.evidence;
    if(!Array.isArray(records)||index<0||index>=records.length)return null;
    return {key,parentId,section,index,text:String(records[index]??''),heading:`${parent.audit.toUpperCase()} • ${section==='general'?parent.code:section}`};
  }
  const style=document.createElement('style');
  style.textContent=`
    .evidence-folder-link{color:#096bb4!important;font-weight:650;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}
    .evidence-folder-link:hover{color:#034d84!important}
    .evidence-linked-list .evidence-record-inner{display:flex;align-items:flex-start;flex-wrap:wrap;gap:10px}
    .evidence-item-text{overflow-wrap:anywhere}
    .evidence-edit-btn{font:600 12px system-ui,sans-serif;color:#096bb4;border:1px solid #b9d4e9;background:#f2f8ff;border-radius:7px;padding:4px 9px;cursor:pointer;white-space:nowrap}
    .evidence-edit-btn:hover{background:#dceeff}
    #evidence-editor-dialog{width:min(540px,calc(100vw - 24px));max-height:90vh;overflow:auto;border:1px solid #cbdce7;border-radius:16px;padding:0;box-shadow:0 30px 80px #092a4044;color:#16384b;background:white}
    #evidence-editor-dialog::backdrop{background:#061e2d99}
    #evidence-editor-dialog .ev-header{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:18px 20px;background:#092d43;color:#fff}
    #evidence-editor-dialog .ev-header strong{font-size:18px}
    #evidence-editor-dialog .ev-header button{background:transparent;color:#fff;border:1px solid #668797;border-radius:7px;cursor:pointer;padding:4px 9px;font-size:20px}
    #evidence-editor-dialog .ev-body{padding:20px}
    #evidence-editor-dialog .ev-meta{font-size:13px;color:#648395;margin-bottom:12px}
    #evidence-editor-dialog label{display:block;font-weight:700;font-size:13px;margin:16px 0 7px;color:#153c52}
    #evidence-editor-dialog textarea,#evidence-editor-dialog input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #bed2df;border-radius:8px;background:white;color:#12384c;font:14px system-ui;line-height:1.5}
    #evidence-editor-dialog .ev-help{font-size:12px;color:#57768a;line-height:1.6;margin:8px 0}
    #evidence-editor-dialog .ev-error{color:#9b2323;font-size:13px;min-height:17px;margin-top:8px}
    #evidence-editor-dialog .ev-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
    #evidence-editor-dialog .ev-actions button,#audit-evidence-tools button{font:600 13px system-ui;border:1px solid #b9d1e2;color:#0d5a8d;background:#f7fbff;border-radius:8px;padding:10px 12px;cursor:pointer}
    #evidence-editor-dialog .ev-primary,#audit-evidence-tools .ev-primary{background:#0b70b7!important;color:white!important;border-color:#0b70b7!important}
    .evidence-inline-export{margin:10px 0 18px;padding:8px 12px;border:1px solid #a6cfe4;background:#eaf7ff;color:#0d6090;border-radius:8px;cursor:pointer;font-weight:750;font-size:13px}
    .evidence-inline-export:hover{background:#d5ebf8}
    #audit-evidence-tools{position:fixed;bottom:18px;left:16px;z-index:9500;max-width:min(360px,calc(100vw - 32px));box-sizing:border-box;background:white;color:#17384b;border:1px solid #bfdae9;border-radius:12px;box-shadow:0 12px 33px #153e5955;padding:12px 14px;font:13px system-ui}
    #audit-evidence-tools .ev-toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between}
    #audit-evidence-tools small{display:block;font-size:11px;line-height:1.5;color:#59778d;margin-top:6px}
    #audit-evidence-tools .ev-number{font-weight:700;color:#12719a}
    @media(max-width:750px){#audit-evidence-tools{bottom:12px;left:10px;right:10px;max-width:none}}
  `;
  document.head.appendChild(style);
  if(!EDITOR)return;
  let currentKey='';
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(drafts));return true;}catch(_e){return false;}}
  function refreshRow(key){
    const orig=readOriginal(key);if(!orig)return;
    const row=[...document.querySelectorAll('.evidence-record')].find(x=>x.dataset.evidenceRecord===key);
    if(!row)return;
    const template=document.createElement('div');
    template.innerHTML=markupFor(orig.parentId,orig.section,orig.index,orig.text);
    const replacement=template.firstElementChild;
    if(replacement)row.replaceWith(replacement);
  }
  function exportFile(){
    const combined={...published,...drafts};
    const valid={};
    for(const [key,value] of Object.entries(combined)){
      if(!readOriginal(key) || !value || typeof value!=='object')continue;
      valid[key]={text:String(value.text??'').slice(0,800),url:normalizeURL(value.url)};
    }
    const textContent=`/* Audit - link evidence terbitan Editor Evidence. Jangan taruh data rahasia di sini. */\nwindow.AUDIT_EVIDENCE_LINKS = ${JSON.stringify(valid,null,2).replace(/</g,'\\u003c')};\n`;
    const blob=new Blob([textContent],{type:'application/javascript;charset=utf-8'});
    const address=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=address;a.download=OUTPUT_FILE;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(address),800);
    const status=el('evidence-tool-status');if(status)status.textContent=`${Object.keys(valid).length} perubahan ada dalam file. Unggah ${OUTPUT_FILE} ke folder utama GitHub.`;
  }
  function buildUI(){
    const dialog=document.createElement('dialog');dialog.id='evidence-editor-dialog';dialog.setAttribute('aria-labelledby','ev-heading');
    dialog.innerHTML=`<div class="ev-header"><strong id="ev-heading">Edit Bukti (Evidence)</strong><button type="button" id="ev-close" aria-label="Tutup Editor Evidence">×</button></div>
      <div class="ev-body"><div class="ev-meta" id="ev-source"></div>
      <label for="ev-text">Tulisan yang tampil pada Evidence</label><textarea id="ev-text" rows="3" maxlength="800" placeholder="Contoh: Training needs analysis"></textarea>
      <label for="ev-url">Link folder atau dokumen</label><input id="ev-url" type="url" inputmode="url" placeholder="https://drive.google.com/drive/folders/..." autocomplete="url"/>
      <p class="ev-help">Gunakan link lengkap HTTPS, misalnya Google Drive, SharePoint, atau OneDrive. Teks akan menjadi tautan yang terbuka di tab baru. Hak akses folder tetap diatur di layanan penyimpanannya.</p>
      <div class="ev-error" id="ev-error" role="alert"></div>
      <div class="ev-actions"><button type="button" class="ev-primary" id="ev-save">Simpan pratinjau</button><button type="button" id="ev-reset">Kembalikan teks awal</button><button type="button" id="ev-export">Unduh File Link Evidence</button></div>
      <p class="ev-help"><strong>Catatan:</strong> Simpan pratinjau hanya berlaku di browser ini. Agar pengunjung melihat hasilnya, unggah file hasil unduhan <code>${OUTPUT_FILE}</code> ke repository GitHub publik. Jangan bagikan tautan ke folder internal tanpa izin perusahaan.</p></div>`;
    document.body.appendChild(dialog);
    const bar=document.createElement('aside');bar.id='audit-evidence-tools';bar.setAttribute('aria-label','Tools Editor Evidence');
    bar.innerHTML=`<div class="ev-toolbar"><strong>✎ Editor Evidence</strong><button type="button" class="ev-primary" id="ev-export-all">Unduh File Link Evidence</button></div><small id="evidence-tool-status">Buka detail audit, klik <strong>✎ Edit link</strong> pada salah satu bukti, lalu simpan.</small>`;
    document.body.appendChild(bar);
    el('ev-close').addEventListener('click',()=>dialog.close());
    el('ev-save').addEventListener('click',()=>{
      const orig=readOriginal(currentKey);if(!orig)return;
      const text=el('ev-text').value.trim(), rawURL=el('ev-url').value.trim();
      if(!text){el('ev-error').textContent='Teks Evidence wajib diisi.';return;}
      const url=normalizeURL(rawURL);
      if(rawURL && !url){el('ev-error').textContent='URL harus dimulai dengan https:// dan merupakan tautan yang valid.';return;}
      drafts[currentKey]={text,url};
      const saved=persist();refreshRow(currentKey);
      el('ev-error').textContent='';
      const status=el('evidence-tool-status');status.textContent=(saved?'Pratinjau tersimpan.':'Pratinjau tersimpan sementara; penyimpanan browser diblokir.')+' Klik Unduh File Link Evidence untuk menerbitkan di GitHub.';
      dialog.close();
      window.dispatchEvent(new CustomEvent('audit-evidence-changed'));
    });
    el('ev-reset').addEventListener('click',()=>{
      const orig=readOriginal(currentKey);if(!orig)return;
      // Export the explicit original even if the deployed file had an older override.
      drafts[currentKey]={text:orig.text,url:''};persist();refreshRow(currentKey);
      window.dispatchEvent(new CustomEvent('audit-evidence-changed'));
      dialog.close();
    });
    el('ev-export').addEventListener('click',exportFile);
    el('ev-export-all').addEventListener('click',exportFile);
    document.addEventListener('click',ev=>{
      if(ev.target.closest('[data-evidence-export]')){exportFile();return;}
      const button=ev.target.closest('.evidence-edit-btn');
      if(!button)return;
      const key=button.dataset.evidenceKey,orig=readOriginal(key);
      if(!orig)return;
      currentKey=key;
      const value=entry(orig.parentId,orig.section,orig.index,orig.text);
      el('ev-source').textContent=orig.heading;
      el('ev-text').value=value.text;
      el('ev-url').value=value.url;
      el('ev-error').textContent='';
      dialog.showModal();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildUI);else buildUI();
})();
