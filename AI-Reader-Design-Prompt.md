# 🎨 UI Design System Prompt — "Dark Editorial Luxury"
> Use this prompt when building any frontend UI in this design system. Hand it to your AI coding agent as a system prompt or prepend it to your feature request.

---

## SYSTEM PROMPT — PASTE THIS TO YOUR AGENT

You are building a UI in the **"Dark Editorial Luxury"** design system. Follow every rule in this specification exactly. Do not default to generic UI patterns, purple gradients, rounded cards, or system fonts. Every decision — colour, type, spacing, motion — must conform to the rules below.

---

## 1. AESTHETIC DIRECTION

The visual language is built on a single tension: **the warmth of analogue print culture against the precision of digital interfaces.** Reference points are the typographic rigour of *The Economist*, the spatial intelligence of *Notion*, and the tactile warmth of aged gold-leaf bookbinding.

**Core Rule:** One dominant near-black base. One warm metallic gold accent. Never use cool blues, purples, or greens as accent colours. The warmth of `#c9933a` against `#0a0b0f` is what creates the luxury editorial feel — not gradients, not glassmorphism, not frosted glass.

---

## 2. COLOUR PALETTE

Define these as CSS custom properties. Use **only** these colours.

```css
:root {
  /* Base surfaces */
  --ink:        #0a0b0f;  /* Primary background — deepest surface */
  --mist:       #1a1c24;  /* Elevated background — cards, panels */
  --slate:      #2c2f3e;  /* UI elements, icon containers */
  --fog:        #4a4e62;  /* Borders, dividers, muted UI */

  /* Brand accent */
  --gold:       #c9933a;  /* Primary accent — CTAs, highlights, icons */
  --gold-light: #e8b96a;  /* Hover states, secondary gold */
  --amber:      #f0a840;  /* Warm glow effects */
  --ember:      #d4622a;  /* Gradient tails, warm secondary */

  /* Text */
  --white:      #fafaf8;  /* Primary body text */
  --ghost:      #8b8fa8;  /* Subtitles, descriptions, metadata */
  --paper:      #f5f0e8;  /* Warm-white — use sparingly */
}
```

**Rules:**
- All borders use `rgba(255,255,255,0.06)` — never hard solid colours
- Elevated surfaces use `rgba(255,255,255,0.015)` layering over `--ink`
- Gold is the ONLY accent — it appears on: active borders, icons, eyebrow labels, CTA buttons, hover reveals, and emphasis text
- Never use opacity < 0.03 or > 0.15 on gold background glows

---

## 3. TYPOGRAPHY

Import from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

```css
--font-serif: 'Playfair Display', Georgia, serif;
--font-sans:  'DM Sans', system-ui, sans-serif;
--font-mono:  'DM Mono', monospace;
```

### Type Scale

| Element | Font | Size | Weight | Letter-spacing | Notes |
|---|---|---|---|---|---|
| Hero headline | Playfair Display | clamp(3rem, 5vw, 5rem) | 900 | -0.02em | Contains italic gold word |
| Section heading | Playfair Display | clamp(2.2rem, 4vw, 3.5rem) | 700 | -0.02em | |
| Card title | Playfair Display | 1.3–1.5rem | 700 | normal | |
| Body text | DM Sans | 1rem | 300 | normal | line-height: 1.7–1.8 |
| Eyebrow label | DM Mono | 0.7rem | 400 | 0.2em | ALL CAPS — always gold |
| Button text | DM Sans | 0.82–0.9rem | 500 | 0.08em | ALL CAPS |
| Tags / metadata | DM Mono | 0.6–0.72rem | 400 | 0.12–0.18em | ALL CAPS |

### ★ Signature Typographic Move — ALWAYS DO THIS
Inside every major headline, place **one italic Playfair Display word in `--gold`** colour. This is the single most important typographic rule of this system.

```html
<!-- Example pattern — the italic gold word breaks rhythm -->
<h1>Stop Reading. <em style="color: var(--gold); font-style: italic;">Start Mastering.</em></h1>
<h2>From <em>Highlight</em> to <em>Habit.</em></h2>
```

---

## 4. SPACING & LAYOUT

```css
/* Section padding */
.section { padding: 6rem 4rem; }          /* 96px vertical, 64px horizontal */

/* Base grid */
background-size: 60px 60px;               /* Grid line rhythm */

/* Component padding */
.card { padding: 2.5rem 3rem; }

/* Dividers */
border: 1px solid rgba(255,255,255,0.06); /* Always opacity-based */
```

**Rules:**
- Negative space is intentional — never cram elements
- Layout rhythm alternates: full-width → 2-column → full-width → 3-column
- Asymmetry and grid-breaking elements are intentional — not mistakes
- Mobile: collapse to single column, reduce section padding to `4rem 2rem`

---

## 5. VISUAL TEXTURE & ATMOSPHERE

### Noise Overlay — ALWAYS INCLUDE
Add this to `body::before`. It prevents the flat digital look and gives surfaces a subtle analogue texture.

```css
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 1000;
}
```

### Radial Gold Halos — Use on Hero & CTA
```css
background:
  radial-gradient(ellipse 60% 80% at 80% 50%, rgba(201,147,58,0.07) 0%, transparent 60%),
  radial-gradient(ellipse 40% 60% at 20% 80%, rgba(212,98,42,0.05) 0%, transparent 50%);
```

### Faint Grid Lines — Use on Hero
```css
background-image:
  linear-gradient(rgba(201,147,58,0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(201,147,58,0.04) 1px, transparent 1px);
background-size: 60px 60px;
/* Mask so it only appears near focal point — not edge to edge */
mask-image: radial-gradient(ellipse 80% 60% at 80% 50%, black 0%, transparent 70%);
```

---

## 6. COMPONENT PATTERNS

### Eyebrow Labels
Every section heading must be preceded by a mono-caps eyebrow with a 24px gold line before it.

```css
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 1rem;
}
.eyebrow::before {
  content: '';
  width: 24px;
  height: 1px;
  background: var(--gold);
}
```

### Cards
```css
.card {
  background: var(--ink);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 2.5rem 3rem;
  position: relative;
  overflow: hidden;
  transition: background 0.4s, border-color 0.3s, transform 0.3s;
}

/* Gold top-edge reveal on hover */
.card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--gold) 0%, transparent 60%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.card:hover {
  background: var(--mist);
  border-color: rgba(201,147,58,0.3);
  transform: translateY(-4px);
}
.card:hover::before { transform: scaleX(1); }

/* Large decorative ghost number — optional */
.card-num {
  font-family: var(--font-serif);
  font-size: 4rem; font-weight: 900;
  color: rgba(201,147,58,0.08);
  position: absolute; top: 1rem; right: 1.5rem;
  line-height: 1;
  transition: color 0.4s;
}
.card:hover .card-num { color: rgba(201,147,58,0.15); }
```

### Buttons
```css
/* Primary — solid gold, sharp corners */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--gold);
  color: var(--ink);
  padding: 1rem 2.2rem;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 0;               /* SHARP CORNERS — never round */
  border: none;
  position: relative;
  overflow: hidden;
  transition: background 0.3s, transform 0.3s;
}
.btn-primary::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
}
.btn-primary:hover { background: var(--gold-light); transform: translateY(-2px); }
.btn-primary:hover::after { opacity: 1; }

/* Ghost — bordered, no fill */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--ghost);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-decoration: none;
  background: none;
  border: none;
  transition: color 0.3s;
}
.btn-ghost:hover { color: var(--white); }
```

### Section Dividers
```css
.divider {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  opacity: 0.3;
}
.divider::before, .divider::after {
  content: ''; flex: 1;
  height: 1px;
  background: var(--gold);
}
.divider span {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  white-space: nowrap;
}
```

### Icon Containers
```css
.icon-wrap {
  width: 48px; height: 48px;
  border: 1px solid rgba(201,147,58,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s, background 0.3s;
  border-radius: 0;  /* Sharp */
}
.card:hover .icon-wrap {
  border-color: var(--gold);
  background: rgba(201,147,58,0.08);
}
.icon-wrap svg {
  width: 22px; height: 22px;
  stroke: var(--gold);
  fill: none;
  stroke-width: 1.5;
}
```

### Floating Tags (decorative)
```css
.floating-tag {
  position: absolute;
  background: var(--slate);
  border: 1px solid rgba(201,147,58,0.3);
  padding: 0.4rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--gold);
  letter-spacing: 0.1em;
  border-radius: 2px;
  white-space: nowrap;
  animation: floatA 4s ease-in-out infinite;
}
```

---

## 7. ANIMATION SYSTEM

### Page Load — Staggered fadeUp
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Apply with increasing delays */
.hero-eyebrow { opacity: 0; animation: fadeUp 0.8s 0.2s ease forwards; }
.hero-headline { opacity: 0; animation: fadeUp 0.8s 0.35s ease forwards; }
.hero-sub      { opacity: 0; animation: fadeUp 0.8s 0.5s ease forwards; }
.hero-actions  { opacity: 0; animation: fadeUp 0.8s 0.65s ease forwards; }
```

### Scroll Reveal
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (i % 4) * 0.08 + 's';
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```
```css
.reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
```

### Hover — All transitions
```css
transition: all 0.3s ease;         /* Default */
transition: transform 0.4s ease;   /* Border reveals — use scaleX, not width */
transition: opacity 0.3s;          /* Colour/opacity only */
```

### Pulse Glow (ambient elements)
```css
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201,147,58,0); }
  50%       { box-shadow: 0 0 20px 2px rgba(201,147,58,0.12); }
}
/* Apply: animation: pulseGlow 3s ease-in-out infinite; */
```

### Float (decorative tags)
```css
@keyframes floatA {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50%       { transform: translateY(-10px) rotate(1deg); }
}
@keyframes floatB {
  0%, 100% { transform: translateY(0px) rotate(1deg); }
  50%       { transform: translateY(-8px) rotate(-1deg); }
}
```

### Shimmer (skeleton/live elements)
```css
.shimmer::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
  animation: shimmer 2.5s infinite;
}
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
```

### Stat Counters
```javascript
function animateCount(el, target, suffix = '') {
  let start;
  const duration = 1800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// Trigger via IntersectionObserver when scrolled into view
```

---

## 8. CUSTOM CURSOR

Replace the default browser cursor. Two-layer system.

```css
body { cursor: none; }

.cursor {
  width: 10px; height: 10px;
  background: var(--gold);
  border-radius: 50%;
  position: fixed; top: 0; left: 0;
  pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%);
  mix-blend-mode: difference;
}
.cursor-ring {
  width: 36px; height: 36px;
  border: 1px solid rgba(201,147,58,0.5);
  border-radius: 50%;
  position: fixed; top: 0; left: 0;
  pointer-events: none; z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s, opacity 0.3s;
}
```

```javascript
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function animate() {
  rx += (mx - rx) * 0.15;  // Lag creates organic feel
  ry += (my - ry) * 0.15;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  ring.style.left   = rx + 'px'; ring.style.top   = ry + 'px';
  requestAnimationFrame(animate);
})();

// Expand ring on interactive elements
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.opacity = '0.5'; });
  el.addEventListener('mouseleave', () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '1'; });
});
```

---

## 9. NAVIGATION PATTERN

```css
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 500;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem 4rem;
  background: linear-gradient(to bottom, rgba(10,11,15,0.95) 0%, transparent 100%);
  backdrop-filter: blur(4px);
}
/* Logo: serif font, gold dot/accent */
/* Nav links: 0.8rem, letter-spacing 0.12em, uppercase, ghost colour → gold on hover */
/* CTA: gold border, gold text, fills solid gold on hover */
```

---

## 10. SCROLLBAR

```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--ink); }
::-webkit-scrollbar-thumb { background: var(--fog); border-radius: 2px; }
```

---

## 11. WHAT NOT TO DO

These are hard prohibitions. Violating them breaks the system's identity:

- ❌ No `border-radius > 2px` on cards or buttons
- ❌ No purple, blue, teal, or green as accent colours
- ❌ No Inter, Roboto, Arial, or system-ui as display fonts
- ❌ No white or light-mode backgrounds
- ❌ No glassmorphism (`backdrop-filter: blur` on cards — only on nav)
- ❌ No simultaneous animations — always stagger
- ❌ No bounce or spring easing — use `ease` or `ease-in-out` only
- ❌ No solid-colour borders — always `rgba` opacity-based
- ❌ No gradient as a background substitute — use it only as overlay/halo
- ❌ No emojis or illustrations — icons only, via SVG with `stroke: var(--gold)`

---

## 12. PRE-FLIGHT CHECKLIST

Before delivering any screen, verify:

- [ ] Background is `#0a0b0f` or `#1a1c24` — not pure black, not dark grey
- [ ] Gold `#c9933a` is the only accent colour
- [ ] Display font is Playfair Display — body is DM Sans — labels are DM Mono
- [ ] At least one headline has an italic serif word in gold
- [ ] All buttons and cards have sharp corners (`border-radius: 0`)
- [ ] All borders use `rgba(white, 0.06)` — not solid colours
- [ ] Every section has a mono-caps eyebrow with a 24px gold `::before` line
- [ ] Noise texture overlay is on `body::before` at `opacity: 0.03`
- [ ] At least one radial gold halo glow on hero or CTA section
- [ ] Hover states use `scaleX` or `translateY` — not colour-only changes
- [ ] All animations are staggered — never fire simultaneously
- [ ] Custom cursor is implemented (two-layer dot + ring)
- [ ] Scrollbar is styled (4px, fog thumb)

---

*Design System: "Dark Editorial Luxury" — Active Intelligence Reader v1.0*
