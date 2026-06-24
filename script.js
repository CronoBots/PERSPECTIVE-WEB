(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Verrouillage type application : pas de zoom au pincement (iOS)
  ["gesturestart", "gesturechange", "gestureend"].forEach((evt) =>
    document.addEventListener(evt, (e) => e.preventDefault(), { passive: false })
  );

  // Année dynamique
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Bascule de thème clair / sombre (mémorisée)
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const root = document.documentElement;
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // L'intro ne se rejoue pas pendant la session
  try { sessionStorage.setItem("introShown", "1"); } catch (e) {}

  // En-tête : ombre au scroll + bouton retour en haut + barre de progression
  const header = document.querySelector(".site-header");
  const toTop = document.getElementById("to-top");
  const progress = document.getElementById("scroll-progress");
  const heroEl = document.querySelector(".hero");
  function headerThreshold() {
    // La barre reste transparente tant qu'on est dans le héros
    return heroEl ? Math.max(heroEl.offsetHeight - 72, 8) : 8;
  }
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > headerThreshold());
    if (toTop) toTop.classList.toggle("show", y > 600);
    if (progress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  // Menu mobile
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Apparition au scroll
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // Compteurs animés
  function animateCount(el) {
    const target = parseFloat(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll("[data-counters]").forEach((counterWrap) => {
    const counters = counterWrap.querySelectorAll("[data-count]");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      const countObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              counters.forEach(animateCount);
              obs.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );
      countObserver.observe(counterWrap);
    }
  });

  // Navigation active (scrollspy)
  const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // Formulaire de demande de maquette (démo front-end)
  const form = document.getElementById("contact-form");
  const message = document.getElementById("form-message");
  if (form && message) {
    const nameInput = form.elements.namedItem("name");
    const emailInput = form.elements.namedItem("email");
    const submitBtn = document.getElementById("contact-submit");
    const formCheck = document.getElementById("form-check");
    const endpoint = (form.dataset.endpoint || "").trim();
    const mailTo = form.dataset.mailto || "contact@digitalconcept.be";
    if (endpoint) form.setAttribute("action", endpoint); // repli sans JS

    function showError(msg) {
      message.className = "form-message error";
      message.textContent = msg;
    }
    function showSuccess(msg) {
      if (formCheck) {
        void formCheck.offsetWidth; // relance l'animation
        formCheck.classList.add("show");
      }
      message.className = "form-message success";
      message.textContent = msg;
    }
    function setLoading(on) {
      if (!submitBtn) return;
      submitBtn.disabled = on;
      submitBtn.textContent = on ? "Envoi…" : "Demander un devis gratuit";
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      message.className = "form-message";
      nameInput.classList.remove("invalid");
      emailInput.classList.remove("invalid");
      if (formCheck) formCheck.classList.remove("show");

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (form.elements.namedItem("_gotcha") && form.elements.namedItem("_gotcha").value) return; // anti-spam

      if (!name) nameInput.classList.add("invalid");
      if (!emailValid) emailInput.classList.add("invalid");
      if (!name || !emailValid) {
        showError("Merci d'indiquer le nom de votre commerce et un e-mail valide.");
        return;
      }

      if (endpoint) {
        // Envoi fluide via Formspree (reste sur la page)
        setLoading(true);
        fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        })
          .then((res) => {
            setLoading(false);
            if (res.ok) {
              showSuccess(`Merci ${name} ! Votre demande est envoyée, on vous écrit à ${email}.`);
              form.reset();
            } else {
              showError("Oups, l'envoi a échoué. Réessayez ou écrivez-nous à " + mailTo + ".");
            }
          })
          .catch(() => {
            setLoading(false);
            showError("Connexion impossible. Réessayez ou écrivez-nous à " + mailTo + ".");
          });
      } else {
        // Repli sans inscription : ouvre la messagerie du visiteur, pré-remplie
        const subject = encodeURIComponent("Demande de maquette gratuite — " + name);
        const body = encodeURIComponent(
          "Bonjour,\n\nJe souhaite découvrir ma maquette gratuite.\n\nCommerce : " +
            name + "\nE-mail : " + email + "\n\nMerci !"
        );
        window.location.href = "mailto:" + mailTo + "?subject=" + subject + "&body=" + body;
        showSuccess("Votre messagerie s'ouvre pour finaliser l'envoi. Merci " + name + " !");
        form.reset();
      }
    });
  }

  // Comparateur avant / après (glissable, clavier-accessible)
  document.querySelectorAll("[data-ba]").forEach((ba) => {
    const range = ba.querySelector(".ba-range");
    if (!range) return;
    const update = () => ba.style.setProperty("--pos", range.value + "%");
    range.addEventListener("input", update);
    update();
  });

  // Inclinaison 3D des cartes (pointeur précis uniquement, hors reduced-motion)
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".feature-card, .plan:not(.plan-featured), .step").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add("is-tilting");
        card.style.transform =
          "perspective(900px) rotateY(" + px * 5 + "deg) rotateX(" + -py * 5 + "deg) translateY(-6px)";
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.transform = "";
      });
    });
  }

  // Sélecteur de métier : personnalise l'aperçu du téléphone en direct
  const trades = document.getElementById("trades");
  const phoneEmoji = document.getElementById("phone-emoji");
  const phoneName = document.getElementById("phone-name");
  if (trades && phoneEmoji && phoneName) {
    trades.addEventListener("click", (e) => {
      const btn = e.target.closest(".trade");
      if (!btn) return;
      trades.querySelectorAll(".trade").forEach((t) => t.classList.remove("is-active"));
      btn.classList.add("is-active");
      phoneEmoji.textContent = btn.dataset.emoji || "🏪";
      phoneName.textContent = btn.dataset.name || "Votre commerce";
      if (!prefersReduced) {
        phoneName.animate(
          [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
          { duration: 350, easing: "ease" }
        );
      }
    });
  }

  // Effets au pointeur (souris de précision uniquement, hors reduced-motion)
  if (finePointer && !prefersReduced) {
    // Projecteur + parallaxe 3D de la maquette dans le héros (throttlé en rAF)
    const hero = document.querySelector(".hero");
    const spotlight = document.getElementById("hero-spotlight");
    const phone = document.querySelector(".phone");
    if (phone) phone.classList.add("has-parallax");
    if (hero) {
      let hraf = 0, hev = null;
      hero.addEventListener("pointermove", (e) => {
        hev = e;
        if (hraf) return;
        hraf = requestAnimationFrame(() => {
          hraf = 0;
          const r = hero.getBoundingClientRect();
          const x = hev.clientX - r.left;
          const y = hev.clientY - r.top;
          if (spotlight) {
            spotlight.style.setProperty("--mx", x + "px");
            spotlight.style.setProperty("--my", y + "px");
          }
          if (phone) {
            const rx = (y / r.height - 0.5) * -10;
            const ry = (x / r.width - 0.5) * 12;
            phone.style.transform =
              "perspective(1000px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
          }
        });
      }, { passive: true });
      hero.addEventListener("pointerleave", () => {
        if (phone) phone.style.transform = "";
      });
    }

    // Boutons principaux magnétiques
    document.querySelectorAll(".btn-primary").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width / 2) * 0.3;
        const my = (e.clientY - r.top - r.height / 2) * 0.4;
        btn.style.transform = "translate(" + mx + "px, " + (my - 2) + "px)";
      }, { passive: true });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });

    // Curseur personnalisé : anneau qui suit avec inertie, grossit sur les éléments interactifs
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    const hoverSel = "a, button, .btn, [role='button'], input, summary, label, .trade";
    let tx = 0, ty = 0, cx = 0, cy = 0, shown = false;
    document.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; cx = tx; cy = ty; dot.classList.add("is-active"); }
    }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest && e.target.closest(hoverSel)) dot.classList.add("is-hover");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest && e.target.closest(hoverSel)) dot.classList.remove("is-hover");
    });
    window.addEventListener("blur", () => dot.classList.remove("is-active"));
    const follow = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      dot.style.transform = "translate(" + cx + "px, " + cy + "px) translate(-50%, -50%)";
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }

  // Aperçu en direct : mise à l'échelle responsive de l'iframe (largeur de référence 1280px)
  document.querySelectorAll(".browser-frame").forEach((frame) => {
    const viewport = frame.parentElement;
    const BASE = 1280;
    const fit = () => {
      frame.style.transform = "scale(" + viewport.clientWidth / BASE + ")";
    };
    fit();
    if (window.ResizeObserver) {
      new ResizeObserver(fit).observe(viewport);
    } else {
      window.addEventListener("resize", fit);
    }
  });

  // Terminal qui s'écrit (façon fi.co)
  const term = document.querySelector("[data-terminal]");
  if (term) {
    const lines = Array.from(term.querySelectorAll(".t-line"));
    if (prefersReduced) {
      lines.forEach((el) => {
        el.textContent = el.getAttribute("data-line");
        el.classList.add("done");
      });
    } else {
      let li = 0;
      const typeLine = () => {
        if (li >= lines.length) return;
        const el = lines[li];
        const full = el.getAttribute("data-line");
        el.classList.add("typing");
        let ci = 0;
        const typeChar = () => {
          el.textContent = full.slice(0, ci);
          ci += 1;
          if (ci <= full.length) {
            setTimeout(typeChar, 24 + Math.random() * 36);
          } else {
            el.classList.remove("typing");
            el.classList.add("done");
            li += 1;
            setTimeout(typeLine, 340);
          }
        };
        typeChar();
      };
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) { obs.disconnect(); typeLine(); }
          });
        }, { threshold: 0.35 });
        io.observe(term);
      } else {
        typeLine();
      }
    }
  }

  // Carrousel de témoignages (auto, pause au survol/focus, glissé, clavier)
  const testi = document.querySelector("[data-testi]");
  if (testi) {
    const cards = Array.from(testi.querySelectorAll(".testi-card"));
    const dotsWrap = testi.querySelector(".testi-dots");
    const viewport = testi.querySelector(".testi-viewport");
    if (cards.length && dotsWrap) {
      let idx = 0;
      let timer = null;
      const show = (i) => {
        i = (i + cards.length) % cards.length;
        cards[idx].classList.remove("is-active");
        dots[idx].classList.remove("is-active");
        idx = i;
        cards[idx].classList.add("is-active");
        dots[idx].classList.add("is-active");
      };
      const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
      const play = () => { if (!prefersReduced && !timer) timer = setInterval(() => show(idx + 1), 5000); };
      const restart = () => { stop(); play(); };
      const dots = cards.map((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Avis " + (i + 1));
        b.addEventListener("click", () => { show(i); restart(); });
        dotsWrap.appendChild(b);
        return b;
      });
      dots[0].classList.add("is-active");
      testi.addEventListener("pointerenter", stop);
      testi.addEventListener("pointerleave", play);
      testi.addEventListener("focusin", stop);
      testi.addEventListener("focusout", play);
      testi.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { show(idx - 1); restart(); }
        else if (e.key === "ArrowRight") { show(idx + 1); restart(); }
      });
      if (viewport) {
        let x0 = null;
        viewport.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
        viewport.addEventListener("touchend", (e) => {
          if (x0 === null) return;
          const dx = e.changedTouches[0].clientX - x0;
          if (Math.abs(dx) > 40) { show(idx + (dx < 0 ? 1 : -1)); restart(); }
          x0 = null;
        }, { passive: true });
      }
      play();
    }
  }
})();
