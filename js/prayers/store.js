/* ============================================================
   STILL WATERS — the prayer list and calendar, kept safe
   ------------------------------------------------------------
   One place that knows:
     - which prayers are on this person's list (built-in ones they
       haven't removed, plus their own)
     - which prayers they recited on which day
     - whether they are signed in, and whether it has all synced

   Not signed in: everything is kept in this browser (localStorage).
   Signed in:     everything is kept in their Firebase account and
                  follows them to every device (see cloud.js).
============================================================ */
import { BUILTIN } from './prayers-data.js';
import { firebaseConfig } from './firebase-config.js';

const KEY = 'sw-prayers';
const GUEST = `${KEY}:guest`;
const LAST_UID = `${KEY}:last-uid`;
const GUEST_SKIP = `${KEY}:guest-kept-for`;
const userKey = (uid) => `${KEY}:user:${uid}`;
const queueKey = (uid) => `${KEY}:queue:${uid}`;
const LOG = '[Still Waters]';

const BUILTIN_BY_ID = Object.fromEntries(BUILTIN.map((p) => [p.id, p]));
const empty = () => ({ custom: {}, hidden: [], log: {} });

/* ---------- small helpers ---------- */
const ls = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ } },
  del(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};
const readData = (key) => {
  const v = ls.get(key);
  return v && typeof v === 'object' ? { ...empty(), ...v } : null;
};

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export const todayKey = () => dateKey(new Date());

const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* ---------- state ---------- */
export const configured = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

export const state = {
  data: empty(),
  // 'local'       no Firebase project set up: this browser only
  // 'starting'    Firebase is loading
  // 'signedOut' | 'signedIn'
  // 'unavailable' Firebase couldn't be loaded (blocked or offline)
  account: { status: configured ? 'starting' : 'local', email: '', google: false, password: false },
  // 'local' | 'loading' | 'saving' | 'synced' | 'offline' | 'error'
  sync: 'local',
  syncError: '',
  guestWaiting: null, // { days, prayers } saved on this device before signing in
};

let uid = null;        // whose data is on screen (null = this device's own)
let cloud = null;
let queue = [];        // changes made while Firebase was still loading or unreachable
let autoMerge = false; // a brand-new account takes this device's prayers with it without asking
let flags = { pending: false, fromCache: true };

const subscribers = new Set();
export function subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); }
function emit() { subscribers.forEach((fn) => { try { fn(state); } catch (err) { console.error(err); } }); }

function persist() { ls.set(uid ? userKey(uid) : GUEST, state.data); }

/* ---------- start ---------- */
const lastUid = configured ? ls.get(LAST_UID) : null;
if (lastUid && readData(userKey(lastUid))) {
  // Show what this person saw last time straight away, while Firebase confirms who they are.
  uid = lastUid;
  state.data = readData(userKey(lastUid));
  state.sync = 'loading';
  queue = ls.get(queueKey(lastUid)) || [];
} else {
  state.data = readData(GUEST) || empty();
}

let cloudReady = null;
if (configured) {
  cloudReady = import('./cloud.js')
    .then((m) => m.startCloud(firebaseConfig, { onUser, onData, onError }))
    .then((c) => { cloud = c; return c; })
    .catch((err) => {
      console.warn(`${LOG} Accounts couldn't be loaded, so changes are kept on this device for now.`, err);
      state.account.status = 'unavailable';
      state.sync = uid ? 'offline' : 'local';
      emit();
      return null;
    });
} else {
  console.info(`${LOG} No Firebase project is set up yet (js/prayers/firebase-config.js), so prayers and the calendar are saved in this browser only. See FIREBASE-SETUP.md.`);
}

window.addEventListener('online', () => { if (uid) { setSyncFromFlags(); emit(); } });
window.addEventListener('offline', () => { if (uid) { setSyncFromFlags(); emit(); } });

function setSyncFromFlags() {
  if (state.account.status !== 'signedIn') return;
  const online = navigator.onLine !== false;
  if (flags.pending) state.sync = online ? 'saving' : 'offline';
  else if (flags.fromCache) state.sync = online ? 'loading' : 'offline';
  else state.sync = 'synced';
}

/* ---------- what Firebase tells us ---------- */
function guestSummary() {
  const g = readData(GUEST);
  if (!g) return null;
  const days = Object.keys(g.log).length;
  const prayers = Object.values(g.custom).filter((p) => !p.removed).length;
  if (!days && !Object.keys(g.custom).length && !g.hidden.length) return null;
  return { days, prayers };
}

function onUser(user) {
  if (user) {
    if (uid !== user.uid) {
      state.data = readData(userKey(user.uid)) || empty();
      queue = ls.get(queueKey(user.uid)) || [];
    }
    uid = user.uid;
    ls.set(LAST_UID, uid);
    state.account = { status: 'signedIn', email: user.email, google: user.google, password: user.password };
    state.sync = 'loading';
    state.syncError = '';
    flags = { pending: false, fromCache: true };

    // Send anything that was changed before Firebase was ready.
    queue.forEach(run);
    queue = [];
    ls.del(queueKey(uid));

    const waiting = guestSummary();
    if (waiting && autoMerge) mergeGuest();
    else state.guestWaiting = waiting && ls.get(GUEST_SKIP) !== uid ? waiting : null;
    autoMerge = false;
  } else {
    if (uid) { ls.del(userKey(uid)); ls.del(queueKey(uid)); }
    ls.del(LAST_UID);
    uid = null;
    queue = [];
    state.data = readData(GUEST) || empty();
    state.account = { status: 'signedOut', email: '', google: false, password: false };
    state.sync = 'local';
    state.syncError = '';
    state.guestWaiting = null;
  }
  emit();
}

function onData({ hidden, custom, log, pending, fromCache }) {
  if (state.account.status !== 'signedIn') return;
  state.data = { hidden, custom, log };
  flags = { pending, fromCache };
  state.syncError = '';
  setSyncFromFlags();
  persist();
  emit();
}

function onError(err) {
  state.sync = 'error';
  state.syncError = (err && err.code) || 'unknown';
  emit();
}

/* ---------- sending changes ---------- */
function run(op) {
  const [kind, a, b, c] = op;
  if (kind === 'log') cloud.setLog(a, b, c);
  else if (kind === 'hidden') cloud.setHidden(a, b);
  else if (kind === 'save') cloud.savePrayer(a);
  else if (kind === 'delete') cloud.deletePrayer(a);
}

function commit(op) {
  persist();
  if (uid) {
    if (cloud && state.account.status === 'signedIn') run(op);
    else { queue.push(op); ls.set(queueKey(uid), queue); }
  } else {
    ls.del(GUEST_SKIP); // this device's own list changed, so offer it again at the next sign-in
  }
  emit();
}

/* ---------- the prayer list ---------- */
export function activePrayers() {
  const hidden = new Set(state.data.hidden);
  const mine = Object.values(state.data.custom).filter((p) => !p.removed).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return [...BUILTIN.filter((p) => !hidden.has(p.id)), ...mine.map((p) => ({ ...p, custom: true }))];
}

export function removedPrayers() {
  const hidden = new Set(state.data.hidden);
  const mine = Object.values(state.data.custom).filter((p) => p.removed).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return [...BUILTIN.filter((p) => hidden.has(p.id)), ...mine.map((p) => ({ ...p, custom: true }))];
}

export function getPrayer(id) {
  if (BUILTIN_BY_ID[id]) return BUILTIN_BY_ID[id];
  const p = state.data.custom[id];
  return p ? { ...p, custom: true } : null;
}

export function prayerName(id) {
  const p = getPrayer(id);
  return p ? (p.short || p.title) : 'A prayer no longer on your list';
}

export function addPrayer({ title, text }) {
  const now = Date.now();
  const p = { id: newId(), title, text, removed: false, createdAt: now, updatedAt: now };
  state.data.custom = { ...state.data.custom, [p.id]: p };
  commit(['save', p]);
  return p.id;
}

export function updatePrayer(id, { title, text }) {
  const old = state.data.custom[id];
  if (!old) return;
  const p = { ...old, title, text, updatedAt: Date.now() };
  state.data.custom = { ...state.data.custom, [id]: p };
  commit(['save', p]);
}

export function removePrayer(id) {
  if (BUILTIN_BY_ID[id]) {
    if (state.data.hidden.includes(id)) return;
    state.data.hidden = [...state.data.hidden, id];
    commit(['hidden', id, true]);
  } else if (state.data.custom[id]) {
    const p = { ...state.data.custom[id], removed: true, updatedAt: Date.now() };
    state.data.custom = { ...state.data.custom, [id]: p };
    commit(['save', p]);
  }
}

export function restorePrayer(id) {
  if (BUILTIN_BY_ID[id]) {
    state.data.hidden = state.data.hidden.filter((x) => x !== id);
    commit(['hidden', id, false]);
  } else if (state.data.custom[id]) {
    const p = { ...state.data.custom[id], removed: false, updatedAt: Date.now() };
    state.data.custom = { ...state.data.custom, [id]: p };
    commit(['save', p]);
  }
}

export function deletePrayerForever(id) {
  if (!state.data.custom[id]) return;
  const { [id]: gone, ...rest } = state.data.custom;
  state.data.custom = rest;
  commit(['delete', id]);
}

/* ---------- the calendar ---------- */
export function dayLog(date) {
  return Object.keys(state.data.log[date] || {});
}

export function isLogged(date, id) {
  return !!(state.data.log[date] && state.data.log[date][id]);
}

export function toggleLog(date, id) {
  if (date > todayKey()) return false; // a day that hasn't come yet
  const day = { ...(state.data.log[date] || {}) };
  const on = !day[id];
  if (on) day[id] = true; else delete day[id];
  const log = { ...state.data.log };
  if (Object.keys(day).length) log[date] = day; else delete log[date];
  state.data.log = log;
  commit(['log', date, id, on]);
  return on;
}

export function stats(year, month) {
  const log = state.data.log;
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  let monthDays = 0;
  let total = 0;
  for (const [date, ids] of Object.entries(log)) {
    const n = Object.keys(ids).length;
    if (!n) continue;
    total += n;
    if (date.startsWith(prefix)) monthDays++;
  }
  // Days in a row, counting back from today (or from yesterday, if today is still to be prayed).
  let streak = 0;
  const d = new Date();
  if (!log[dateKey(d)]) d.setDate(d.getDate() - 1);
  while (log[dateKey(d)]) { streak++; d.setDate(d.getDate() - 1); }
  return { monthDays, total, streak };
}

/* ---------- accounts ---------- */
async function needCloud() {
  const c = cloud || (cloudReady && (await cloudReady));
  if (!c) throw Object.assign(new Error('Accounts are not available'), { code: 'sw/unavailable' });
  return c;
}

export async function signUp(email, password) {
  const c = await needCloud();
  autoMerge = true;
  try {
    const cred = await c.signUp(email, password);
    if (uid === cred.user.uid) { autoMerge = false; if (state.guestWaiting) mergeGuest(); }
  } catch (err) { autoMerge = false; throw err; }
}

export async function signIn(email, password) {
  const c = await needCloud();
  await c.signIn(email, password);
}

export async function signInWithGoogle() {
  const c = await needCloud();
  const { user, isNew } = await c.google();
  if (!isNew) return;
  if (uid === user.uid) { if (state.guestWaiting) mergeGuest(); } else autoMerge = true;
}

export async function resetPassword(email) {
  const c = await needCloud();
  await c.resetPassword(email);
}

export async function signOut() {
  const c = await needCloud();
  await c.signOut();
}

export async function deleteAccount(password) {
  const c = await needCloud();
  await c.deleteAccount(password);
}

export const hasUnsynced = () => state.account.status === 'signedIn' && (state.sync === 'saving' || state.sync === 'offline');

/* ---------- prayers saved on this device before signing in ---------- */
export function mergeGuest() {
  const g = readData(GUEST);
  if (g && cloud && uid) {
    cloud.mergeIn(g);
    ls.del(GUEST);
    ls.del(GUEST_SKIP);
  }
  state.guestWaiting = null;
  emit();
}

export function keepGuestSeparate() {
  if (uid) ls.set(GUEST_SKIP, uid);
  state.guestWaiting = null;
  emit();
}
