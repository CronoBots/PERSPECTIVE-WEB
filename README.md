# Digital Concept

Site vitrine de **Digital Concept** (digitalconcept.be) — agence digitale en
Belgique. Création de **sites web**, **applications mobiles**, solutions
d'**intelligence artificielle**, **crypto/blockchain** et **bots pour réseaux
sociaux**. Des solutions sur mesure pour faire grandir votre entreprise.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page unique (hero, services, réalisations, partenaire, méthode, expertises, résultats, avis, FAQ, contact) + SEO et données structurées JSON-LD |
| `styles.css` | Thème sombre premium, responsive, mobile-first, animations |
| `script.js` | Apparition au scroll, navigation active, compteurs animés, en-tête au scroll, retour-en-haut, menu mobile, validation du formulaire, terminal animé, carrousel d'avis |
| `favicon.svg` | Monogramme « DC » de l'onglet |
| `CNAME` | Domaine personnalisé GitHub Pages (`digitalconcept.be`) |
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

Hébergé sur **GitHub Pages** (workflow `.github/workflows/deploy-pages.yml`), avec
le domaine personnalisé `digitalconcept.be` (fichier `CNAME`). Hébergeable tel quel
sur n'importe quel hébergement statique (Netlify, Cloudflare Pages…).

## Formulaire de contact

Le formulaire est **fonctionnel** :
- Par défaut (sans configuration), il ouvre la messagerie du visiteur pré-remplie
  vers l'adresse indiquée dans `data-mailto` (aucune inscription requise).
- Pour un envoi fluide sans quitter la page, créez un formulaire gratuit sur
  [Formspree](https://formspree.io) et collez son identifiant dans l'attribut
  `data-endpoint` du `<form id="contact-form">`.

## À personnaliser

- **Coordonnées** : l'e-mail `contact@digitalconcept.be` est utilisé partout —
  remplacez-le par votre adresse réelle et ajoutez un numéro de téléphone si souhaité.
- Ajouter le logo définitif, des photos et de vraies réalisations clients.
- (Optionnel) Activer Formspree pour l'envoi du formulaire sans quitter la page.
