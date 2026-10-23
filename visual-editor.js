/* AuditAtlas Visual Editor v3.0 - editor lokal, bukan panel admin server. */
(() => {
  'use strict';
  const search = new URLSearchParams(location.search);
  if (search.get('editor') !== '1') return;
  const MOBILE_LIMIT = 900;
  const STORAGE_KEY = 'auditatlas-layout-editor-v27';
  const editables = [
    {id:'beranda-img',page:'beranda',label:'Karakter',selector:'#page-beranda .hero-worker',anchor:'right-bottom'},
    {id:'beranda-bubble',page:'beranda',label:'Kotak percakapan',selector:'#page-beranda .hero-speech',anchor:'left-top'},
    {id:'jelajahi-img',page:'jelajahi',label:'Karakter',selector:'#page-jelajahi .feature-banner-worker',anchor:'right-bottom'},
    {id:'jelajahi-bubble',page:'jelajahi',label:'Kotak percakapan',selector:'#page-jelajahi .feature-banner-bubble',anchor:'left-top'},
    {id:'peta-img',page:'peta',label:'Karakter',selector:'#page-peta .hero-worker',anchor:'right-bottom'},
    {id:'peta-bubble',page:'peta',label:'Kotak percakapan',selector:'#page-peta .hero-speech',anchor:'left-top'},
    {id:'glosarium-img',page:'glosarium',label:'Karakter',selector:'#page-glosarium .feature-banner-worker',anchor:'right-bottom'},
    {id:'glosarium-bubble',page:'glosarium',label:'Kotak percakapan',selector:'#page-glosarium .feature-banner-bubble',anchor:'left-top'},
    {id:'panduan-img',page:'panduan',label:'Karakter',selector:'#page-panduan .feature-banner-worker',anchor:'right-bottom'},
    {id:'panduan-bubble',page:'panduan',label:'Kotak percakapan',selector:'#page-panduan .feature-banner-bubble',anchor:'left-top'}
  ];
  const pageLabels={beranda:'Ringkasan',jelajahi:'Jelajahi Klausul',peta:'Peta Audit',glosarium:'Glosarium',panduan:'Panduan Penggunaan'};
  let changes = {};
  try { const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); if(parsed && typeof parsed==='object' && !Array.isArray(parsed))changes=parsed; } catch (_e) {}
  let currentPage='beranda',currentId='beranda-img';
  let savedState=true,drag=null;
  const current = () => editables.find(x=>x.id===currentId);
  const $ = (id) => document.getElementById(id);
  const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,Math.round(Number(n)||0)));
  const rangeData = [{key:'x',min:-300,max:350}, {key:'y',min:-250,max:400},{key:'width',min:120,max:640}];
  const ruleFor = (item,v) => {
    if (item.anchor==='audit-image') return `${item.selector}{width:${v.width}px!important;max-width:none!important;transform:translate(${v.x}px,${v.y}px)!important;}`;
    if (item.anchor==='right-bottom') return `${item.selector}{position:absolute!important;right:${v.x}px!important;bottom:${v.y}px!important;left:auto!important;top:auto!important;width:${v.width}px!important;height:auto!important;max-width:none!important;}`;
    return `${item.selector}{position:absolute!important;left:${v.x}px!important;top:${v.y}px!important;right:auto!important;bottom:auto!important;width:${v.width}px!important;max-width:none!important;}`;
  };
  function generateCSS(){
    const entries=editables.filter(i=>changes[i.id]);
    return `/* AuditAtlas - layout custom hasil Mode Editor Visual.\n   Berlaku untuk desktop, agar layout HP tetap responsif. */\n@media (min-width: 901px) {\n`+
       entries.map(item=>`  ${ruleFor(item,changes[item.id])}`).join('\n')+ '\n}\n';
  }
  function updatePreview(){
    $('ae-style').textContent=generateCSS();
    const num=Object.keys(changes).length;
    $('ae-count').textContent=`${num} elemen diatur`;
    const entry=changes[currentId];
    $('ae-reset').disabled=!entry;
    $('ae-status').textContent=savedState?'Pratinjau tersimpan di browser':'Ada perubahan yang belum disimpan';
    const selected=document.querySelector(current()?.selector||'');
    document.querySelectorAll('.ae-mark').forEach(el=>el.classList.remove('ae-mark'));
    if(selected)selected.classList.add('ae-mark');
  }
  function ensureStyle(){
    const style=document.createElement('style');style.id='ae-style';document.head.appendChild(style);
    const uiStyle=document.createElement('style');uiStyle.textContent=`
      #ae-panel{position:fixed;right:16px;top:95px;z-index:9999;width:320px;max-height:calc(100vh - 115px);overflow:auto;background:#fff;color:#17354e;border:1px solid #cddde9;box-shadow:0 16px 45px #09293b44;border-radius:16px;font:13px system-ui,sans-serif}
      #ae-panel *{box-sizing:border-box}#ae-panel header{background:#092a40;color:#fff;padding:16px 18px;border-radius:15px 15px 0 0;display:flex;justify-content:space-between;align-items:center}
      #ae-panel header strong{font-size:16px}#ae-panel .ae-body{padding:14px 17px 17px}#ae-panel .ae-hint{font-size:11px;line-height:1.5;color:#678197;margin:0 0 15px}
      #ae-panel label{display:block;font-size:12px;font-weight:700;margin:13px 0 7px}#ae-panel select,#ae-panel input[type=number]{width:100%;padding:10px;border:1px solid #ccdce7;border-radius:8px;background:#fff;color:#13384b}
      #ae-panel .ae-value{display:flex;align-items:center;gap:10px}#ae-panel input[type=range]{width:100%;accent-color:#0D6DB7}#ae-panel input[type=number]{width:76px;padding:7px}#ae-panel .ae-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}
      #ae-panel button{border-radius:8px;border:1px solid #bed0df;background:#fff;color:#0a4d7b;padding:9px 10px;font-size:12px;font-weight:700;cursor:pointer}
      #ae-panel button:hover{border-color:#0D6DB7;background:#f1f8fd}#ae-panel .ae-primary{background:#0D6DB7;color:white;border-color:#0D6DB7}#ae-panel .ae-primary:hover{background:#075c9d;color:#fff}
      #ae-panel .ae-footer{border-top:1px solid #e5edf2;margin-top:14px;padding-top:10px;font-size:11px;color:#627e90;line-height:1.6}
      #ae-panel .ae-warning{margin:10px 0;padding:9px;background:#f5f9eb;border:1px solid #e2ebba;border-radius:8px;font-size:11px;color:#42552c;line-height:1.5}
      body.ae-enabled .ae-mark{outline:2px dashed #B1BB1C!important;outline-offset:4px;cursor:grab!important}body.ae-enabled .ae-mark:active{cursor:grabbing!important}
      #ae-collapse{background:transparent!important;color:#fff!important;border:1px solid #7795a4!important;font-size:17px!important}
      #ae-panel.ae-collapsed{width:auto;max-height:none}#ae-panel.ae-collapsed .ae-body{display:none}
      #ae-alert{position:fixed;bottom:16px;right:16px;background:#12374f;color:white;padding:10px 16px;border-radius:8px;z-index:10000;display:none;max-width:330px}
      @media(max-width:900px){#ae-panel{left:12px;right:12px;top:auto;bottom:12px;width:auto;max-height:65vh}#ae-panel .ae-body:before{content:'Pengaturan visual disarankan melalui komputer. File CSS yang diekspor hanya mengubah versi desktop.';display:block;padding:9px;color:#a05500;background:#fff7df;border-radius:8px;margin-bottom:12px}}
    `;document.head.appendChild(uiStyle);
  }
  function makePanel(){
    const panel=document.createElement('section');panel.id='ae-panel';panel.setAttribute('aria-label','Editor Visual AuditAtlas');
    panel.innerHTML=`<header><strong>⚙️ Mode Editor Visual <small style="font-size:11px;opacity:.72">v3.0</small></strong><button id="ae-collapse" aria-label="Sembunyikan panel">−</button></header>
    <div class="ae-body"><p class="ae-hint">Atur posisi langsung dengan slider atau geser elemen menggunakan mouse. Perubahan hanya terlihat pada browser ini sampai CSS diekspor dan diunggah ke GitHub.</p>
    <label for="ae-page">Halaman</label><select id="ae-page"></select>
    <label for="ae-element">Bagian yang diedit</label><select id="ae-element"></select>
    <label id="ae-label-x" for="ae-x">Jarak horizontal</label><div class="ae-value"><input type="range" id="ae-x" min="-300" max="350" step="1"/><input type="number" id="ae-x-n" min="-300" max="350" step="1" aria-label="Jarak horizontal dalam piksel"/></div>
    <label id="ae-label-y" for="ae-y">Jarak vertikal</label><div class="ae-value"><input type="range" id="ae-y" min="-250" max="400" step="1"/><input type="number" id="ae-y-n" min="-250" max="400" step="1" aria-label="Jarak vertikal dalam piksel"/></div>
    <label for="ae-width">Lebar elemen (px)</label><div class="ae-value"><input type="range" id="ae-width" min="120" max="640" step="1"/><input type="number" id="ae-width-n" min="120" max="640" step="1" aria-label="Lebar elemen dalam piksel"/></div>
    <div class="ae-grid"><button id="ae-save" class="ae-primary">Simpan pratinjau</button><button id="ae-reset">Reset elemen</button><button id="ae-copy">Salin CSS</button><button id="ae-export" class="ae-primary">Unduh CSS</button></div>
    <div class="ae-warning"><strong>Perubahan permanen:</strong> unggah file <code>editor-overrides.css</code> hasil unduhan ke repository. Pengunjung lain tidak bisa mengubah source melalui editor ini.</div>
    <div class="ae-footer"><div id="ae-count">0 elemen diatur</div><div id="ae-status"></div><button id="ae-exit" style="margin-top:8px;width:100%">Keluar dari Mode Editor</button></div>
    </div>`;
    document.body.appendChild(panel);
    const alert=document.createElement('div');alert.id='ae-alert';alert.setAttribute('role','status');document.body.appendChild(alert);
    $('ae-page').innerHTML=Object.entries(pageLabels).map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
    $('ae-collapse').onclick=()=>{ panel.classList.toggle('ae-collapsed');$('ae-collapse').textContent=panel.classList.contains('ae-collapsed')?'+':'−'; };
    $('ae-page').onchange=()=>changePage($('ae-page').value);
    $('ae-element').onchange=()=>{currentId=$('ae-element').value; syncInputs();};
    for(const {key,min,max} of rangeData){
      for(const suffix of ['', '-n']) $(key==='width'?`ae-width${suffix}`:`ae-${key}${suffix}`).addEventListener('input',e=>{
        const data=getCurrentValues(); data[key]=clamp(e.target.value,min,max); changes[currentId]=data;savedState=false;
        setInputValues(data);updatePreview();
      });
    }
    $('ae-save').onclick=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(changes)); savedState=true;updatePreview();notify('Pratinjau tersimpan di browser.');}catch(e){notify('Browser tidak mengizinkan penyimpanan lokal. Gunakan Unduh CSS.');}};
    $('ae-reset').onclick=()=>{delete changes[currentId];savedState=false;syncInputs();updatePreview();notify('Posisi elemen kembali ke desain bawaan.');};
    $('ae-export').onclick=()=>{
      const blob=new Blob([generateCSS()],{type:'text/css;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='editor-overrides.css';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      notify('CSS diunduh. Unggah file tersebut ke GitHub agar berlaku untuk publik.');
    };
    $('ae-copy').onclick=async()=>{try{await navigator.clipboard.writeText(generateCSS());notify('CSS disalin.');}catch(_e){notify('Salin gagal. Gunakan tombol Unduh CSS.');}};
    $('ae-exit').onclick=()=>{const url=new URL(location.href);url.searchParams.delete('editor');location.href=url.toString();};
    document.body.classList.add('ae-enabled');
    changePage(location.hash.replace('#','') in pageLabels ? location.hash.slice(1) : 'beranda');
  }
  function notify(msg){const t=$('ae-alert');t.textContent=msg;t.style.display='block';clearTimeout(notify.t);notify.t=setTimeout(()=>t.style.display='none',3200);}
  function pageSelect(){
    const sel=$('ae-element');const options=editables.filter(i=>i.page===currentPage);
    sel.innerHTML=options.map(i=>`<option value="${i.id}">${i.label}</option>`).join('');
    if(!options.some(i=>i.id===currentId))currentId=options[0].id;
    sel.value=currentId;
    $('ae-page').value=currentPage;
  }
  function gotoPage(page){
    const button=document.querySelector(`.nav-link[data-page="${page}"]`);if(button)button.click();
  }
  function changePage(page){currentPage=page;pageSelect();gotoPage(page);requestAnimationFrame(syncInputs);}
  function sample(item){
    const el=document.querySelector(item.selector),parent=el?.offsetParent||el?.parentElement;
    if(!el||!parent)return {x:0,y:0,width:260};
    const er=el.getBoundingClientRect(),pr=parent.getBoundingClientRect();
    if(item.anchor==='audit-image')return {x:0,y:0,width:clamp(er.width,120,640)};
    if(item.anchor==='right-bottom')return {x:clamp(pr.right-er.right,-300,350),y:clamp(pr.bottom-er.bottom,-250,400),width:clamp(er.width,120,640)};
    return {x:clamp(er.left-pr.left,-300,350),y:clamp(er.top-pr.top,-250,400),width:clamp(er.width,120,640)};
  }
  function getCurrentValues(){return changes[currentId] ? {...changes[currentId]} : sample(current());}
  function setInputValues(values){for(const {key} of rangeData){const a=$(`ae-${key}`),b=$(`ae-${key}-n`);a.value=values[key];b.value=values[key];}}
  function syncInputs(){
    const item=current();if(!item)return;
    const x=item.anchor==='right-bottom'?'Jarak dari kanan':item.anchor==='audit-image'?'Geser ke kanan (+)':'Jarak dari kiri';
    const y=item.anchor==='right-bottom'?'Jarak dari bawah':item.anchor==='audit-image'?'Geser ke bawah (+)':'Jarak dari atas';
    $('ae-label-x').textContent=x+' (px)';$('ae-label-y').textContent=y+' (px)';
    setInputValues(getCurrentValues());updatePreview();
  }
  function enableDrag(){
    document.addEventListener('pointerdown',e=>{
      if(e.button!==0 || e.target.closest('#ae-panel'))return;
      const item=current();if(!item||window.innerWidth<=MOBILE_LIMIT)return;
      const el=document.querySelector(item.selector);
      if(!el||!(e.target===el||el.contains(e.target)))return;
      const start=getCurrentValues();drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,values:start,item};
      e.preventDefault();
    });
    window.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.pointer)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      const values={...drag.values};
      values.x=clamp(values.x+(drag.item.anchor==='right-bottom'?-dx:dx),-300,350);
      values.y=clamp(values.y+(drag.item.anchor==='right-bottom'?-dy:dy),-250,400);
      changes[drag.item.id]=values;savedState=false;setInputValues(values);updatePreview();
    });
    window.addEventListener('pointerup',()=>drag=null);
    window.addEventListener('pointercancel',()=>drag=null);
  }
  ensureStyle();makePanel();enableDrag();updatePreview();
  window.addEventListener('hashchange',()=>{
    const page=location.hash.slice(1);
    if(page in pageLabels && page!==currentPage){currentPage=page;pageSelect();setTimeout(syncInputs,30);}
  });
})();
