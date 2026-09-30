---
name: Obsidian Slate
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c1c7cf'
  on-secondary: '#2b3137'
  secondary-container: '#41474e'
  on-secondary-container: '#afb6bd'
  tertiary: '#b4c5ff'
  on-tertiary: '#002a78'
  tertiary-container: '#618bff'
  on-tertiary-container: '#002469'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#dde3eb'
  secondary-fixed-dim: '#c1c7cf'
  on-secondary-fixed: '#161c22'
  on-secondary-fixed-variant: '#41474e'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display:
    fontFamily: Geist
    fontSize: 3.5rem
    fontWeight: '600'
    lineHeight: 4rem
    letterSpacing: -0.035em
  display-mobile:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: '500'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for high-performance developer tools, data platforms, and modern technical software requiring uncompromising clarity. The visual language couples precise, reductionist minimalism with high-contrast functional aesthetics. 

The atmosphere rejects muddy shadows, decorative gradients, and synthetic neon glows in favor of laser-sharp legibility, deliberate density, and exact spatial rhythm. Surfaces exist on pure jet black and carbon planes, punctuated strictly by functional electric blue accents that guide intent and interaction. The emotional response is one of surgical control, institutional trust, speed, and modern engineering excellence.

## Colors

The palette is strictly calibrated for dark-mode environments to maximize information density without eye fatigue.

- **Canvas & Surfaces:**
  - Base Canvas: `#000000` (absolute black for outer frame and viewport background)
  - Surface Default: `#0a0a0c` (deep clean jet black for layout containers, cards, and data surfaces)
  - Surface Elevated: `#111317` (subtle step for active states, hover wells, and modals)
- **Accents:**
  - Primary Accent: `#3b82f6` (electric cobalt for high-priority interactive cues, primary buttons, focus rings, and selection indicators)
  - Primary Hover / Pressed: `#2563eb` (deeper electric blue for active interaction states)
- **Borders & Dividers:**
  - Structural Borders: `#1e293b` (crisp, precise, single-pixel hairline dividers)
  - Border Subtle: `#161f2e` (secondary table lines, background grid demarcations)
  - Border Active: `#384966` (input and container focus states)
- **Typography & Content:**
  - Text Primary: `#ffffff` (pure white for all headings, key metric values, and primary actions)
  - Text Secondary: `#e2e8f0` (bright silver-grey for high-clarity subheaders and table headers)
  - Text Muted: `#94a3b8` (cool slate grey for body copy, labels, captions, and secondary metadata)
  - Text Disabled: `#475569`

## Typography

Typography prioritizes geometric discipline, high legibility, and technical density. 

- **Geist** serves as the primary system typeface for all headings and body copy, chosen for its neutral precision, compact vertical metrics, and distinct horizontal balance at high resolutions.
- **JetBrains Mono** is incorporated selectively for metadata tags, status pills, numbers, tabular data, and input code labels to reinforce the technical ethos.
- **Rules of Hierarchy:**
  - Display and Headline tiers require tight negative tracking (`-0.02em` to `-0.035em`) to maintain sharp structural cohesion.
  - Body text remains un-tracked or marginally tightened for frictionless sustained scanning.
  - All labels and technical attributes set in monospace feature explicit positive letter spacing (`0.02em` to `0.04em`) and uppercase treatment when specifying system states.

## Layout & Spacing

The layout is built upon an uncompromising, rigid 4px base increment system structured inside a 12-column responsive fluid grid.

- **Breakpoints & Grids:**
  - **Desktop (>= 1280px):** 12-column grid, `margin-lg` (3rem / 48px), `gutter-lg` (2rem / 32px). Maximum content bound: 1440px.
  - **Tablet (768px - 1279px):** 8-column grid, `margin-md` (2rem / 32px), `gutter-md` (1.5rem / 24px).
  - **Mobile (< 768px):** 4-column grid, `margin` (1rem / 16px), `gutter` (1rem / 16px).
- **Rhythm & Structure:** 
  - Interfaces lean toward deliberate compactness rather than loose editorial padding.
  - Layout lines align flush to structural containers separated by hairline 1px `#1e293b` frames.
  - Vertical stacking relies on strict multiples of `0.5rem` (8px), avoiding arbitrary fractional offsets.

## Elevation & Depth

This system intentionally eliminates blurred drop shadows, multi-tiered soft lighting, and skeuomorphic bevels. Visual depth is established purely through **flat tonal layering** and **hairline outline demarcation**:

1. **Base Level (Canvas):** Pure `#000000`. Structural foundation and backdrop.
2. **First Tier (Panels, Cards, Tables):** Solid `#0a0a0c` bounded by a 1px solid `#1e293b` border. No drop shadows.
3. **Second Tier (Flyouts, Dropdowns, Hovered Modules):** `#111317` surface, framed by a 1px `#2a384f` border.
4. **Active & Focused Tier (Modals, Overlays):** `#0a0a0c` floating above a solid `#000000` scrim with 80% opacity (`rgba(0, 0, 0, 0.8)`). The modal is delineated by a 1px border of `#384966`.
5. **Focus States:** High-contrast 2px solid `#3b82f6` outline with a 2px `#000000` offset, providing unequivocal accessibility without relying on diffuse glow filters.

## Shapes

The system adopts a restrained **Soft (Level 1)** geometric standard to convey a crisp, industrial personality.

- **Base Components:** Inputs, buttons, chips, and small controls use `0.25rem` (4px) corner radii.
- **Containers & Surfaces:** Cards, panels, modals, and split panes use `0.5rem` (8px / `rounded-lg`).
- **Inner Nested Elements:** When nesting elements inside a parent container, the child radius is kept at `0.25rem` to avoid concentric corner distortion.
- **Pill Shapes:** Strictly prohibited except for binary status dot indicators.

## Components

### Buttons
- **Primary:** Solid `#3b82f6` background with pure `#ffffff` text (`Geist`, weight 500, `body-sm`). Padding: `0.5rem 1rem`. Radius: `0.25rem`. Hover state: `#2563eb`. Active: `#1d4ed8`. No drop shadow.
- **Secondary / Outline:** Transparent background, 1px `#1e293b` border, `#ffffff` text. Hover state: background `#111317`, border `#384966`.
- **Ghost:** Transparent background, `#94a3b8` text. Hover state: background `#111317`, text `#ffffff`.
- **Disabled State:** Opacity 40%, border `#1e293b`, cursor `not-allowed`.

### Input Fields & Controls
- **Text Inputs:** Height 36px, background `#0a0a0c`, border 1px solid `#1e293b`, text `#ffffff` (`body-sm`), placeholder `#475569`. Radius: `0.25rem`.
- **Focus Ring:** 1px solid `#3b82f6` border with immediate transition; no ambient glow.
- **Checkboxes & Radios:** 16px square/circle, `#0a0a0c` fill with 1px `#1e293b` border. Checked state: solid `#3b82f6` fill with pure white tick mark.

### Chips & Badges
- **Status Badges:** Background `#0a0a0c`, border 1px solid `#1e293b`, text `#94a3b8`, font `JetBrains Mono` (`label-sm`). Padding: `0.125rem 0.5rem`.
- **Active / Accent Badge:** Background `#111c2e`, border 1px solid `#2563eb`, text `#3b82f6`.

### Cards & Panels
- **Container Structure:** Flat `#0a0a0c` fill, 1px solid `#1e293b` perimeter, radius `0.5rem` (`rounded-lg`).
- **Card Headers:** Separated from body by a 1px solid `#1e293b` horizontal line. Padding: `1rem` on desktop, `0.75rem` on mobile. Headings use pure `#ffffff` (`headline-sm`). Body text uses `#94a3b8` (`body-sm`).

### Lists & Data Tables
- **Table Headers:** Background `#0a0a0c`, 1px solid `#1e293b` border-bottom, text `#e2e8f0` (`label-sm`, uppercase).
- **Table Rows:** Alternating hover background `#111317`, border-bottom 1px solid `#161f2e`. Cell text `#94a3b8` with primary identifiers in `#ffffff`.

### Code Blocks & Monospace Terminals
- High-contrast technical blocks set on pure `#000000` with 1px solid `#1e293b` border. Text `#e2e8f0` using `JetBrains Mono` (`body-sm`). Line numbers set in `#475569`.