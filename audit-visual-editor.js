/* AuditAtlas v3.0 - editor visual panel audit, hanya pratinjau lokal.
   Tidak mengirim data ke server atau GitHub. Ekspor hasil lewat ZIP. */
(() => {
  'use strict';
  if(new URLSearchParams(location.search).get('editor')!=='1') return;
  const profiles=window.AUDIT_DATA?.profiles || [];
  if(!profiles.length) return;
  const root=document.getElementById('ae-panel')?.querySelector('.ae-body');
  if(!root) return;
  const STORAGE='auditatlas-visual-audit-v3';
  const $=id=>document.getElementById(id);
  const int=(n,low,high)=>Math.max(low,Math.min(high,Math.round(Number(n)||0)));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let edits={}, photos={}, current='cdm', dragging=null;
  const origin=JSON.parse(JSON.stringify(window.AUDIT_VISUAL_CONFIG||{}));
  try{
    const stored=JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(stored && typeof stored==='object' && !Array.isArray(stored)){
      if(stored.edits && typeof stored.edits==='object')edits=stored.edits;
      if(stored.photos && typeof stored.photos==='object')photos=stored.photos;
    }
  }catch(_e){}
  const panel=document.createElement('details');panel.id='aev-panel';
  panel.innerHTML=`<summary>🖼 Editor panel penjelasan audit</summary><div class="aev-body">
    <p class="aev-small">Ubah desain masing-masing audit: ganti gambar sendiri, posisi/ukuran karakter, kotak penjelasan, dan latar. Pratinjau hanya di browser ini.</p>
    <label for="aev-audit">Pilih jenis audit</label><select id="aev-audit"></select>
    <div class="aev-block"><strong>Karakter audit</strong>
      <label for="aev-upload">Ganti gambar dari komputer (PNG, JPG, WebP)</label>
      <input id="aev-upload" type="file" accept="image/png,image/jpeg,image/webp"/>
      <p class="aev-small" id="aev-image-note">Gunakan gambar yang diizinkan untuk dipublikasikan.</p>
      <button type="button" id="aev-remove-img" class="aev-secondary">Gunakan gambar bawaan</button>
      <label for="aev-imageWidth">Lebar karakter (px)</label><div class="aev-range"><input id="aev-imageWidth" type="range" min="100" max="500" step="5"/><output id="aev-imageWidth-val"></output></div>
      <label for="aev-imageX">Geser karakter horizontal (px)</label><div class="aev-range"><input id="aev-imageX" type="range" min="-250" max="250" step="5"/><output id="aev-imageX-val"></output></div>
      <label for="aev-imageY">Geser karakter vertikal (px)</label><div class="aev-range"><input id="aev-imageY" type="range" min="-250" max="250" step="5"/><output id="aev-imageY-val"></output></div>
    </div>
    <div class="aev-block"><strong>Kotak percakapan</strong>
      <label for="aev-title">Judul kotak</label><input id="aev-title" type="text" maxlength="150"/>
      <label for="aev-text">Isi kotak</label><textarea id="aev-text" rows="3" maxlength="500"></textarea>
      <label for="aev-bubbleWidth">Lebar kotak (px)</label><div class="aev-range"><input id="aev-bubbleWidth" type="range" min="150" max="430" step="5"/><output id="aev-bubbleWidth-val"></output></div>
      <label for="aev-bubbleX">Geser kotak horizontal (px)</label><div class="aev-range"><input id="aev-bubbleX" type="range" min="-250" max="250" step="5"/><output id="aev-bubbleX-val"></output></div>
      <label for="aev-bubbleY">Geser kotak vertikal (px)</label><div class="aev-range"><input id="aev-bubbleY" type="range" min="-250" max="250" step="5"/><output id="aev-bubbleY-val"></output></div>
      <label for="aev-bg">Warna latar area audit</label><input id="aev-bg" type="color" value="#f2fafc"/>
    </div>
    <div class="aev-actions"><button type="button" class="ae-primary" id="aev-save">Simpan pratinjau</button><button type="button" class="aev-secondary" id="aev-reset">Reset audit ini</button><button type="button" class="ae-primary aev-full" id="aev-export">Unduh ZIP hasil edit untuk GitHub</button></div>
    <p id="aev-status" class="aev-small" role="status"></p>
    <p class="aev-small"><b>Publikasi:</b> Extract All ZIP hasil editor, lalu unggah <code>audit-visual-config.js</code> beserta gambar <code>audit-custom-*.webp</code> ke folder utama GitHub. Jangan unggah file pribadi atau rahasia.</p>
  </div>`;
  const styles=document.createElement('style');styles.textContent=`
    #aev-panel{border-top:1px solid #d8e8f0;margin-top:18px;padding-top:12px}
    #aev-panel>summary{cursor:pointer;color:#0D6DB7;font-weight:800;padding:10px 3px;font-size:13px}
    #aev-panel .aev-small{font-size:11px;line-height:1.6;color:#5f7789;margin:6px 0 9px}
    #aev-panel label{font-size:11px;margin:12px 0 6px}
    #aev-panel input[type=file]{width:100%;max-width:100%;font-size:11px}
    #aev-panel input[type=text],#aev-panel textarea,#aev-panel select{width:100%;border:1px solid #cbdde9;background:#fff;border-radius:8px;font-size:12px;padding:9px;color:#18364c;box-sizing:border-box}
    #aev-panel .aev-block{border:1px solid #e2ebf1;border-radius:10px;padding:12px;margin:12px 0;background:#f9fcfe}
    #aev-panel .aev-block>strong{font-size:12px;color:#0b354c}
    #aev-panel .aev-range{display:flex;gap:8px;align-items:center}
    #aev-panel input[type=range]{flex:1;min-width:0;accent-color:#0D6DB7}
    #aev-panel output{min-width:45px;text-align:right;font-size:11px;font-weight:700;color:#41586c}
    #aev-panel input[type=color]{height:38px;width:100%;border:1px solid #cbdde9;border-radius:8px;background:white;padding:3px}
    #aev-panel .aev-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
    #aev-panel .aev-actions button{min-height:40px}
    #aev-panel .aev-full{grid-column:1/-1}
    #aev-panel .aev-secondary{color:#0c5b90}
  `;document.head.appendChild(styles);
  root.insertBefore(panel, root.querySelector('.ae-warning')||root.lastElementChild);
  $('aev-audit').innerHTML=profiles.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  const keys={imageWidth:250,imageX:0,imageY:0,bubbleWidth:225,bubbleX:0,bubbleY:0,bg:'#f2fafc'};
  const rangeKeys=['imageWidth','imageX','imageY','bubbleWidth','bubbleX','bubbleY'];
  function baseText(){
    const bubble=document.querySelector('#audit-context .audit-overview-visual .feature-banner-bubble');
    return {title:bubble?.querySelector('strong')?.textContent||profiles.find(p=>p.id===current)?.name||'Audit',text:bubble?.querySelector('span')?.textContent||''};
  }
  const selected=()=>edits[current]||origin[current]||{};
  function setAudit(audit){
    current=profiles.some(x=>x.id===audit)?audit:'cdm';
    $('aev-audit').value=current;
    const sel=$('audit-select');
    if(sel.value!==current){sel.value=current;sel.dispatchEvent(new Event('change',{bubbles:true}));}
    const item=selected(), defaults=baseText();
    for(const k of rangeKeys){$("aev-"+k).value=item[k]??keys[k];$("aev-"+k+'-val').textContent=($("aev-"+k).value)+' px';}
    $('aev-title').value=item.title??defaults.title;
    $('aev-text').value=item.text??defaults.text;
    $('aev-bg').value=/^#[0-9a-fA-F]{6}$/.test(item.bg||'')?item.bg:keys.bg;
    $('aev-image-note').textContent=photos[current]?'Gambar kustom aktif. File ikut dalam ZIP hasil ekspor.':item.image?'Gambar kustom sudah terpasang di website.':'Gunakan PNG, JPG atau WebP milik Anda (maks. 5 MB).';
    $('aev-upload').value='';
    previewImage();
  }
  function configForPreview(){return {...origin,...edits};}
  function previewImage(){
    const el=document.querySelector('#audit-context .audit-overview-visual img');
    if(el&&photos[current]?.dataURL)el.src=photos[current].dataURL;
  }
  function preview(){
    window.AUDIT_VISUAL_CONFIG=configForPreview();
    const sel=$('audit-select');
    if(sel.value!==current)sel.value=current;
    sel.dispatchEvent(new Event('change',{bubbles:true}));
    previewImage();
  }
  function commitChange(key,value){
    const orig=selected();edits[current]={...orig,[key]:value};
    if(key==='imageWidth'||key==='imageX'||key==='imageY'||key==='bubbleWidth'||key==='bubbleX'||key==='bubbleY')$('aev-'+key+'-val').textContent=value+' px';
    $('aev-status').textContent='Perubahan terlihat sebagai pratinjau. Simpan atau unduh ZIP agar tidak hilang.';
    preview();
  }
  for(const k of rangeKeys)$('aev-'+k).addEventListener('input',e=>commitChange(k,Number(e.target.value)));
  ['title','text','bg'].forEach(k=>$('aev-'+k).addEventListener('input',e=>commitChange(k,e.target.value)));
  $('aev-audit').addEventListener('change',()=>setAudit($('aev-audit').value));
  $('aev-remove-img').onclick=()=>{
    delete photos[current];
    edits[current]={...selected()};delete edits[current].image;
    $('aev-image-note').textContent='Gambar bawaan digunakan.';
    preview();
  };
  async function resizePhoto(file){
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Format harus PNG, JPG atau WebP.');
    if(file.size>5*1024*1024)throw new Error('Ukuran gambar maksimal 5 MB.');
    const source=URL.createObjectURL(file);
    try{
      const image=new Image();image.src=source;await image.decode();
      const max=1300,scale=Math.min(1,max/Math.max(image.width,image.height));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      return canvas.toDataURL('image/webp',.86);
    }finally{URL.revokeObjectURL(source);}
  }
  $('aev-upload').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      const dataURL=await resizePhoto(file);
      if(!dataURL.startsWith('data:image/webp;base64,'))throw new Error('Browser tidak mendukung konversi WebP.');
      photos[current]={dataURL};
      edits[current]={...selected(),image:`audit-custom-${current}.webp`};
      $('aev-image-note').textContent='Gambar diganti. Klik Unduh ZIP agar gambarnya bisa diunggah ke GitHub.';
      preview();
      $('aev-status').textContent='Gambar berhasil dipratinjau. Simpan atau unduh ZIP.';
    }catch(err){$('aev-status').textContent='Gambar tidak dipakai: '+err.message;}
  });
  function save(){
    try{localStorage.setItem(STORAGE,JSON.stringify({edits,photos}));$('aev-status').textContent='Pengaturan tersimpan di browser ini. Website publik belum berubah.';return true;}
    catch(_e){$('aev-status').textContent='Penyimpanan lokal penuh. Unduh ZIP agar perubahan tidak hilang.';return false;}
  }
  $('aev-save').onclick=save;
  $('aev-reset').onclick=()=>{
    delete edits[current];delete photos[current];
    window.AUDIT_VISUAL_CONFIG=configForPreview();
    preview();setAudit(current);
    $('aev-status').textContent='Pengaturan audit ini kembali seperti versi awal. Unduh ZIP untuk menerapkannya secara publik.';
  };
  // ZIP tanpa kompresi (valid ZIP PKZIP): tidak ada server atau library eksternal.
  const enc=new TextEncoder();
  const crc=(bytes)=>{
    let c=0xffffffff;
    for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}
    return (c^0xffffffff)>>>0;
  };
  function buildZip(items){
    const locals=[],centrals=[];let offset=0;
    for(const {name,bytes} of items){
      const filename=enc.encode(name),checksum=crc(bytes);
      const local=new Uint8Array(30+filename.length);const d=new DataView(local.buffer);
      d.setUint32(0,0x04034b50,true);d.setUint16(4,20,true);d.setUint16(6,0x800,true);d.setUint16(8,0,true);
      d.setUint32(14,checksum,true);d.setUint32(18,bytes.length,true);d.setUint32(22,bytes.length,true);d.setUint16(26,filename.length,true);
      local.set(filename,30);locals.push(local,bytes);
      const central=new Uint8Array(46+filename.length),v=new DataView(central.buffer);
      v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x800,true);v.setUint32(16,checksum,true);
      v.setUint32(20,bytes.length,true);v.setUint32(24,bytes.length,true);v.setUint16(28,filename.length,true);v.setUint32(42,offset,true);central.set(filename,46);
      centrals.push(central);offset+=local.length+bytes.length;
    }
    const directoryLength=centrals.reduce((n,x)=>n+x.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);
    v.setUint32(0,0x06054b50,true);v.setUint16(8,items.length,true);v.setUint16(10,items.length,true);v.setUint32(12,directoryLength,true);v.setUint32(16,offset,true);
    return new Blob([...locals,...centrals,end],{type:'application/zip'});
  }
  $('aev-export').onclick=()=>{
    save();
    const cfg=configForPreview();
    const js=`/* AuditAtlas - konfigurasi tampilan audit per jenis. */\nwindow.AUDIT_VISUAL_CONFIG = ${JSON.stringify(cfg,null,2)};\n`;
    const items=[{name:'audit-visual-config.js',bytes:enc.encode(js)}];
    for(const [id,img] of Object.entries(photos)){
      const m=img.dataURL?.match(/^data:image\/webp;base64,([A-Za-z0-9+/=]+)$/);
      if(m&&/^[a-z0-9_-]+$/.test(id)){const binary=atob(m[1]);items.push({name:`audit-custom-${id}.webp`,bytes:Uint8Array.from(binary,c=>c.charCodeAt(0))});}
    }
    items.push({name:'PETUNJUK_UPLOAD_EDITOR.txt',bytes:enc.encode('Ekstrak ZIP ini. Upload audit-visual-config.js beserta semua gambar audit-custom-*.webp ke folder UTAMA repository GitHub Pages. File ini tidak berisi source website lain. Semua pengaturan hanya berlaku untuk panel ringkasan audit. File gambar lama di GitHub tidak perlu dihapus jika masih dipakai. Jangan mengunggah gambar rahasia atau tanpa izin.\n')});
    const url=URL.createObjectURL(buildZip(items)),a=document.createElement('a');a.href=url;a.download='AuditAtlas_Hasil_Editor_Panel_Audit.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
    $('aev-status').textContent='ZIP berhasil disiapkan. Extract All lalu unggah isi ZIP ke GitHub.';
  };
  $('aev-panel').addEventListener('toggle',()=>{
    if(!panel.open)return;
    const p=$('ae-page');if(p&&p.value!=='jelajahi'){p.value='jelajahi';p.dispatchEvent(new Event('change',{bubbles:true}));}
    const selected=$('audit-select')?.value;
    setAudit(selected&&selected!=='all'?selected:current);
  });
  $('audit-select').addEventListener('change',()=>{
    const id=$('audit-select').value;
    if(panel.open&&id!=='all'&&id!==current)setAudit(id);
  });
  // Hanya saat halaman audit dimuat ulang oleh aplikasi.
  document.addEventListener('auditatlas:context-rendered',e=>{
    if(e.detail?.auditId!==current)return;
    previewImage();
  });
  // editor lama tetap berfungsi untuk banner halaman lain.
})();
