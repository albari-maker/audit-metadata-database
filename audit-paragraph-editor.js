/* Editor Paragraf Audit v3.22: teks, rata kiri/tengah/kanan/justify, publikasi konfigurasi.
 * Berjalan seluruh pengunjung untuk menerapkan file publik, tetapi kontrol edit
 * hanya muncul ketika ?editor=1. Tidak mengirim data ke server.
 */
(() => {
  'use strict';
  const EDITOR = new URLSearchParams(location.search).get('editor') === '1';
  const STORAGE_KEY = 'audit-paragraph-editor-v322';
  const OUTPUT_FILE = 'audit-paragraphs.js';
  const ALIGNMENTS = new Set(['left', 'center', 'right', 'justify']);
  const published = window.AUDIT_PARAGRAPH_OVERRIDES && typeof window.AUDIT_PARAGRAPH_OVERRIDES === 'object'
    ? window.AUDIT_PARAGRAPH_OVERRIDES : {};
  let drafts = {};
  if (EDITOR) {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) drafts = stored;
    } catch (_e) { drafts = {}; }
  }
  let currentAudit = '', rows = [], editing = false, active = null, editorDialog = null;
  const $ = id => document.getElementById(id);
  const rowKey = (audit, i) => `${audit}:paragraph:${i}`;
  const isValidKey = key => /^[a-z0-9_-]+:paragraph:\d{1,3}$/.test(key);
  const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const getChange = key => (EDITOR && hasKey(drafts, key)) ? drafts[key] : published[key];
  const cleanChange = raw => {
    if (!raw || typeof raw !== 'object') return null;
    const text = typeof raw.text === 'string' ? raw.text.slice(0, 8000) : null;
    const align = ALIGNMENTS.has(raw.align) ? raw.align : 'justify';
    return {text, align};
  };
  function setStatus(message) {
    const status = $('audit-paragraph-status');
    if (status) status.textContent = message;
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts)); return true; }
    catch (_e) { setStatus('Pratinjau aktif, tetapi browser tidak mengizinkan penyimpanan lokal.'); return false; }
  }
  function restoreAndApply(row) {
    const element = row.element;
    if (!element.isConnected) return;
    element.innerHTML = row.originalHTML;
    element.style.removeProperty('text-align');
    const change = cleanChange(getChange(row.key));
    if (!change) return;
    if (change.text !== null) element.textContent = change.text;
    element.style.textAlign = change.align;
  }
  function refreshContext(event) {
    const root = $('audit-context');
    if (!root) return;
    currentAudit = event?.detail?.auditId || root.dataset.auditVisual || '';
    rows = [...root.querySelectorAll('.audit-overview-main .overview-section p, .audit-overview-main .overview-section .overview-pillars > li')]
      .map((element, i) => ({element, key:rowKey(currentAudit, i), originalHTML:element.innerHTML,
        originalText:element.textContent.trim(), group:element.closest('.overview-section')?.querySelector('h4')?.textContent || 'Ringkasan'}));
    rows.forEach(row => {
      row.element.dataset.paragraphKey = row.key;
      restoreAndApply(row);
    });
    if (!EDITOR) return;
    let toolbar = root.querySelector('#audit-paragraph-tools');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'audit-paragraph-tools';
      toolbar.className = 'audit-paragraph-tools';
      toolbar.innerHTML = '<strong>✎ Editor Paragraf</strong>' +
        '<button type="button" id="ap-toggle" aria-pressed="false">Pilih paragraf untuk diedit</button>' +
        '<button type="button" id="ap-justify-all">Rata kanan-kiri semua</button>' +
        '<button type="button" class="ap-primary" id="ap-export">Unduh File Paragraf</button>' +
        '<small id="audit-paragraph-status">Pilih paragraf untuk mengubah teks atau perataannya. Pratinjau tersimpan di browser; unduh file untuk menerbitkan.</small>';
      const heading = root.querySelector('.audit-overview-main .context-head');
      if (heading) heading.insertAdjacentElement('afterend', toolbar);
    }
    root.classList.toggle('audit-paragraph-editing', editing);
    const toggle = toolbar.querySelector('#ap-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(editing));
      toggle.textContent = editing ? 'Selesai memilih paragraf' : 'Pilih paragraf untuk diedit';
    }
  }
  function openEditor(row) {
    if (!editorDialog) return;
    active = {row, snapshotHTML:row.element.innerHTML, snapshotAlign:row.element.style.textAlign};
    const change = cleanChange(getChange(row.key));
    $('ap-location').textContent = `${currentAudit.toUpperCase()} · ${row.group} · Paragraf ${rows.indexOf(row) + 1}`;
    $('ap-text').value = change?.text !== null && change?.text !== undefined ? change.text : row.originalText;
    setAlign(change?.align || 'justify');
    row.element.classList.add('audit-paragraph-active');
    editorDialog.showModal();
    $('ap-text').focus();
  }
  let selectedAlign = 'justify';
  function setAlign(value) {
    selectedAlign = ALIGNMENTS.has(value) ? value : 'justify';
    editorDialog?.querySelectorAll('[data-ap-align]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.apAlign === selectedAlign));
    });
    if (active) active.row.element.style.textAlign = selectedAlign;
  }
  function livePreview() {
    if (!active) return;
    const row = active.row, text = $('ap-text').value;
    if (text.trim() === row.originalText) row.element.innerHTML = row.originalHTML;
    else row.element.textContent = text;
    row.element.style.textAlign = selectedAlign;
  }
  function closeEditor(keep = false) {
    if (active) {
      const row = active.row;
      if (!keep) {
        row.element.innerHTML = active.snapshotHTML;
        if (active.snapshotAlign) row.element.style.textAlign = active.snapshotAlign;
        else row.element.style.removeProperty('text-align');
      }
      row.element.classList.remove('audit-paragraph-active');
    }
    active = null;
    if (editorDialog?.open) editorDialog.close();
  }
  function saveCurrent() {
    if (!active) return false;
    const row = active.row, text = $('ap-text').value.trim();
    if (!text) { $('ap-modal-status').textContent = 'Paragraf tidak boleh kosong.'; return false; }
    if (text.length > 8000) { $('ap-modal-status').textContent = 'Panjang maksimum 8.000 karakter.'; return false; }
    drafts[row.key] = {text:text === row.originalText ? null : text, align:selectedAlign};
    persist();
    restoreAndApply(row);
    closeEditor(true);
    setStatus('Pratinjau tersimpan. Klik Unduh File Paragraf untuk menerbitkan perubahan di GitHub.');
    return true;
  }
  function resetCurrent() {
    if (!active) return;
    const row = active.row;
    drafts[row.key] = null; // penanda penghapusan pengaturan terbitan pada saat ekspor
    persist();
    row.element.innerHTML = row.originalHTML;
    row.element.style.removeProperty('text-align');
    closeEditor(true);
    setStatus('Paragraf dikembalikan. Ekspor file agar perubahan juga berlaku di website publik.');
  }
  function justifyAll() {
    if (!rows.length) return;
    rows.forEach(row => {
      const prior = cleanChange(getChange(row.key));
      drafts[row.key] = {text:prior?.text ?? null, align:'justify'};
      restoreAndApply(row);
    });
    persist();
    setStatus(`${rows.length} paragraf pada audit ${currentAudit.toUpperCase()} sudah rata kanan-kiri. Unduh file untuk memublikasikan.`);
  }
  function exportConfig() {
    const combined = {...published, ...drafts};
    const valid = {};
    Object.entries(combined).forEach(([key, raw]) => {
      if (!isValidKey(key)) return;
      const change = cleanChange(raw);
      if (change) valid[key] = change;
    });
    // Ganti '<' agar isi teks tidak dapat menyisipkan tag ketika file digunakan ulang.
    const json = JSON.stringify(valid, null, 2).replace(/</g, '\\u003c');
    const text = '/* Pengaturan paragraf Audit. Ekspor Mode Editor Visual. */\n' +
      'window.AUDIT_PARAGRAPH_OVERRIDES = ' + json + ';\n';
    const blob = new Blob([text], {type:'text/javascript;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = OUTPUT_FILE; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(`File ${OUTPUT_FILE} berhasil dibuat (${Object.keys(valid).length} pengaturan). Unggah ke folder utama repository GitHub.`);
  }
  function buildUI() {
    if (!EDITOR) return;
    editorDialog = document.createElement('dialog');
    editorDialog.id = 'audit-paragraph-dialog';
    editorDialog.className = 'audit-paragraph-dialog';
    editorDialog.setAttribute('aria-labelledby', 'ap-title');
    editorDialog.innerHTML = `
      <div class="ap-header"><strong id="ap-title">Edit Paragraf Audit</strong><button id="ap-close" type="button" aria-label="Tutup editor">×</button></div>
      <div class="ap-body">
        <p class="ap-location" id="ap-location"></p>
        <label for="ap-text">Teks paragraf</label><textarea id="ap-text" maxlength="8000" rows="6"></textarea>
        <label>Perataan teks</label>
        <div class="ap-align-choices" role="group" aria-label="Pilihan perataan paragraf">
          <button type="button" data-ap-align="left" aria-pressed="false">☰ Kiri</button>
          <button type="button" data-ap-align="center" aria-pressed="false">☷ Tengah</button>
          <button type="button" data-ap-align="right" aria-pressed="false">☰ Kanan</button>
          <button type="button" data-ap-align="justify" aria-pressed="true">▤ Kanan-kiri</button>
        </div>
        <div class="ap-actions"><button type="button" class="ap-primary" id="ap-save">Simpan pratinjau</button>
          <button type="button" id="ap-reset">Kembalikan paragraf</button>
          <button type="button" id="ap-download">Unduh File Paragraf</button></div>
        <p class="ap-status" id="ap-modal-status" role="status"></p>
        <p class="ap-help">Perataan teks tidak menghapus cetak miring atau tebal. Jika isi paragraf diubah lewat kotak teks, format khusus di dalam paragraf tersebut menjadi teks biasa. Unggah <code>audit-paragraphs.js</code> ke GitHub untuk menerbitkan perubahan bagi semua pengunjung.</p>
      </div>`;
    document.body.appendChild(editorDialog);
    $('ap-close').addEventListener('click', () => closeEditor());
    editorDialog.addEventListener('cancel', ev => { ev.preventDefault(); closeEditor(); });
    editorDialog.addEventListener('click', ev => { if (ev.target === editorDialog) closeEditor(); });
    $('ap-text').addEventListener('input', livePreview);
    editorDialog.querySelectorAll('[data-ap-align]').forEach(b => b.addEventListener('click', () => setAlign(b.dataset.apAlign)));
    $('ap-save').addEventListener('click', saveCurrent);
    $('ap-reset').addEventListener('click', resetCurrent);
    $('ap-download').addEventListener('click', () => { if (saveCurrent()) exportConfig(); });
    document.addEventListener('click', event => {
      const root = $('audit-context');
      if (!root) return;
      if (event.target.closest('#ap-toggle')) {
        editing = !editing;
        root.classList.toggle('audit-paragraph-editing', editing);
        const button = root.querySelector('#ap-toggle');
        button.textContent = editing ? 'Selesai memilih paragraf' : 'Pilih paragraf untuk diedit';
        button.setAttribute('aria-pressed', String(editing));
      } else if (event.target.closest('#ap-justify-all')) {
        justifyAll();
      } else if (event.target.closest('#ap-export')) {
        exportConfig();
      } else if (editing && !editorDialog.open) {
        const editable = event.target.closest('[data-paragraph-key]');
        const row = rows.find(r => r.element === editable);
        if (row) { event.preventDefault(); openEditor(row); }
      }
    });
  }
  document.addEventListener('auditatlas:context-rendered', refreshContext);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUI);
  else buildUI();
})();
