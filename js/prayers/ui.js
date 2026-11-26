/* ============================================================
   STILL WATERS — Prayers tab, Calendar tab and the account window
   ------------------------------------------------------------
   Draws the three from what store.js knows, and redraws whenever
   that changes (a tap here, or a change arriving from another device).
============================================================ */
import { CLOSING, COMMON_PRAYERS } from './prayers-data.js';
import * as store from './store.js';
import { openPrintDialog } from './print.js';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

const LIMITS = { title: 120, text: 8000 };
const { state } = store;

if ($('#panel-prayers') && $('#panel-calendar')) start();

function start() {
  /* Redraw without losing the reader's place: remember which element had focus and give it back. */
  function redraw(fn) {
    const key = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.focusKey : null;
    fn();
    if (key) {
      const again = document.querySelector(`[data-focus-key="${CSS.escape(key)}"]`);
      if (again) again.focus({ preventScroll: true });
    }
  }

  /* ==================== WHERE IT'S SAVED ==================== */
  function syncText(withEmail = true) {
    const a = state.account;
    const signIn = '<button class="linklike" type="button" data-open-account>Sign in or create an account</button>';
    if (a.status === 'local') return ['local', 'Saved in this browser, on this device.'];
    if (a.status === 'unavailable') return ['warn', 'Saved on this device. Sign-in can’t be reached right now; reload the page to try again.'];
    if (a.status === 'starting') return state.sync === 'loading' ? ['busy', 'Opening your account…'] : ['local', 'Saved on this device.'];
    if (a.status === 'signedOut') return ['local', `Saved on this device only. ${signIn} to keep your prayers and calendar on every device.`];
    const who = withEmail && a.email ? ` · ${esc(a.email)}` : '';
    if (state.sync === 'synced') return ['ok', `Synced to your account${who}`];
    if (state.sync === 'saving') return ['busy', 'Saving to your account…'];
    if (state.sync === 'offline') return ['warn', 'You’re offline. Changes are saved on this device and will sync when you’re back online.'];
    if (state.sync === 'error') return ['warn', 'You’re signed in, but your saved prayers couldn’t be reached. Changes are kept on this device for now.'];
    return ['busy', 'Connecting to your account…'];
  }

  function renderSync() {
    const [tone, text] = syncText();
    let html = `<p class="sync-line" data-tone="${tone}"><span class="sync-dot" aria-hidden="true"></span><span>${text}</span></p>`;
    const g = state.guestWaiting;
    if (g) {
      const parts = [];
      if (g.days) parts.push(`${plural(g.days, 'day')} logged`);
      if (g.prayers) parts.push(`${plural(g.prayers, 'prayer')} of your own`);
      const what = parts.length ? parts.join(' and ') : 'changes to your prayer list';
      html += `<div class="sync-offer">
        <p>This device has ${what} from before you signed in.</p>
        <div class="sync-offer-actions">
          <button class="btn btn-gold pr-mini" type="button" data-guest="merge">Add to my account</button>
          <button class="btn btn-ghost pr-mini" type="button" data-guest="keep">Keep separate</button>
        </div>
      </div>`;
    }
    $$('[data-sync-bar]').forEach((el) => { el.innerHTML = html; });

    const btn = $('#acct-btn');
    const a = state.account.status;
    btn.hidden = a === 'local' || a === 'unavailable';
    btn.textContent = a === 'signedIn' ? 'Account' : 'Sign in';
    btn.classList.toggle('is-in', a === 'signedIn');
    btn.title = a === 'signedIn' ? state.account.email : 'Sign in to keep your prayers on every device';
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-account]')) openAccount();
    const g = e.target.closest('[data-guest]');
    if (g) { if (g.dataset.guest === 'merge') store.mergeGuest(); else store.keepGuestSeparate(); }
  });

  /* ==================== PRAYERS TAB ==================== */
  const list = $('#pr-list');
  const openItems = new Set();
  const openWords = new Set();
  let noticeTimer = 0;

  const words = (key) => {
    try { if (typeof ROSARY !== 'undefined' && ROSARY.prayers.en[key]) return ROSARY.prayers.en[key]; } catch { /* fall through */ }
    return COMMON_PRAYERS[key];
  };
  const paragraphs = (text) => String(text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');

  function bodyHtml(p) {
    if (p.kind === 'guide') {
      return `<p class="pr-summary">${esc(p.summary)}</p>
        <p><button class="linklike" type="button" data-nav="${p.nav}">${esc(p.linkText)} →</button></p>`;
    }
    if (p.custom) {
      return `<div class="pr-text">${paragraphs(p.text) || '<p class="pr-empty">No words written down for this one: pray it as you know it.</p>'}</div>`;
    }
    return `<div class="pr-text">
        <p class="pr-address">${esc(p.address)}</p>
        ${p.body.map((t) => `<p>${esc(t)}</p>`).join('')}
      </div>
      <h4>${esc(p.concludeLead.replace(/:$/, ''))}</h4>
      <ul class="pr-conclude">
        ${p.conclude.map((c) => `<li><strong>${c.count} ${esc(c.name)}</strong> <span>${esc(c.intention)}</span></li>`).join('')}
      </ul>
      <details class="pr-words" data-words="${p.id}"${openWords.has(p.id) ? ' open' : ''}>
        <summary>The words of these three prayers</summary>
        ${p.conclude.map((c) => `<p><strong>${esc(c.name === 'Hail Marys' ? 'Hail Mary' : c.name)}.</strong> ${esc(words(c.key))}</p>`).join('')}
      </details>
      <p class="pr-saints">${p.saints.map(esc).join('<br>')}</p>
      <p class="pr-closing">${esc(CLOSING)}</p>`;
  }

  function itemHtml(p, i, today) {
    const done = store.isLogged(today, p.id);
    return `<details class="miracle-item pr-item" data-id="${esc(p.id)}"${openItems.has(p.id) ? ' open' : ''}>
      <summary data-focus-key="sum:${esc(p.id)}">
        <span class="m-day">${i + 1}</span>
        <span class="m-title">${esc(p.title)}</span>
        ${done ? '<span class="pr-done">✓ Prayed today</span>' : p.custom ? '<span class="m-era">Yours</span>' : ''}
      </summary>
      <div class="m-body">
        ${bodyHtml(p)}
        <div class="pr-actions">
          <button class="btn ${done ? 'btn-ghost' : 'btn-gold'} pr-mini" type="button" data-act="today" data-focus-key="today:${esc(p.id)}" aria-pressed="${done}">${done ? '✓ Prayed today · undo' : 'I prayed this today'}</button>
          ${p.custom ? `<button class="btn btn-ghost pr-mini" type="button" data-act="edit" data-focus-key="edit:${esc(p.id)}">Edit</button>` : ''}
          <button class="btn btn-ghost pr-mini" type="button" data-act="print" data-focus-key="print:${esc(p.id)}">Print or save</button>
          <button class="pr-remove" type="button" data-act="remove">Remove from my list</button>
        </div>
      </div>
    </details>`;
  }

  function renderPrayers() {
    const today = store.todayKey();
    const active = store.activePrayers();
    const removed = store.removedPrayers();
    const prayedToday = active.filter((p) => store.isLogged(today, p.id)).length;

    list.innerHTML = active.length
      ? active.map((p, i) => itemHtml(p, i, today)).join('')
      : '<p class="pr-none">Your list is empty. Add a prayer of your own, or put one back from the removed prayers below.</p>';

    $('#pr-count').textContent = `${plural(active.length, 'prayer')} on your list` + (prayedToday ? ` · ${prayedToday} prayed today` : '');

    const drawer = $('#pr-removed');
    drawer.hidden = !removed.length;
    if (!removed.length) drawer.open = false;
    $('#pr-removed-count').textContent = removed.length;
    $('#pr-removed-list').innerHTML = removed.map((p) => `
      <li data-id="${esc(p.id)}">
        <span class="pr-removed-title">${esc(p.title)}</span>
        <span class="pr-removed-actions">
          <button class="linklike" type="button" data-act="restore" data-focus-key="restore:${esc(p.id)}">Put back</button>
          ${p.custom ? '<button class="linklike pr-danger" type="button" data-act="forever">Delete forever</button>' : ''}
        </span>
      </li>`).join('');
  }

  function notice(html) {
    const box = $('#pr-notice');
    clearTimeout(noticeTimer);
    box.innerHTML = html;
    box.hidden = !html;
    if (html) noticeTimer = setTimeout(() => { box.hidden = true; box.innerHTML = ''; }, 9000);
  }

  // <details> open/close doesn't bubble, so listen on the way down.
  list.addEventListener('toggle', (e) => {
    const d = e.target;
    if (d.matches('.pr-item')) { if (d.open) openItems.add(d.dataset.id); else openItems.delete(d.dataset.id); }
    if (d.matches('.pr-words')) { if (d.open) openWords.add(d.dataset.words); else openWords.delete(d.dataset.words); }
  }, true);

  $('#panel-prayers').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const holder = btn.closest('[data-id]');
    const id = holder && holder.dataset.id;
    const p = id && store.getPrayer(id);
    const act = btn.dataset.act;

    if (act === 'today' && id) {
      store.toggleLog(store.todayKey(), id);
    } else if (act === 'print' && p) {
      openPrintDialog([id]);
    } else if (act === 'edit' && p) {
      openPrayerForm(p);
    } else if (act === 'remove' && p) {
      openItems.delete(id);
      store.removePrayer(id);
      notice(`Removed “${esc(p.short || p.title)}” from your list. <button class="linklike" type="button" data-act="undo" data-undo="${esc(id)}">Undo</button>`);
    } else if (act === 'undo') {
      store.restorePrayer(btn.dataset.undo);
      notice('');
    } else if (act === 'restore' && id) {
      store.restorePrayer(id);
    } else if (act === 'forever' && p) {
      if (window.confirm(`Delete “${p.title}” forever?\n\nDays when you logged it stay on your calendar.`)) store.deletePrayerForever(id);
    }
  });

  /* ---------- add or edit a prayer of your own ---------- */
  const prayerModal = $('#prayer-modal');
  const prayerForm = $('#prayer-form');
  let editingId = null;
  let returnFocus = null;

  function openPrayerForm(p) {
    editingId = p ? p.id : null;
    returnFocus = document.activeElement;
    $('#prayer-modal-title').textContent = p ? 'Edit your prayer' : 'Add a prayer of your own';
    prayerForm.elements.title.value = p ? p.title : '';
    prayerForm.elements.text.value = p ? p.text || '' : '';
    $('#prayer-form-error').hidden = true;
    prayerModal.hidden = false;
    prayerForm.elements.title.focus();
  }
  $('#pr-add').addEventListener('click', () => openPrayerForm(null));
  $('#pr-print').addEventListener('click', () => openPrintDialog([]));

  prayerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = prayerForm.elements.title.value.trim().slice(0, LIMITS.title);
    const text = prayerForm.elements.text.value.trim().slice(0, LIMITS.text);
    if (!title) {
      const err = $('#prayer-form-error');
      err.textContent = 'Give your prayer a name, so you can find it on your list.';
      err.hidden = false;
      prayerForm.elements.title.focus();
      return;
    }
    if (editingId) {
      store.updatePrayer(editingId, { title, text });
    } else {
      const id = store.addPrayer({ title, text });
      openItems.add(id);
      renderPrayers();
      const added = list.querySelector(`[data-id="${CSS.escape(id)}"]`);
      if (added) added.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    prayerModal.hidden = true;
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  });

  /* ==================== CALENDAR TAB ==================== */
  const grid = $('#cal-grid');
  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();
  let selected = store.todayKey();

  const monthName = (y, m) => new Date(y, m, 1).toLocaleDateString('en-GB', { month: 'long' });
  const parseKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };

  $('#cal-weekdays').innerHTML = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<span>${d}</span>`).join('');

  function renderCalendar() {
    const today = store.todayKey();
    const first = new Date(viewYear, viewMonth, 1);
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    $('#cal-title').textContent = `${monthName(viewYear, viewMonth)} ${viewYear}`;

    // Only one day is in the Tab order; the arrow keys move between days.
    const inView = parseKey(selected).getFullYear() === viewYear && parseKey(selected).getMonth() === viewMonth;
    const todayInView = parseKey(today).getFullYear() === viewYear && parseKey(today).getMonth() === viewMonth;
    const tabStop = inView ? selected : todayInView ? today : store.dateKey(first);

    let html = '<span class="cal-blank"></span>'.repeat(first.getDay());
    for (let d = 1; d <= days; d++) {
      const date = store.dateKey(new Date(viewYear, viewMonth, d));
      const n = store.dayLog(date).length;
      const cls = ['cal-day'];
      if (date === today) cls.push('is-today');
      if (date === selected) cls.push('is-selected');
      if (n) cls.push('has-log');
      if (date > today) cls.push('is-future');
      const label = parseKey(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
        + (date === today ? ', today' : '') + (n ? `, ${plural(n, 'prayer')} recited` : '');
      const dots = n ? '<i></i>'.repeat(Math.min(n, 3)) + (n > 3 ? `<b>+${n - 3}</b>` : '') : '';
      html += `<button class="${cls.join(' ')}" type="button" data-date="${date}" data-focus-key="cell:${date}"
        tabindex="${date === tabStop ? 0 : -1}" aria-pressed="${date === selected}" aria-label="${esc(label)}">
        <span class="cal-num">${d}</span><span class="cal-dots" aria-hidden="true">${dots}</span></button>`;
    }
    grid.innerHTML = html;

    const s = store.stats(viewYear, viewMonth);
    $('#cal-stats').innerHTML = `
      <div class="cal-stat"><span class="cal-stat-n">${s.monthDays}</span><span class="cal-stat-l">${s.monthDays === 1 ? 'day' : 'days'} of prayer in ${monthName(viewYear, viewMonth)}</span></div>
      <div class="cal-stat"><span class="cal-stat-n">${s.streak}</span><span class="cal-stat-l">${s.streak === 1 ? 'day' : 'days'} in a row</span></div>
      <div class="cal-stat"><span class="cal-stat-n">${s.total}</span><span class="cal-stat-l">${s.total === 1 ? 'prayer' : 'prayers'} recited in all</span></div>`;

    renderDay(today);
  }

  function renderDay(today) {
    const date = parseKey(selected);
    const future = selected > today;
    const logged = store.dayLog(selected);
    const active = store.activePrayers();
    const activeIds = new Set(active.map((p) => p.id));
    // Prayers logged on this day that have since been removed from the list still show, so the record stays true.
    const gone = logged.filter((id) => !activeIds.has(id));
    const when = selected === today ? ' · Today' : '';

    const row = (id, name, extra = '') => {
      const on = logged.includes(id);
      return `<li><button class="day-row${on ? ' is-on' : ''}" type="button" data-id="${esc(id)}" data-focus-key="day:${esc(id)}" aria-pressed="${on}">
        <span class="day-tick" aria-hidden="true">${on ? '✓' : ''}</span><span class="day-name">${esc(name)}${extra}</span></button></li>`;
    };

    let body;
    if (future) {
      body = '<p class="day-note">This day is still to come.</p>';
    } else if (!active.length && !gone.length) {
      body = '<p class="day-note">Your prayer list is empty.</p>';
    } else {
      body = `<ul class="day-list">
        ${active.map((p) => row(p.id, p.short || p.title)).join('')}
        ${gone.map((id) => row(id, store.prayerName(id), ' <em>(removed from your list)</em>')).join('')}
      </ul>`;
    }

    $('#day-card').innerHTML = `
      <p class="eyebrow">${date.toLocaleDateString('en-GB', { weekday: 'long' })}${when}</p>
      <h3>${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
      <p class="day-sum">${future ? '' : logged.length ? `${plural(logged.length, 'prayer')} recited` : 'Nothing marked yet. Tap a prayer once you’ve prayed it.'}</p>
      ${body}
      <p class="day-foot"><button class="linklike" type="button" data-nav="prayers">Open the prayers →</button></p>`;
  }

  function select(dateKey, focus) {
    const d = parseKey(dateKey);
    selected = dateKey;
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
    renderCalendar();
    if (focus) { const cell = grid.querySelector(`[data-date="${dateKey}"]`); if (cell) cell.focus(); }
  }

  function shiftMonth(by) {
    const d = new Date(viewYear, viewMonth + by, 1);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
    redraw(renderCalendar);
  }

  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cal-day');
    if (cell) select(cell.dataset.date, true);
  });
  grid.addEventListener('keydown', (e) => {
    const cell = e.target.closest('.cal-day');
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!cell || !step) return;
    e.preventDefault();
    const d = parseKey(cell.dataset.date);
    d.setDate(d.getDate() + step);
    select(store.dateKey(d), true);
  });
  $('#cal-prev').addEventListener('click', () => shiftMonth(-1));
  $('#cal-next').addEventListener('click', () => shiftMonth(1));
  $('#cal-today').addEventListener('click', () => select(store.todayKey(), false));

  $('#day-card').addEventListener('click', (e) => {
    const row = e.target.closest('.day-row');
    if (row) store.toggleLog(selected, row.dataset.id);
  });

  /* ==================== ACCOUNT WINDOW ==================== */
  const acctModal = $('#account-modal');
  const acctBody = $('#account-body');
  let mode = 'signin';
  let drawn = '';

  const AUTH_ERRORS = {
    'auth/invalid-email': 'That email address doesn’t look right.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/missing-password': 'Please enter your password.',
    'auth/invalid-credential': 'That email and password don’t match. Check them and try again, or reset your password.',
    'auth/wrong-password': 'That email and password don’t match. Check them and try again, or reset your password.',
    'auth/user-not-found': 'That email and password don’t match. Check them and try again, or reset your password.',
    'auth/email-already-in-use': 'There’s already an account with that email. Try signing in instead.',
    'auth/weak-password': 'Please choose a longer password: at least 6 characters.',
    'auth/password-does-not-meet-requirements': 'That password doesn’t meet the requirements. Try a longer one with a mix of letters and numbers.',
    'auth/too-many-requests': 'Too many tries for now. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'No connection. Check your internet and try again.',
    'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
    'auth/account-exists-with-different-credential': 'There’s already an account with that email. Sign in with your email and password instead.',
    'auth/operation-not-allowed': 'This way of signing in isn’t switched on for this site yet.',
    'auth/unauthorized-domain': 'This website address isn’t approved for sign-in yet.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/requires-recent-login': 'For your safety, please sign out, sign in again, and then try once more.',
    'sw/unavailable': 'Sign-in can’t be reached right now. Check your connection and reload the page.',
  };
  const SILENT = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'];

  function explain(err) {
    const code = (err && err.code) || '';
    if (SILENT.includes(code)) return '';
    if (code === 'auth/operation-not-allowed' || code === 'auth/unauthorized-domain') {
      console.warn('[Still Waters] Sign-in is not fully set up in the Firebase console (see FIREBASE-SETUP.md, steps 2 and 3).', err);
    } else if (!AUTH_ERRORS[code]) {
      console.warn('[Still Waters] Account error', err);
    }
    return AUTH_ERRORS[code] || 'Something went wrong. Please try again in a moment.';
  }

  function showError(sel, text) {
    const el = $(sel, acctBody);
    if (!el) return;
    el.textContent = text;
    el.hidden = !text;
  }

  function renderAccount(force) {
    const a = state.account;
    const view = a.status === 'signedIn' ? 'in' : `out:${mode}`;
    if (a.status === 'signedIn') {
      const line = $('#acct-sync', acctBody);
      if (line && drawn === view) { line.innerHTML = syncText(false)[1]; return; }
    }
    if (drawn === view && !force) return;
    drawn = view;

    if (a.status === 'signedIn') {
      acctBody.innerHTML = `
        <p class="eyebrow">Your account</p>
        <h3 id="acct-title">You’re signed in</h3>
        <p class="acct-email">${esc(a.email)}</p>
        <p class="acct-lead" id="acct-sync">${syncText(false)[1]}</p>
        <p class="acct-lead">Your prayer list and calendar open on any device where you sign in. Only you can see them.</p>
        <div class="acct-row">
          <button class="btn btn-ghost" type="button" data-acct="signout">Sign out</button>
        </div>
        <details class="acct-danger">
          <summary>Delete my account</summary>
          <p>This permanently deletes your account, the prayers you added and your whole calendar, on every device. It can’t be undone.</p>
          ${a.password
            ? '<label class="field"><span>Your password, to confirm</span><input type="password" id="acct-del-pw" autocomplete="current-password"></label>'
            : '<p>You’ll be asked to confirm with Google first.</p>'}
          <p class="form-error" id="acct-del-error" role="alert" hidden></p>
          <button class="btn acct-delete" type="button" data-acct="delete">Delete everything</button>
        </details>`;
      return;
    }

    const up = mode === 'signup';
    acctBody.innerHTML = `
      <p class="eyebrow">Your account</p>
      <h3 id="acct-title">Keep your prayers on every device</h3>
      <p class="acct-lead">With an account, your prayer list and calendar follow you to your phone, tablet and computer. Only you can see them.</p>
      <div class="chips acct-modes">
        <button class="chip${up ? '' : ' is-active'}" type="button" data-mode="signin" aria-pressed="${!up}">Sign in</button>
        <button class="chip${up ? ' is-active' : ''}" type="button" data-mode="signup" aria-pressed="${up}">Create account</button>
      </div>
      <form id="acct-form" novalidate>
        <label class="field"><span>Email</span>
          <input type="email" name="email" autocomplete="email" inputmode="email" required></label>
        <label class="field"><span>Password${up ? ' <em>at least 6 characters</em>' : ''}</span>
          <input type="password" name="password" autocomplete="${up ? 'new-password' : 'current-password'}" required minlength="6"></label>
        <p class="form-error" id="acct-error" role="alert" hidden></p>
        <p class="form-ok" id="acct-ok" role="status" hidden></p>
        <button class="btn btn-gold acct-submit" type="submit">${up ? 'Create account' : 'Sign in'}</button>
        ${up ? '' : '<button class="linklike acct-forgot" type="button" data-acct="forgot">Forgot your password?</button>'}
      </form>
      <div class="acct-or"><span>or</span></div>
      <button class="btn btn-ghost acct-google" type="button" data-acct="google">
        <svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.96 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/></svg>
        Continue with Google
      </button>`;
  }

  function openAccount() {
    returnFocus = document.activeElement;
    renderAccount(true);
    acctModal.hidden = false;
    const first = $('input, button', acctBody);
    if (first) first.focus();
  }
  $('#acct-btn').addEventListener('click', openAccount);

  async function busy(btn, label, work) {
    const old = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = label;
    try { return await work(); } finally {
      if (document.contains(btn)) { btn.disabled = false; btn.innerHTML = old; }
    }
  }

  acctBody.addEventListener('submit', async (e) => {
    if (e.target.id !== 'acct-form') return;
    e.preventDefault();
    const form = e.target;
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    showError('#acct-error', '');
    $('#acct-ok', acctBody).hidden = true;
    if (!email) { showError('#acct-error', AUTH_ERRORS['auth/missing-email']); form.elements.email.focus(); return; }
    if (!password) { showError('#acct-error', AUTH_ERRORS['auth/missing-password']); form.elements.password.focus(); return; }
    if (mode === 'signup' && password.length < 6) { showError('#acct-error', AUTH_ERRORS['auth/weak-password']); form.elements.password.focus(); return; }
    const btn = $('.acct-submit', form);
    try {
      await busy(btn, mode === 'signup' ? 'Creating your account…' : 'Signing in…',
        () => (mode === 'signup' ? store.signUp(email, password) : store.signIn(email, password)));
      acctModal.hidden = true;
    } catch (err) {
      showError('#acct-error', explain(err));
    }
  });

  acctBody.addEventListener('click', async (e) => {
    const m = e.target.closest('[data-mode]');
    if (m) {
      // Keep what was typed when switching between Sign in and Create account.
      const form = $('#acct-form', acctBody);
      const kept = form ? [form.elements.email.value, form.elements.password.value] : ['', ''];
      mode = m.dataset.mode;
      renderAccount(true);
      const f = $('#acct-form', acctBody);
      f.elements.email.value = kept[0];
      f.elements.password.value = kept[1];
      $(`[data-mode="${mode}"]`, acctBody).focus();
      return;
    }
    const btn = e.target.closest('[data-acct]');
    if (!btn) return;
    const act = btn.dataset.acct;

    if (act === 'google') {
      showError('#acct-error', '');
      try { await store.signInWithGoogle(); acctModal.hidden = true; } catch (err) { showError('#acct-error', explain(err)); }
    } else if (act === 'forgot') {
      const form = $('#acct-form', acctBody);
      const email = form.elements.email.value.trim();
      showError('#acct-error', '');
      if (!email) { showError('#acct-error', 'Type your email address above first, then choose “Forgot your password?” again.'); form.elements.email.focus(); return; }
      try {
        await store.resetPassword(email);
        const ok = $('#acct-ok', acctBody);
        ok.textContent = `If there’s an account for ${email}, an email with a link to choose a new password is on its way.`;
        ok.hidden = false;
      } catch (err) { showError('#acct-error', explain(err)); }
    } else if (act === 'signout') {
      if (store.hasUnsynced() && !window.confirm('Some changes haven’t reached your account yet, and signing out now would lose them.\n\nSign out anyway?')) return;
      try { await busy(btn, 'Signing out…', () => store.signOut()); acctModal.hidden = true; } catch (err) { console.warn(err); }
    } else if (act === 'delete') {
      const pw = $('#acct-del-pw', acctBody);
      showError('#acct-del-error', '');
      if (pw && !pw.value) { showError('#acct-del-error', AUTH_ERRORS['auth/missing-password']); pw.focus(); return; }
      if (!window.confirm('Delete your account, your own prayers and your whole calendar forever?')) return;
      try {
        await busy(btn, 'Deleting…', () => store.deleteAccount(pw ? pw.value : ''));
        acctModal.hidden = true;
      } catch (err) {
        const text = explain(err);
        if (text) showError('#acct-del-error', text.replace('That email and password don’t match. Check them and try again, or reset your password.', 'That password isn’t right.'));
      }
    }
  });

  /* ==================== KEEPING IT ALL CURRENT ==================== */
  function renderAll() {
    redraw(() => {
      renderSync();
      renderPrayers();
      renderCalendar();
      if (!acctModal.hidden) renderAccount(false);
    });
  }
  store.subscribe(renderAll);
  renderAll();

  // A new day may have begun since the page was opened.
  let lastDay = store.todayKey();
  const freshen = () => {
    const t = store.todayKey();
    if (t === lastDay) return;
    if (selected === lastDay) { selected = t; const d = new Date(); viewYear = d.getFullYear(); viewMonth = d.getMonth(); }
    lastDay = t;
    renderAll();
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) freshen(); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-nav]')) freshen(); });
}
