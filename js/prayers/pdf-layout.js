/* ============================================================
   STILL WATERS — the printed prayer book
   ------------------------------------------------------------
   Turns the prayers someone chose into a pdfmake document:
   a small, quiet booklet set in the site's own typefaces
   (Cormorant Garamond for titles, Spectral for the words).

   Nothing here touches the page; print.js loads pdfmake and the
   fonts, then hands this file's result to it.
============================================================ */
import { CLOSING, COMMON_PRAYERS } from './prayers-data.js';

const C = {
  lapis: '#1e2a55',
  ink: '#2b3048',
  soft: '#4d5470',
  gold: '#a8863c',
  olive: '#6b7658',
  rule: '#d8cfb8',
  tint: '#f6f2e7',
};

// The font files in assets/fonts/ (subsets of the site's two typefaces).
export const FONT_FILES = {
  Display: {
    normal: 'cormorant-garamond-500.ttf',
    italics: 'cormorant-garamond-500-italic.ttf',
    bold: 'cormorant-garamond-600.ttf',
    bolditalics: 'cormorant-garamond-500-italic.ttf',
  },
  Body: {
    normal: 'spectral-400.ttf',
    italics: 'spectral-400-italic.ttf',
    bold: 'spectral-500.ttf',
    bolditalics: 'spectral-400-italic.ttf',
  },
};

// Characters those font files can draw. Anything else (an emoji, Chinese characters…) would print as a gap.
const PRINTABLE = /^[\t\n\r -~ -ſƒȘ-țˆ-˝Ѐ-џҐґḀ-ỿ -⁯€№™←-↓−ﬁﬂ]$/u;
export function unprintable(text) {
  const bad = new Set();
  for (const ch of String(text || '')) if (!PRINTABLE.test(ch)) bad.add(ch);
  return [...bad];
}
const clean = (text) => Array.from(String(text || '')).filter((ch) => PRINTABLE.test(ch)).join('');

/* ---------- little drawings ---------- */
const ARCH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30">
  <path d="M2 30 V14 A10 10 0 0 1 22 14 V30" fill="none" stroke="${C.gold}" stroke-width="1.3"/>
  <path d="M12 8 V20 M8 13 H16" fill="none" stroke="${C.gold}" stroke-width="1.1"/></svg>`;
const ORNAMENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 10">
  <path d="M0 5 H63 M87 5 H150" stroke="${C.gold}" stroke-width="0.6"/>
  <path d="M75 1.2 L78.8 5 L75 8.8 L71.2 5 Z" fill="none" stroke="${C.gold}" stroke-width="0.8"/>
  <circle cx="67" cy="5" r="0.9" fill="${C.gold}"/><circle cx="83" cy="5" r="0.9" fill="${C.gold}"/></svg>`;
const CROSS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 16">
  <path d="M6 1 V15 M2 5.5 H10" stroke="${C.gold}" stroke-width="1" fill="none"/></svg>`;
const STARS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 8">
  <path d="M10 1 L13 4 L10 7 L7 4 Z M30 0.5 L33.5 4 L30 7.5 L26.5 4 Z M50 1 L53 4 L50 7 L47 4 Z" fill="${C.gold}" opacity="0.85"/></svg>`;

const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
const numberWord = (n) => NUMBER_WORDS[n] || String(n);

const firstSentence = (s) => (String(s).match(/^.*?[.!?](\s|$)/) || [s])[0].trim();

// Which Mysteries are prayed on which day (the same plan as the Rosary tab).
const DAY_SET = ['Glorious', 'Joyful', 'Sorrowful', 'Glorious', 'Luminous', 'Sorrowful', 'Joyful']; // Sunday first
const DAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
function daysFor(set) {
  const days = [1, 2, 3, 4, 5, 6, 0].filter((d) => DAY_SET[d] === set).map((d) => DAY_NAMES[d]);
  return days.length > 1 ? `${days.slice(0, -1).join(', ')} and ${days[days.length - 1]}` : days[0];
}

/* ============================================================
   buildPrayerBook(items, options, env) → pdfmake document

   items    prayers in the order chosen (as store.getPrayer returns them)
   options  { paper: 'A4' | 'LETTER', size: 'regular' | 'large',
              newPage: bool, words: bool, mysteries: 'all' | 'today',
              compact: bool  (a touch smaller, to keep one prayer on one page) }
   env      { rosary, threeHailMarys, date: Date,
              probe: {} (optional: receives { pages } once pdfmake has laid it out) }
============================================================ */
export function buildPrayerBook(items, options = {}, env = {}) {
  const o = { paper: 'A4', size: 'regular', newPage: true, words: true, mysteries: 'all', ...options };
  const k = (o.size === 'large' ? 1.22 : 1) * (o.compact ? 0.94 : 1);
  const lh = o.compact ? 0.95 : 1; // tighter leading in compact mode
  const today = env.date || new Date();
  const R = env.rosary || null;
  const T = env.threeHailMarys || null;
  const P = (R && R.prayers && R.prayers.en) || COMMON_PRAYERS;

  const pageWidth = o.paper === 'LETTER' ? 612 : 595.28;
  const pageHeight = o.paper === 'LETTER' ? 792 : 841.89;
  const side = o.size === 'large' ? 66 : 82;
  const margins = [side, 64, side, 74];

  const hasCover = items.length >= 3;
  const plain = items.filter((p) => !p.kind && !p.custom);           // the twelve prayers that close with Our Father, Hail Marys, Glory Be
  const wordsAtEnd = o.words && plain.length > 1;                   // printed once at the back, not after every prayer
  const wordsInline = o.words && plain.length === 1;

  /* ---------- building blocks ---------- */
  const svg = (s, width, extra = {}) => ({ svg: s, width, alignment: 'center', ...extra });
  const caps = (text, style, extra = {}) => ({ text: String(text).toUpperCase(), style, ...extra });
  const para = (text, style = 'body', extra = {}) => ({ text: clean(text), style, ...extra });
  const label = (text, extra = {}) => caps(text, 'label', extra);
  // Keep a title or label together with what follows it, so it is never left alone at the foot of a page.
  const together = (...nodes) => ({ stack: nodes.filter(Boolean), unbreakable: true });
  // For a long prayer, keeping it whole could leave half a page empty, so let it run on;
  // its name is marked so it never sits on the last lines of a page (see pageBreakBefore).
  const SHORT = 340;
  const named = (name, words, style = 'prayerName') => {
    const head = { text: name, style, headlineLevel: 2 };
    return String(words).length <= SHORT
      ? together(head, para(words), { text: '', margin: [0, 0, 0, 2 * k] })
      : { stack: [head, para(words)], margin: [0, 0, 0, 2 * k] };
  };

  function heading(id, eyebrow, title) {
    const t = { text: clean(title), style: 'title', id: `sw-${id}`, outline: true, outlineText: clean(title) };
    if (hasCover) Object.assign(t, { tocItem: true, tocStyle: 'tocText', tocNumberStyle: 'tocNumber', tocMargin: [0, 5, 0, 5] });
    return {
      stack: [
        caps(eyebrow, 'eyebrow'),
        t,
        svg(ORNAMENT, 108 * k, { margin: [0, 2, 0, 14 * k] }),
      ],
      unbreakable: true,
    };
  }

  // A list of named prayers (name above, words below), shaded like a card.
  function wordsBox(entries, extra = {}) {
    return {
      table: {
        widths: ['*'],
        dontBreakRows: true,
        body: entries.map(([name, words], i) => [{
          stack: [
            { text: name, style: 'wordsName' },
            para(words, 'wordsText'),
          ],
          fillColor: C.tint,
          margin: [0, i === 0 ? 4 : 0, 0, i === entries.length - 1 ? 4 : 0],
        }]),
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: (i) => (i === 0 ? 1.4 : 0),
        vLineColor: () => C.gold,
        paddingLeft: () => 16 * k,
        paddingRight: () => 16 * k,
        paddingTop: () => 7 * k,
        paddingBottom: () => 7 * k,
      },
      ...extra,
    };
  }

  const commonWords = () => [
    ['Our Father', P.ourFather],
    ['Hail Mary', P.hailMary],
    ['Glory Be', P.gloryBe],
  ];

  function closing() {
    return {
      stack: [
        svg(CROSS, 9 * k, { margin: [0, 0, 0, 6] }),
        { text: CLOSING, style: 'closing' },
      ],
      unbreakable: true,
      margin: [0, 14 * k, 0, 0],
    };
  }

  /* ---------- one prayer from the list of twelve ---------- */
  function builtIn(p) {
    const count = (c) => (c.count === 3 ? 'Three Hail Marys' : c.name);
    const out = [
      together(heading(p.id, 'A prayer for every day', p.title), para(p.address, 'address'), para(p.body[0])),
      ...p.body.slice(1).map((t) => para(t)),
      {
        stack: [
          label('To conclude', { margin: [0, 8 * k, 0, 4] }),
          para(p.concludeLead.replace(/:$/, ':'), 'lead'),
          {
            table: {
              widths: [104 * k, '*'],
              body: p.conclude.map((c) => [
                { text: count(c), style: 'concludeName' },
                { text: clean(c.intention), style: 'concludeFor' },
              ]),
            },
            layout: {
              hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
              hLineColor: () => C.rule,
              vLineWidth: () => 0,
              paddingLeft: (i) => (i === 0 ? 0 : 10),
              paddingRight: () => 0,
              paddingTop: () => 3.5 * k,
              paddingBottom: () => 3.5 * k,
            },
          },
        ],
        unbreakable: true,
      },
    ];
    if (wordsInline) out.push(wordsBox(commonWords(), { margin: [0, 14 * k, 0, 0] }));
    if (wordsAtEnd) {
      out.push({
        text: ['The words of these three prayers: page ', { pageReference: 'sw-common-prayers' }],
        style: 'note', margin: [0, 6 * k, 0, 0],
      });
    }
    out.push({ stack: p.saints.map((s) => para(s, 'saints')), margin: [0, 12 * k, 0, 0], unbreakable: true });
    out.push(closing());
    return out;
  }

  /* ---------- a prayer someone added themselves ---------- */
  function custom(p) {
    const paras = String(p.text || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const first = paras.length ? para(paras[0])
      : para('No words were written down for this prayer: pray it as you know it.', 'lead', { alignment: 'center' });
    return [
      together(heading(p.id, 'A prayer of your own', p.title), first),
      ...paras.slice(1).map((t) => para(t)),
      {
        stack: [svg(STARS, 30 * k)],
        margin: [0, 14 * k, 0, 0],
      },
    ];
  }

  /* ---------- the Holy Rosary ---------- */
  function rosary(p) {
    if (!R) return [together(heading(p.id, 'Prayed on the beads', p.title), para(p.summary))];
    const sets = o.mysteries === 'today' ? [DAY_SET[today.getDay()]] : Object.keys(R.mysteries);
    const out = [
      together(heading(p.id, 'Prayed on the beads', p.title), para(firstSentence(p.summary), 'intro')),

      together(label('How to pray it'), {
        ol: [
          'Make the Sign of the Cross and pray the Apostles’ Creed.',
          'Pray an Our Father, three Hail Marys and the Glory Be.',
          'For each of the five decades, announce the Mystery, then pray an Our Father, ten Hail Marys, the Glory Be and the Fatima Prayer. At the end of each Mystery you may add the short prayer below.',
          'Close with the Hail, Holy Queen and the concluding prayer.',
        ].map((t) => ({ text: t, style: 'body', margin: [0, 0, 0, 4 * k] })),
        markerColor: C.gold,
        style: 'body',
        margin: [6, 0, 0, 6 * k],
      }),

      label('The prayers', { headlineLevel: 2 }),
      named('Before you begin', R.beforePrayer),
      named('The Sign of the Cross', P.sign),
      named('The Apostles’ Creed', P.creed),
      named('Our Father', P.ourFather),
      named('Hail Mary', P.hailMary),
      named('Glory Be', P.gloryBe),
      named('The Fatima Prayer', P.fatima),
      named('At the end of each Mystery', R.mysteryEnd),
      named('Hail, Holy Queen', P.hailHolyQueen),
      named('Concluding prayer', P.conclusion),
    ];

    const mysteriesLabel = label(o.mysteries === 'today'
      ? `Today’s Mysteries · ${today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`
      : 'The Mysteries');
    const mysteriesLead = o.mysteries === 'today' ? null
      : para('Each day has its own set of five Mysteries. Hold one in your heart through each decade.', 'lead', { margin: [0, 0, 0, 8 * k] });

    sets.forEach((set, si) => {
      const setHead = {
        stack: [
          { text: `The ${set} Mysteries`, style: 'setTitle' },
          { text: `Prayed on ${daysFor(set)}`, style: 'setDays' },
        ],
        margin: [0, si === 0 ? 4 * k : 18 * k, 0, 8 * k],
      };
      (R.mysteries[set] || []).forEach((m, i) => {
        const [meditation, ...scripture] = String(m.reflect).split('\n');
        // The Mystery's name and meditation stay together; the Scripture and offering may run on.
        const top = {
          stack: [
            caps(`${ORDINALS[i] || i + 1} Mystery`, 'mysteryNo'),
            { text: clean(m.name), style: 'mysteryName' },
            para(meditation, 'meditation'),
          ],
        };
        const rest = [
          ...(scripture.length ? [para(scripture.join(' '), 'scripture')] : []),
          para(m.pray, 'offering', { margin: [0, 0, 0, 14 * k] }),
        ];
        if (i === 0) out.push(together(si === 0 ? mysteriesLabel : null, si === 0 ? mysteriesLead : null, setHead, top));
        else out.push(together(top));
        out.push(...rest);
      });
    });
    return out;
  }

  /* ---------- the Three Hail Marys ---------- */
  function threeHailMarys(p) {
    if (!T) return [together(heading(p.id, 'Morning and evening', p.title), para(p.summary))];
    const sections = T.sections.map((s) => [
      { text: clean(s.title), style: 'prayerName', headlineLevel: 2 },
      para(s.body),
      para(s.closing, 'offering', { margin: [0, 0, 0, 12 * k] }),
    ]);
    return [
      together(heading(p.id, 'Morning and evening', p.title), para(T.what, 'intro')),
      together(label('How to pray it'), {
        ul: T.how.map((t) => ({ text: clean(t), style: 'body', margin: [0, 0, 0, 4 * k] })),
        markerColor: C.gold,
        style: 'body',
        margin: [6, 0, 0, 6 * k],
      }),
      together(label(T.novenaTitle), para(T.novenaIntro, 'lead', { margin: [0, 0, 0, 10 * k] })),
      ...sections.flat(),
      wordsBox([['Hail Mary', P.hailMary]], { margin: [0, 4 * k, 0, 0] }),
      closing(),
    ];
  }

  /* ---------- put the book together ---------- */
  const content = [];

  if (hasCover) {
    content.push(
      svg(ARCH, 30, { margin: [0, 78, 0, 14] }),
      caps('Still Waters', 'brand', { alignment: 'center' }),
      { text: 'Prayers for Every Day', style: 'coverTitle' },
      {
        text: `${numberWord(items.length)} prayers, gathered on ${today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        style: 'coverSub',
      },
      svg(ORNAMENT, 130, { margin: [0, 18, 0, 26] }),
      {
        toc: {
          title: caps('Contents', 'tocTitle'),
          textStyle: 'tocText',
          numberStyle: 'tocNumber',
        },
        margin: [24, 0, 24, 0],
      },
    );
  }

  items.forEach((p, i) => {
    const part = p.custom ? custom(p)
      : p.id === 'rosary' ? rosary(p)
      : p.id === 'three-hail-marys' ? threeHailMarys(p)
      : p.kind ? [heading(p.id, 'Devotion', p.title), para(p.summary)]
      : builtIn(p);

    if (i > 0 || hasCover) {
      if (o.newPage || (hasCover && i === 0)) part[0] = { ...part[0], pageBreak: 'before' };
      else content.push(svg(STARS, 34, { margin: [0, 26 * k, 0, 26 * k] }));
    }
    content.push(...part);
  });

  if (wordsAtEnd) {
    content.push(
      {
        stack: [
          {
            stack: [
          caps('To know by heart', 'eyebrow'),
          { text: 'The Our Father, Hail Mary and Glory Be', style: 'title', id: 'sw-common-prayers', outline: true,
            ...(hasCover ? { tocItem: true, tocStyle: 'tocText', tocNumberStyle: 'tocNumber', tocMargin: [0, 5, 0, 5] } : {}) },
          svg(ORNAMENT, 108 * k, { margin: [0, 2, 0, 14 * k] }),
            ],
          },
          wordsBox(commonWords()),
        ],
        unbreakable: true,
        pageBreak: o.newPage ? 'before' : undefined,
        margin: o.newPage ? 0 : [0, 30 * k, 0, 0],
      },
    );
  }

  const fs = (n) => n * k;
  const title = items.length === 1 ? clean(items[0].title) : 'Prayers for Every Day';

  return {
    pageSize: o.paper === 'LETTER' ? 'LETTER' : 'A4',
    pageMargins: margins,
    language: 'en',
    info: { title, author: 'Still Waters', subject: 'Prayers', creator: 'Still Waters', producer: 'Still Waters' },
    displayTitle: true,

    background: (page) => (hasCover && page === 1 ? {
      canvas: [
        { type: 'rect', x: 26, y: 26, w: pageWidth - 52, h: pageHeight - 52, lineWidth: 0.7, lineColor: C.gold },
        { type: 'rect', x: 31, y: 31, w: pageWidth - 62, h: pageHeight - 62, lineWidth: 0.3, lineColor: C.gold },
      ],
    } : null),

    header: (page) => (!hasCover && page === 1 ? {
      text: 'STILL WATERS', style: 'brand', alignment: 'center', margin: [0, 30, 0, 0],
    } : null),

    footer: (page, pages) => {
      if (hasCover && page === 1) {
        return {
          text: [
            { text: '“He leadeth me beside the still waters.”', italics: true },
            { text: '   Psalm 23:2', color: C.olive, fontSize: 8.5 },
          ],
          font: 'Display', fontSize: 11, color: C.soft, alignment: 'center', margin: [0, 22, 0, 0],
        };
      }
      return {
        text: pages === 1 ? [{ text: 'Still Waters' }] : [{ text: 'Still Waters' }, { text: '   ·   ', color: C.gold }, { text: String(page) }],
        font: 'Display', italics: true, fontSize: 9.5, color: C.olive, alignment: 'center', margin: [0, 34, 0, 0],
      };
    },

    // Learn how many pages the book came to, and move a small heading that would sit
    // on the last lines of a page over to the next one, with its text.
    pageBreakBefore: (node, nodes) => {
      if (env.probe) env.probe.pages = Math.max(env.probe.pages || 0, node.pages);
      return node.headlineLevel === 2 && node.startPosition
        && (node.startPosition.verticalRatio > 0.86 || nodes.getFollowingNodesOnPage().length === 0);
    },

    content,

    defaultStyle: { font: 'Body', fontSize: fs(10.75), lineHeight: 1.38 * lh, color: C.ink },
    styles: {
      body: { fontSize: fs(10.75), lineHeight: 1.38 * lh, color: C.ink, margin: [0, 0, 0, 7 * k] },
      intro: { font: 'Display', italics: true, fontSize: fs(14.5), lineHeight: 1.25, color: C.lapis, alignment: 'center', margin: [12, 0, 12, 14 * k] },
      eyebrow: { fontSize: fs(7.25), bold: true, characterSpacing: 1.8, color: C.olive, alignment: 'center', margin: [0, 0, 0, 6] },
      brand: { fontSize: 7.5, bold: true, characterSpacing: 2.6, color: C.gold },
      title: { font: 'Display', fontSize: fs(24), lineHeight: 1.04, color: C.lapis, alignment: 'center', margin: [8, 0, 8, 7] },
      address: { font: 'Display', italics: true, fontSize: fs(15), lineHeight: 1.18, color: C.lapis, margin: [0, 0, 0, 7 * k] },
      label: { fontSize: fs(7.25), bold: true, characterSpacing: 1.7, color: C.gold, margin: [0, 14 * k, 0, 7 * k] },
      lead: { italics: true, fontSize: fs(10.5), lineHeight: 1.4, color: C.soft, margin: [0, 0, 0, 4 * k] },
      note: { italics: true, fontSize: fs(9.5), color: C.olive },
      concludeName: { font: 'Display', bold: true, fontSize: fs(13), color: C.lapis, lineHeight: 1.1 },
      concludeFor: { fontSize: fs(10.25), lineHeight: 1.38 * lh, color: C.soft },
      wordsName: { font: 'Display', bold: true, fontSize: fs(13), color: C.lapis, margin: [0, 0, 0, 2] },
      wordsText: { fontSize: fs(10.25), lineHeight: 1.4 * lh, color: C.ink },
      saints: { italics: true, fontSize: fs(10.5), lineHeight: 1.4 * lh, color: C.soft, margin: [0, 0, 0, 2] },
      closing: { font: 'Display', italics: true, fontSize: fs(14.5), lineHeight: 1.2, color: C.lapis, alignment: 'center' },
      prayerName: { font: 'Display', bold: true, fontSize: fs(14), color: C.lapis, margin: [0, 4 * k, 0, 2 * k] },
      setTitle: { font: 'Display', fontSize: fs(19), color: C.lapis, alignment: 'center' },
      setDays: { font: 'Display', italics: true, fontSize: fs(12), color: C.olive, alignment: 'center' },
      mysteryNo: { fontSize: fs(6.75), bold: true, characterSpacing: 1.6, color: C.gold, margin: [0, 0, 0, 1] },
      mysteryName: { font: 'Display', bold: true, fontSize: fs(15), color: C.lapis, margin: [0, 0, 0, 3 * k] },
      meditation: { fontSize: fs(10.75), lineHeight: 1.4, color: C.ink, margin: [0, 0, 0, 4 * k] },
      scripture: { italics: true, fontSize: fs(10), lineHeight: 1.4, color: C.soft, margin: [12, 0, 0, 5 * k] },
      offering: { font: 'Display', italics: true, fontSize: fs(12.75), lineHeight: 1.25, color: C.lapis, margin: [0, 0, 0, 2 * k] },
      coverTitle: { font: 'Display', fontSize: 38, lineHeight: 1.05, color: C.lapis, alignment: 'center', margin: [0, 16, 0, 8] },
      coverSub: { font: 'Display', italics: true, fontSize: 14, color: C.soft, alignment: 'center' },
      tocTitle: { fontSize: 7.5, bold: true, characterSpacing: 2.4, color: C.gold, alignment: 'center', margin: [0, 0, 0, 10] },
      tocText: { font: 'Display', fontSize: 13.5, color: C.lapis },
      tocNumber: { font: 'Display', italics: true, fontSize: 13.5, color: C.gold },
    },
  };
}

/* ---------- a sensible file name ---------- */
export function fileNameFor(items) {
  const name = items.length === 1 ? (items[0].short || items[0].title) : 'Prayers';
  const safe = clean(name).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 70) || 'Prayers';
  return `Still Waters - ${safe}.pdf`;
}
