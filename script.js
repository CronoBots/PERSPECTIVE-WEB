(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const counterWrap = document.querySelector("[data-counters]");
  if (counterWrap) {
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
  }

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
    const mailTo = form.dataset.mailto || "contact@perspectiveweb.be";
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
      submitBtn.textContent = on ? "Envoi…" : "Recevoir ma maquette";
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
    // Projecteur + parallaxe 3D de la maquette dans le héros
    const hero = document.querySelector(".hero");
    const spotlight = document.getElementById("hero-spotlight");
    const phone = document.querySelector(".phone");
    if (phone) phone.classList.add("has-parallax");
    if (hero) {
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
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
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
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
})();
