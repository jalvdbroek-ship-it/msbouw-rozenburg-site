/* MSBouw: gedrag en beweging. GSAP + ScrollTrigger alleen waar beweging iets vertelt. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const HEADER = 72;

  /* ---------- header en menu ---------- */
  const header = $("[data-header]");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = $(".menu-btn");
  const setMenu = (open) => {
    root.classList.toggle("nav-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector(".menu-btn__label").textContent = open ? "Sluit" : "Menu";
  };
  if (menuBtn) {
    menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
    $$(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("nav-open")) { setMenu(false); menuBtn.focus(); }
    });
    matchMedia("(min-width: 900px)").addEventListener("change", (e) => e.matches && setMenu(false));
  }

  /* ---------- voor en na: handmatige slider (altijd beschikbaar) ---------- */
  $$("[data-ba]").forEach((ba) => {
    const input = $("input", ba);
    const set = (v) => ba.style.setProperty("--pos", v);
    input.addEventListener("input", () => set(input.value));
    set(input.value);
  });

  /* ---------- diensten: voorbeeldfoto volgt de cursor ---------- */
  const list = $("[data-svc-list]");
  if (list && matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)").matches) {
    const peek = document.createElement("div");
    peek.className = "svc-peek";
    peek.setAttribute("aria-hidden", "true");
    const imgs = {};
    $$("[data-peek]", list).forEach((row) => {
      const n = row.dataset.peek;
      if (imgs[n]) return;
      const im = new Image();
      im.alt = "";
      im.src = `assets/img/${n}.webp`;
      peek.appendChild(im);
      imgs[n] = im;
    });
    document.body.appendChild(peek);
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      peek.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = peek.classList.contains("is-on") || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const show = (n) => { Object.entries(imgs).forEach(([k, im]) => im.classList.toggle("is-on", k === n)); peek.classList.add("is-on"); if (!raf) raf = requestAnimationFrame(loop); };
    $$(".svc", list).forEach((row) => {
      row.addEventListener("pointerenter", (e) => { tx = x = e.clientX + 36; ty = y = e.clientY - 150; if (row.dataset.peek) show(row.dataset.peek); });
      row.addEventListener("pointermove", (e) => { tx = e.clientX + 36; ty = e.clientY - 150; });
      row.addEventListener("pointerleave", () => peek.classList.remove("is-on"));
    });
  }

  /* ---------- projecten: filter en lightbox ---------- */
  const chips = $$("[data-filter]");
  if (chips.length) {
    const items = $$("[data-cat]");
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      const f = chip.dataset.filter;
      items.forEach((it) => { it.hidden = !(f === "alle" || it.dataset.cat.split(" ").includes(f)); });
      const live = $("#filter-live");
      if (live) live.textContent = `${items.filter((i) => !i.hidden).length} foto's getoond`;
      window.ScrollTrigger && window.ScrollTrigger.refresh();
    }));
  }
  const box = $("#lightbox");
  if (box) {
    const buttons = $$("[data-zoom]");
    const img = $("img", box), cap = $(".lightbox__cap", box);
    let idx = 0, opener = null;
    const visible = () => buttons.filter((b) => !b.closest("[data-cat]").hidden);
    const show = (i) => {
      const v = visible(); idx = (i + v.length) % v.length;
      const b = v[idx];
      img.src = b.dataset.zoom; img.alt = b.dataset.alt; cap.textContent = b.dataset.alt;
    };
    buttons.forEach((b) => b.addEventListener("click", () => { opener = b; show(visible().indexOf(b)); box.showModal(); }));
    $(".lb-prev", box).addEventListener("click", () => show(idx - 1));
    $(".lb-next", box).addEventListener("click", () => show(idx + 1));
    $(".lb-close", box).addEventListener("click", () => box.close());
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
    box.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });
    box.addEventListener("close", () => opener && opener.focus());
  }

  /* ---------- offerteformulier ---------- */
  const form = $("[data-offerte]");
  if (form) {
    const status = $("[data-status]", form.parentElement);
    const sendBtn = $("[type=submit]", form);
    const rules = {
      naam: (v) => (v.trim().length < 2 ? "Vul uw naam in." : ""),
      email: (v) => (!v.trim() ? "Vul uw e-mailadres in." : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Dit e-mailadres lijkt niet te kloppen."),
      telefoon: (v) => (v.trim() && !/^[+\d][\d\s().-]{6,}$/.test(v.trim()) ? "Dit telefoonnummer lijkt niet te kloppen." : ""),
      bericht: (v) => (v.trim().length < 10 ? "Vertel kort wat u wilt laten doen (minimaal 10 tekens)." : ""),
    };
    const setStatus = (kind, title, html) => {
      status.className = `status status--${kind} is-on`;
      status.innerHTML = `<h3>${title}</h3>${html || ""}`;
      status.setAttribute("role", kind === "err" ? "alert" : "status");
    };
    const check = (name) => {
      const field = form.elements[name]; if (!field || !rules[name]) return true;
      const wrap = field.closest(".field"); const msg = rules[name](field.value);
      wrap.classList.toggle("has-error", !!msg);
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      $(".field__error", wrap).textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach((n) => form.elements[n].addEventListener("blur", () => check(n)));
    Object.keys(rules).forEach((n) => form.elements[n].addEventListener("input", () => form.elements[n].closest(".field").classList.contains("has-error") && check(n)));

    const data = () => Object.fromEntries(new FormData(form).entries());
    const mailto = (d) => {
      const body = `Naam: ${d.naam}\nTelefoon: ${d.telefoon || "-"}\nE-mail: ${d.email}\nSoort werk: ${d.soort || "-"}\n\n${d.bericht}`;
      return `mailto:info@MsBouwRozenburg.nl?subject=${encodeURIComponent("Offerteaanvraag via de website")}&body=${encodeURIComponent(body)}`;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).filter((n) => !check(n));
      if (bad.length) {
        setStatus("err", "Controleer de gemarkeerde velden", "<p>Uw gegevens zijn bewaard. Pas de velden met een melding aan en verstuur opnieuw.</p>");
        form.elements[bad[0]].focus();
        return;
      }
      const d = data();
      if (d.website) return; // honeypot
      sendBtn.disabled = true; form.classList.add("is-sending");
      setStatus("wait", "Bezig met versturen", "<p>Een moment geduld.</p>");
      try {
        const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
        const res = await fetch(form.dataset.endpoint || "/api/offerte", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d), signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error(`status ${res.status}`);
        setStatus("ok", "Bedankt, uw aanvraag is verstuurd", "<p>Marcus neemt zo snel mogelijk contact met u op. Dringend? Bel <a href=\"tel:+31614670460\">06 1467 0460</a>.</p>");
        form.reset();
        status.setAttribute("tabindex", "-1"); status.focus();
      } catch {
        setStatus("err", "Versturen via de website lukt nu niet", `<p>Uw gegevens staan nog in het formulier. Verstuur de aanvraag via uw e-mailprogramma, of bel <a href="tel:+31614670460">06 1467 0460</a>.</p><p><a class="btn btn--ink btn--sm" href="${mailto(d)}"><span>Verstuur via e-mail</span></a></p>`);
      } finally {
        sendBtn.disabled = false; form.classList.remove("is-sending");
      }
    });
  }

  /* ---------- beweging ---------- */
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || !root.classList.contains("motion")) {
    root.classList.remove("motion");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const fail = setTimeout(() => root.classList.add("motion-failed"), 6000); // vangnet als er iets hapert
  requestAnimationFrame(() => requestAnimationFrame(() => clearTimeout(fail)));

  const splitWords = (el, cls) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const s = document.createElement("span");
            if (cls === "w") { s.className = "w"; s.textContent = part; }
            else { s.className = "wm"; const i = document.createElement("span"); i.className = "wi"; i.textContent = part; s.appendChild(i); }
            frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  };
  $$("[data-words]").forEach((el) => splitWords(el, "wi"));
  $$("[data-statement]").forEach((el) => splitWords(el, "w"));

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const desktop = matchMedia("(min-width: 900px)").matches;

    /* hero: de opening, daarna blijft er iets leven */
    const hero = $(".hero");
    if (hero) {
      const media = $("[data-hero-media]", hero), duo = $(".hero__duo, .hero__house", media), imgs = $$("img", media);
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (desktop) {
        tl.fromTo(media, { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }, { clipPath: "polygon(17% 0, 100% 0, 100% 100%, 0% 100%)", duration: 1.4, ease: "power3.inOut" }, 0);
      } else {
        tl.fromTo(media, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power1.out" }, 0);
      }
      if (imgs.length) tl.fromTo(imgs, { scale: 1.15 }, { scale: 1.02, duration: 2.4, ease: "power2.out" }, 0);
      tl.fromTo($$(".wi", hero), { yPercent: 112, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.45)
        .fromTo($$("[data-reveal]", hero), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.85)
        ;
      // het huis renoveert zichzelf: sloop, timmerwerk, afwerking, oplevering, en opnieuw
      const house = $(".hero__house", media);
      if (house) {
        const q = (n) => $$(`[data-a="${n}"]`, house);
        const chips = $$(".hero__phases li", media);
        const on = (i) => chips.forEach((c, k) => c.classList.toggle("is-on", k === i));
        const all = $$("[data-a]", house);
        const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.4, delay: 0.6 });
        loop.call(on, [0], 0)
          .fromTo(q(1).filter((e) => e.classList.contains("dr")), { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: "power2.inOut" }, 0)
          .fromTo(q(1).filter((e) => !e.classList.contains("dr")), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.3)
          .call(on, [1], 1.9)
          .fromTo(q(2), { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: "power2.out" }, 1.9)
          .call(on, [2], 3.9)
          .fromTo(q(3).filter((e) => e.tagName === "g" && !e.classList.contains("hh-doors")), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.15 }, 3.9)
          .to($$(".hh-studs path", house), { opacity: 0, duration: 0.5 }, 4.0)
          .fromTo(q(3).filter((e) => e.classList.contains("st")), { opacity: 1, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.45, stagger: 0.09, ease: "back.out(1.4)" }, 4.2)
          .fromTo(q(3).filter((e) => e.classList.contains("hh-doors")), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 4.8)
          .call(on, [3], 6.0)
          .fromTo(q(4).filter((e) => e.classList.contains("win")), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.18 }, 6.0)
          .fromTo(q(4).filter((e) => e.classList.contains("dr")), { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 1, ease: "power2.inOut" }, 6.2)
          .to($$(".win", house), { opacity: 0.55, duration: 0.9, yoyo: true, repeat: 1, ease: "sine.inOut" }, 7.4)
          .to(all, { opacity: 0, duration: 0.7, ease: "power1.in" }, 10.2);
        loop.eventCallback("onRepeat", () => $$(".hh-studs path", house).forEach((p) => (p.style.opacity = "")));
        ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", onToggle: (self) => (self.isActive ? loop.play() : loop.pause()) });
      }
      // houtkrullen: kleine deeltjes die langzaam door het beeld drijven
      if (desktop && imgs.length) {
        for (let i = 0; i < 18; i++) {
          const d = document.createElement("i"); d.className = "dust"; d.setAttribute("aria-hidden", "true");
          const s = 2 + Math.random() * 4; d.style.width = d.style.height = `${s}px`;
          d.style.left = `${20 + Math.random() * 78}%`; d.style.top = `${10 + Math.random() * 70}%`;
          media.appendChild(d);
          gsap.fromTo(d, { y: 0, x: 0, opacity: 0 }, { y: 80 + Math.random() * 160, x: -30 + Math.random() * 60, opacity: 0.55, duration: 5 + Math.random() * 5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.5 + Math.random() * 4 });
        }
      }
      // foto's: rustige zoom die blijft doorlopen
      imgs.forEach((im, i) => gsap.to(im, { scale: 1.07, xPercent: -1.5, duration: 9 + (i % 2) * 2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.6 }));
      if (duo) gsap.to(duo, { yPercent: 4, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    }

    /* lint met vakgebieden loopt door */
    $$("[data-ticker]").forEach((t) => {
      const track = $(".ticker__track", t);
      Array.from(track.children).forEach((li) => { const c = li.cloneNode(true); track.appendChild(c); });
      gsap.to(track, { x: () => -track.scrollWidth / 2, ease: "none", duration: 38, repeat: -1 });
    });

    /* binnenpagina's: dakrand tekent zichzelf */
    $$(".page-head__roof path").forEach((p) => gsap.to(p, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", delay: 0.3 }));

    /* koppen: woord voor woord omhoog */
    $$("[data-words]").filter((el) => !el.closest(".hero")).forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.fromTo($$(".wi", el), { yPercent: 112, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.06 }) });
    });

    /* blokken: omhoog en zichtbaar */
    const reveals = $$("[data-reveal]").filter((el) => !el.closest(".hero"));
    ScrollTrigger.batch(reveals, { start: "top 90%", once: true, onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true }) });

    /* foto's: gecontroleerd onthuld */
    $$(".reveal-img").forEach((el) => {
      const im = $("img", el);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      tl.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power3.inOut" }).fromTo(im, { scale: 1.18 }, { scale: 1, duration: 1.4, ease: "power2.out" }, 0);
    });

    /* parallax collage */
    $$("[data-speed]").forEach((f) => {
      const s = parseFloat(f.dataset.speed);
      gsap.fromTo(f, { y: s * -700 }, { y: s * 700, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });

    /* statement: woorden lichten op tijdens het scrollen */
    $$("[data-statement]").forEach((el) => {
      gsap.to($$(".w", el), { opacity: 1, ease: "none", stagger: 0.12, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } });
    });

    /* dienstenlijst */
    const rows = $$(".svc");
    if (rows.length) ScrollTrigger.batch(rows, { start: "top 92%", once: true, onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, overwrite: true }) });

    /* werkwijze: de dakrand tekent mee met het scrollen */
    $$("[data-roofline]").forEach((r) => {
      gsap.to($("path", r), { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: r, start: "top 85%", end: "bottom 40%", scrub: true } });
    });
    const steps = $$(".step");
    if (steps.length) ScrollTrigger.batch(steps, { start: "top 88%", once: true, onEnter: (els) => gsap.to(els, { opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out", overwrite: true }) });

    /* echt cijfer: 30 jaar */
    $$("[data-count]").forEach((el) => {
      const end = parseInt(el.dataset.count, 10), o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) }) });
    });

    /* breed scherm: gepinde scenes */
    if (desktop) {
      const stage = $("[data-ba-stage]");
      if (stage) {
        const pin = $(".ba-pin", stage), items = $$("[data-ba-item]", stage), count = $("[data-ba-count]", stage), bar = $("[data-ba-bar]", stage);
        stage.classList.add("is-pinned");
        const bas = items.map((it) => $("[data-ba]", it));
        gsap.set(items, { autoAlpha: 0 }); gsap.set(items[0], { autoAlpha: 1 });
        bas.forEach((b) => b.style.setProperty("--pos", 0));
        const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: pin, start: `top top+=${HEADER}`, end: `+=${items.length * 100}%`, pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => { const i = Math.min(items.length - 1, Math.floor(self.progress * items.length)); count.textContent = `0${i + 1} / 0${items.length}`; gsap.set(bar, { scaleX: self.progress }); } } });
        items.forEach((it, i) => {
          if (i > 0) tl.to(items[i - 1], { autoAlpha: 0, duration: 0.3 }).to(it, { autoAlpha: 1, duration: 0.3 }, "<");
          tl.fromTo(bas[i], { "--pos": 0 }, { "--pos": 100, duration: 1.2, ease: "power1.inOut" }).to({}, { duration: 0.4 });
        });
        return () => { stage.classList.remove("is-pinned"); bas.forEach((b) => (b.style.setProperty("--pos", $("input", b).value))); gsap.set(items, { clearProps: "all" }); };
      }
    }
  });

  /* horizontaal bouwverloop (projecten) */
  mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
    const hs = $("[data-hs]"); if (!hs) return;
    const track = $(".hs__track", hs), bar = $("[data-hs-bar]");
    hs.classList.add("is-pinned");
    const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
    gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: hs, start: `top top+=${HEADER}`, end: () => `+=${dist()}`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (s) => bar && gsap.set(bar, { scaleX: s.progress }) } });
    return () => hs.classList.remove("is-pinned");
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
