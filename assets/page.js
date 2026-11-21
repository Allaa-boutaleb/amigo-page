// AMIGO project page: draws and animates the figures of index.html. Numbers of the charts: assets/data.js.
(() => {
  "use strict";
  const D = window.AMIGO_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const add = (node, html) => node.insertAdjacentHTML("beforeend", html);
  const fmt = (v, d = 1) => Number(v).toFixed(d);
  const tip = $("#tip");
  function showTip(e, html) {
    tip.innerHTML = html; tip.style.opacity = 1;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + w > innerWidth - 8) x = e.clientX - w - 14;
    if (y + h > innerHeight - 8) y = e.clientY - h - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  const hideTip = () => { tip.style.opacity = 0; };

  // run fn once when the element comes into view (at once with reduced motion)
  function whenSeen(node, fn, threshold = 0.3) {
    if (!node) return;
    if (still || !("IntersectionObserver" in window)) { fn(); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); fn(); } }), { threshold });
    io.observe(node);
  }

  const reflow = (n) => n.getBoundingClientRect();
  const twoFrames = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  // ------------------------------------------------------------------ theme, bar
  $("#theme").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme === "dark";
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("amigo-theme", root.dataset.theme); } catch (e) {}
  });
  const bar = $("#bar");
  const links = $$(".bar nav a");
  addEventListener("scroll", () => {
    bar.classList.toggle("scrolled", scrollY > 260);
    let here = null;
    for (const a of links) { const s = $(a.getAttribute("href")); if (s && s.getBoundingClientRect().top < 140) here = a; }
    links.forEach((a) => a.classList.toggle("here", a === here));
  }, { passive: true });

  // count-up numbers
  $$("[data-count]").forEach((n) => {
    const end = parseFloat(n.dataset.count), dec = parseInt(n.dataset.dec || "0", 10);
    if (still) return;
    whenSeen(n, () => {
      const t0 = performance.now(), dur = 1300;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        n.textContent = fmt(end * e, dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 0.6);
  });

  // ------------------------------------------------------------------ header art: one question, branching interpretations
  (function heroArt() {
    const g = $("#heroTree");
    const root = [300, 40], mid = [[170, 150], [430, 150]];
    const low = [[90, 250], [190, 250], [290, 250], [410, 250], [500, 250]];
    const leaves = [[60, 340], [130, 340], [200, 340], [270, 340], [340, 340], [420, 340], [490, 340], [540, 340]];
    const pairs = [[root, mid[0]], [root, mid[1]], [mid[0], low[0]], [mid[0], low[1]], [mid[0], low[2]], [mid[1], low[3]], [mid[1], low[4]],
      [low[0], leaves[0]], [low[0], leaves[1]], [low[1], leaves[2]], [low[2], leaves[3]], [low[2], leaves[4]], [low[3], leaves[5]], [low[4], leaves[6]], [low[4], leaves[7]]];
    const c = (a, b) => `M${a[0]} ${a[1]} C${a[0]} ${(a[1] + b[1]) / 2} ${b[0]} ${(a[1] + b[1]) / 2} ${b[0]} ${b[1]}`;
    let html = pairs.map(([a, b]) => `<path class="e" d="${c(a, b)}"/>`).join("");
    html += pairs.map(([a, b], i) => `<path class="p" d="${c(a, b)}" style="animation-delay:${(i * 0.37) % 4.8}s"/>`).join("");
    html += [root, ...mid, ...low].map(([x, y]) => `<circle class="n" cx="${x}" cy="${y}" r="9"/>`).join("");
    html += leaves.map(([x, y]) => `<rect class="l" x="${x - 9}" y="${y - 7}" width="18" height="14" rx="3"/>`).join("");
    add(g, html);
  })();

  // ------------------------------------------------------------------ typed question
  (function typed() {
    const b = $("#typed");
    if (still) return;
    const parts = [["How many ", false], ["Riverside", true], [" bike trips were made in 2025?", false]];
    whenSeen(b, () => {
      b.innerHTML = '<span class="caret"></span>';
      let i = 0, j = 0, html = "";
      const tick = () => {
        if (i >= parts.length) { b.innerHTML = html + '<span class="caret"></span>'; return; }
        const [s, amb] = parts[i];
        j++;
        const cur = s.slice(0, j);
        b.innerHTML = html + (amb ? `<span class="amb">${cur}</span>` : cur) + '<span class="caret"></span>';
        if (j >= s.length) { html += amb ? `<span class="amb">${s}</span>` : s; i++; j = 0; }
        setTimeout(tick, 38);
      };
      setTimeout(tick, 300);
    }, 0.6);
  })();

  // ------------------------------------------------------------------ 01 interpretations
  (function interp() {
    const svg = $("#interpSvg");
    const L = [
      { x: 90, tabs: ["survey"], n: "1,240", what: "trips that residents of the district report in the survey", s: ["trips residents", "report"] },
      { x: 240, tabs: ["trip", "rider"], n: "3,105", what: "trips by riders who live in the district", s: ["trips by riders", "living there"] },
      { x: 375, tabs: ["trip", "station"], n: "4,812", what: "trips that start in the district", s: ["trips starting", "in the district"] },
      { x: 510, tabs: ["trip", "station"], n: "4,530", what: "trips that end in the district", s: ["trips ending", "in the district"] },
      { x: 650, tabs: ["trip", "station"], n: "960", what: "trips that start at the Riverside station", s: ["trips starting", "at the station"] },
      { x: 790, tabs: ["trip", "station"], n: "1,015", what: "trips that end at the Riverside station", s: ["trips ending", "at the station"] },
    ];
    const g = $("#leaves");
    L.forEach((l, i) => {
      const k = l.tabs.length, w = k === 1 ? 92 : 122;
      let icons = l.tabs.map((t, j) => {
        const cx = l.x + (k === 1 ? 0 : (j ? 25 : -25));
        return `<use href="#i-tbl" x="${cx - 15}" y="391" width="30" height="22"/><text x="${cx}" y="432" text-anchor="middle" class="lab">${t}</text>`;
      }).join("");
      add(g, `<g class="leaf" data-i="${i + 1}" tabindex="0" role="button" aria-label="${l.what}: ${l.n}">
        <ellipse cx="${l.x}" cy="414" rx="${w / 2}" ry="34"/>${icons}
        <path class="edge" d="M${l.x} 448v14" marker-end="url(#ah)"/>
        <rect x="${l.x - 21}" y="464" width="42" height="22" rx="5" fill="none" stroke="var(--line)" stroke-width="1.4"/>
        <text x="${l.x}" y="479" text-anchor="middle" class="mono muted" style="font-size:11.5px">SQL</text>
        <path class="edge" d="M${l.x} 486v10" marker-end="url(#ah)"/>
        <g class="ans"><rect x="${l.x - 36}" y="498" width="72" height="28" rx="14"/><text x="${l.x}" y="517" text-anchor="middle">${l.n}</text></g>
        <text x="${l.x}" y="548" text-anchor="middle" class="small muted">${l.s[0]}</text>
        <text x="${l.x}" y="563" text-anchor="middle" class="small muted">${l.s[1]}</text>
      </g>`);
    });
    const out = $("#interpOut");
    let cur = 0, timer = null;
    function pick(i) {
      cur = i;
      svg.classList.toggle("picking", i > 0);
      $$("[data-l]", svg).forEach((n) => n.classList.toggle("on", i > 0 && n.dataset.l.split(" ").includes(String(i))));
      $$(".leaf", svg).forEach((n) => n.classList.toggle("on", +n.dataset.i === i));
      const tabs = i ? L[i - 1].tabs : [];
      $$(".lake-t", svg).forEach((n) => n.classList.toggle("on", tabs.includes(n.dataset.t)));
      out.innerHTML = i
        ? `<span class="n">${L[i - 1].n}</span><span class="what"><b>Interpretation ${i} of 6:</b> ${L[i - 1].what}.</span><span class="tabs">tables: ${tabs.join(" + ")}</span>`
        : `<span class="what sub">Six interpretations, three different table sets, six different answers.</span>`;
    }
    function auto() { timer = setInterval(() => pick(cur % 6 + 1), 2600); }
    function stop() { clearInterval(timer); timer = null; }
    $$(".leaf", svg).forEach((n) => {
      const i = +n.dataset.i;
      n.addEventListener("mouseenter", () => { stop(); pick(i); });
      n.addEventListener("click", () => { stop(); pick(i); });
      n.addEventListener("focus", () => { stop(); pick(i); });
      n.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stop(); pick(i); } });
    });
    pick(0);
    if (!still) whenSeen(svg, () => { pick(1); auto(); }, 0.5);
  })();

  // ------------------------------------------------------------------ 02 where
  (function where() {
    const g = $("#whereRows");
    const lanes = [
      ["At retrieval", "AMIGO", 6, 6, true],
      ["At SQL writing", "Ambiguous text-to-SQL: ODIN, Sphinteract, AmbiSQL, PleaSQLarify", 4, 4, false],
      ["Nowhere", "Table retrievers: MURRE, JAR, CORE-T, ARM, CRUSH4SQL", 4, 1, false],
    ];
    let html = [["in the lake", 75], ["after retrieval", 255], ["after SQL", 435]]
      .map(([t, x]) => `<text x="${x}" y="22" text-anchor="middle" class="lab muted">${t}</text>`).join("");
    const dots = (x0, y, n, cls) => Array.from({ length: 6 }, (_, i) => {
      const x = x0 + i * 22;
      return i < n ? `<circle class="dot ${cls}" style="--i:${i}" cx="${x}" cy="${y}" r="8"/>`
        : `<g class="gone ${cls}" style="--i:${i}"><circle cx="${x}" cy="${y}" r="7"/><path d="M${x - 4} ${y - 4}l8 8M${x - 4} ${y + 4}l8-8"/></g>`;
    }).join("");
    lanes.forEach(([where, who, a, b, amigo], k) => {
      const y = 36 + k * 126, col = amigo ? "var(--red)" : "var(--ink)";
      html += `<rect class="lane ${amigo ? "amigo" : ""}" x="1" y="${y}" width="658" height="112" rx="14"/>
        <text x="18" y="${y + 30}" class="big" style="fill:${col};font-size:17px">${where}</text>
        <text x="18" y="${y + 50}" class="small muted">${who}</text>
        ${dots(20, y + 82, 6, "d1")}
        <path class="flow" d="M150 ${y + 82}h34" stroke="${amigo ? "var(--red)" : "var(--faint)"}"/>
        ${dots(200, y + 82, a, "d2")}
        <path class="flow" d="M330 ${y + 82}h34" stroke="${amigo ? "var(--red)" : "var(--faint)"}"/>
        ${dots(380, y + 82, b, "d3")}
        <text class="kept k" x="600" y="${y + 92}" text-anchor="middle" style="fill:${col}">${b}</text>
        <text class="k small muted" x="600" y="${y + 106}" text-anchor="middle">left</text>`;
    });
    add(g, html);
    const svg = $("#whereSvg");
    if (!still) whenSeen(svg, () => { svg.classList.add("arm"); reflow(svg); twoFrames(() => svg.classList.add("in")); }, 0.4);
  })();

  // ------------------------------------------------------------------ steppers (03 and 05)
  function stepper({ fig, n, say, texts, play, prev, next, stepsBox, labels, onStep, dwell = 4200 }) {
    let cur = n, timer = null, playing = false;  // complete at rest: the last step shows everything
    stepsBox.innerHTML = labels.map((t, i) => `<button type="button" data-k="${i + 1}"><b>${i + 1}</b>${t}<span class="prog"></span></button>`).join("");
    const btns = $$("button", stepsBox);
    function set(k) {
      cur = Math.max(1, Math.min(n, k));
      const last = cur === n;
      $$("[data-s]", fig).forEach((e) => {
        const s = +e.dataset.s;
        e.classList.toggle("later", s > cur);
        e.classList.toggle("past", !last && s < cur && !e.hasAttribute("data-keep"));
      });
      $$(".hdr", fig).forEach((h) => h.classList.toggle("cur", +h.dataset.h === cur));
      $$(".off", fig).forEach((o) => o.classList.toggle("cur", o.dataset.o.split(" ").includes(String(cur))));
      btns.forEach((b, i) => { b.classList.toggle("on", i + 1 === cur); b.classList.toggle("done", i + 1 < cur); });
      const t = texts[cur - 1];
      say.innerHTML = `<h3>${cur}. ${t[0]}</h3><p>${t[1]}</p>`;
      onStep && onStep(cur);
      const box = fig.classList.contains("scroll") ? fig : null, head = $(`.hdr[data-h="${cur}"]`, fig);
      if (box && head && box.scrollWidth > box.clientWidth + 4 && fig.classList.contains("anim")) {
        const r = head.getBoundingClientRect(), b = box.getBoundingClientRect();
        box.scrollTo({ left: box.scrollLeft + r.left - b.left - 24, behavior: still ? "auto" : "smooth" });
      }
    }
    function bar(k) {
      btns.forEach((b, i) => { const p = $(".prog", b); p.style.transition = "none"; p.style.width = "0"; });
      if (!playing || k > n) return;
      const p = $(".prog", btns[k - 1]);
      requestAnimationFrame(() => requestAnimationFrame(() => { p.style.transition = `width ${dwell}ms linear`; p.style.width = "100%"; }));
    }
    function label() {
      const atEnd = cur === n && !playing;
      play.innerHTML = `<svg><use href="#i-${playing ? "pause" : atEnd ? "redo" : "play"}"/></svg><span>${playing ? "Pause" : atEnd ? "Replay" : "Play"}</span>`;
    }
    function go() {
      playing = true; clearTimeout(timer); bar(cur); label();
      timer = setTimeout(function tick() {
        if (cur >= n) { playing = false; label(); bar(0); return; }
        set(cur + 1); bar(cur);
        timer = setTimeout(tick, cur === n ? dwell * 0.6 : dwell);
      }, dwell);
    }
    function halt() { playing = false; clearTimeout(timer); bar(0); label(); }
    play.addEventListener("click", () => { if (playing) halt(); else { if (cur === n) set(1); go(); } });
    prev.addEventListener("click", () => { halt(); set(cur - 1); });
    next.addEventListener("click", () => { halt(); set(cur + 1); });
    btns.forEach((b) => b.addEventListener("click", () => { halt(); set(+b.dataset.k); }));
    set(cur); label();
    if (!still) whenSeen(fig, () => { fig.classList.add("anim"); set(1); go(); }, 0.45);
  }

  const hdr = (k, x, t, w) => `<g class="hdr" data-h="${k}"><rect x="${x - 8}" y="76" width="${w}" height="30" rx="8"/>
    <text class="n" x="${x}" y="96">${k}</text><text class="t" x="${x + 16}" y="96">${t}</text></g>`;
  const mark = (x, y, ok) => `<g class="${ok ? "yes" : "no"}"><rect x="${x}" y="${y - 11}" width="22" height="22" rx="5" stroke-width="1.3"/>
    <text x="${x + 11}" y="${y + 5}" text-anchor="middle" font-size="13">${ok ? "✓" : "×"}</text></g>`;
  const llm = (x, y, s = 1, label = "LLM") => `<g transform="translate(${x} ${y}) scale(${s})">
    ${[-8, 0, 8].map((t) => `<path d="M${t} -17v-5M${t} 17v5M-17 ${t}h-5M17 ${t}h5" stroke="var(--ink)" stroke-width="2"/>`).join("")}
    <rect x="-17" y="-17" width="34" height="34" rx="5" fill="var(--ink)"/><rect x="-13" y="-13" width="26" height="26" rx="3" fill="none" stroke="var(--card)" stroke-width="1"/>
    <text x="0" y="4" text-anchor="middle" font-size="9.5" font-weight="700" style="fill:var(--card)">${label}</text></g>`;

  // ------------------------------------------------------------------ 03 pipeline
  (function pipeline() {
    const g = $("#pipeDraw");
    const places = [
      [1, "trip.id", "1.00", 1], [1, "survey.weekly_trips", "1.58", 1], [1, "rider.id", "2.00", 0],
      [2, "station.district", "1.00", 1], [2, "station.name", "1.58", 1], [2, "survey.district", "2.00", 1],
      [2, "rider.home_district", "2.32", 1], [2, "trip.start_station", "2.85", 0],
      [3, "trip.started_at", "1.00", 1], [3, "survey.year", "1.58", 1]];
    const ys = [132, 164, 196, 244, 276, 308, 340, 372, 420, 452];
    let h = "";
    // question
    h += `<rect x="0" y="6" width="600" height="46" rx="23" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>
      <text x="22" y="36" font-size="19">How many <tspan fill="var(--red)" font-weight="600">Riverside</tspan> <tspan fill="var(--red)" font-weight="600">bike trips</tspan> were made in <tspan fill="var(--red)" font-weight="600">2025</tspan>?</text>`;
    h += hdr(1, 4, "split", 84) + hdr(2, 173, "places", 98) + hdr(3, 393, "judge", 82) + hdr(4, 478, "search", 96)
      + hdr(5, 713, "join judge", 122) + hdr(6, 870, "candidates", 128) + hdr(7, 1100, "search tree", 132);
    // 1: parts
    h += `<g data-s="1" data-keep>
      <rect class="box" x="0" y="144" width="140" height="40" rx="10"/><text x="70" y="169" text-anchor="middle" font-size="15">bike trip</text>
      <rect class="box" x="0" y="284" width="140" height="48" rx="10"/><text x="70" y="304" text-anchor="middle" font-size="14.5">place of the trip</text><text x="70" y="323" text-anchor="middle" font-size="14" font-weight="700" style="fill:var(--lake)">= Riverside</text>
      <rect class="box" x="0" y="412" width="140" height="48" rx="10"/><text x="70" y="432" text-anchor="middle" font-size="14.5">date of the trip</text><text x="70" y="451" text-anchor="middle" font-size="14" font-weight="700" style="fill:var(--lake)">= 2025</text>
    </g>`;
    // 2: places with their costs
    h += `<g data-s="2" data-keep><text x="372" y="122" text-anchor="middle" class="small muted">cost</text>`;
    [[164, 132, 196], [308, 244, 372], [436, 420, 452]].forEach(([c, a, b]) => {
      h += `<path class="edge" d="M140 ${c}h12M152 ${a}V${b}M152 ${a}h10M152 ${b}h10"/>`;
      ys.filter((y) => y > a && y < b).forEach((y) => { h += `<path class="edge" d="M152 ${y}h10"/>`; });
    });
    places.forEach(([, col, cost, ok], i) => {
      h += `<g class="prow" data-ok="${ok}"><rect class="chip" x="165" y="${ys[i] - 13}" width="180" height="26" rx="6"/>
        <text x="175" y="${ys[i] + 4.5}" class="mono">${col}</text>
        <text x="372" y="${ys[i] + 5}" text-anchor="middle" font-size="13" font-weight="600" style="fill:${i === 7 ? "var(--red-ink)" : "var(--ink)"}">${cost}</text></g>`;
    });
    h += `</g>`;
    // 3: the place judge
    h += `<g data-s="3" data-keep>${places.map(([, , , ok], i) => mark(398, ys[i], ok)).join("")}</g>`;
    // 4: search over the link graph
    h += `<g data-s="4" data-keep>
      <rect class="box" x="470" y="118" width="222" height="236" rx="14"/>
      <text x="484" y="140" class="small muted" font-weight="700" letter-spacing=".08em">BIKESHARE</text>
      <path class="gedge hot" id="eStart" d="M540 224 C566 172 586 166 604 168"/>
      <path class="gedge" d="M540 238 C580 226 594 196 610 180"/>
      <path class="gedge" d="M540 240 C578 278 590 298 604 302"/>
      <text x="548" y="180" class="small" style="fill:var(--red-ink)">start</text>
      <text x="583" y="225" class="small muted">end</text>
      <g class="tnode"><rect x="484" y="218" width="58" height="28" rx="6"/><text x="513" y="237" text-anchor="middle">trip</text></g>
      <g class="tnode"><rect x="604" y="154" width="74" height="28" rx="6"/><text x="641" y="173" text-anchor="middle">station</text></g>
      <g class="tnode"><rect x="604" y="288" width="64" height="28" rx="6"/><text x="636" y="307" text-anchor="middle">rider</text></g>
      <rect x="470" y="370" width="222" height="96" rx="14" fill="none" stroke="var(--line)" stroke-width="1.4" stroke-dasharray="5 4"/>
      <text x="484" y="392" class="small muted" font-weight="700" letter-spacing=".08em">MOBILITY</text>
      <g class="tnode"><rect x="596" y="414" width="74" height="28" rx="6"/><text x="633" y="433" text-anchor="middle">survey</text></g>
      ${still ? "" : `<circle class="pulse" r="5"><animateMotion dur="1.8s" repeatCount="indefinite" path="M540 224 C566 172 586 166 604 168"/></circle>`}
    </g>`;
    // 5: the join judge
    h += `<g data-s="5" data-keep>
      <rect class="box" x="706" y="234" width="140" height="104" rx="12"/>
      <text x="720" y="260" font-weight="700" font-size="14">trip → station</text>
      <text x="720" y="292" font-size="14">on start</text><text x="720" y="322" font-size="14">on end</text>
      ${mark(812, 287, 1)}${mark(812, 317, 1)}
    </g>`;
    // 6: candidates, in the order of the leaves of the tree
    const cands = [["x₁", "trip, station", "district, start", "4.00"], ["x₂", "trip, station", "district, end", "4.00"],
      ["x₃", "trip, station", "name, start", "4.58"], ["x₄", "trip, station", "name, end", "4.58"],
      ["x₅", "trip, rider", "home_district", "5.32"], ["x₆", "survey", "district", "5.17"]];
    const cy = [140, 196, 252, 308, 364, 420];
    h += `<g data-s="6" data-keep>${cands.map(([x, t, d, c], i) => `<g class="cand">
      <rect x="862" y="${cy[i] - 22}" width="214" height="44" rx="9"/>
      <text class="x" x="874" y="${cy[i] + 5}" font-size="15">${x}</text>
      <text x="902" y="${cy[i] - 2}" font-size="14">${t}</text><text x="902" y="${cy[i] + 14}" class="small muted">${d}</text>
      <text x="1066" y="${cy[i] + 5}" text-anchor="end" font-size="15" font-weight="700">${c}</text></g>`).join("")}</g>`;
    // 7: the search tree, built from the candidates (its leaves) up to the root
    const fork = (x, y, t, dy = -14) => `<g class="fork"><circle cx="${x}" cy="${y}" r="10"/><text x="${x}" y="${y + 4}" text-anchor="middle">?</text>
      <text x="${x + 4}" y="${y + dy}" class="small" style="fill:var(--red-ink)">${t}</text></g>`;
    h += `<g data-s="7" data-keep>
      <text x="1100" y="126" class="small muted">built bottom up, asked top down</text>
      <path class="branch" d="M1078 140H1122V158M1078 196H1122V178M1078 252H1122V270M1078 308H1122V290"/>
      <path class="branch" d="M1132 168H1174V214M1132 280H1174V234"/>
      <path class="branch" d="M1184 224H1228V284M1078 364H1228V304"/>
      <path class="branch" d="M1238 294H1282V347M1078 420H1282V367"/>
      ${fork(1122, 168, "join")}${fork(1122, 280, "join", 26)}${fork(1174, 224, "column")}${fork(1228, 294, "table")}${fork(1282, 357, "database", 28).replace(/<text x="1286" y="385" class="small"/, '<text x="1266" y="361" text-anchor="end" class="small"')}
      <use href="#i-person" x="1268" y="232" width="28" height="28" style="color:var(--red)"/>
      <path class="branch" d="M1282 264V334" marker-end="url(#ahr)"/>
    </g>`;
    // built once per lake
    h += `<path d="M0 494H1320" stroke="var(--line)" stroke-dasharray="6 5" stroke-width="1.5"/>
      <text x="0" y="516" class="small muted" font-weight="700" letter-spacing=".08em">BUILT ONCE PER LAKE</text>
      <g transform="translate(0 534)"><ellipse cx="16" cy="6" rx="14" ry="5" fill="none" stroke="var(--lake)" stroke-width="1.6"/>
        <path d="M2 6v22c0 3 6 5 14 5s14-2 14-5V6" fill="none" stroke="var(--lake)" stroke-width="1.6"/>
        <text x="40" y="16" font-size="13.5" font-weight="600">bikeshare,</text><text x="40" y="33" font-size="13.5" font-weight="600">mobility</text></g>
      <g class="off" data-o="2"><rect class="box" x="165" y="534" width="134" height="38" rx="9"/><text x="232" y="558" text-anchor="middle" font-size="13.5" font-weight="600">value index</text></g>
      <g class="off" data-o="2 3"><rect class="box" x="309" y="534" width="148" height="38" rx="9"/><text x="383" y="551" text-anchor="middle" font-size="12.5" font-weight="600">descriptions,</text><text x="383" y="566" text-anchor="middle" font-size="12.5" font-weight="600">embeddings</text></g>
      <g class="off" data-o="4 5"><rect class="box" x="490" y="534" width="182" height="38" rx="9"/><text x="581" y="558" text-anchor="middle" font-size="13.5" font-weight="600">links between tables</text></g>
      <path class="edge" d="M232 534V470M330 534V470M581 534V470" marker-end="url(#ahp)"/>`;
    add(g, `<defs><marker id="ahp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="arrowhead" d="M0 0 10 5 0 10Z"/></marker>
      <marker id="ahr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10Z" fill="var(--red)"/></marker></defs>` + h);
    const rows = $$(".prow", g), marks = $$('[data-s="3"] > g', g);
    stepper({
      fig: $("#pipe"), n: 7, say: $("#pipeSay"), play: $("#pipePlay"), prev: $("#pipePrev"), next: $("#pipeNext"), stepsBox: $("#pipeSteps"),
      labels: ["split", "places", "place judge", "search", "join judge", "candidates", "search tree"],
      texts: [
        ["Split the question into parts", "An LLM splits the question into parts. Each part names one thing the question asks for or filters on, with its value when it gives one. The rest of the search works on each part on its own."],
        ["Find the places of each part, with a cost", 'For each part, AMIGO lists the columns of the whole lake that may store it: the 30 closest by meaning, plus every column that stores its value. Each place gets a cost, lower when it is more likely: the cost grows with its rank by meaning, and rises when other places store the value of the part and this one does not. <code>trip.start_station</code> stores station ids, not "Riverside", so its cost rises.'],
        ["The place judge keeps the places the user could mean", "For each place, an LLM answers yes or no: could the user mean this column for this part? A rider is not a trip, so <code>rider.id</code> is out. Fewer places keep the tree small."],
        ["Search the joins, from the lowest cost up", "AMIGO joins one kept place per part through the links between tables. It finds the way to connect them at the lowest cost, exactly (a group Steiner tree), then the next one, and so on: the candidates come in exact order of cost, each once."],
        ["The join judge picks the links", "Two tables can join on several links, and each link relates other rows: a trip meets a station where it starts or where it ends. An LLM keeps the links the user could mean. Here, both."],
        ["Six candidates, each with a cost", 'A candidate is one table set: the cost of its places plus one cost per join. x₁ places the three parts in columns of cost 1 and needs one join: <span class="f">1 + 1 + 1 + 1 = 4</span>.'],
        ["Arrange the candidates into a search tree", "The candidates are the leaves. Each fork is a question AMIGO can ask the user: which database, table, column or join. With no user, AMIGO keeps every leaf. Try it in the next section."],
      ],
      onStep: (k) => {
        rows.forEach((r) => r.classList.toggle("row-off", k >= 3 && r.dataset.ok === "0"));
        marks.forEach((m) => m.classList.toggle("fx", true));
      },
    });
  })();

  // ------------------------------------------------------------------ 04 tree walk
  (function treeWalk() {
    const J = "How does a trip join a station?";
    const T = { id: "D", q: "Which database?", row: 0, opts: [
      { lab: "bikeshare", sh: ".69", row: 1, node: { id: "T", q: "Which table holds “place of the trip”?", opts: [
        { lab: "station", sh: ".71", row: 2, node: { id: "C", q: "Which column of station?", opts: [
          { lab: "district", sh: ".60", row: 3, node: { id: "J1", q: J, opts: [{ lab: "start", sh: ".50", row: 4, leaf: 1 }, { lab: "end", sh: ".50", row: 5, leaf: 2 }] } },
          { lab: "name", sh: ".40", row: 6, node: { id: "J2", q: J, opts: [{ lab: "start", sh: ".50", row: 7, leaf: 3 }, { lab: "end", sh: ".50", row: 8, leaf: 4 }] } }] } },
        { lab: "rider", sh: ".29", row: 9, leaf: 5 }] } },
      { lab: "mobility", sh: ".31", row: 10, leaf: 6 }] };
    const LEAF = { 1: ["trip, station", "4.00", "trips that start in the district"], 2: ["trip, station", "4.00", "trips that end in the district"],
      3: ["trip, station", "4.58", "trips that start at the station"], 4: ["trip, station", "4.58", "trips that end at the station"],
      5: ["trip, rider", "5.32", "trips by riders who live in the district"], 6: ["survey", "5.17", "trips that residents report"] };
    const Y = (r) => 30 + r * 34, DX = 24, LX = 452;
    const g = $("#treeDraw");
    const leavesOf = (o) => (o.leaf ? [o.leaf] : o.node.opts.flatMap(leavesOf));
    let h = "";
    // rows: an option (with its share) and, if it leads to a fork, the fork's question on the same row
    const fkText = (n, x, y, row = 0) => {
      const w = Math.max(120, n.q.length * 6.9 + 18);
      return `<g class="fk" data-id="${n.id}" data-row="${row}"><rect x="${x}" y="${y - 13}" width="${w}" height="26" rx="6"/><text x="${x + 9}" y="${y + 4.5}">${n.q}</text></g>`;
    };
    h += fkText(T, 0, Y(0));
    function draw(node, level, parentRow) {
      node.opts.forEach((o) => {
        const x = level * DX, y = Y(o.row), px = (level - 1) * DX + 10;
        h += `<path class="ln" data-row="${o.row}" d="M${px} ${Y(parentRow) + 13}V${y}H${x - 3}"/>`;
        const ow = o.lab.length * 8 + 34;
        h += `<g class="row" data-row="${o.row}"><text class="o mono" x="${x}" y="${y + 4.5}">${o.lab}</text><text class="share" x="${x + o.lab.length * 8 + 6}" y="${y + 4.5}">${o.sh}</text></g>`;
        if (o.node) { h += fkText(o.node, x + ow, y, o.row); draw(o.node, level + 1, o.row); }
        else {
          const lf = LEAF[o.leaf];
          h += `<path class="dots" d="M${x + ow - 4} ${y}H${LX - 4}"/>
            <g class="lf" data-leaf="${o.leaf}"><rect x="${LX}" y="${y - 13}" width="186" height="26" rx="5"/>
            <text x="${LX + 9}" y="${y + 4.5}" font-weight="700">x${"₀₁₂₃₄₅₆"[o.leaf]}</text>
            <text x="${LX + 36}" y="${y + 4.5}" class="mono" style="font-size:12px">${lf[0]}</text>
            <text x="${LX + 178}" y="${y + 4.5}" text-anchor="end" font-weight="700">${lf[1]}</text></g>`;
        }
      });
    }
    draw(T, 1, 0);
    add(g, h);
    const svg = $("#treeSvg");
    const elQ = $("#askQ"), elO = $("#askOpts"), elC = $("#askCrumbs"), elN = $("#askLeft");
    let stack, crumbs, result;
    function reset() { stack = [{ node: T, left: [...T.opts] }]; crumbs = []; result = null; render(); }
    function possible() {
      if (result) return result;
      if (!stack.length) return [];
      return stack[stack.length - 1].left.flatMap(leavesOf);
    }
    function render() {
      const P = possible();
      const top = stack[stack.length - 1];
      const chosen = new Set(stack.slice(1).map((s) => s.via.row));
      if (result && result.length === 1 && stack.length) chosen.add(stack.__lastRow);
      $$(".row", svg).forEach((r) => r.classList.toggle("out", !rowLeaves(+r.dataset.row).some((l) => P.includes(l))));
      $$(".ln", svg).forEach((r) => {
        const row = +r.dataset.row;
        r.classList.toggle("on", chosen.has(row) || (result && result.length < 6 && rowLeaves(row).some((l) => result.includes(l)) && pathRows(result).has(row)));
        r.classList.toggle("out", !rowLeaves(row).some((l) => P.includes(l)));
      });
      $$(".lf", svg).forEach((l) => { const k = +l.dataset.leaf; l.classList.toggle("out", !P.includes(k)); l.classList.toggle("kept", !!result && result.includes(k)); });
      $$(".fk", svg).forEach((f) => {
        f.classList.toggle("cur", !result && !!top && f.dataset.id === top.node.id);
        f.classList.toggle("out", +f.dataset.row > 0 && !rowLeaves(+f.dataset.row).some((l) => P.includes(l)));
      });
      elN.textContent = P.length;
      elC.innerHTML = crumbs.map(([t, x]) => `<span class="${x ? "x" : ""}">${t}</span>`).join("");
      if (result) {
        elQ.textContent = result.length === 0 ? "No answer found." : result.length === 1 ? "Done." : "No user: every leaf is kept.";
        elO.innerHTML = result.length === 0
          ? `<p class="done">You ruled out every option. AMIGO reports that it found no answer.</p>`
          : result.length === 1
            ? `<p class="done">You reached one leaf: <b>${LEAF[result[0]][0]}</b>, ${LEAF[result[0]][2]}. AMIGO writes its SQL query.</p>`
            : `<p class="done">AMIGO keeps all <b>6</b> leaves, from the lowest cost up: <b>3</b> different table sets (<b>trip, station</b>; <b>survey</b>; <b>trip, rider</b>), and one SQL query per leaf.</p>`;
        return;
      }
      elQ.textContent = top.node.q;
      const max = Math.max(...top.node.opts.map((o) => +o.sh));
      elO.innerHTML = top.left.map((o, i) => `<button class="opt" type="button" data-i="${i}"><span class="bar2" style="width:${(+o.sh / max) * 100}%"></span><span class="mono">${o.lab}</span><span class="sh">share ${o.sh}</span></button>`).join("")
        + `<button class="opt none" type="button" data-i="-1"><span>None of these</span><span class="sh">go back up</span></button>`;
      $$(".opt", elO).forEach((b) => b.addEventListener("click", () => answer(+b.dataset.i)));
    }
    const rowLeaves = (row) => { const f = (n) => n.opts.flatMap((o) => (o.row === row ? leavesOf(o) : o.node ? f(o.node) : [])); return f(T); };
    function pathRows(leaves) {
      const s = new Set(); const f = (n, path) => n.opts.forEach((o) => { const p = [...path, o.row]; if (o.leaf && leaves.includes(o.leaf)) p.forEach((r) => s.add(r)); if (o.node) f(o.node, p); });
      f(T, []); return s;
    }
    function answer(i) {
      const top = stack[stack.length - 1];
      if (i < 0) {                       // none of these: the option that led here was wrong
        crumbs.push([`none at "${top.node.q.replace("?", "")}"`, true]);
        stack.pop();
        backtrack(top);
        return;
      }
      const o = top.left[i];
      crumbs.push([o.lab, false]);
      if (o.leaf) { result = [o.leaf]; stack.__lastRow = o.row; render(); return; }
      stack.push({ node: o.node, left: [...o.node.opts], via: o });
      render();
    }
    function backtrack(gone) {
      // remove the option that led to the fork we left; climb while a fork has nothing left
      let via = gone.via;
      while (stack.length) {
        const up = stack[stack.length - 1];
        up.left = up.left.filter((o) => o !== via);
        if (up.left.length) { render(); return; }
        crumbs.push([`none left at "${up.node.q.replace("?", "")}"`, true]);
        via = up.via; stack.pop();
      }
      result = []; render();
    }
    $("#askRestart").addEventListener("click", reset);
    $("#askLazy").addEventListener("click", () => { reset(); result = [1, 2, 3, 4, 6, 5]; crumbs = [["keep every leaf", false]]; render(); });
    $("#askCons").addEventListener("click", () => { reset(); let n = 0; while (!result && n++ < 6) answer(0); });
    reset();

    // the two small panels under the tree
    const bench = ["BIRD", "Spider", "MMQA"];
    const nf = $("#nofork");
    nf.innerHTML = `<svg viewBox="0 0 420 110" role="img" aria-label="Questions with a one-path tree: BIRD ${D.noFork.BIRD}%, Spider ${D.noFork.Spider}%, MMQA ${D.noFork.MMQA}%">${bench.map((b, i) => `
      <text x="0" y="${24 + i * 34}" class="lab" font-weight="600">${b}</text>
      <rect x="70" y="${10 + i * 34}" width="300" height="20" rx="4" fill="var(--card)"/>
      <rect class="grow" x="70" y="${10 + i * 34}" width="0" data-w="${3 * D.noFork[b]}" height="20" rx="4" fill="var(--red)"/>
      <text x="380" y="${25 + i * 34}" class="lab" font-weight="700">${fmt(D.noFork[b])}%</text>`).join("")}</svg>`;
    const inf = $("#informed");
    const M = D.retrieval.multi;
    const sx = (v) => 70 + (v - 50) * 6;
    inf.innerHTML = `<svg viewBox="0 0 420 130" role="img" aria-label="P* of AMIGO lazy and AMIGO informed">
      ${[50, 60, 70, 80, 90, 100].map((v) => `<path d="M${sx(v)} 4V104" stroke="var(--line)" stroke-dasharray="2 4"/><text x="${sx(v)}" y="122" text-anchor="middle" class="small muted">${v}</text>`).join("")}
      ${bench.map((b, i) => {
        const a = M[b]["AMIGO lazy"][2], c = M[b]["AMIGO informed"][2], y = 22 + i * 34;
        return `<text x="0" y="${y + 5}" class="lab" font-weight="600">${b}</text>
          <path class="drawline" d="M${sx(a)} ${y}H${sx(c)}" stroke="var(--red)" stroke-width="3" stroke-dasharray="${sx(c) - sx(a)}" stroke-dashoffset="0"/>
          <circle cx="${sx(a)}" cy="${y}" r="7" fill="var(--red)" stroke="var(--card)" stroke-width="2"/>
          <circle cx="${sx(c)}" cy="${y}" r="7" fill="var(--card)" stroke="var(--red)" stroke-width="2.5"/>
          <text x="${sx(a) - 11}" y="${y + 4.5}" text-anchor="end" class="small muted">${fmt(a)}</text>
          <text x="${sx(c) + 11}" y="${y + 4.5}" class="small" font-weight="700">${fmt(c)}</text>`;
      }).join("")}</svg>
      <p class="note" style="margin-top:2px">Filled: no user (lazy). Ring: a user who answers right (informed, a reference point that knows the labels).</p>`;
    $$(".grow", nf).forEach((r) => r.setAttribute("width", r.dataset.w));
    if (!still) {
      whenSeen(nf, () => { $$(".grow", nf).forEach((r) => { r.style.transition = "none"; r.setAttribute("width", 0); reflow(r); r.style.transition = ""; }); twoFrames(() => $$(".grow", nf).forEach((r) => r.setAttribute("width", r.dataset.w))); }, 0.5);
      whenSeen(inf, () => { $$(".drawline", inf).forEach((p) => { p.style.transition = "none"; p.setAttribute("stroke-dashoffset", p.getAttribute("stroke-dasharray")); reflow(p); p.style.transition = ""; }); twoFrames(() => $$(".drawline", inf).forEach((p) => p.setAttribute("stroke-dashoffset", 0))); }, 0.5);
    }
  })();

  // ------------------------------------------------------------------ 05 labeler (Figure 5 of the paper)
  (function labeler() {
    const g = $("#labDraw");
    const RED = "var(--red)", BLUE = "var(--lake)", AMB = "var(--amber)";
    // the step names run along the bottom of this figure
    let h = `<g transform="translate(0 320)">${hdr(1, 8, "map words", 120) + hdr(2, 408, "search", 92) + hdr(3, 572, "vote, three times", 186)
      + hdr(4, 876, "write, run", 112) + hdr(5, 996, "final filter", 116) + hdr(6, 1124, "hand check", 116)}</g>`;
    // 1: question, query, and an LLM that maps groups of words to the query
    h += `<g data-s="1" data-keep>
      <rect class="box" x="0" y="18" width="300" height="104" rx="14"/>
      <text x="16" y="50" font-size="17" font-style="italic">“How many <tspan class="t-red">Riverside</tspan></text>
      <text x="16" y="78" font-size="17" font-style="italic"><tspan class="t-blue">bike trips</tspan> were made</text>
      <text x="16" y="106" font-size="17" font-style="italic"><tspan class="t-amber">in 2025</tspan>?”</text>
      <rect x="0" y="146" width="300" height="200" rx="12" fill="var(--soft)"/>
      <text x="14" y="176" class="mono">SELECT COUNT(*)</text>
      <text x="14" y="204" class="mono">FROM station JOIN <tspan class="t-blue">trip</tspan></text>
      <text x="14" y="232" class="mono">WHERE station.<tspan class="t-red">district</tspan></text>
      <text x="14" y="260" class="mono">  = 'Riverside'</text>
      <text x="14" y="288" class="mono">AND trip.<tspan class="t-amber">date</tspan></text>
      <text x="14" y="316" class="mono">  LIKE '2025%'</text>
      <path d="M126 45C220 40 290 60 316 112" stroke="${RED}" stroke-width="1.6" stroke-dasharray="5 4" fill="none"/>
      <path d="M110 73C230 75 290 90 322 112" stroke="${BLUE}" stroke-width="1.6" stroke-dasharray="5 4" fill="none"/>
      <path d="M86 101C200 104 290 108 328 114" stroke="${AMB}" stroke-width="1.6" stroke-dasharray="5 4" fill="none"/>
      ${llm(330, 140, 1.05)}
      <path d="M318 166C312 210 280 226 214 228" stroke="${RED}" stroke-width="1.6" stroke-dasharray="5 4" fill="none" marker-end="url(#ahl)"/>
      <path d="M330 166C326 190 300 200 200 200" stroke="${BLUE}" stroke-width="1.6" stroke-dasharray="5 4" fill="none" marker-end="url(#ahl)"/>
      <path d="M342 166C344 240 300 284 128 284" stroke="${AMB}" stroke-width="1.6" stroke-dasharray="5 4" fill="none" marker-end="url(#ahl)"/>
    </g>`;
    // the stacked sheets: steps 2 to 5 run once per group of words
    h += `<g data-s="2" data-keep>
      <rect x="396" y="34" width="712" height="342" rx="14" fill="color-mix(in srgb, var(--amber) 9%, var(--card))" stroke="${AMB}" stroke-opacity=".5" class="sheet"/>
      <rect x="388" y="26" width="712" height="342" rx="14" fill="color-mix(in srgb, var(--lake) 9%, var(--card))" stroke="${BLUE}" stroke-opacity=".5" class="sheet"/>
      <rect x="380" y="18" width="712" height="342" rx="14" fill="color-mix(in srgb, var(--red) 6%, var(--card))" stroke="${RED}" stroke-opacity=".6" class="sheet"/>
      <text x="396" y="42" class="small" style="fill:var(--red-ink)" font-weight="700">one sheet per group of words; here: “Riverside”</text>
      <text x="1104" y="388" text-anchor="end" class="small" style="fill:var(--amber)">same for “in 2025”</text>
      <text x="1094" y="374" text-anchor="end" class="small" style="fill:var(--lake)">same for “bike trips”</text>
      <path class="edge" d="M352 160C366 186 376 196 392 200" marker-end="url(#ahl)"/>
      <g transform="translate(424 200)"><circle r="15" fill="none" stroke="var(--ink)" stroke-width="3"/><path d="M11 11l12 12" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/></g>
      <text x="430" y="252" text-anchor="middle" class="small muted">search</text><text x="430" y="266" text-anchor="middle" class="small muted">the lake</text>
      ${[[90, "meaning"], [140, "keywords"], [190, "spelling"], [240, "values"]].map(([y, t]) => `<path class="edge" d="M452 202C478 202 470 ${y} 500 ${y}H560"/><text x="510" y="${y - 6}" class="small muted">${t}</text>`).join("")}
      ${["station.name", "rider.home_district", "survey.district", "trip.start_station"].map((t, i) => `<rect class="chip" x="566" y="${77 + i * 50}" width="188" height="26" rx="6"/><text x="576" y="${94.5 + i * 50}" class="mono">${t}</text>`).join("")}
    </g>`;
    // 3: votes; the decoy is planted here
    const votes = [[1, 1, 1], [1, 1, 0], [1, 1, 1], [1, 0, 0]];
    h += `<g data-s="3" data-keep>
      <g class="decoy"><rect x="566" y="277" width="188" height="26" rx="6"/></g><text x="576" y="294.5" class="mono" style="fill:var(--amber)">rider.plan</text>
      ${llm(806, 52, 0.95)}<text x="834" y="57" font-size="14" font-weight="700">×3</text>
      ${votes.map((v, i) => v.map((ok, j) => `<g class="vote" style="--v:${i * 3 + j}">${mark(772 + j * 30, 90 + i * 50, ok)}</g>`).join("")).join("")}
      <g class="vote" style="--v:12">${mark(772, 290, 0)}</g>
      <rect x="802" y="279" width="22" height="22" rx="5" fill="none" stroke="var(--line)" stroke-dasharray="3 3"/><rect x="832" y="279" width="22" height="22" rx="5" fill="none" stroke="var(--line)" stroke-dasharray="3 3"/>
      <text x="866" y="245" class="small muted">not kept</text><text x="866" y="295" class="small" style="fill:var(--amber)">decoy: not kept</text>
    </g>`;
    // 4: write and run one query per kept option
    const page = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 -12h12l6 6v18H0Z" fill="var(--card)" stroke="var(--ink)" stroke-width="1.4"/><path d="M3 -3h11M3 2h11M3 7h8" stroke="var(--ink)" stroke-width="1"/></g>`;
    const rowsIc = (x, y) => `<g transform="translate(${x} ${y})">${[-8, -2, 4].map((d) => `<rect x="0" y="${d}" width="22" height="4.5" rx="1" fill="var(--lake)" opacity=".75"/>`).join("")}</g>`;
    h += `<g data-s="4" data-keep>${[90, 140, 190].map((y) => `<path class="edge" d="M864 ${y}h10"/>${page(880, y)}<path class="edge" d="M902 ${y}h12"/>${rowsIc(918, y)}<path class="edge" d="M944 ${y}h40" marker-end="url(#ahl)"/>`).join("")}</g>`;
    // 5: the final filter, a stronger LLM used once
    h += `<g data-s="5" data-keep>
      <rect x="988" y="62" width="88" height="158" rx="12" fill="color-mix(in srgb, var(--ink) 8%, transparent)" stroke="var(--ink)" stroke-width="1.4"/>
      ${llm(1032, 116, 1.25)}
      <text x="1032" y="176" text-anchor="middle" class="small" font-weight="700">stronger,</text><text x="1032" y="191" text-anchor="middle" class="small" font-weight="700">used once</text>
      ${[[90, 1], [140, 0], [190, 1]].map(([y, ok]) => mark(1080, y, ok)).join("")}
      <path d="M1112 80h8V200h-8" stroke="${BLUE}" stroke-width="2" fill="none"/>
      <text x="1128" y="126" font-size="15" font-weight="700" style="fill:var(--lake)">multi-valid</text>
      <text x="1128" y="144" font-size="15" font-weight="700" style="fill:var(--lake)">label</text>
      <text x="1128" y="166" class="small muted">original query</text><text x="1128" y="181" class="small muted">+ kept queries</text>
    </g>`;
    // 6: hand check of a sample
    h += `<g data-s="6" data-keep>
      <use href="#i-person" x="1128" y="236" width="34" height="34" style="color:var(--teal)"/>
      <g transform="translate(1180 252)"><circle r="11" fill="none" stroke="var(--teal)" stroke-width="2.6"/><path d="M8 8l9 9" stroke="var(--teal)" stroke-width="3.4" stroke-linecap="round"/></g>
      <text x="1128" y="298" font-size="26" font-weight="800" font-family="Montserrat" style="fill:var(--teal)">173/174</text>
      <text x="1128" y="318" class="small muted">labels agreed with,</text><text x="1128" y="333" class="small muted">on 174 of 3,641</text><text x="1128" y="348" class="small muted">questions</text>
    </g>`;
    add(g, `<defs><marker id="ahl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="arrowhead" d="M0 0 10 5 0 10Z"/></marker></defs>` + h);
    stepper({
      fig: $("#labfig"), n: 6, say: $("#labSay"), play: $("#labPlay"), prev: $("#labPrev"), next: $("#labNext"), stepsBox: $("#labSteps"),
      labels: ["map words", "search", "vote", "write, run", "final filter", "hand check"],
      texts: [
        ["Map the words to the query", "An LLM maps groups of words of the question to the tables and columns of the benchmark's query: “Riverside” to <code>station.district</code>, “bike trips” to <code>trip</code>, “in 2025” to <code>trip.date</code>. Each group gets its own sheet."],
        ["Search the lake for other options", "For each group of words, we list the columns and tables of the lake that these words could mean, with four signals: meaning, keywords, spelling and stored values."],
        ["Vote three times, with a decoy", "An LLM votes three times on each option: could the user mean it? An option is kept on two yes votes or more. One decoy, far from the words, is planted in every list. Of 9,737 decoys, the LLM accepted 5."],
        ["Write and run a query for each option", "Each kept option is swapped into the original query, and the query is run. The rest of the query, such as its aggregates and grouping, stays the same."],
        ["A stronger LLM filters the queries", "A stronger LLM reads the question, each rewritten query and its rows, and keeps or removes the query. The label holds the original query and every query kept, over all sheets."],
        ["A person checks a sample", "One author checked the labels of 174 of the 3,641 questions, and agreed with 173 of them."],
      ],
      dwell: 3800,
    });
    // meters
    const meters = $("#meters");
    if (!still) whenSeen(meters, () => $$(".fill", meters).forEach((f) => { f.style.transition = "none"; f.style.width = "0"; reflow(f); f.style.transition = ""; twoFrames(() => (f.style.width = "")); }), 0.4);
  })();

  // ------------------------------------------------------------------ 06 results: scatter plots
  const STYLE = {
    "AMIGO lazy": { c: "--red", s: "circle", r: 8.5, g: "AMIGO", lab: "lazy", what: "no user: keeps every leaf" },
    "AMIGO whole judge": { c: "--red", s: "diamond", r: 8, g: "AMIGO", lab: "whole judge", what: "no user: an LLM checks each final candidate" },
    "AMIGO conservative": { c: "--red-light", s: "circle", r: 6.5, g: "AMIGO", lab: "conservative", what: "keeps only the likeliest leaf" },
    "AMIGO informed": { c: "--red", s: "ring", r: 7.5, g: "AMIGO", lab: "informed†", what: "a user who answers every fork right", multiOnly: true },
    "LLM sets": { c: "--series-navy", s: "star", r: 10, g: "Several table sets", lab: "LLM sets", what: "an LLM lists table sets from the 20 closest tables (our baseline)" },
    "CORE-T": { c: "--green", s: "square", r: 7, g: "One table set", lab: "CORE-T" },
    "Route+SQL": { c: "--green", s: "triangle", r: 8, g: "One table set", lab: "Route+SQL" },
    "Dense": { c: "--grey", s: "plus", r: 7, g: "One list of 3 tables", lab: "Dense" },
    "MURRE": { c: "--grey", s: "tridown", r: 7.5, g: "One list of 3 tables", lab: "MURRE" },
    "JAR": { c: "--grey", s: "diamond", r: 6, g: "One list of 3 tables", lab: "JAR" },
    "Iterative JAR": { c: "--grey", s: "thin", r: 7, g: "One list of 3 tables", lab: "Iterative JAR" },
    "CRUSH4SQL": { c: "--grey", s: "cross", r: 6.5, g: "One list of 3 tables", lab: "CRUSH4SQL" },
  };
  function shape(st, extra = "") {
    const r = st.r, c = `var(${st.c})`, ring = `stroke="var(--card)" stroke-width="1.6"`;
    switch (st.s) {
      case "circle": return `<circle r="${r}" fill="${c}" ${ring} ${extra}/>`;
      case "ring": return `<circle r="${r - 1}" fill="var(--card)" stroke="${c}" stroke-width="2.8" ${extra}/>`;
      case "square": return `<rect x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" rx="1.5" fill="${c}" ${ring} ${extra}/>`;
      case "diamond": return `<path d="M0 ${-r * 1.25}L${r} 0 0 ${r * 1.25} ${-r} 0Z" fill="${c}" ${ring} ${extra}/>`;
      case "thin": return `<path d="M0 ${-r * 1.3}L${r * 0.6} 0 0 ${r * 1.3} ${-r * 0.6} 0Z" fill="${c}" ${ring} ${extra}/>`;
      case "triangle": return `<path d="M0 ${-r * 1.15}L${r} ${r * 0.75} ${-r} ${r * 0.75}Z" fill="${c}" ${ring} ${extra}/>`;
      case "tridown": return `<path d="M0 ${r * 1.15}L${r} ${-r * 0.75} ${-r} ${-r * 0.75}Z" fill="${c}" ${ring} ${extra}/>`;
      case "plus": return `<path d="M${-r} 0H${r}M0 ${-r}V${r}" stroke="${c}" stroke-width="3.2" ${extra}/>`;
      case "cross": return `<path d="M${-r} ${-r}L${r} ${r}M${-r} ${r}L${r} ${-r}" stroke="${c}" stroke-width="3" ${extra}/>`;
      case "star": {
        let p = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; p += `${i ? "L" : "M"}${(rr * Math.cos(a)).toFixed(2)} ${(rr * Math.sin(a)).toFixed(2)}`; }
        return `<path d="${p}Z" fill="${c}" ${ring} ${extra}/>`;
      }
    }
    return "";
  }
  (function scatters() {
    const box = $("#scatters"), legend = $("#legend"), say = $("#scatterSay"), note = $("#scatterNote");
    const bench = ["BIRD", "Spider", "MMQA"];
    const W = 340, H = 300, m = { l: 46, r: 14, t: 12, b: 42 };
    const DOM = { multi: { x: [0, 100], y: [0, 60], xt: [0, 20, 40, 60, 80, 100], yt: [0, 10, 20, 30, 40, 50, 60], xl: "precision P*", yl: "complete recall CR*" },
      single: { x: [30, 100], y: [30, 100], xt: [30, 40, 50, 60, 70, 80, 90, 100], yt: [30, 40, 50, 60, 70, 80, 90, 100], xl: "precision P", yl: "complete recall CR" } };
    let label = "multi", focus = null, zoom = 0;
    const ZOOM = { multi: { x: [50, 100], y: [20, 60], xt: [50, 60, 70, 80, 90, 100], yt: [20, 30, 40, 50, 60] },
      single: { x: [50, 100], y: [60, 100], xt: [50, 60, 70, 80, 90, 100], yt: [60, 70, 80, 90, 100] } };
    const names = Object.keys(STYLE);
    box.innerHTML = bench.map((b) => `<div class="chart"><h4>${b}</h4><svg viewBox="0 0 ${W} ${H}" data-b="${b}" role="img" aria-label="${b}: complete recall against precision"><g class="grid"></g><g class="axis"></g><g class="pts">${
      [...names.filter((n) => n !== "LLM sets").reverse(), "LLM sets"].map((n) => `<g class="pt" data-n="${n}">${shape(STYLE[n])}<circle class="hit" r="13"/></g>`).join("")}</g></svg></div>`).join("");
    // legend: one block per group
    const groups = {};
    names.forEach((n) => (groups[STYLE[n].g] ||= []).push(n));
    legend.innerHTML = Object.entries(groups).map(([gname, ns]) => `<div class="g"><em>${gname}</em>${ns.map((n) => `<button type="button" data-n="${n}" title="${STYLE[n].what || n}"><svg viewBox="-10 -10 20 20">${shape({ ...STYLE[n], r: Math.min(STYLE[n].r, 8) })}</svg>${STYLE[n].lab}</button>`).join("")}</div>`).join("");
    $$("button", legend).forEach((b) => b.addEventListener("click", () => { focus = focus === b.dataset.n ? null : b.dataset.n; draw(); }));
    function draw() {
      const d = zoom ? { ...DOM[label], ...ZOOM[label] } : DOM[label];
      const X = (v) => m.l + ((v - d.x[0]) / (d.x[1] - d.x[0])) * (W - m.l - m.r);
      const Y = (v) => H - m.b - ((v - d.y[0]) / (d.y[1] - d.y[0])) * (H - m.t - m.b);
      $$("svg[data-b]", box).forEach((svg, k) => {
        const b = svg.dataset.b, rows = D.retrieval[label][b];
        $(".grid", svg).innerHTML = d.xt.map((v) => `<line x1="${X(v)}" x2="${X(v)}" y1="${m.t}" y2="${H - m.b}"/>`).join("") + d.yt.map((v) => `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}"/>`).join("");
        $(".axis", svg).innerHTML = `<path d="M${m.l} ${m.t}V${H - m.b}H${W - m.r}"/>`
          + d.xt.map((v) => `<text x="${X(v)}" y="${H - m.b + 17}" text-anchor="middle">${v}</text>`).join("")
          + d.yt.map((v) => `<text x="${m.l - 7}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")
          + `<text class="axis-title" x="${(m.l + W - m.r) / 2}" y="${H - 6}" text-anchor="middle">${d.xl}</text>`
          + (k === 0 ? `<text class="axis-title" transform="translate(12 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle">${d.yl}</text>` : "");
        $$(".pt", svg).forEach((p) => {
          const n = p.dataset.n, v = rows[n], st = STYLE[n];
          const show = v && !(st.multiOnly && label === "single");
          p.style.opacity = show ? "" : 0;
          p.style.pointerEvents = show ? "" : "none";
          p.classList.toggle("dim", !!focus && focus !== n);
          p.classList.toggle("edge-pt", !!v && (v[2] < d.x[0] || v[1] < d.y[0]));  // outside the zoom: kept on its edge
          if (v) p.style.transform = `translate(${X(Math.max(d.x[0], v[2]))}px, ${Y(Math.max(d.y[0], v[1]))}px)`;
          else p.style.transform = `translate(${X(d.x[0])}px, ${Y(d.y[0])}px)`;
        });
      });
      $$("button", legend).forEach((b) => { b.classList.toggle("dim", !!focus && focus !== b.dataset.n); b.style.display = STYLE[b.dataset.n].multiOnly && label === "single" ? "none" : ""; });
      say.innerHTML = label === "multi"
        ? `<b>AMIGO finds more of the valid table sets than every existing retriever.</b> A list of three tables rarely equals a valid table set, and CORE-T's one set usually holds more tables than a valid set, so these methods sit at the bottom left. LLM sets, a baseline we define, is on par with AMIGO on these lakes. A user who answers the forks (informed) raises precision with almost no loss.`
        : `<b>No loss on the single-answer task.</b> Against the benchmarks' own labels, AMIGO has the highest complete recall on Spider and MMQA, and tight table sets: precision 93.7, 95.3 and 83.0, against at most 63.5 for CORE-T and the methods built on it.`;
      note.innerHTML = label === "multi"
        ? (zoom ? "Faded points lie outside the zoom, on its edge. " : "") + "CR*: share of questions whose valid table sets are all returned. P*: share of returned table sets that are valid. A returned table set counts only when it equals a valid one. † Knows the labeled table sets: a reference point. Route+SQL does not apply to MMQA. Hover a point for its scores; click a name to pick it out."
        : (zoom ? "Faded points lie outside the zoom, on its edge. " : "") + "CR: share of needed tables all returned in one set (averaged per question). P: share of returned tables that are needed. Route+SQL does not apply to MMQA. Hover a point for its scores; click a name to pick it out.";
    }
    box.addEventListener("mousemove", (e) => {
      const p = e.target.closest(".pt"); if (!p) { hideTip(); return; }
      const svg = p.closest("svg"), n = p.dataset.n, v = D.retrieval[label][svg.dataset.b][n];
      const s = label === "multi" ? "*" : "";
      showTip(e, `<b>${n}</b> · ${svg.dataset.b}<br><span class="k">R${s}</span> ${fmt(v[0])} &nbsp;<span class="k">CR${s}</span> ${fmt(v[1])} &nbsp;<span class="k">P${s}</span> ${fmt(v[2])}<br><span class="k">${label === "multi" ? "table sets per question" : "tables per set"}</span> ${fmt(v[3], 2)}${STYLE[n].what ? `<br><span class="k">${STYLE[n].what}</span>` : ""}`);
    });
    box.addEventListener("mouseleave", hideTip);
    box.addEventListener("click", (e) => { const p = e.target.closest(".pt"); if (p) { focus = focus === p.dataset.n ? null : p.dataset.n; draw(); } });
    const labBtns = $$('#results > .controls .seg button[data-label]'), zoomBtns = $$("#zoomSeg button");
    labBtns.forEach((b) => b.addEventListener("click", () => { label = b.dataset.label; labBtns.forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); }));
    zoomBtns.forEach((b) => b.addEventListener("click", () => { zoom = +b.dataset.z; zoomBtns.forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); }));
    // start with every point at the origin, then move them out when the plots are seen
    label = "multi";
    draw();
    if (!still) whenSeen(box, () => {
      $$(".pt", box).forEach((p) => { p.dataset.t = p.style.transform; p.style.transition = "none"; p.style.transform = `translate(${m.l}px, ${H - m.b}px)`; reflow(p); });
      twoFrames(() => $$(".pt", box).forEach((p, i) => { p.style.transition = ""; p.style.transitionDelay = `${(i % 12) * 40}ms`; p.style.transform = p.dataset.t; setTimeout(() => (p.style.transitionDelay = ""), 1400); }));
    }, 0.3);
  })();

  // ------------------------------------------------------------------ 06 results: the bigger lake
  (function lake() {
    const box = $("#lake");
    const W = 420, H = 270, m = { l: 40, r: 120, t: 16, b: 40 };
    const lines = [["AMIGO lazy", "var(--red)", ""], ["AMIGO whole judge", "var(--red-light)", "6 4"], ["LLM sets", "var(--series-navy)", ""]];
    let key = "CR";
    function draw(animate) {
      const v = (n, s) => D.merged[s][n][key];
      const all = lines.flatMap(([n]) => [v(n, "75"), v(n, "2097")]);
      const lo = Math.floor((Math.min(...all) - 3) / 5) * 5, hi = Math.ceil((Math.max(...all) + 2) / 5) * 5;
      const X = [m.l + 30, W - m.r - 10], Y = (x) => H - m.b - ((x - lo) / (hi - lo)) * (H - m.t - m.b);
      const ticks = []; for (let t = lo; t <= hi; t += hi - lo > 30 ? 10 : 5) ticks.push(t);
      let h = `<g class="grid">${ticks.map((t) => `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/>`).join("")}</g>
        <g class="axis">${ticks.map((t) => `<text x="${m.l - 7}" y="${Y(t) + 4}" text-anchor="end">${t}</text>`).join("")}
        <text x="${X[0]}" y="${H - m.b + 18}" text-anchor="middle">BIRD alone</text><text x="${X[0]}" y="${H - m.b + 33}" text-anchor="middle" class="axis-title">75 tables</text>
        <text x="${X[1]}" y="${H - m.b + 18}" text-anchor="middle">merged lake</text><text x="${X[1]}" y="${H - m.b + 33}" text-anchor="middle" class="axis-title">2,097 tables</text></g>`;
      const ends = [];
      lines.forEach(([n, c, dash]) => {
        const a = v(n, "75"), b = v(n, "2097"), len = Math.hypot(X[1] - X[0], Y(b) - Y(a));
        h += `<path class="drawline" d="M${X[0]} ${Y(a)}L${X[1]} ${Y(b)}" stroke="${c}" stroke-width="3" fill="none" ${dash ? `stroke-dasharray="${dash}"` : `stroke-dasharray="${len}" stroke-dashoffset="${animate ? len : 0}"`}/>`;
        const st = STYLE[n];
        h += `<g transform="translate(${X[0]} ${Y(a)})">${shape({ ...st, r: Math.min(st.r, 8) })}</g><g transform="translate(${X[1]} ${Y(b)})">${shape({ ...st, r: Math.min(st.r, 8) })}</g>`;
        ends.push([Y(b), `${st.lab === "lazy" ? "AMIGO lazy" : st.lab === "whole judge" ? "whole judge" : st.lab} ${fmt(b)}`, c, n, a]);
      });
      // labels at the right end, pushed apart when they collide
      ends.sort((p, q) => p[0] - q[0]);
      for (let i = 1; i < ends.length; i++) if (ends[i][0] - ends[i - 1][0] < 15) ends[i][0] = ends[i - 1][0] + 15;
      h += ends.map(([y, t]) => `<text x="${X[1] + 14}" y="${y + 4}" class="lab" font-weight="600">${t}</text>`).join("");
      const gap = v("AMIGO lazy", "2097") - v("LLM sets", "2097");
      h += `<text x="${X[1] - 14}" y="${(Y(v("AMIGO lazy", "2097")) + Y(v("LLM sets", "2097"))) / 2 + 5}" text-anchor="end" font-weight="800" font-family="Montserrat" font-size="16" style="fill:${gap >= 0 ? "var(--red)" : "var(--muted)"}">${gap >= 0 ? "+" : ""}${fmt(gap)}</text>`;
      box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${key} of AMIGO lazy, AMIGO whole judge and LLM sets on BIRD alone and on the merged lake">${h}</svg>
        <p class="note">${key}: AMIGO lazy loses ${fmt(v("AMIGO lazy", "75") - v("AMIGO lazy", "2097"))} points from 75 to 2,097 tables; LLM sets loses ${fmt(v("LLM sets", "75") - v("LLM sets", "2097"))}.${key === "P*" ? " Precision is a lower bound here: a table set of another benchmark counts as wrong." : ""}</p>`;
      if (animate) requestAnimationFrame(() => requestAnimationFrame(() => $$(".drawline", box).forEach((p) => { if (!p.getAttribute("stroke-dasharray").includes(" ")) p.setAttribute("stroke-dashoffset", 0); })));
    }
    $$("#lakeSeg button").forEach((b) => b.addEventListener("click", () => { key = b.dataset.k; $$("#lakeSeg button").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(!still); }));
    draw(false);
    if (!still) whenSeen(box, () => draw(true), 0.4);
  })();

  // ------------------------------------------------------------------ 06 results: SQL answers
  (function sql() {
    const box = $("#sql");
    const rows = [["Oracle", "Oracle", "none"], ["AMIGO lazy", "AMIGO lazy", "var(--red)"], ["CORE-T", "CORE-T", "var(--green)"],
      ["Route+SQL", "Route+SQL", "color-mix(in srgb, var(--green) 55%, var(--card))"], ["MURRE@3", "MURRE", "var(--grey)"], ["Dense@3", "Dense", "color-mix(in srgb, var(--grey) 60%, var(--card))"]];
    const bench = ["BIRD", "Spider", "MMQA"];
    let label = "multi";
    const W = 420, L = 96, R = 40, rh = 17;
    function draw(grow) {
      let y = 4, h = "";
      bench.forEach((b) => {
        const vals = D.sql[label][b];
        h += `<text x="0" y="${y + 14}" font-family="Montserrat" font-weight="700" font-size="14">${b}</text>`; y += 22;
        rows.forEach(([k, name, c]) => {
          const v = vals[k]; if (v == null) return;
          const w = ((W - L - R) * v) / 100;
          h += `<text class="lbl" x="${L - 8}" y="${y + 12}" text-anchor="end" ${k === "AMIGO lazy" ? 'font-weight="700"' : ""}>${name}</text>`;
          h += c === "none"
            ? `<rect class="grow" x="${L}" y="${y + 2}" height="${rh - 4}" width="${grow ? 0 : w}" data-w="${w}" rx="3" fill="none" stroke="var(--faint)" stroke-dasharray="3 3"/>`
            : `<rect class="grow" x="${L}" y="${y + 2}" height="${rh - 4}" width="${grow ? 0 : w}" data-w="${w}" rx="3" fill="${c}"/>`;
          h += `<text class="val" x="${L + w + 6}" y="${y + 12}">${fmt(v)}</text>`;
          y += rh;
        });
        y += 10;
      });
      box.innerHTML = `<svg viewBox="0 0 ${W} ${y}" class="bars" role="img" aria-label="Execution accuracy, ${label === "multi" ? "multi-valid" : "single-valid"} label">${h}</svg>
        <p class="note">Share of the expected answers that some written query returns. Oracle: one query per labeled table set. Route+SQL does not apply to MMQA.</p>`;
      if (grow) requestAnimationFrame(() => requestAnimationFrame(() => $$(".grow", box).forEach((r) => r.setAttribute("width", r.dataset.w))));
    }
    $$("#sqlSeg button").forEach((b) => b.addEventListener("click", () => { label = b.dataset.label; $$("#sqlSeg button").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(!still); }));
    draw(false);
    if (!still) whenSeen(box, () => draw(true), 0.3);
  })();

  // ------------------------------------------------------------------ 06 results: tight table sets
  (function tight() {
    const box = $("#tight"), rows = Object.entries(D.tight);
    const W = 760, L = 100, R = 120, rh = 28, X = (v) => L + (v / 1.4) * (W - L - R);
    let h = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4].map((v) => `<line x1="${X(v)}" x2="${X(v)}" y1="18" y2="${18 + rows.length * rh}" stroke="var(--line)" stroke-dasharray="2 4"/><text x="${X(v)}" y="${34 + rows.length * rh}" text-anchor="middle" class="small muted">${v.toFixed(1)}</text>`).join("");
    h += `<text x="${W - R + 16}" y="12" class="small muted" font-weight="600">SQL accuracy</text>`;
    rows.forEach(([name, [a, c, ea, ec]], i) => {
      const y = 32 + i * rh;
      h += `<text x="0" y="${y + 4}" class="lab" font-weight="600">${name}</text>
        <path d="M${X(a)} ${y}H${X(c)}" stroke="var(--line)" stroke-width="3"/>
        <circle cx="${X(c)}" cy="${y}" r="7" fill="var(--green)" stroke="var(--card)" stroke-width="1.6"/>
        <circle cx="${X(a)}" cy="${y}" r="7" fill="var(--red-light)" stroke="var(--card)" stroke-width="1.6"/>
        <text x="${W - R + 16}" y="${y + 4}" class="small"><tspan font-weight="700" fill="var(--red-ink)">${fmt(ea)}</tspan><tspan class="muted"> vs ${fmt(ec)}</tspan></text>`;
    });
    box.innerHTML = `<div class="legend" style="margin:6px 0 2px"><span style="display:inline-flex;gap:6px;align-items:center"><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="var(--red-light)"/></svg>AMIGO conservative</span><span style="display:inline-flex;gap:6px;align-items:center"><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="var(--green)"/></svg>CORE-T</span></div>
      <div class="scroll"><svg viewBox="0 0 ${W} ${48 + rows.length * rh}" style="min-width:520px" role="img" aria-label="Unneeded tables per set and SQL accuracy, AMIGO conservative against CORE-T">${h}</svg></div>
      <p class="note">Unneeded tables in the one table set of each method, over the answers whose tables both found. SV: single-valid label; MV: multi-valid.</p>`;
  })();

  // ------------------------------------------------------------------ 07 forks against ambiguity and complexity
  (function forks() {
    const box = $("#forkChart");
    const cols = { BIRD: ["var(--purple)", "circle"], Spider: ["var(--orange)", "square"], MMQA: ["var(--teal)", "triangle"] };
    const W = 720, H = 330, m = { l: 48, r: 90, t: 16, b: 46 };
    let key = "labeled_sets";
    function draw(animate) {
      const X = (x) => m.l + ((x - 0.7) / 3.6) * (W - m.l - m.r), Y = (v) => H - m.b - (v / 9) * (H - m.t - m.b);
      let h = `<g class="grid">${[0, 2, 4, 6, 8].map((v) => `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}"/>`).join("")}</g>
        <g class="axis">${[0, 2, 4, 6, 8].map((v) => `<text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join("")}
        ${[1, 2, 3, 4].map((x) => `<text x="${X(x)}" y="${H - m.b + 19}" text-anchor="middle">${x === 4 ? "4+" : x}</text>`).join("")}
        <text class="axis-title" x="${(m.l + W - m.r) / 2}" y="${H - 8}" text-anchor="middle">${key === "tables" ? "tables the question needs" : "valid table sets of the question"}</text>
        <text class="axis-title" transform="translate(13 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle">forks per question</text></g>`;
      const ends = [];
      Object.entries(D.forks[key]).forEach(([b, pts]) => {
        const [c, s] = cols[b], sh = b === "BIRD" ? -0.05 : b === "Spider" ? 0.05 : 0;
        if (!pts.length) return;
        h += `<path d="${pts.map((p, i) => `${i ? "L" : "M"}${X(p[0] + sh)} ${Y(p[2])}`).join("")}${pts.slice().reverse().map((p) => `L${X(p[0] + sh)} ${Y(p[3])}`).join("")}Z" fill="${c}" opacity=".13"/>`;
        const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0] + sh)} ${Y(p[1])}`).join("");
        h += `<path class="fl" d="${d}" stroke="${c}" stroke-width="3" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${animate ? 1 : 0}" style="transition: stroke-dashoffset 1.2s ease"/>`;
        pts.forEach((p) => {
          h += `<path d="M${X(p[0] + sh)} ${Y(p[2])}V${Y(p[3])}" stroke="${c}" stroke-width="1.6"/>`;
          h += `<g class="fp" transform="translate(${X(p[0] + sh)} ${Y(p[1])})" data-t="${b}: ${fmt(p[1], 2)} forks on average (95% interval ${fmt(p[2], 2)} to ${fmt(p[3], 2)}), ${p[4]} questions">${shape({ c: "--card", s, r: 7.5 }).replace('fill="var(--card)"', `fill="${c}"`)}<circle r="12" fill="transparent"/></g>`;
        });
        const last = pts[pts.length - 1];
        ends.push([Y(last[1]) + 5, X(last[0] + sh) + 14, b, c]);
      });
      // names at the end of each line, pushed apart when they collide
      ends.sort((p, q) => p[0] - q[0]);
      for (let i = 1; i < ends.length; i++) if (ends[i][0] - ends[i - 1][0] < 16) ends[i][0] = ends[i - 1][0] + 16;
      h += ends.map(([y, x, b, c]) => `<text x="${x}" y="${y}" font-weight="700" font-size="14" style="fill:${c}">${b}</text>`).join("");
      box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Forks per question against ${key === "tables" ? "the tables needed" : "the valid table sets"}">${h}</svg>`;
      if (animate) twoFrames(() => $$(".fl", box).forEach((p) => p.setAttribute("stroke-dashoffset", 0)));
    }
    box.addEventListener("mousemove", (e) => { const p = e.target.closest(".fp"); if (p) showTip(e, p.dataset.t); else hideTip(); });
    box.addEventListener("mouseleave", hideTip);
    $$("#forkSeg button").forEach((b) => b.addEventListener("click", () => { key = b.dataset.k; $$("#forkSeg button").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(!still); }));
    draw(false);
    if (!still) whenSeen(box, () => draw(true), 0.3);
  })();
})();
