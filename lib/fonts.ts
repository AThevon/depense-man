/**
 * Configuration centralisée des fonts.
 *
 * 3 rôles distincts :
 *  - bodyFont    → texte courant (lisibilité prime)
 *  - titleFont   → titres en LETTRES (logo, h1/h2, sheet titles - identitaire)
 *  - displayFont → CHIFFRES + montants (tabular-nums, lisible mais stylé)
 *
 * Pour swap : décommente l'import + la déclaration, puis change l'export en bas.
 *
 * Référence des fonts dispo : ~/.dotfiles/docs/fonts.md
 */

import {
  Space_Grotesk,
  // Orbitron,
  Audiowide,
  // Bungee,
  // Dela_Gothic_One,
  Space_Mono,
  // Inter,
  // Outfit,
} from 'next/font/google';

// =========================================================================
// Body fonts (texte courant)
// =========================================================================

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

// const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
// const outfit = Outfit({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500','600','700'], display: 'swap' });

// =========================================================================
// Title fonts (titres en lettres - logo, headers, sheets)
// =========================================================================

const audiowide = Audiowide({
  subsets: ['latin'],
  variable: '--font-title',
  weight: ['400'],
  display: 'swap',
});

// const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-title', weight: ['400','500','600','700','800','900'], display: 'swap' });
// const bungee = Bungee({ subsets: ['latin'], variable: '--font-title', weight: ['400'], display: 'swap' });
// const delaGothicOne = Dela_Gothic_One({ subsets: ['latin'], variable: '--font-title', weight: ['400'], display: 'swap' });

// =========================================================================
// Display fonts (chiffres + montants)
// =========================================================================

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700'],
  display: 'swap',
});

// const orbitronDisplay = Orbitron({ subsets: ['latin'], variable: '--font-display', weight: ['400','500','600','700','800','900'], display: 'swap' });

// =========================================================================
// 👇 Active config — change ces 3 lignes pour swap
// =========================================================================

export const bodyFont = spaceGrotesk;
export const titleFont = audiowide;
export const displayFont = spaceMono;

export const fontVariables = `${bodyFont.variable} ${titleFont.variable} ${displayFont.variable}`;
