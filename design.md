# 🎨 Metis Design Language & Guidelines

This document serves as the official design system for Metis. It defines the visual standards, tokens, and implementation patterns required to maintain a calm, trustworthy, and maternal healthcare interface.

---

## 1. Visual Identity & "Glassmorphism"
Metis follows a **Soft Healthcare Glassmorphism** system. The goal is to feel airy, safe, and modern—bridging the gap between clinical reliability and emotional warmth.

### Core Principles
- **Softness**: Rounded corners and diffused shadows.
- **Translucency**: Layered interfaces with high levels of blur and saturation.
- **Calmness**: A desaturated, pastel-heavy color palette.

---

## 2. Color System

### Base Palette
| Token | Value | Use Case |
| :--- | :--- | :--- |
| **Trust Blue** | `#5C7CFA` | Primary buttons, active nav states, growth graphs. |
| **Maternal Yellow** | `#FFD98E` | Important alerts, vaccine due reminders. |
| **Growth Green** | `#8ED1B2` | Positive metrics, successful status. |
| **Pastel Indigo** | `#A5C8FF` | Secondary indicators, soft backgrounds. |
| **Sky Tint** | `#E0EFFF` | Background gradient start. |

### Semantic Text Colors
- **Primary**: `rgba(15, 23, 42, 0.8)` (Slate 900/80) - Used for headings.
- **Secondary**: `rgba(71, 85, 105, 1)` (Slate 500) - Used for subtexts and descriptions.

---

## 3. Background System
The background is critical for the glass effect. It uses a combination of a fixed linear gradient and decorative blurred "blobs."

### The Metis Gradient (Pure Cool Blue)
```css
background: fixed linear-gradient(
  135deg,
  #E3F0FF 0%,
  #EDF5FF 50%,
  #E1EEFF 100%
);
```

### Decorative Blobs
Place these behind the main content (z-index 0). Use strictly cool blue tones to avoid pinkish or white voids.
- **Top Left**: `#BBDDFF/25` (blur 140px)
- **Bottom Right**: `#C6DFFF/30` (blur 120px)
- **Top Right**: `#DCE6FF/25` (blur 110px)
- **Bottom Left**: `#D0E1FF/20` (blur 90px)

---

## 4. The "Liquid Glass" System
All major UI containers must use the `.glass` utility.

### Technical Specification
- **Background**: Multi-layered directional gradient: `linear-gradient(165deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 40%, rgba(255, 255, 255, 0) 100%)`.
- **Backdrop Filter**: Deep blur (`40px`) and high saturation (`200%`) for a heavy, wet glass look.
- **Border**: `1.5px solid rgba(255, 255, 255, 0.8)` (Glossy structural edge).
- **Shadow**: `0 4px 30px rgba(0, 0, 0, 0.03)` with a high-intensity `inset 0 0 12px 2px rgba(255, 255, 255, 0.3)`.
- **Radius**: `1.25rem` (20px)

---

## 5. Typography
Metis uses a dual-font approach for a premium look.

- **Primary (Serif)**: `Instrument Serif` - Used for all major headlines (Hero, Section Titles). Pattern: Regular + Italic Serif.
- **Secondary (Sans)**: `Instrument Sans` - Used for sub-headings, UI elements, navigation, and body text.

---

## 6. Layout & Spacing
- **Sidebar**: Fixed width (`w-24` or `w-32`), fixed position, high z-index.
- **Grid**: Standard 8px grid system.
- **Padding**: Minimum `p-8` for dashboard containers to allow for "breathing room."
- **Scrolling**: The sidebar remains static; only the main content area should scroll.

---

## 7. Interactive Elements
- **Cursors**: Every interactive element (buttons, cards, nav items) **MUST** use `cursor: pointer`.
- **States**: 
  - Buttons: Slight opacity shift or background tint.
  - Cards: Optional slight scale or shadow increase on hover.

---

## 🧡 Brand Essence
**Soft. Intelligent. Secure. Emotional.**
*Metis — Growing With You, From Day One.*
