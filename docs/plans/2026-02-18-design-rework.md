# Design Rework - Depense-Man

## Contexte

App perso de gestion de depenses mensuelles et credits. Utilisee principalement sur mobile. Le design actuel est surcharge (7 modes de vue, 10 cartes de stats, footer inutile). L'objectif est un rework complet : plus simple, plus agreable, mobile-first, style glassmorphism subtil.

## Approche

Rework par page : design system d'abord, puis page par page. Tout l'ancien sera remplace au merge.

---

## Design System

### Palette de couleurs (dark mode par defaut)

| Token | Valeur | Usage |
|-------|--------|-------|
| background | `#0a0a0b` | Fond principal |
| surface | `rgba(255, 255, 255, 0.03)` | Cards de base |
| surface-elevated | `rgba(255, 255, 255, 0.06)` | Cards hover/actives |
| border | `rgba(255, 255, 255, 0.08)` | Borders subtiles 1px |
| foreground | `#e4e4e7` | Texte principal |
| muted | `#71717a` | Texte secondaire (zinc-500) |
| accent | `#6366f1` | Elements actifs (indigo) |
| success | `#34d399` | Revenus (emerald) |
| destructive | `#f87171` | Depenses (rouge doux) |
| warning | `#fbbf24` | Credits (ambre) |

### Cards glassmorphism

```css
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
border-radius: 16px;
```

### Typographie

- **Font** : Outfit (Google Fonts, variable)
- **Montants** : `font-variant-numeric: tabular-nums`
- Une seule font pour tout (on vire Space Grotesk)

### Spacing

- Padding pages : 16px mobile, 24px desktop
- Gap entre cards : 8px
- Radius : 16px cards, 12px boutons, 8px inputs

### Animations

- Motion library, duree 0.2s, pas de spring exagere
- Pas de staggered reveals sur les cartes
- Transitions de pages douces

---

## Layout & Navigation

### Mobile (< 768px)

- **Header** : logo "D-Man" a gauche + icone settings a droite. Ultra minimal.
- **Bottom tab bar** : 4 tabs (Liste, Stats, Projections, Credits). Fond glassmorphism avec blur. Indicateur actif en accent color.
- **Safe area** : padding-bottom pour iPhones avec barre home.
- **Pas de footer**.

### Desktop (>= 768px)

- **Header** : logo + 4 tabs inline + icone settings. Sticky, glassmorphism.
- **Pas de bottom bar** (tabs dans le header).
- **Max-width** : 960px centre.
- **Pas de footer**.

---

## Pages

### 1. Page Liste (Dashboard)

Page principale ouverte au quotidien.

**Structure :**
1. **Hero card "Reste a payer"** : grande card glassmorphism en haut. Montant en text-3xl bold. Selecteur de jour pour simuler "et si on etait le JX ?" (se reset au refresh).
2. **Filtres** : pills horizontaux scrollables (Tout, Depenses, Credits, Revenus).
3. **Items en lignes** (pas de cards individuelles) :
   - Section "Paye" : items avant la date actuelle/simulee, opacite reduite (~60%)
   - Indicateur "Aujourd'hui" avec accent color
   - Section "A venir" : items apres aujourd'hui, opacite pleine
   - Chaque item : icone + nom a gauche, montant + jour a droite
4. **Bouton Ajouter** : en bas de la liste, simple.
5. **Swipe conserve** sur mobile pour edit/delete.

### 2. Page Stats

Simplifiee.

**Structure :**
1. **Resume du mois** : 2 cards cote a cote (Depenses avec split credit/hors credit + Revenus)
2. **Top 5 depenses** : classement simple

Supprime : donut chart, velocite, runway, burn rate, sante financiere, jours critiques, petites depenses recurrentes.

### 3. Page Projections

Previsionnel sur 12 mois.

**Structure :**
1. **Graphique 12 mois** : line chart Nivo (revenus/depenses/solde projetes). Montre l'impact des fins de credits.
2. **Tableau previsionnel** : pour chaque mois sur 12, une ligne avec depenses, revenus, reste. Met en evidence quand un credit se termine.
3. **Prochains evenements** : liste des fins de credits (nom, date de fin, montant libere par mois).

### 4. Page Credits

Dediee aux credits en cours.

**Structure :**
1. **Liste des credits actifs** : chaque credit avec barre de progression, montant mensuel, reste a payer, date de fin estimee.
2. **Resume** : total mensuel de tous les credits + total restant a rembourser.

### 5. Page Login

Logo centre + formulaire glassmorphism centre (email + mot de passe + bouton). Clean.

### 6. Page Settings

- Toggle dark/light mode
- Export JSON des donnees
- Version de l'app
- Lien GitHub
- Bouton deconnexion

---

## Ce qui est supprime

- 6 modes de vue (timeline, compact, kanban, heatmap, treemap, calendrier)
- 8 cartes de metriques (solde actuel, solde fin de mois, sante financiere, velocite, runway, burn rate, revenus card, depenses card dans les stats)
- Donut chart distribution
- Cash flow chart
- Jours critiques
- Petites depenses recurrentes
- Footer complet
- Font Space Grotesk

## Ce qui est nouveau

- Bottom tab bar mobile
- Simulateur de jour sur hero card "Reste a payer"
- Page Credits dediee
- Page Projections avec tableau previsionnel mois par mois
- Items en lignes (pas en cards) = moins de scroll
- Font Outfit
- Design glassmorphism subtil
