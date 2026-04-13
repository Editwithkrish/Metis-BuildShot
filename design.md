# 🎨 METIS Design System

This document outlines the design principles, tokens, and components used in the METIS platform to ensure visual consistency across all pages and features.

---

## 🏗️ Design Philosophy

METIS combines **clinical precision** with **human-centric empathy**. The aesthetic is a blend of high-tech and high-care:
- **Premium Dark Aesthetic**: Utilizing deep charcoal and obsidian tones to minimize eye strain and convey authority.
- **Vibrant Accents**: Using a signature seafoam green (`#86efac`) to symbolize health, growth, and hope.
- **Glassmorphism**: Subtle use of `backdrop-blur` and low-opacity borders to create depth and hierarchy without clutter.
- **Dynamic Interactions**: Micro-animations and staggered reveals that make the interface feel alive and responsive.

---

## 🎨 Color Palette

### Base Colors (OKLCH)
| Token | OKLCH Value | Description |
|---|---|---|
| **Background** | `oklch(0.06 0.008 260)` | Deep Obsidian (Primary background) |
| **Foreground** | `oklch(0.94 0.005 90)` | Off-White (Primary text) |
| **Card** | `oklch(0.09 0.008 260)` | Charcoal (Component backgrounds) |
| **Muted** | `oklch(0.12 0.008 260)` | Light Charcoal (Secondary UI elements) |
| **Border** | `oklch(0.18 0.008 260)` | Subtle Edge |

### Signature Accent
- **Primary Accent**: `#86efac` (Seafoam Green)
- **Usage**: Call-to-action buttons, active states, key data highlights, and branding marks.

---

## 🔠 Typography

We use a three-font system for maximum typographic hierarchy:

| Font Family | Usage | Characteristics |
|---|---|---|
| **Instrument Serif** | Display | Headlines, large section titles (`font-display`). Large, elegant, serif. |
| **Instrument Sans** | Sans | Body text, UI labels, buttons. Clean, highly readable. |
| **JetBrains Mono** | Mono | Code snippets, technical stats, eyebrow text. Precise, developer-friendly. |

---

## 📐 Layout & Grid

### The "Bento" Grid
- Most sections utilize a **Bento Grid** layout system.
- Components are housed in cards with a `border-foreground/10` and `bg-foreground/[0.02]`.
- Padding is generous (`p-8` to `p-14` on desktop) to allow the content to breathe.

### Global Spacing
- **Section Vertical Padding**: `py-24 lg:py-32` or `py-32 lg:py-40`.
- **Max Container Width**: `max-w-[1400px]`.

---

## ✨ Motion & Effects

### Signature Animations
- **BlurWord**: Staggered letter reveal with opacity and blur fade-in.
- **Line Reveal**: `clip-path` based reveal for borders and section dividers.
- **DotGraph**: Canvas-based real-time organic wave visualizations.
- **Noise Overlay**: A subtle `0.03` opacity noise texture on body for a tactile/organic feel.

### Animated Transitions
- **Hover Lift**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for smooth upward movement on interactive cards.
- **Marquee**: Infinite horizontal scroll for partners and ticker text.

---

## 🧱 Components Pattern

- **Buttons**: Rounded-full, high-contrast, `shadow-[0_0_20px_rgba(134,239,172,0.3)]` on hover.
- **Section Headers**: Eyebrow text in Mono (`text-muted-foreground`), followed by a large Display headline.
- **Navigation**: Glassmorphic sticky header with high-contrast active states.

---

## 📋 Checklist for New Components
- [ ] Does it use the defined OKLCH variables?
- [ ] Is it using the correct font family (Sans/Display/Mono)?
- [ ] Does it have a smooth entry animation?
- [ ] Is the padding consistent with existing bento cards?
- [ ] Is it responsive (`lg:` breakpoints for grid column changes)?
