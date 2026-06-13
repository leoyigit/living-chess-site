/* ============================================================
   LIVING CHESS — site behaviour
   nav · reveals · countdown · date picker · forms · TWEAKS
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- nav stuck ---------- */
  const nav = $("#nav");
  // Inner pages: always show the frosted nav bar
  if (window.location.pathname !== "/") nav?.classList.add("is-stuck");
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 24);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- active nav link ---------- */
  const path = window.location.pathname;
  $$(".nav__links a, .mobile-menu__nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (href && !href.startsWith("/#") && href !== "/" && path.startsWith(href)) {
      a.classList.add("nav-active");
    }
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

  // Observe explicitly-marked reveal elements
  $$(".reveal").forEach(el => io.observe(el));

  // Section headers: container gets .in → CSS cascades to children
  $$(".sec-head").forEach(el => io.observe(el));

  // Auto-stagger children inside .stagger containers
  $$(".stagger").forEach(container => {
    Array.from(container.children).forEach((child, i) => {
      if (!child.classList.contains("reveal")) child.classList.add("reveal");
      child.dataset.delay = String(Math.min(i + 1, 8));
      io.observe(child);
    });
  });

  // Subtle parallax on the atmospheric gradient
  const atmos = $(".atmos");
  if (atmos) {
    window.addEventListener("scroll", () => {
      atmos.style.transform = `translateY(${window.scrollY * 0.12}px)`;
    }, { passive: true });
  }

  /* ---------- countdown to next Saturday 18:00 CET (UTC+1) ---------- */
  function nextSession(from) {
    // Sessions are Sundays (UTC day 0)
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 17, 0, 0));
    while (d.getUTCDay() !== 0 || d.getTime() <= from.getTime()) d.setUTCDate(d.getUTCDate() + 1);
    return d;
  }
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  if (cd.d) {
    const pad = n => String(n).padStart(2, "0");
    const tick = () => {
      const now = new Date();
      let diff = Math.max(0, nextSession(now) - now);
      const day = Math.floor(diff / 864e5); diff -= day * 864e5;
      const hr  = Math.floor(diff / 36e5);  diff -= hr  * 36e5;
      const mn  = Math.floor(diff / 6e4);   diff -= mn  * 6e4;
      const sc  = Math.floor(diff / 1e3);
      cd.d.textContent = pad(day); cd.h.textContent = pad(hr);
      cd.m.textContent = pad(mn);  cd.s.textContent = pad(sc);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- date picker (server-rendered; just handle selection) ---------- */
  const datesEl = $("#dates");
  if (datesEl) {
    datesEl.addEventListener("click", e => {
      const b = e.target.closest(".date-opt");
      if (!b || b.classList.contains("full")) return;
      $$(".date-opt", datesEl).forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
    });
  }

  /* ---------- registration form → POST /api/register ---------- */
  const regForm = $("#regForm");
  if (regForm) {
    const regBtn = $("#regBtn");
    regForm.addEventListener("submit", async e => {
      e.preventDefault();
      const name  = $("#rn").value.trim();
      const email = $("#re").value.trim();
      const piece = $("#rp").value;
      const dateEl = $(".date-opt.sel");
      const dateIdx = dateEl ? +dateEl.dataset.i : 0;

      if (name.length < 2 || !/.+@.+\..+/.test(email)) {
        regForm.classList.add("shake");
        setTimeout(() => regForm.classList.remove("shake"), 400);
        return;
      }

      const orig = regBtn.innerHTML;
      regBtn.disabled = true;
      regBtn.textContent = "Reserving…";

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, piece_pref: piece, date_idx: dateIdx }),
        });
        const data = await res.json();
        if (data.ok) {
          regBtn.innerHTML = "Seat reserved ✓";
          regBtn.style.background = "linear-gradient(180deg,#7fd29a,#46a86a)";
          regBtn.style.color = "#06120a";
          setTimeout(() => {
            regBtn.innerHTML = orig; regBtn.style.background = "";
            regBtn.style.color = ""; regBtn.disabled = false; regForm.reset();
          }, 3000);
        } else {
          regBtn.innerHTML = orig; regBtn.disabled = false;
          regForm.classList.add("shake");
          setTimeout(() => regForm.classList.remove("shake"), 400);
        }
      } catch {
        regBtn.innerHTML = orig; regBtn.disabled = false;
      }
    });
  }

  /* ---------- newsletter form → POST /api/newsletter ---------- */
  const newsForm = $("#newsForm");
  if (newsForm) {
    const newsBtn = $("#newsBtn");
    newsForm.addEventListener("submit", async e => {
      e.preventDefault();
      const email = $("#newsEmail").value.trim();
      if (!/.+@.+\..+/.test(email)) {
        newsForm.classList.add("shake");
        setTimeout(() => newsForm.classList.remove("shake"), 400);
        return;
      }

      const orig = newsBtn.innerHTML;
      newsBtn.disabled = true;
      newsBtn.textContent = "Subscribing…";

      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.ok) {
          newsBtn.innerHTML = "Subscribed ✓";
          newsBtn.style.background = "linear-gradient(180deg,#7fd29a,#46a86a)";
          newsBtn.style.color = "#06120a";
          setTimeout(() => {
            newsBtn.innerHTML = orig; newsBtn.style.background = "";
            newsBtn.style.color = ""; newsBtn.disabled = false; newsForm.reset();
          }, 3000);
        } else {
          newsBtn.innerHTML = orig; newsBtn.disabled = false;
        }
      } catch {
        newsBtn.innerHTML = orig; newsBtn.disabled = false;
      }
    });
  }

  /* ============================================================
     TWEAKS
     ============================================================ */
  const ACCENTS = {
    duo:   { gold: "#E8B341", goldSoft: "#F6D584", goldDeep: "#B07E1C", blue: "#6B8AFF", blueSoft: "#A7BBFF" },
    gold:  { gold: "#E8B341", goldSoft: "#F6D584", goldDeep: "#B07E1C", blue: "#D9A24A", blueSoft: "#F0C97A" },
    amber: { gold: "#F0A92E", goldSoft: "#FAD27E", goldDeep: "#B57A12", blue: "#3FB8A6", blueSoft: "#86D8CC" },
    rose:  { gold: "#E0A48B", goldSoft: "#F2C9B6", goldDeep: "#B57A60", blue: "#8893A8", blueSoft: "#B8C0D0" },
  };
  const T = Object.assign({ accent: "duo", font: "serif", hero: "flow", grain: "on" }, window.__TWEAKS || {});

  function applyAll() {
    const a = ACCENTS[T.accent] || ACCENTS.duo;
    const rs = document.documentElement.style;
    rs.setProperty("--gold",      a.gold);     rs.setProperty("--gold-soft", a.goldSoft);
    rs.setProperty("--gold-deep", a.goldDeep); rs.setProperty("--blue",      a.blue);
    rs.setProperty("--blue-soft", a.blueSoft);
    document.body.dataset.accent = T.accent;
    document.body.dataset.font   = T.font;
    document.body.dataset.grain  = T.grain;
    if (document.body.dataset.hero !== T.hero) {
      document.body.dataset.hero = T.hero;
      if (window.__heroRestart) window.__heroRestart();
    } else {
      document.body.dataset.hero = T.hero;
    }
    syncButtons();
  }

  function syncButtons() {
    $$("#tw-accent button").forEach(b => b.classList.toggle("on", b.dataset.v === T.accent));
    [["#tw-font", "font"], ["#tw-hero", "hero"], ["#tw-grain", "grain"]].forEach(([sel, key]) =>
      $$(sel + " .tw-opt").forEach(b => b.classList.toggle("on", b.dataset.v === T[key]))
    );
  }

  function bindGroup(sel, key) {
    $$(sel + " button").forEach(b => b.addEventListener("click", () => { T[key] = b.dataset.v; applyAll(); }));
  }
  bindGroup("#tw-accent", "accent");
  bindGroup("#tw-font",   "font");
  bindGroup("#tw-hero",   "hero");
  bindGroup("#tw-grain",  "grain");

  applyAll();

  /* panel open/close */
  const panel  = $("#tweaks");
  const open   = () => panel.classList.add("open");
  const close  = () => panel.classList.remove("open");
  $("#tweaksClose")?.addEventListener("click", close);

  window.addEventListener("message", e => {
    const t = e.data && e.data.type;
    if (t === "__activate_edit_mode")   open();
    if (t === "__deactivate_edit_mode") close();
  });
  try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch (_) {}

  /* ---------- blog: table of contents + active heading ---------- */
  const tocList   = $("#tocList");
  const tocToggle = $("#tocToggle");
  const tocNav    = $("#tocNav");
  const article   = $("#articleBody");
  if (tocList && article) {
    // Build TOC from h2/h3 headings
    const headings = $$("h2, h3", article);
    headings.forEach((h, i) => {
      if (!h.id) h.id = "section-" + i;
      const li = document.createElement("li");
      li.className = "toc-item toc-item--" + h.tagName.toLowerCase();
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
    });

    // Remove TOC sidebar if no headings
    if (headings.length === 0) {
      document.querySelector(".article-toc")?.remove();
    }

    // Highlight active heading on scroll
    const tocLinks = $$("a", tocList);
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove("is-active"));
          const active = tocList.querySelector(`a[href="#${e.target.id}"]`);
          if (active) active.classList.add("is-active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    headings.forEach(h => io2.observe(h));

    // Toggle TOC
    if (tocToggle) {
      tocToggle.addEventListener("click", () => {
        const expanded = tocToggle.getAttribute("aria-expanded") === "true";
        tocToggle.setAttribute("aria-expanded", String(!expanded));
        tocNav?.classList.toggle("is-hidden", expanded);
      });
    }
  }

  /* ---------- mobile hamburger menu ---------- */
  const burger     = $("#navBurger");
  const mobileMenu = $("#mobileMenu");
  if (burger && mobileMenu) {
    const openMenu = () => {
      burger.classList.add("is-open");
      mobileMenu.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      mobileMenu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const closeMenu = () => {
      burger.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };
    burger.addEventListener("click", () =>
      burger.classList.contains("is-open") ? closeMenu() : openMenu()
    );
    $$("a", mobileMenu).forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- dark / light theme toggle ---------- */
  const themeBtn = $("#themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const html = document.documentElement;
      const next = html.dataset.theme === "light" ? "dark" : "light";

      // Brief class enables smooth transitions on everything
      html.classList.add("lc-switching");
      html.dataset.theme = next;
      localStorage.setItem("lc-theme", next);
      setTimeout(() => html.classList.remove("lc-switching"), 400);
    });
  }
})();
