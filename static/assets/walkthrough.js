/* ============================================================
   LIVING CHESS — How It Works interactive walkthrough
   propose → King curates 3 → cast a weighted vote → result
   ============================================================ */
(function () {
  const demo = document.getElementById("demo");
  const stepsRail = document.getElementById("steps");
  if (!demo) return;

  const crown = '<svg class="crown" viewBox="0 0 24 24" fill="none"><path d="M4 8l3.5 3L12 5l4.5 6L20 8l-1.5 10h-13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const kingSvg = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v5M9.5 5.5h5M5 11l3 8h8l3-8-4.5 3L12 8l-2.5 6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';

  const YOU = { name: "You", role: "Knight · your piece", glyph: "\u265E", weight: 3.0 };

  const state = {
    step: 0,
    proposals: [
      { mv: "e4",  by: "Pawn · w 1.0" },
      { mv: "Nf3", by: "Knight · w 3.0" },
      { mv: "d4",  by: "Queen · w 9.0" },
      { mv: "c4",  by: "Bishop · w 3.5" },
      { mv: "Bb5", by: "Rook · w 5.0" },
    ],
    shortlist: ["e4", "d4", "Bb5"],     // the King's three
    base: { e4: 7.0, d4: 9.0, Bb5: 6.0 }, // weight already committed by others
    vote: null,
  };

  const esc = (s) => String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

  /* ---------- renderers ---------- */
  function head(phase, blue, timer) {
    return `<div class="demo__head">
      <span class="demo__phase ${blue ? "blue" : ""}">${phase}</span>
      <span class="demo__timer"><span class="ring"></span>${timer}</span>
    </div>`;
  }

  function whoCard() {
    return `<div class="who">
      <div class="who__disc">${YOU.glyph}</div>
      <div class="who__meta"><b>${YOU.name}</b><span>${YOU.role}</span></div>
      <div class="who__weight"><b>${YOU.weight.toFixed(1)}</b><span>YOUR WEIGHT</span></div>
    </div>`;
  }

  function renderPropose() {
    const feed = state.proposals.map(p =>
      `<div class="move-card"><span class="mv">${esc(p.mv)}</span><span class="by">${esc(p.by)}</span><span class="cnt">proposed</span></div>`
    ).join("");
    demo.innerHTML = head("Stage 01 · Suggestion phase — open to all", false, "Anyone can propose") +
      `<div class="demo__body">
        ${whoCard()}
        <div class="proposes">
          <div class="propose-input">
            <input id="propInput" type="text" placeholder="Propose a move…  e.g. Bc4" maxlength="8" autocomplete="off" />
            <button class="btn btn--gold" id="propBtn">Propose</button>
          </div>
          <div class="chiprow">
            <button class="chip" data-mv="Bc4">Bc4</button>
            <button class="chip" data-mv="g3">g3</button>
            <button class="chip" data-mv="Nc3">Nc3</button>
            <button class="chip" data-mv="e5">e5</button>
            <button class="chip" data-mv="O-O">O-O</button>
          </div>
          <div class="feed" id="feed">${feed}</div>
        </div>
        <div class="demo__foot">
          <span class="result-note"><b>${state.proposals.length}</b> proposals on the board — the King will keep only three.</span>
          <button class="btn btn--ghost" data-go="1">Send to the King →</button>
        </div>
      </div>`;
    const input = demo.querySelector("#propInput");
    const add = () => {
      const v = input.value.trim();
      if (!v) return;
      state.proposals.unshift({ mv: v, by: `${YOU.name} · w ${YOU.weight.toFixed(1)}` });
      input.value = "";
      renderPropose(); demo.querySelector("#propInput").focus();
    };
    demo.querySelector("#propBtn").addEventListener("click", add);
    input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); add(); } });
    demo.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => { input.value = c.dataset.mv; add(); }));
  }

  function renderCurate() {
    const cards = state.proposals.map(p => {
      const picked = state.shortlist.includes(p.mv);
      return `<div class="move-card ${picked ? "picked" : "dim"}" data-mv="${esc(p.mv)}">
        ${crown}<span class="mv">${esc(p.mv)}</span><span class="by">${esc(p.by)}</span>
        <span class="cnt">${picked ? "shortlisted" : "set aside"}</span></div>`;
    }).join("");
    demo.innerHTML = head("Stage 02 · Curation — the King decides what advances", false, "King curating") +
      `<div class="demo__body">
        <div class="king-banner">${kingSvg}<p>The <b>King never votes.</b> Instead they curate — choosing exactly <b>three</b> proposals from the board to move forward to the weighted vote.</p></div>
        <div class="feed" id="feed">${cards}</div>
        <div class="demo__foot">
          <span class="result-note">Three advance: <b>${state.shortlist.join(" · ")}</b></span>
          <button class="btn btn--ghost" data-go="2">Open the vote →</button>
        </div>
      </div>`;
    // animate the cut: start neutral, then reveal
    const feed = demo.querySelector("#feed");
    feed.querySelectorAll(".move-card").forEach(c => { c.classList.add("neutral"); });
    feed.querySelectorAll(".move-card").forEach(c => { c.classList.remove("picked", "dim"); });
    setTimeout(() => {
      feed.querySelectorAll(".move-card").forEach(c => {
        const picked = state.shortlist.includes(c.dataset.mv);
        c.classList.add(picked ? "picked" : "dim");
      });
    }, 420);
  }

  function tallies() {
    const t = Object.assign({}, state.base);
    if (state.vote) t[state.vote] += YOU.weight;
    return t;
  }

  function renderVote() {
    const t = tallies();
    const max = Math.max(...Object.values(t));
    const leader = Object.keys(t).find(k => t[k] === max);
    const SCALE = 16;
    const opts = state.shortlist.map(mv => {
      const lead = mv === leader;
      const chosen = state.vote === mv;
      return `<div class="vote-opt ${chosen ? "chosen" : ""} ${lead ? "lead" : ""}" data-mv="${mv}">
        <div class="vote-opt__top">
          <span class="vote-opt__mv">${mv}</span>
          ${lead ? '<span class="label" style="color:var(--gold)">LEADING</span>' : ""}
          <span class="vote-opt__radio"></span>
        </div>
        <div class="vote-meter"><i style="width:${Math.round(t[mv] / SCALE * 100)}%"></i></div>
        <div class="vote-opt__foot"><span>weight tally</span><b>${t[mv].toFixed(1)}</b></div>
      </div>`;
    }).join("");
    demo.innerHTML = head("Stage 03 · Weighted vote — everyone decides", true, "Voting round 03") +
      `<div class="demo__body">
        <div class="your-weight">Your ballot carries <b>${YOU.weight.toFixed(1)}×</b> weight as a Knight. A pawn would carry 1.0; the queen, 9.0. Pick a move.</div>
        <div class="vote-list" id="voteList">${opts}</div>
        <div class="demo__foot">
          <span class="result-note">${state.vote ? `You voted <b>${state.vote}</b> — ${leader === state.vote ? "and it's leading." : `<b>${leader}</b> is ahead.`}` : "Cast your weighted ballot above."}</span>
          <button class="btn ${state.vote ? "btn--gold" : "btn--ghost"}" data-go="3" ${state.vote ? "" : 'disabled style="opacity:.45;pointer-events:none"'}>See the result →</button>
        </div>
      </div>`;
    demo.querySelectorAll(".vote-opt").forEach(o =>
      o.addEventListener("click", () => { state.vote = o.dataset.mv; renderVote(); })
    );
  }

  function renderResult() {
    const t = tallies();
    const sorted = Object.keys(t).sort((a, b) => t[b] - t[a]);
    const win = sorted[0];
    const rows = sorted.map((mv, i) =>
      `<div class="tally-row ${i === 0 ? "win" : ""}" style="display:grid;grid-template-columns:54px 1fr auto;gap:12px;align-items:center;margin:7px 0;">
        <span class="tn" style="font-family:var(--mono);font-size:12px;color:${i === 0 ? "var(--gold-soft)" : "var(--muted)"}">${mv}</span>
        <span class="tally-bar" style="height:7px;border-radius:5px;background:rgba(255,255,255,.06);overflow:hidden"><i style="display:block;height:100%;width:${Math.round(t[mv] / Math.max(...Object.values(t)) * 100)}%;border-radius:5px;background:${i === 0 ? "linear-gradient(90deg,var(--gold),var(--gold-soft))" : "linear-gradient(90deg,var(--blue),var(--blue-soft))"}"></i></span>
        <span class="tv" style="font-family:var(--mono);font-size:12px;color:var(--faint)">${t[mv].toFixed(1)}</span>
      </div>`
    ).join("");
    demo.innerHTML = head("Stage 04 · The move is made", false, "Cycle resolved") +
      `<div class="demo__body">
        <div class="king-banner" style="background:rgba(232,179,65,.07);border-color:rgba(232,179,65,.35)">
          ${kingSvg}
          <p>The team plays <b>${win}</b> — carried by <b>${t[win].toFixed(1)}</b> of weighted votes${state.vote === win ? ", including yours" : ""}. The piece moves; the board resets; the next cycle begins.</p>
        </div>
        <div style="margin:18px 0 4px">${rows}</div>
        <div class="demo__foot">
          <span class="result-note">One move took <b>3 stages</b> and <b>${state.proposals.length} ideas</b> to make.</span>
          <button class="btn btn--gold" data-go="reset">Run another cycle ↻</button>
        </div>
      </div>`;
  }

  const renderers = [renderPropose, renderCurate, renderVote, renderResult];

  function go(step) {
    if (step === "reset") { state.vote = null; step = 0; }
    state.step = step;
    renderers[step]();
    stepsRail.querySelectorAll(".step").forEach(s => s.classList.toggle("active", +s.dataset.step === step));
  }

  // delegate "next/go" buttons
  demo.addEventListener("click", e => {
    const b = e.target.closest("[data-go]");
    if (b) go(b.dataset.go === "reset" ? "reset" : +b.dataset.go);
  });
  // left rail clicks
  stepsRail.querySelectorAll(".step").forEach(s =>
    s.addEventListener("click", () => go(+s.dataset.step))
  );

  go(0);
})();
