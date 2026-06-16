# PointComme

Site vitrine de **PointComme** (pointcomme.be) — création de sites web et
d'applications mobiles pour les commerces et indépendants de la région du
Condroz (Belgique).

Le site présente l'offre, les tarifs (Essentiel 29 €/mois · Pro 49 €/mois · Premium
79 €/mois), un exemple concret et un formulaire de demande de maquette gratuite.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page unique (hero, avantages, avant/après, méthode, exemple, tarifs, FAQ, contact) + SEO et données structurées JSON-LD |
| `styles.css` | Thème sombre premium, responsive, mobile-first, animations |
| `script.js` | Apparition au scroll, navigation active, compteurs animés, en-tête au scroll, retour-en-haut, menu mobile, validation du formulaire |
| `favicon.svg` | Icône de l'onglet |
| `robots.txt` / `sitemap.xml` | Référencement |

## Optimisations intégrées

- **Performance** : aucune dépendance, aucun build, JS léger et `passive` sur le scroll.
- **Accessibilité** : lien d'évitement, focus visibles, `aria-*`, contrastes, respect de `prefers-reduced-motion`.
- **SEO** : balises meta, Open Graph/Twitter, canonical, `sitemap.xml`, `robots.txt`, données structurées `ProfessionalService`.
- **UX** : navigation active au scroll, animations d'apparition, micro-interactions, retour-en-haut.

## Lancer en local

Aucune dépendance, aucun build. Ouvrez `index.html` dans un navigateur, ou servez
le dossier :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déploiement

Hébergeable tel quel sur n'importe quel hébergement statique (GitHub Pages,
Netlify, Cloudflare Pages…).

## Formulaire de contact

Le formulaire est **fonctionnel** :
- Par défaut (sans configuration), il ouvre la messagerie du visiteur pré-remplie
  vers l'adresse indiquée dans `data-mailto` (aucune inscription requise).
- Pour un envoi fluide sans quitter la page, créez un formulaire gratuit sur
  [Formspree](https://formspree.io) et collez son identifiant dans l'attribut
  `data-endpoint` du `<form id="contact-form">` (ex.
  `data-endpoint="https://formspree.io/f/xxxxxxx"`). Le script bascule alors
  automatiquement en envoi AJAX (avec état de chargement et anti-spam).

## À faire / à personnaliser

- Ajouter le logo définitif et des photos réelles une fois disponibles.
- (Optionnel) Activer Formspree pour l'envoi du formulaire sans quitter la page.
