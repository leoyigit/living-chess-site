/* ============================================================
   LIVING CHESS — hero board: looping decision cycle (SVG)
   suggestion → curation → weighted vote → the move → repeat
   ============================================================ */
(function () {
  const SVG = "http://www.w3.org/2000/svg";
  const board = document.getElementById("board");
  const stage = document.getElementById("stage");
  const tally = document.getElementById("stageTally");
  const phaseText = document.getElementById("phaseText");
  const phasePill = document.getElementById("phasePill");
  const phaseCycle = document.getElementById("phaseCycle");
  if (!board) return;

  const N = (t, a = {}) => { const e = document.createElementNS(SVG, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const cell = (c) => 90 + c * 60;          // center x/y for column/row 0..7

  /* ---- the cast ---- */
  const pieces = [
    { id: "K", glyph: "\u265A", col: 4, row: 7, wt: "—",  cls: "king" },
    { id: "Q", glyph: "\u265B", col: 3, row: 6, wt: "9.0" },
    { id: "R", glyph: "\u265C", col: 0, row: 7, wt: "5.0" },
    { id: "B", glyph: "\u265D", col: 5, row: 6, wt: "3.5" },
    { id: "N", glyph: "\u265E", col: 1, row: 6, wt: "3.0" },
    { id: "pa", glyph: "\u265F", col: 2, row: 5, wt: "1.0" },
    { id: "pb", glyph: "\u265F", col: 4, row: 5, wt: "1.0" },
    { id: "pc", glyph: "\u265F", col: 6, row: 5, wt: "1.0" },
  ];
  const P = Object.fromEntries(pieces.map(p => [p.id, p]));

  /* ---- candidate moves proposed this cycle ---- */
  const candidates = [
    { id: "d4",  col: 3, row: 4, label: "d4",  short: true,  voters: ["R", "pa"],        weight: 6.0 },
    { id: "e4",  col: 4, row: 4, label: "e4",  short: true,  voters: ["Q", "N", "pb"],   weight: 13.0, win: true, mover: "pb" },
    { id: "Bc4", col: 5, row: 4, label: "Bc4", short: true,  voters: ["B", "pc"],        weight: 4.5 },
    { id: "c4",  col: 2, row: 4, label: "c4",  short: false, voters: [] },
    { id: "Nf3", col: 1, row: 5, label: "Nf3", short: false, voters: [] },
  ];
  const MAXW = 13.0;

  /* ---- build static board ---- */
  const gGrid = N("g", { class: "b-grid" });
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    gGrid.appendChild(N("rect", { class: "b-square" + ((r + c) % 2 ? " alt" : ""), x: 60 + c * 60, y: 60 + r * 60, width: 60, height: 60 }));
  }
  for (let i = 0; i <= 8; i++) {
    gGrid.appendChild(N("line", { x1: 60, y1: 60 + i * 60, x2: 540, y2: 60 + i * 60 }));
    gGrid.appendChild(N("line", { x1: 60 + i * 60, y1: 60, x2: 60 + i * 60, y2: 540 }));
  }
  board.appendChild(gGrid);

  const gEdges = N("g", {}); board.appendChild(gEdges);

  /* candidates */
  const candEls = {};
  const gC = N("g", {});
  candidates.forEach(cd => {
    const g = N("g", { class: "cand" + (cd.short ? "" : ""), "data-id": cd.id });
    const x = cell(cd.col), y = cell(cd.row);
    g.appendChild(N("circle", { cx: x, cy: y, r: 23 }));
    const t = N("text", { x: x, y: y + 1, "text-anchor": "middle", "dominant-baseline": "central" });
    t.textContent = cd.label; g.appendChild(t);
    gC.appendChild(g); candEls[cd.id] = g;
  });
  board.appendChild(gC);

  /* trail (drawn behind moving node) */
  const trail = N("path", { class: "trail", d: "" }); board.appendChild(trail);

  /* nodes */
  const nodeEls = {};
  const gN = N("g", {});
  pieces.forEach(p => {
    const x = cell(p.col), y = cell(p.row);
    const g = N("g", { class: "node-g", "data-id": p.id, transform: `translate(${x},${y})` });
    const inner = N("g", { class: "node " + (p.cls || "") });
    inner.appendChild(N("circle", { class: "halo", cx: 0, cy: 0, r: 28 }));
    inner.appendChild(N("circle", { class: "disc", cx: 0, cy: 0, r: 22 }));
    const gl = N("text", { class: "glyph", x: 0, y: 1 }); gl.textContent = p.glyph; inner.appendChild(gl);
    const wt = N("text", { class: "wt", x: 0, y: 34 }); wt.textContent = p.wt === "—" ? "KING" : p.wt; inner.appendChild(wt);
    g.appendChild(inner); gN.appendChild(g);
    nodeEls[p.id] = { g, inner, home: { x, y } };
  });
  board.appendChild(gN);

  /* tally rows in HUD */
  const tallyOrder = ["e4", "d4", "Bc4"];
  tally.innerHTML = tallyOrder.map(id => {
    const cd = candidates.find(c => c.id === id);
    return `<div class="tally-row${cd.win ? " win" : ""}" data-id="${id}">
      <span class="tn">${cd.label}</span>
      <span class="tally-bar"><i></i></span>
      <span class="tv">${cd.weight.toFixed(1)}</span></div>`;
  }).join("");

  /* ---- helpers ---- */
  const edge = (from, to, cls) => {
    const a = nodeEls[from] ? nodeEls[from].home : { x: cell(P[from].col), y: cell(P[from].row) };
    const x1 = a.x, y1 = a.y, x2 = cell(to.col), y2 = cell(to.row);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.18 - 18;
    const e = N("path", { class: "edge " + cls, d: `M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}` });
    gEdges.appendChild(e);
    return e;
  };
  const clearEdges = () => { gEdges.innerHTML = ""; };
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  /* ---- cycle state machine ---- */
  let runId = 0, cycle = 1;

  function resetVisuals() {
    clearEdges();
    candidates.forEach(cd => { candEls[cd.id].classList.remove("short", "drop", "winner"); });
    Object.values(nodeEls).forEach(n => { n.inner.classList.remove("voting", "mover"); });
    nodeEls["pb"].g.setAttribute("transform", `translate(${nodeEls["pb"].home.x},${nodeEls["pb"].home.y})`);
    trail.classList.remove("show"); trail.setAttribute("d", "");
    tally.querySelectorAll(".tally-bar i").forEach(i => i.style.width = "0%");
  }

  function setPhase(k, txt) {
    stage.dataset.phase = k;
    phasePill.dataset.k = k;
    phaseText.textContent = txt;
  }

  async function cycleOnce(id) {
    const mode = document.body.dataset.hero; // flow | calm | off
    const flow = mode === "flow";
    const t = mode === "calm" ? 1.45 : 1;   // time multiplier
    const alive = () => id === runId;

    resetVisuals();
    phaseCycle.textContent = "CYCLE " + String(cycle).padStart(3, "0");

    /* 1 — SUGGESTION */
    setPhase("1", "01 · Suggestion");
    candidates.forEach(cd => {
      cd.voters.concat(cd.short ? [] : (cd.id === "c4" ? ["pa"] : ["N"])).forEach(src => {
        const e = edge(src, cd, "show" + (flow ? " flow" : ""));
      });
    });
    // a few extra proposal lines for liveliness
    edge("Q", candidates[3], "show" + (flow ? " flow" : ""));
    edge("B", candidates[4], "show" + (flow ? " flow" : ""));
    await wait(3000 * t); if (!alive()) return;

    /* 2 — CURATION (King picks 3) */
    setPhase("2", "02 · Curation");
    clearEdges();
    candidates.forEach(cd => {
      if (cd.short) candEls[cd.id].classList.add("short");
      else candEls[cd.id].classList.add("drop");
    });
    await wait(2500 * t); if (!alive()) return;

    /* 3 — WEIGHTED VOTE */
    setPhase("3", "03 · Weighted vote");
    clearEdges();
    candidates.filter(c => c.short).forEach(cd => {
      cd.voters.forEach(v => {
        nodeEls[v].inner.classList.add("voting");
        const w = Math.max(1.6, parseFloat(P[v].wt) * 0.55);
        const e = edge(v, cd, "vote" + (cd.win ? " gold" : ""));
        e.style.strokeWidth = w.toFixed(2);
        requestAnimationFrame(() => e.classList.add("show"));
      });
    });
    // fill tally bars
    await wait(120);
    tally.querySelectorAll(".tally-row").forEach(row => {
      const cd = candidates.find(c => c.id === row.dataset.id);
      row.querySelector("i").style.width = Math.round(cd.weight / MAXW * 100) + "%";
    });
    await wait(3200 * t); if (!alive()) return;

    /* 4 — THE MOVE */
    setPhase("4", "04 · The move");
    const winner = candidates.find(c => c.win);
    candEls[winner.id].classList.add("winner");
    const mv = nodeEls[winner.mover];
    mv.inner.classList.add("mover");
    const from = mv.home, to = { x: cell(winner.col), y: cell(winner.row) };
    trail.setAttribute("d", `M${from.x} ${from.y} L ${to.x} ${to.y}`);
    trail.classList.add("show");
    mv.g.setAttribute("transform", `translate(${to.x},${to.y})`);
    await wait(3000 * t); if (!alive()) return;

    cycle++;
  }

  async function loop(id) {
    while (id === runId && document.body.dataset.hero !== "off") {
      await cycleOnce(id);
    }
  }

  function staticResolved() {
    // show the resolved state once, no animation
    resetVisuals();
    setPhase("4", "04 · The move");
    candidates.forEach(cd => { if (cd.short) candEls[cd.id].classList.add("short"); else candEls[cd.id].classList.add("drop"); });
    const winner = candidates.find(c => c.win);
    candEls[winner.id].classList.add("winner");
    tally.querySelectorAll(".tally-row").forEach(row => {
      const cd = candidates.find(c => c.id === row.dataset.id);
      row.querySelector("i").style.width = Math.round(cd.weight / MAXW * 100) + "%";
    });
    const mv = nodeEls[winner.mover];
    mv.inner.classList.add("mover");
    mv.g.setAttribute("transform", `translate(${cell(winner.col)},${cell(winner.row)})`);
  }

  // public restart hook (called by tweaks / observers)
  window.__heroRestart = function () {
    runId++;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.body.dataset.hero === "off" || reduce) { staticResolved(); }
    else { loop(runId); }
  };

  // start when visible (avoid running off-screen forever, but it's hero so just start)
  window.__heroRestart();
})();
