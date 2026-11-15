/* ============================================================
   STILL WATERS — app.js
   Tabs · Daily Verse · 365 Miracles · 18 Holy Sites (+quiz) · Rosary · Three Hail Marys · Talks
============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ==================== TAB NAVIGATION ==================== */
  function goTo(name) {
    $$(".panel").forEach((p) => p.classList.toggle("is-active", p.id === "panel-" + name));
    $$(".tab").forEach((t) => {
      const on = t.dataset.nav === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) { e.preventDefault(); goTo(nav.dataset.nav); }
  });
  document.addEventListener("keydown", (e) => {
    const nav = e.target.closest && e.target.closest(".home-card[data-nav]");
    if (nav && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); goTo(nav.dataset.nav); }
  });

  /* ==================== MIRACLES ==================== */
  const dayOfYear = Math.min(365, Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5));
  const today = MIRACLES.find((m) => m.day === dayOfYear) || MIRACLES[0];

  $("#today-card").innerHTML = `
    <p class="eyebrow">Today’s miracle · Day ${today.day} of 365</p>
    <h3>${esc(today.title)}</h3>
    <p class="today-era">${esc(today.era)}</p>
    <h4>What happened</h4>
    <p>${esc(today.happened)}</p>
    <h4>How it touches the heart in Christ</h4>
    <p><em>${esc(today.reflection)}</em></p>`;

  // Era chips (grouped by leading era keyword)
  const eraGroups = ["All eras", "Biblical", "Early Church", "Middle Ages", "Modern"];
  const eraOf = (era) => {
    const e = era.toLowerCase();
    if (e.includes("biblical")) return "Biblical";
    if (e.includes("early church") || e.includes("patristic")) return "Early Church";
    if (e.includes("middle") || e.includes("medieval")) return "Middle Ages";
    return "Modern";
  };
  let activeEra = "All eras", query = "", shown = 30;
  const chipsBox = $("#era-chips");
  eraGroups.forEach((g, i) => {
    const b = document.createElement("button");
    b.className = "chip" + (i === 0 ? " is-active" : "");
    b.textContent = g;
    b.onclick = () => { activeEra = g; shown = 30; $$(".chip", chipsBox).forEach((c) => c.classList.toggle("is-active", c === b)); renderMiracles(); };
    chipsBox.appendChild(b);
  });

  const filtered = () => MIRACLES.filter((m) => {
    if (activeEra !== "All eras" && eraOf(m.era) !== activeEra) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.happened.toLowerCase().includes(q) ||
           m.reflection.toLowerCase().includes(q) || m.era.toLowerCase().includes(q) ||
           String(m.day) === q.replace(/^day\s*/, "");
  });

  function renderMiracles() {
    const list = filtered();
    $("#miracle-count").textContent = list.length === 365
      ? "Showing all 365 days — open any day to read the full account."
      : `${list.length} miracle${list.length === 1 ? "" : "s"} found.`;
    $("#miracle-list").innerHTML = list.slice(0, shown).map((m) => `
      <details class="miracle-item">
        <summary>
          <span class="m-day">Day ${m.day}</span>
          <span class="m-title">${esc(m.title)}</span>
          <span class="m-era">${esc(eraOf(m.era))}</span>
        </summary>
        <div class="m-body">
          <h4>Historical era</h4><p>${esc(m.era)}</p>
          <h4>What happened</h4><p>${esc(m.happened)}</p>
          <h4>How it touches the heart in Christ</h4>
          <p class="m-reflect">${esc(m.reflection)}</p>
        </div>
      </details>`).join("");
    $("#miracle-more").style.display = shown < list.length ? "" : "none";
    $("#miracle-more").textContent = `Show more days (${Math.min(shown, list.length)} of ${list.length})`;
  }
  $("#miracle-search").addEventListener("input", (e) => { query = e.target.value.trim(); shown = 30; renderMiracles(); });
  $("#miracle-more").addEventListener("click", () => { shown += 40; renderMiracles(); });
  renderMiracles();

  /* ==================== HOLY SITES ==================== */
  const SITES = SITES_DATA.sites;
  $("#sites-intro").innerHTML =
    esc(SITES_DATA.holylandIntro).slice(0, 0) + // keep structure simple
    `If you’ve ever wanted to literally walk through the pages of the New Testament, this journey is for you. Twelve sites trace the life of Jesus across the Holy Land — from the Annunciation in Nazareth to the empty tomb in Jerusalem — and six more follow the faith to Rome, Vatican City, and Assisi. <strong>Tap any photograph to step inside.</strong>`;

  let region = "all";
  function renderSites() {
    const list = SITES.filter((s) => region === "all" || s.region === region);
    $("#site-grid").innerHTML = list.map((s) => `
      <button class="site-card" data-site="${s.num}" aria-label="Open ${esc(s.name)}">
        <img src="${s.image}" alt="${esc(s.name)}" loading="lazy">
        <span class="sc-label">
          <span class="sc-num">Site ${s.num} · ${esc(s.region)}</span><br>
          <span class="sc-name">${esc(s.name)}</span><br>
          <span class="sc-loc">${esc(s.location)}</span>
        </span>
      </button>`).join("");
  }
  $$("#region-chips .chip").forEach((c) => c.addEventListener("click", () => {
    region = c.dataset.region;
    $$("#region-chips .chip").forEach((x) => x.classList.toggle("is-active", x === c));
    renderSites();
  }));
  renderSites();

  // --- Site modal ---
  const siteModal = $("#site-modal");
  let currentSite = 0;
  function openSite(num) {
    const s = SITES.find((x) => x.num === num);
    if (!s) return;
    currentSite = num;
    $("#modal-img").src = s.image;
    $("#modal-img").alt = s.name;
    $("#modal-region").textContent = s.region;
    $("#modal-title").textContent = s.name;
    $("#modal-loc").textContent = s.location;
    $("#modal-text").innerHTML = s.body.split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join("");
    $("#modal-count").textContent = `${num} of 18`;
    siteModal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModals() {
    $$(".modal").forEach((m) => (m.hidden = true));
    if (typeof stopVideo === "function") stopVideo();       // save progress, kill the player
    const vf = $("#vm-frame"); if (vf) vf.innerHTML = "";
    document.body.style.overflow = "";
  }
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".site-card");
    if (card) openSite(+card.dataset.site);
    if (e.target.closest("[data-close]")) closeModals();
  });
  $("#modal-prev").onclick = () => openSite(currentSite === 1 ? 18 : currentSite - 1);
  $("#modal-next").onclick = () => openSite(currentSite === 18 ? 1 : currentSite + 1);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModals();
    if (!siteModal.hidden) {
      if (e.key === "ArrowRight") $("#modal-next").click();
      if (e.key === "ArrowLeft") $("#modal-prev").click();
    }
  });

  /* ==================== PILGRIM QUIZ ==================== */
  const quizModal = $("#quiz-modal");
  let qOrder = [], qIndex = 0, qScore = 0;
  const shuffleArr = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function startQuiz() {
    qOrder = shuffleArr(SITES).slice(0, 6);
    qIndex = 0; qScore = 0;
    quizModal.hidden = false;
    document.body.style.overflow = "hidden";
    renderQuestion();
  }
  function renderQuestion() {
    if (qIndex >= qOrder.length) {
      const msg = qScore === 6 ? "A true pilgrim! You know these holy places by heart."
        : qScore >= 4 ? "Well walked! Your feet know most of this road."
        : "Every pilgrimage begins with a single step — explore the sites and try again.";
      $("#quiz-body").innerHTML = `
        <p class="eyebrow">Pilgrim quiz · complete</p>
        <div class="quiz-final">
          <div class="big">${qScore} / 6</div>
          <p style="margin:.6rem 0 1.2rem">${msg}</p>
          <button class="btn btn-gold" id="quiz-again">Walk again</button>
        </div>`;
      $("#quiz-again").onclick = startQuiz;
      return;
    }
    const site = qOrder[qIndex];
    const wrong = shuffleArr(SITES.filter((s) => s.num !== site.num)).slice(0, 3);
    const opts = shuffleArr([site, ...wrong]);
    $("#quiz-body").innerHTML = `
      <p class="eyebrow">Pilgrim quiz · question ${qIndex + 1} of 6</p>
      <h3>Which holy site is this?</h3>
      <div class="quiz-img"><img src="${site.image}" alt="A holy site — can you name it?"></div>
      <div class="quiz-opts">
        ${opts.map((o) => `<button class="quiz-opt" data-num="${o.num}">${esc(o.name)} <span style="opacity:.6;font-weight:400">· ${esc(o.location)}</span></button>`).join("")}
      </div>
      <div class="quiz-foot">
        <span class="quiz-score">Score: ${qScore}</span>
        <span style="font-size:.8rem;color:#8b989e">Choose an answer to continue</span>
      </div>`;
    $$(".quiz-opt").forEach((b) => b.addEventListener("click", () => {
      const right = +b.dataset.num === site.num;
      if (right) qScore++;
      $$(".quiz-opt").forEach((x) => {
        x.disabled = true;
        if (+x.dataset.num === site.num) x.classList.add("correct");
        else if (x === b) x.classList.add("wrong");
      });
      setTimeout(() => { qIndex++; renderQuestion(); }, 1100);
    }));
  }
  $("#quiz-open").addEventListener("click", startQuiz);

  /* ==================== ROSARY GUIDE ==================== */
  let rLang = "en";
  let rSet = null;          // "Joyful" | "Sorrowful" | "Glorious"
  let rStep = 0;            // 0..20
  let rBeads = 0;           // beads tapped in current Hail Mary step

  // Default mystery set by day, per St. John Paul II's Rosarium Virginis Mariae (2002):
  // Sun Glorious · Mon Joyful · Tue Sorrowful · Wed Glorious · Thu Luminous · Fri Sorrowful · Sat Joyful
  const dow = new Date().getDay();
  const defaultSet = [ "Glorious", "Joyful", "Sorrowful", "Glorious", "Luminous", "Sorrowful", "Joyful" ][dow];

  const P = () => ROSARY.prayers[rLang];
  const paras = (t) => t.split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join("");

  // step model: maps step index 0..20 to content
  function stepInfo(i) {
    const m = ROSARY.mysteries[rSet];
    if (i === 0) return { title: "Sign of the Cross", beads: 0, html: paras(P().sign) };
    if (i === 1) return { title: "Apostles’ Creed", beads: 0, html: paras(P().creed) };
    if (i === 2) return { title: "Our Father", beads: 0, html: paras(P().ourFather) };
    if (i === 3) return { title: "Three Hail Marys", beads: 3, html: paras(P().hailMary) };
    if (i === 4) return { title: "Glory Be", beads: 0, html: paras(P().gloryBe) };
    if (i === 20) return { title: "Hail Holy Queen & Concluding Prayer", beads: 0, html: paras(P().hailHolyQueen) + paras(P().conclusion) };
    const d = Math.floor((i - 5) / 3);         // decade 0..4
    const phase = (i - 5) % 3;                  // 0 announce+OF, 1 ten HM, 2 glory+fatima
    const my = m[d];
    const ord = ["First", "Second", "Third", "Fourth", "Fifth"][d];
    if (phase === 0) return {
      title: `${ord} ${rSet} Mystery — ${my.name}`, beads: 0,
      html: `<h4>Let us reflect</h4>${paras(my.reflect)}<h4>Let us pray</h4>${paras(my.pray)}<h4>Our Father</h4>${paras(P().ourFather)}`
    };
    if (phase === 1) return { title: `Ten Hail Marys — ${my.name}`, beads: 10, html: paras(P().hailMary) };
    return {
      title: "Glory Be & Fatima Prayer", beads: 0,
      html: paras(P().gloryBe) + paras(P().fatima) + `<p><em>${esc(ROSARY.mysteryEnd)}</em></p>`
    };
  }

  function renderRosary() {
    const body = $("#rosary-body");
    if (!rSet) {
      body.innerHTML = `
        <div class="rg-start">
          <p>Today is a day the Church traditionally prays the <strong>${defaultSet} Mysteries</strong>.</p>
          <button class="btn btn-gold" id="rg-start-btn">Begin with the ${defaultSet} Mysteries</button>
          <p class="rg-hint">…or choose another set above.</p>
        </div>`;
      $("#rg-start-btn").onclick = () => selectSet(defaultSet);
      return;
    }
    const s = stepInfo(rStep);
    const beadsHTML = s.beads
      ? `<div class="rg-beads" role="group" aria-label="Prayer beads">${
          Array.from({ length: s.beads }, (_, i) =>
            `<button class="bead ${i < rBeads ? "done" : ""}" data-b="${i}" aria-label="Hail Mary ${i + 1} of ${s.beads}"></button>`).join("")
        }</div><p class="rg-bead-count">${rBeads} of ${s.beads} Hail Marys prayed — tap a bead as you pray</p>`
      : "";
    body.innerHTML = `
      <div class="rg-progress"><div class="rg-progress-fill" style="width:${((rStep + 1) / 21) * 100}%"></div></div>
      <p class="rg-stepnum">Step ${rStep + 1} of 21 · ${esc(rSet)} Mysteries</p>
      <h3 class="rg-title">${esc(s.title)}</h3>
      <div class="rg-text">${s.html}</div>
      ${beadsHTML}
      <div class="rg-nav">
        <button class="btn btn-ghost" id="rg-prev" ${rStep === 0 ? "disabled" : ""}>← Back</button>
        <button class="btn btn-gold" id="rg-next">${rStep === 20 ? "Amen — finish 🕊️" : "Next step →"}</button>
      </div>`;
    $("#rg-prev").onclick = () => { if (rStep > 0) { rStep--; rBeads = 0; renderRosary(); } };
    $("#rg-next").onclick = () => {
      if (rStep === 20) { rSet = null; rStep = 0; rBeads = 0; $$("#mystery-chips .chip").forEach((c) => c.classList.remove("is-active")); renderRosary(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      rStep++; rBeads = 0; renderRosary();
    };
    $$(".bead", body).forEach((b) => b.addEventListener("click", () => {
      rBeads = Math.min(s.beads, Math.max(rBeads, +b.dataset.b + 1));
      renderRosary();
    }));
  }
  function selectSet(name) {
    rSet = name; rStep = 0; rBeads = 0;
    $$("#mystery-chips .chip").forEach((c) => c.classList.toggle("is-active", c.dataset.mset === name));
    renderRosary();
  }
  $$("#mystery-chips .chip").forEach((c) => c.addEventListener("click", () => selectSet(c.dataset.mset)));
  $$("#lang-chips .chip").forEach((c) => c.addEventListener("click", () => {
    rLang = c.dataset.lang;
    $$("#lang-chips .chip").forEach((x) => x.classList.toggle("is-active", x === c));
    renderRosary();
  }));

  // Reference accordions
  $("#steps-list").innerHTML = ROSARY.steps.map((s) => `<li>${esc(s)}</li>`).join("");
  $("#before-prayer").innerHTML = paras(ROSARY.beforePrayer) + `<p class="promise-note">Prayer to be said at the end of each Mystery: <em>${esc(ROSARY.mysteryEnd)}</em></p>`;
  $("#promise-list").innerHTML = ROSARY.promises.map((p) => `<li>${esc(p)}</li>`).join("");
  $("#fatima-words").innerHTML = ROSARY.fatimaWords.map((w) => `<p>“${esc(w.q)}” <span class="fw-date">— ${esc(w.d)}</span></p>`).join("") + `<p>${esc(ROSARY.sisterLucia)}</p>`;
  $("#fatima-seven").innerHTML = ROSARY.fatimaPrayers7.map((p) => `<p>${esc(p)}</p>`).join("");
  $("#novena-54").innerHTML = paras(ROSARY.novena.intro) + paras(ROSARY.novena.pattern) + `<h4>Where it comes from</h4>` + paras(ROSARY.novena.story);
  renderRosary();

  /* ==================== THREE HAIL MARYS ==================== */
  $("#thm-what").textContent = THREE_HM.what;
  $("#thm-how").innerHTML = THREE_HM.how.map((h) => `<li>${esc(h)}</li>`).join("");
  $("#thm-benefits").innerHTML = THREE_HM.benefits.map((b) => `<li>${esc(b)}</li>`).join("");
  $("#thm-novena-title").textContent = THREE_HM.novenaTitle;
  $("#thm-novena-intro").textContent = THREE_HM.novenaIntro;
  $("#thm-sections").innerHTML = THREE_HM.sections.map((s) => `
    <div class="thm-section">
      <h4>${esc(s.title)}</h4>
      ${s.body.split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join("")}
      <p class="thm-closing">${esc(s.closing)}</p>
    </div>`).join("");

  let candlesLit = [false, false, false];
  const hour = new Date().getHours();
  $("#thm-done").textContent = hour < 17
    ? "“O my Mother, preserve me this day from mortal sin.” Amen. 🤍"
    : "“O my Mother, preserve me this night from mortal sin.” Amen. 🤍";
  $$("#thm-candles .candle").forEach((c) => c.addEventListener("click", () => {
    candlesLit[+c.dataset.c] = true;
    c.classList.add("lit");
    if (candlesLit.every(Boolean)) { $("#thm-done").hidden = false; $("#thm-reset").hidden = false; }
  }));
  $("#thm-reset").onclick = () => {
    candlesLit = [false, false, false];
    $$("#thm-candles .candle").forEach((c) => c.classList.remove("lit"));
    $("#thm-done").hidden = true; $("#thm-reset").hidden = true;
  };

  /* ==================== DAILY VERSE / DEVOTIONAL ==================== */
  const devDayOfYear = Math.min(365, Math.max(1, Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5)));
  let vCurrent = devDayOfYear;   // day being shown on the stage
  let vRevealed = false;
  let vShown = 30;
  let vQuery = "";
  let vFav = new Set(JSON.parse(localStorage.getItem("sw-fav-verses") || "[]"));

  const devOf = (day) => DEVOTIONAL.find((d) => d.day === day) || DEVOTIONAL[0];
  function saveFav() { localStorage.setItem("sw-fav-verses", JSON.stringify([...vFav])); }

  function renderStage() {
    const d = devOf(vCurrent);
    const isToday = d.day === devDayOfYear;
    const faved = vFav.has(d.day);
    $("#verse-stage").innerHTML = `
      <div class="vs-card ${vRevealed ? "revealed" : ""}">
        <div class="vs-top">
          <span class="vs-daytag">${isToday ? "Today · " : ""}Day ${d.day} of 365</span>
          <button class="vs-fav ${faved ? "faved" : ""}" id="vs-fav" aria-label="Save this verse" title="Save this verse">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.9-10-9.3C.4 8.4 2.4 4.5 6.2 4.5c2.2 0 3.7 1.2 4.6 2.6.2.4.9.4 1.1 0 .9-1.4 2.5-2.6 4.7-2.6 3.8 0 5.8 3.9 4.2 7.2C19.5 16.1 12 21 12 21z"/></svg>
          </button>
        </div>
        <p class="vs-theme">${esc(d.theme)}</p>
        <p class="vs-verse">“${esc(d.verse)}”</p>
        <p class="vs-ref">${esc(d.ref)}</p>
        <div class="vs-reflect-wrap">
          ${vRevealed
            ? `<h4>Reflection</h4><p class="vs-reflection">${esc(d.reflection)}</p>`
            : `<button class="btn btn-gold vs-reveal" id="vs-reveal">Reveal the reflection</button>
               <p class="vs-pause">…first, sit with the verse for a moment.</p>`}
        </div>
      </div>`;
    if (!vRevealed) $("#vs-reveal").onclick = () => { vRevealed = true; renderStage(); };
    $("#vs-fav").onclick = () => {
      faved ? vFav.delete(d.day) : vFav.add(d.day);
      saveFav(); renderStage(); renderBrowse();
    };
  }
  function goDay(day, { reveal = false } = {}) {
    vCurrent = ((day - 1 + 365) % 365) + 1;   // wrap 1..365
    vRevealed = reveal;
    renderStage();
    document.getElementById("panel-devotional").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $("#verse-prev").onclick = () => goDay(vCurrent - 1);
  $("#verse-next").onclick = () => goDay(vCurrent + 1);
  $("#verse-today").onclick = () => goDay(devDayOfYear);
  $("#verse-random").onclick = () => goDay(Math.floor(Math.random() * 365) + 1);

  // Browse / search list
  const devFiltered = () => DEVOTIONAL.filter((d) => {
    if (!vQuery) return true;
    const q = vQuery.toLowerCase();
    return d.ref.toLowerCase().includes(q) || d.verse.toLowerCase().includes(q) ||
           d.reflection.toLowerCase().includes(q) || d.theme.toLowerCase().includes(q) ||
           String(d.day) === q.replace(/^day\s*/, "");
  });
  function renderBrowse() {
    const list = devFiltered();
    $("#verse-count").textContent = list.length === 365
      ? "Browsing all 365 days — tap any to open it above."
      : `${list.length} verse${list.length === 1 ? "" : "s"} found.`;
    $("#verse-browse").innerHTML = list.slice(0, vShown).map((d) => `
      <button class="verse-chip ${vFav.has(d.day) ? "faved" : ""}" data-day="${d.day}">
        <span class="vch-day">Day ${d.day}</span>
        <span class="vch-ref">${esc(d.ref)}</span>
        <span class="vch-verse">${esc(d.verse.length > 90 ? d.verse.slice(0, 90) + "…" : d.verse)}</span>
        ${vFav.has(d.day) ? '<span class="vch-heart">❤</span>' : ""}
      </button>`).join("");
    $("#verse-more").style.display = vShown < list.length ? "" : "none";
    $("#verse-more").textContent = `Show more (${Math.min(vShown, list.length)} of ${list.length})`;
  }
  $("#verse-browse").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-day]");
    if (chip) goDay(+chip.dataset.day);
  });
  $("#verse-search").addEventListener("input", (e) => { vQuery = e.target.value.trim(); vShown = 30; renderBrowse(); });
  $("#verse-more").onclick = () => { vShown += 40; renderBrowse(); };
  $("#verse-showfav").onclick = () => {
    const favs = [...vFav].sort((a, b) => a - b);
    if (!favs.length) {
      $("#verse-browse").innerHTML = `<p class="verse-empty">No saved verses yet — tap the ♡ on any verse to keep it here.</p>`;
      $("#verse-count").textContent = ""; $("#verse-more").style.display = "none";
      return;
    }
    vQuery = ""; $("#verse-search").value = "";
    $("#verse-count").textContent = `${favs.length} saved verse${favs.length === 1 ? "" : "s"}.`;
    $("#verse-browse").innerHTML = favs.map((day) => { const d = devOf(day); return `
      <button class="verse-chip faved" data-day="${d.day}">
        <span class="vch-day">Day ${d.day}</span>
        <span class="vch-ref">${esc(d.ref)}</span>
        <span class="vch-verse">${esc(d.verse.length > 90 ? d.verse.slice(0, 90) + "…" : d.verse)}</span>
        <span class="vch-heart">❤</span>
      </button>`; }).join("");
    $("#verse-more").style.display = "none";
  };
  renderStage();
  renderBrowse();

  /* ==================== TALKS / VIDEOS ==================== */
  /* Watch state + symbol tags, kept in this browser only (localStorage).
     Progress is read from the YouTube player when it will load; when it is
     blocked, time spent in the player is used instead — so the shelf still
     knows what you have started and finished either way.                    */

  const MARKS = [
    { id: "keep",  glyph: "✦", label: "Keep" },
    { id: "loved", glyph: "❤", label: "Loved it" },
    { id: "again", glyph: "↻", label: "Watch again" },
    { id: "act",   glyph: "✎", label: "Act on it" },
    { id: "share", glyph: "⚑", label: "Share it" }
  ];
  const markOf = (id) => MARKS.find((m) => m.id === id);

  let vCat = "christian";
  let vFilter = "all";
  const THUMB = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  let talks = {};
  try { talks = JSON.parse(localStorage.getItem("sw-talks") || "{}"); } catch (e) { talks = {}; }
  const saveTalks = () => { try { localStorage.setItem("sw-talks", JSON.stringify(talks)); } catch (e) {} };
  const recOf = (id) => talks[id] || (talks[id] = { pct: 0, secs: 0, manual: null, marks: [] });

  // "new" · "partial" · "watched"
  function statusOf(id) {
    const r = talks[id];
    if (!r) return "new";
    if (r.manual === "watched") return "watched";
    if (r.manual === "unwatched") return "new";
    if (r.pct >= 90) return "watched";
    if (r.pct >= 3 || r.secs >= 45) return "partial";
    return "new";
  }
  const STATUS_TEXT = { new: "Not started", partial: "Still watching", watched: "Watched" };
  function pctOf(id) {
    const r = talks[id];
    if (!r) return 0;
    if (statusOf(id) === "watched") return 100;
    if (r.pct) return Math.min(99, Math.round(r.pct));
    if (r.secs) return Math.min(60, Math.round(r.secs / 12));  // rough, time-in-player only
    return 0;
  }

  /* ---------- the shelf ---------- */
  function renderVideos() {
    const all = VIDEOS[vCat] || [];
    const list = all.filter((v) => {
      if (vFilter === "all") return true;
      if (vFilter === "marked") return (talks[v.id]?.marks || []).length > 0;
      return statusOf(v.id) === vFilter;
    });

    const watched = all.filter((v) => statusOf(v.id) === "watched").length;
    const started = all.filter((v) => statusOf(v.id) === "partial").length;
    $("#shelf-bar-fill").style.width = all.length ? (watched / all.length) * 100 + "%" : "0%";
    $("#shelf-count").textContent =
      `${watched} of ${all.length} watched` + (started ? ` · ${started} still in progress` : "");

    $("#video-grid").innerHTML = list.length ? list.map((v) => {
      const st = statusOf(v.id), pct = pctOf(v.id), marks = talks[v.id]?.marks || [];
      return `
      <article class="video-card is-${st}" data-id="${v.id}">
        <button class="vc-open" data-id="${v.id}" aria-label="Play ${esc(v.title)}">
          <span class="vc-thumb">
            <img src="${THUMB(v.id)}" alt="" loading="lazy"
                 onerror="this.style.display='none';this.parentElement.classList.add('no-thumb')">
            <span class="vc-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l12-7z"/></svg></span>
            <span class="vc-status" title="${STATUS_TEXT[st]}">${
              st === "watched" ? "✓ Watched" : st === "partial" ? "◍ Still watching" : "○ Not started"}</span>
            ${pct > 0 ? `<span class="vc-progress"><span style="width:${pct}%"></span></span>` : ""}
          </span>
          <span class="vc-meta">
            <span class="vc-title">${esc(v.title)}</span>
            ${v.speaker ? `<span class="vc-speaker">${esc(v.speaker)}</span>` : ""}
            ${v.note ? `<span class="vc-note">${esc(v.note)}</span>` : ""}
          </span>
        </button>
        <div class="vc-foot">
          <span class="vc-marks">${marks.map((m) => {
            const mk = markOf(m); return mk ? `<span class="vc-mark" title="${mk.label}">${mk.glyph}</span>` : ""; }).join("")}</span>
          <button class="vc-tag" data-tag="${v.id}" aria-label="Tag ${esc(v.title)}" title="Tag this talk">✦<span>Tag</span></button>
        </div>
      </article>`; }).join("")
      : `<p class="verse-empty">Nothing on this shelf matches that filter yet.</p>`;
  }

  $$("#vt-chips .chip").forEach((c) => c.addEventListener("click", () => {
    vCat = c.dataset.vcat;
    $$("#vt-chips .chip").forEach((x) => x.classList.toggle("is-active", x === c));
    closeMarkPop(); renderVideos();
  }));
  $$("#status-chips .chip").forEach((c) => c.addEventListener("click", () => {
    vFilter = c.dataset.vfilter;
    $$("#status-chips .chip").forEach((x) => x.classList.toggle("is-active", x === c));
    closeMarkPop(); renderVideos();
  }));

  /* ---------- symbol tags ---------- */
  const markPop = $("#mark-pop");
  let popFor = null;

  function drawMarkRow(container, id) {
    const marks = talks[id]?.marks || [];
    container.innerHTML = MARKS.map((m) => `
      <button class="mark-btn ${marks.includes(m.id) ? "on" : ""}" data-mark="${m.id}" data-for="${id}"
              aria-pressed="${marks.includes(m.id)}" title="${m.label}">
        <span class="mk-glyph">${m.glyph}</span><span class="mk-label">${m.label}</span>
      </button>`).join("");
  }
  function toggleMark(id, markId) {
    const r = recOf(id);
    r.marks = r.marks.includes(markId) ? r.marks.filter((x) => x !== markId) : [...r.marks, markId];
    saveTalks();
    if (popFor === id) drawMarkRow($("#mark-pop-row"), id);
    if (openId === id) drawMarkRow($("#vm-mark-row"), id);
    renderVideos();
  }
  function openMarkPop(id, anchor) {
    popFor = id;
    drawMarkRow($("#mark-pop-row"), id);
    markPop.hidden = false;
    const r = anchor.getBoundingClientRect();
    const w = 250;
    let left = r.right - w + window.scrollX;
    left = Math.max(12 + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - w - 12));
    markPop.style.left = left + "px";
    markPop.style.top = r.bottom + window.scrollY + 8 + "px";
  }
  function closeMarkPop() { markPop.hidden = true; popFor = null; }
  $("#mark-pop-close").onclick = closeMarkPop;
  markPop.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mark]");
    if (b) toggleMark(b.dataset.for, b.dataset.mark);
  });
  document.addEventListener("click", (e) => {
    if (!markPop.hidden && !e.target.closest("#mark-pop") && !e.target.closest("[data-tag]")) closeMarkPop();
  });
  window.addEventListener("resize", closeMarkPop);

  /* ---------- the player ---------- */
  const videoModal = $("#video-modal");
  let openId = null, ytPlayer = null, poll = null, sessionSecs = 0;
  let ytApi = null;   // null = untried, true/false once known

  function loadYT(cb) {
    if (ytApi === false) return cb(false);
    if (window.YT && window.YT.Player) return cb(true);
    const done = (ok) => { ytApi = ok; cb(ok); };
    const t = setTimeout(() => done(false), 3500);          // blocked or slow → fall back
    window.onYouTubeIframeAPIReady = () => { clearTimeout(t); done(true); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => { clearTimeout(t); done(false); };
    document.head.appendChild(s);
  }

  function paintTrack() {
    if (!openId) return;
    const st = statusOf(openId), pct = pctOf(openId);
    $("#vm-status").innerHTML =
      `<span class="vm-dot is-${st}"></span>${STATUS_TEXT[st]}${pct > 0 && st !== "watched" ? ` · about ${pct}%` : ""}`;
    $("#vm-bar-fill").style.width = pct + "%";
    $("#vm-mark-watched").textContent = st === "watched" ? "✓ Watched" : "Mark watched";
    $("#vm-mark-watched").disabled = st === "watched";
    $("#vm-mark-unwatched").style.display = st === "new" ? "none" : "";
  }
  function bump(pct, secs) {
    if (!openId) return;
    const r = recOf(openId);
    if (pct != null && pct > r.pct) r.pct = pct;
    if (secs != null) r.secs = Math.max(r.secs, secs);
    if (r.manual === "unwatched" && (r.pct >= 3 || r.secs >= 45)) r.manual = null;
    saveTalks(); paintTrack();
  }

  function openVideo(v) {
    openId = v.id;
    sessionSecs = 0;
    recOf(v.id);
    $("#vm-title").textContent = v.title;
    $("#vm-speaker").textContent = [v.speaker, v.note].filter(Boolean).join(" · ");
    $("#vm-link").href = `https://www.youtube-nocookie.com/embed/${v.id}`;
    drawMarkRow($("#vm-mark-row"), v.id);
    paintTrack();
    videoModal.hidden = false;
    document.body.style.overflow = "hidden";

    $("#vm-frame").innerHTML = `<div id="yt-host"></div>`;
    loadYT((ok) => {
      if (openId !== v.id) return;                 // user already moved on
      if (ok) {
        ytPlayer = new YT.Player("yt-host", {
          videoId: v.id,
          host: "https://www.youtube-nocookie.com",
          playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: (e) => e.target.playVideo(),
            onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) bump(100, null); }
          }
        });
        poll = setInterval(() => {
          try {
            const d = ytPlayer.getDuration?.(), t = ytPlayer.getCurrentTime?.();
            if (d > 0 && t >= 0) bump((t / d) * 100, null);
          } catch (err) {}
        }, 4000);
      } else {
        // API blocked — plain embed, and count time spent watching instead
        $("#vm-frame").innerHTML = `<iframe
          src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1"
          title="${esc(v.title)}" frameborder="0" allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
        poll = setInterval(() => { sessionSecs += 5; bump(null, (talks[v.id]?.secs || 0) + 5); }, 5000);
      }
    });
  }

  function stopVideo() {
    if (poll) { clearInterval(poll); poll = null; }
    if (ytPlayer) { try { ytPlayer.destroy(); } catch (e) {} ytPlayer = null; }
    openId = null;
    renderVideos();
  }

  $("#vm-mark-watched").onclick = () => { const r = recOf(openId); r.manual = "watched"; r.pct = 100; saveTalks(); paintTrack(); renderVideos(); };
  $("#vm-mark-unwatched").onclick = () => { const r = recOf(openId); r.manual = "unwatched"; r.pct = 0; r.secs = 0; saveTalks(); paintTrack(); renderVideos(); };
  $("#vm-mark-row").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mark]");
    if (b) toggleMark(b.dataset.for, b.dataset.mark);
  });

  $("#video-grid").addEventListener("click", (e) => {
    const tag = e.target.closest("[data-tag]");
    if (tag) {
      if (popFor === tag.dataset.tag) { closeMarkPop(); return; }
      openMarkPop(tag.dataset.tag, tag);
      return;
    }
    const open = e.target.closest(".vc-open");
    if (open) {
      const v = (VIDEOS[vCat] || []).find((x) => x.id === open.dataset.id);
      if (v) openVideo(v);
    }
  });

  renderVideos();
})();

