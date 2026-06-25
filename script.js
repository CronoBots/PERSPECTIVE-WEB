(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentLang = "fr";

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

  // Multilingue FR / EN / NL (français par défaut, préférence mémorisée)
  const I18N = window.I18N || {};
  const LANGS = ["fr", "en", "nl"];
  const langSwitch = document.getElementById("lang-switch");
  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = "fr";
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang);
    const dict = lang !== "fr" ? I18N[lang] : null;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      if (el._fr == null) el._fr = el.innerHTML;
      const tr = dict ? dict[el.getAttribute("data-i18n")] : null;
      el.innerHTML = tr != null ? tr : el._fr;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      if (el._frPh == null) el._frPh = el.getAttribute("placeholder") || "";
      const tr = dict ? dict[el.getAttribute("data-i18n-ph")] : null;
      el.setAttribute("placeholder", tr != null ? tr : el._frPh);
    });
    if (langSwitch) {
      langSwitch.querySelectorAll("button").forEach((b) => {
        const on = b.dataset.lang === lang;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
    }
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }
  // 1er passage : on détecte la langue du navigateur (FR/EN/NL, repli FR).
  // Un choix manuel (mémorisé) reste toujours prioritaire.
  function detectLang() {
    const list = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language || "fr"];
    for (let i = 0; i < list.length; i++) {
      const code = (list[i] || "").slice(0, 2).toLowerCase();
      if (code === "nl" || code === "en" || code === "fr") return code;
    }
    return "fr";
  }
  let storedLang = null;
  try { storedLang = localStorage.getItem("lang"); } catch (e) {}
  applyLang(storedLang && LANGS.indexOf(storedLang) !== -1 ? storedLang : detectLang());
  if (langSwitch) {
    langSwitch.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (b) applyLang(b.dataset.lang);
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

  // Garantit l'affichage immédiat du héros (titre + chorégraphie) dès le chargement
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) requestAnimationFrame(() => heroContent.classList.add("is-visible"));

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

  // Formulaire de demande de devis
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
    const t = (fr, en, nl) =>
      currentLang === "nl" ? (nl != null ? nl : fr) : currentLang === "en" ? en : fr;

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
      submitBtn.textContent = on
        ? t("Envoi…", "Sending…", "Versturen…")
        : t("Demander un devis gratuit", "Get a free quote", "Gratis offerte aanvragen");
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
        showError(t("Merci d'indiquer votre nom et une adresse e-mail valide.", "Please enter your name and a valid email address.", "Vul uw naam en een geldig e-mailadres in."));
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
              showSuccess(t(
                `Merci ${name} ! Votre demande est envoyée, nous vous répondons à ${email} sous 24 h.`,
                `Thanks ${name}! Your request has been sent — we'll reply to ${email} within 24 h.`,
                `Bedankt ${name}! Uw aanvraag is verzonden — we antwoorden binnen 24 u op ${email}.`
              ));
              form.reset();
            } else {
              showError(t("Oups, l'envoi a échoué. Réessayez ou écrivez-nous à " + mailTo + ".",
                          "Sorry, sending failed. Please retry or email us at " + mailTo + ".",
                          "Verzenden mislukt. Probeer opnieuw of mail ons op " + mailTo + "."));
            }
          })
          .catch(() => {
            setLoading(false);
            showError(t("Connexion impossible. Réessayez ou écrivez-nous à " + mailTo + ".",
                        "Connection failed. Please retry or email us at " + mailTo + ".",
                        "Verbinding mislukt. Probeer opnieuw of mail ons op " + mailTo + "."));
          });
      } else {
        // Repli sans inscription : ouvre la messagerie du visiteur, pré-remplie
        const subject = encodeURIComponent(t("Demande de devis — ", "Quote request — ", "Offerteaanvraag — ") + name);
        const body = encodeURIComponent(t(
          "Bonjour,\n\nJe souhaite discuter d'un projet.\n\nNom / entreprise : " + name + "\nE-mail : " + email + "\n\nDescription du projet : \n\nMerci !",
          "Hello,\n\nI'd like to discuss a project.\n\nName / company: " + name + "\nEmail: " + email + "\n\nProject description: \n\nThank you!",
          "Hallo,\n\nIk wil graag een project bespreken.\n\nNaam / bedrijf: " + name + "\nE-mail: " + email + "\n\nProjectomschrijving: \n\nBedankt!"
        ));
        window.location.href = "mailto:" + mailTo + "?subject=" + subject + "&body=" + body;
        showSuccess(t("Votre messagerie s'ouvre pour finaliser l'envoi. Merci " + name + " !",
                      "Your email app is opening to complete the request. Thanks " + name + "!",
                      "Uw e-mailprogramma opent om de aanvraag af te ronden. Bedankt " + name + "!"));
        form.reset();
      }
    });
  }

  // Inclinaison 3D des cartes (pointeur précis uniquement, hors reduced-motion)
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".feature-card, .step").forEach((card) => {
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

  // Terminal qui s'écrit
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
})();
