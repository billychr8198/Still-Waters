/* ============================================================
   STILL WATERS — print or save prayers as a PDF
   ------------------------------------------------------------
   The "Print or save as PDF" window on the Prayers tab: choose one
   prayer or several, pick a few layout options, then download a
   PDF or print it. The book itself is laid out in pdf-layout.js.

   pdfmake (the PDF maker) and the fonts load only the first time
   someone opens this window, so the rest of the site stays light.
============================================================ */
import * as store from './store.js';
import { buildPrayerBook, fileNameFor, FONT_FILES, unprintable } from './pdf-layout.js';

const PDFMAKE = {
  src: 'https://cdn.jsdelivr.net/npm/pdfmake@0.3.14/build/pdfmake.min.js',
  integrity: 'sha384-cBs99oVmpAk4AiRofg7YMpyFITGSJaVZ9HzRYyTS8sqEEF56hKBVjp3s+VxXh8GD',
};
const FONT_DIR = new URL('../../assets/fonts/', import.meta.url).href;
const OPTIONS_KEY = 'sw-print-options';
const LOG = '[Still Waters]';

const $ = (s, c = document) => c.querySelector(s);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- which device are we on? ---------- */
const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/i.test(ua);
const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
// Android browsers can't show a PDF in a tab (they download it), so there "Print" means "open the download".
const canPrint = !isAndroid;
// Chrome, Edge and Firefox on a computer can print a PDF straight from a hidden frame.
const printInFrame = !isIOS && !isAndroid && !isSafari;

/* ---------- remembered choices ---------- */
function defaultPaper() {
  const region = (navigator.language || '').split('-')[1] || '';
  return ['US', 'CA', 'MX', 'PH', 'CL', 'CO', 'VE', 'GT', 'CR', 'PA', 'DO', 'PR', 'SV'].includes(region.toUpperCase()) ? 'LETTER' : 'A4';
}
function loadOptions() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(OPTIONS_KEY)); } catch { /* ignore */ }
  return { paper: defaultPaper(), size: 'regular', newPage: true, words: true, mysteries: 'all', ...(saved || {}) };
}
function saveOptions(o) {
  try { localStorage.setItem(OPTIONS_KEY, JSON.stringify(o)); } catch { /* ignore */ }
}

/* ---------- loading pdfmake and the fonts ---------- */
let ready = null;
function loadPdfMake() {
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    const done = () => {
      const pm = window.pdfMake;
      if (!pm) { reject(new Error('pdfmake did not start')); return; }
      const fonts = {};
      for (const [family, files] of Object.entries(FONT_FILES)) {
        fonts[family] = Object.fromEntries(Object.entries(files).map(([style, file]) => [style, FONT_DIR + file]));
      }
      pm.setFonts(fonts);
      pm.setUrlAccessPolicy((url) => url.startsWith(FONT_DIR)); // fetch our own fonts, nothing else
      pm.setUrlResourceCaching(true);                           // and only once per visit
      resolve(pm);
    };
    if (window.pdfMake) { done(); return; }
    const s = document.createElement('script');
    s.src = PDFMAKE.src;
    s.integrity = PDFMAKE.integrity;
    s.crossOrigin = 'anonymous';
    s.onload = done;
    s.onerror = () => { s.remove(); reject(new Error('pdfmake could not be loaded')); };
    document.head.appendChild(s);
  }).catch((err) => { ready = null; throw err; });
  return ready;
}

/* ---------- making the PDF ---------- */
async function makePdf(items, options) {
  const pm = await loadPdfMake();
  const env = {
    rosary: typeof ROSARY !== 'undefined' ? ROSARY : null,                 // from js/rosary-data.js
    threeHailMarys: typeof THREE_HM !== 'undefined' ? THREE_HM : null,
    date: new Date(),
  };
  const probe = {};
  let blob = await pm.createPdf(buildPrayerBook(items, options, { ...env, probe })).getBlob();
  // A single prayer that just spills onto a second page: try it a touch smaller, to keep it on one sheet.
  if (items.length === 1 && probe.pages === 2) {
    const probe2 = {};
    const tighter = await pm.createPdf(buildPrayerBook(items, { ...options, compact: true }, { ...env, probe: probe2 })).getBlob();
    if (probe2.pages === 1) blob = tighter;
  }
  return blob;
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function printBlob(blob) {
  const url = URL.createObjectURL(blob);
  const old = document.getElementById('sw-print-frame');
  if (old) old.remove();
  const frame = document.createElement('iframe');
  frame.id = 'sw-print-frame';
  frame.title = 'Prayers to print';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none;';
  frame.src = url;
  frame.onload = () => {
    setTimeout(() => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch (err) {
        console.warn(`${LOG} Printing from the page didn't work, so the PDF opens in a new tab instead.`, err);
        window.open(url, '_blank');
      }
    }, 300);
  };
  document.body.appendChild(frame);
  setTimeout(() => { URL.revokeObjectURL(url); frame.remove(); }, 10 * 60_000);
}

/* ============================================================
   The window
============================================================ */
const modal = $('#print-modal');
const listEl = $('#print-list');
const form = $('#print-form');
let options = loadOptions();
let chosen = new Set();
let returnFocus = null;
let working = false;

function prayersOnList() {
  return store.activePrayers();
}

function renderList() {
  const prayers = prayersOnList();
  listEl.innerHTML = prayers.map((p) => {
    const on = chosen.has(p.id);
    const tag = p.custom ? '<span class="print-tag">Yours</span>' : p.kind ? '<span class="print-tag">Devotion</span>' : '';
    const sub = p.id === 'rosary' && on ? `
      <div class="print-sub" role="radiogroup" aria-label="Which Mysteries to print">
        <label><input type="radio" name="mysteries" value="all" ${options.mysteries !== 'today' ? 'checked' : ''}> All four sets of Mysteries</label>
        <label><input type="radio" name="mysteries" value="today" ${options.mysteries === 'today' ? 'checked' : ''}> Only today’s Mysteries</label>
      </div>` : '';
    return `<li>
      <label class="print-opt${on ? ' is-on' : ''}">
        <input type="checkbox" name="prayer" value="${esc(p.id)}" ${on ? 'checked' : ''}>
        <span class="print-box" aria-hidden="true"></span>
        <span class="print-name">${esc(p.title)}</span>${tag}
      </label>${sub}
    </li>`;
  }).join('') || '<li class="print-empty">Your prayer list is empty.</li>';
  renderSummary();
}

function selected() {
  // Print in the order of the prayer list, not the order they were ticked.
  return prayersOnList().filter((p) => chosen.has(p.id));
}

function renderSummary() {
  const items = selected();
  const n = items.length;
  const all = prayersOnList().length;
  $('#print-count').textContent = n === 0 ? 'No prayers chosen yet'
    : n === 1 ? '1 prayer chosen' : `${n} prayers chosen`;
  const toggle = $('#print-all');
  toggle.textContent = n === all && all > 0 ? 'Clear all' : 'Select all';
  toggle.hidden = all === 0;

  $('#print-opt-newpage').hidden = n < 2;
  $('#print-opt-words').hidden = !items.some((p) => !p.kind && !p.custom);
  $('#print-cover-note').hidden = n < 3;

  // Characters the PDF's typeface can't draw (an emoji, Chinese characters…) are left out: say so first.
  const missing = items.filter((p) => p.custom && unprintable(`${p.title}\n${p.text || ''}`).length);
  const note = $('#print-note');
  note.hidden = !missing.length;
  note.textContent = missing.length
    ? `Some characters in ${missing.map((p) => `“${p.title}”`).join(', ')} can’t be shown in the PDF’s typeface (for example emoji or Chinese characters), so they’ll be left out.`
    : '';

  for (const b of [$('#print-download'), $('#print-print')]) b.disabled = n === 0 || working;
}

function syncOptionsToForm() {
  form.elements.paper.value = options.paper;
  form.elements.size.value = options.size;
  form.elements.newPage.checked = !!options.newPage;
  form.elements.words.checked = !!options.words;
}

function status(text, tone = '') {
  const el = $('#print-status');
  el.textContent = text;
  el.dataset.tone = tone;
  el.hidden = !text;
}

export function openPrintDialog(preselect = []) {
  returnFocus = document.activeElement;
  options = loadOptions();
  const onList = new Set(prayersOnList().map((p) => p.id));
  chosen = new Set(preselect.filter((id) => onList.has(id)));
  $('#print-title').textContent = chosen.size === 1 ? 'Print or save this prayer' : 'Print or save prayers';
  syncOptionsToForm();
  status('');
  renderList();
  $('#print-print').hidden = !canPrint;
  $('#print-android-note').hidden = canPrint;
  modal.hidden = false;
  const ticked = listEl.querySelector('input[name="prayer"]:checked');
  if (ticked) ticked.closest('li').scrollIntoView({ block: 'nearest' });
  const first = chosen.size ? $('#print-download') : listEl.querySelector('input');
  if (first) first.focus({ preventScroll: true });
  loadPdfMake().catch(() => { /* reported when they press a button */ }); // get ready while they choose
}

/* ---------- reacting to choices ---------- */
listEl.addEventListener('change', (e) => {
  const t = e.target;
  if (t.name === 'prayer') {
    if (t.checked) chosen.add(t.value); else chosen.delete(t.value);
    const keep = t.value;
    renderList();
    const again = listEl.querySelector(`input[name="prayer"][value="${CSS.escape(keep)}"]`);
    if (again) again.focus();
  } else if (t.name === 'mysteries') {
    options.mysteries = t.value;
    saveOptions(options);
  }
  status('');
});

$('#print-all').addEventListener('click', () => {
  const all = prayersOnList();
  chosen = chosen.size === all.length ? new Set() : new Set(all.map((p) => p.id));
  renderList();
});

form.addEventListener('change', (e) => {
  const t = e.target;
  if (!['paper', 'size', 'newPage', 'words'].includes(t.name)) return;
  options = {
    ...options,
    paper: form.elements.paper.value,
    size: form.elements.size.value,
    newPage: form.elements.newPage.checked,
    words: form.elements.words.checked,
  };
  saveOptions(options);
  status('');
});

form.addEventListener('submit', (e) => e.preventDefault());

async function run(kind) {
  const items = selected();
  if (!items.length || working) return;
  working = true;
  renderSummary();
  const button = kind === 'print' ? $('#print-print') : $('#print-download');
  const label = button.textContent;
  button.textContent = 'Preparing…';
  status(window.pdfMake ? 'Setting your prayers in type…' : 'Setting your prayers in type… (the first time takes a few seconds)', 'busy');

  // A phone or Safari shows the PDF in a new tab, which has to be opened now, while the tap still counts.
  let tab = null;
  if (kind === 'print' && !printInFrame) {
    tab = window.open('', '_blank');
    if (tab) {
      tab.document.title = 'Preparing your prayers…';
      tab.document.body.style.cssText = 'font-family:Georgia,serif;color:#1e2a55;background:#efeee8;display:grid;place-items:center;height:100vh;margin:0';
      tab.document.body.textContent = 'Preparing your prayers…';
    }
  }

  try {
    const blob = await makePdf(items, options);
    const name = fileNameFor(items);
    if (kind === 'download' || (kind === 'print' && !printInFrame && !tab)) {
      saveBlob(blob, name);
      status(kind === 'download'
        ? `Saved “${name}”. You’ll find it with your downloads.`
        : `Your browser blocked the new tab, so “${name}” was downloaded instead. Open it to print.`, 'ok');
    } else if (tab) {
      tab.location.href = URL.createObjectURL(blob);
      status(isIOS ? 'Your PDF is open in a new tab. Tap Share, then Print.' : 'Your PDF is open in a new tab. Use its Print button.', 'ok');
    } else {
      printBlob(blob);
      status('Your printer window is opening. You can also choose “Save as PDF” there.', 'ok');
    }
  } catch (err) {
    if (tab) tab.close();
    console.warn(`${LOG} The PDF couldn't be made.`, err);
    status(navigator.onLine === false
      ? 'You seem to be offline. Connect to the internet once so the PDF maker can load, then try again.'
      : 'The PDF couldn’t be made just now. Check your connection and try again.', 'error');
  } finally {
    working = false;
    button.textContent = label;
    renderSummary();
  }
}

$('#print-download').addEventListener('click', () => run('download'));
$('#print-print').addEventListener('click', () => run('print'));

// Give focus back to the button that opened the window, once it closes.
new MutationObserver(() => {
  if (modal.hidden && returnFocus && document.contains(returnFocus)) { returnFocus.focus(); returnFocus = null; }
}).observe(modal, { attributes: true, attributeFilter: ['hidden'] });

// The prayer list can change while the window is open (another device, another tab).
store.subscribe(() => { if (!modal.hidden) { const ids = new Set(prayersOnList().map((p) => p.id)); chosen = new Set([...chosen].filter((id) => ids.has(id))); renderList(); } });
