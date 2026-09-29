/* ============================================================
   STILL WATERS — the niche (entry point)
   ------------------------------------------------------------
   A small shrine niche in the corner of the page where 3D figures of
   Christ and Our Lady stand. This file wires up the HTML, the
   hide/show button and the verses, and loads the Three.js scene
   (scene.js) only when the niche is actually open, so readers who
   keep it tucked away never download Three.js at all.

   Everything you are likely to want to change is in CONFIG below.
============================================================ */

const CONFIG = {
  // Your model. Until the file exists, simple stand-in figures are shown instead.
  modelUrl: 'assets/models/jesus_mary.glb',
  usePlaceholderIfMissing: true,
  clayFinish: true,              // force a matte, clay-like surface on the model's materials

  // Names inside the .glb (see assets/models/README.md). Several spellings may be listed.
  rig: {
    jesus: { root: ['Jesus', 'Jesus_Rig'], head: 'Jesus_Head', neck: 'Jesus_Neck', hands: ['Jesus_Hand_R'], halo: 'Jesus_Halo' },
    mary:  { root: ['Mary', 'Mary_Rig'],   head: 'Mary_Head',  neck: 'Mary_Neck',  hands: ['Mary_Hand_R', 'Mary_Hand_L'], halo: 'Mary_Halo' },
  },
  // Which animation clips loop, and which play on a click.
  // "Jesus_Idle" loops for Christ; "Mary_Bless" plays when Our Lady is clicked; a plain "Bless" plays for both.
  clips: { idle: /idle|breath/i, gesture: /bless|grace|gesture/i },

  figureHeight: 1.68,            // scene units; the model is scaled to this, whatever its export size
  standHeight: 0.05,             // the low step they stand on

  camera: { fov: 26, position: [0, 1.05, 6.4], target: [0, 0.83, 0] },
  light: { exposure: 1.0, ambient: 1.5, key: 2.3, fill: 0.45, rim: 2.4, halo: 1.6 },
  halo: { radius: 0.078, up: 0.062, back: 0.05, glow: 0.42 }, // sizes are fractions of figureHeight

  look: {
    maxYaw: 0.5,                 // radians (~29°) left/right
    maxPitchUp: 0.3,
    maxPitchDown: 0.22,
    speed: 1.5,                  // lower is slower; 1.5 settles in about two seconds
    neckShare: 0.4,              // how much of the turn the neck takes; the head takes the rest
    planeZ: 1.4,                 // depth of the invisible plane the cursor ray is cast onto
    idleAfter: 6,                // seconds without cursor movement before they return to rest
  },
  motion: { wakeFor: 3.2, minGesture: 2.4 },
  motes: { max: 180, idleRate: 1.6, burst: 34, emitDelay: 1.0 },

  startCollapsedBelow: 640,      // px; on narrow screens the niche starts tucked away
  storageKey: 'sw-niche-collapsed',

  // Short King James verses (in keeping with the Daily Verse section) shown on the ledge after a gesture.
  verses: {
    jesus: [
      ['Peace I leave with you.', 'John 14:27'],
      ['Be of good cheer; it is I; be not afraid.', 'Matthew 14:27'],
      ['Lo, I am with you alway.', 'Matthew 28:20'],
      ['Come unto me … and I will give you rest.', 'Matthew 11:28'],
      ['The Lord bless thee, and keep thee.', 'Numbers 6:24'],
      ['Thy faith hath made thee whole.', 'Luke 8:48'],
    ],
    mary: [
      ['Whatsoever he saith unto you, do it.', 'John 2:5'],
      ['Behold the handmaid of the Lord.', 'Luke 1:38'],
      ['My soul doth magnify the Lord.', 'Luke 1:46'],
      ['Blessed art thou among women.', 'Luke 1:28'],
    ],
    both: [
      ['Be still, and know that I am God.', 'Psalm 46:10'],
      ['He leadeth me beside the still waters.', 'Psalm 23:2'],
    ],
  },
};

/* ==================== setup ==================== */
const niche = document.getElementById('sw-niche');
if (niche) init(niche);

function init(niche) {
  const $ = (s) => niche.querySelector(s);
  const frame = $('.sw-niche__frame');
  const stage = $('.sw-niche__stage');
  const hideBtn = $('.sw-niche__hide');
  const showBtn = $('.sw-niche__show');
  const verseEl = $('.sw-niche__verse');
  const refEl = $('.sw-niche__ref');
  const inscription = $('.sw-niche__inscription');
  const isHero = niche.dataset.placement === 'hero';

  if (!hasWebGL()) { niche.dataset.state = 'error'; return; }
  niche.dataset.state = 'idle'; // the niche stays hidden until this script has run (see niche.css)

  let scene = null;
  let loading = null;
  let inView = true;
  let collapsed = !isHero && startCollapsed();

  // The first line on the ledge says what the niche does.
  const touch = matchMedia('(hover: none)').matches;
  verseEl.textContent = touch ? 'Tap for a verse' : 'Click for a verse';
  inscription.classList.add('is-hint');

  /* ---------- hide / show ---------- */
  function applyCollapsed() {
    niche.classList.toggle('is-collapsed', collapsed);
    frame.hidden = collapsed;
    hideBtn.hidden = collapsed;
    showBtn.hidden = !collapsed;
    hideBtn.setAttribute('aria-expanded', String(!collapsed));
    showBtn.setAttribute('aria-expanded', String(!collapsed));
    if (!collapsed) load();
    refresh();
  }
  hideBtn.addEventListener('click', () => {
    collapsed = true; remember(true); applyCollapsed(); showBtn.focus();
  });
  showBtn.addEventListener('click', () => {
    collapsed = false; remember(false); applyCollapsed(); stage.focus({ preventScroll: true });
  });

  /* ---------- keyboard: Enter or Space asks for a gesture ---------- */
  stage.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    scene?.gesture('both');
  });

  /* ---------- load Three.js and the scene, once ---------- */
  function load() {
    if (loading) return loading;
    niche.dataset.state = 'loading';
    loading = new Promise((resolve) => whenIdle(resolve))
      .then(() => import('./scene.js'))
      .then(({ createNicheScene }) => createNicheScene(stage, CONFIG, { onGesture: showVerse }))
      .then((s) => {
        scene = s;
        niche.dataset.state = 'ready';
        niche.dataset.source = s.source;
        refresh();
      })
      .catch((err) => {
        // Quietly step aside: a devotional page is better with no niche than a broken one.
        console.warn('[Still Waters niche] Could not start, so the niche is hidden.', err);
        niche.dataset.state = 'error';
      });
    return loading;
  }

  /* ---------- only draw while someone can see it ---------- */
  const modals = [...document.querySelectorAll('.modal')];
  function refresh() {
    if (!scene) return;
    const modalOpen = modals.some((m) => !m.hidden);
    scene.setActive(!collapsed && inView && !document.hidden && !modalOpen);
  }
  document.addEventListener('visibilitychange', refresh);
  const modalWatch = new MutationObserver(refresh);
  modals.forEach((m) => modalWatch.observe(m, { attributes: true, attributeFilter: ['hidden'] }));
  if (isHero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; refresh(); }).observe(niche);
  }

  /* ---------- verses on the ledge ---------- */
  const bags = {};
  function nextVerse(who) {
    const pool = CONFIG.verses[who] || CONFIG.verses.both;
    if (!bags[who] || !bags[who].length) bags[who] = shuffle(pool.slice());
    return bags[who].pop();
  }
  function showVerse(who) {
    const [text, ref] = nextVerse(who === 'both' && Math.random() < 0.5 ? 'both' : who === 'both' ? 'jesus' : who);
    inscription.classList.add('is-changing');
    setTimeout(() => {
      inscription.classList.remove('is-hint');
      verseEl.textContent = text;
      refEl.textContent = ref;
      inscription.classList.remove('is-changing');
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320);
  }

  applyCollapsed();
}

/* ==================== helpers ==================== */
function startCollapsed() {
  try {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved !== null) return saved === '1';
  } catch { /* storage blocked: fall through */ }
  const narrow = window.innerWidth < CONFIG.startCollapsedBelow;
  const saveData = navigator.connection && navigator.connection.saveData;
  return narrow || !!saveData;
}

function remember(isCollapsed) {
  try { localStorage.setItem(CONFIG.storageKey, isCollapsed ? '1' : '0'); } catch { /* ignore */ }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch { return false; }
}

function whenIdle(fn) {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1500 });
  else setTimeout(fn, 400);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
