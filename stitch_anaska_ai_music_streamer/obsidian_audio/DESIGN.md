---
name: Obsidian Audio
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#ffb873'
  on-tertiary: '#4b2800'
  tertiary-container: '#e89337'
  on-tertiary-container: '#5b3200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is tailored for an ultra-minimalist, audio-first mobile streaming experience. The aesthetic eliminates visual clutter—stripping away skeuomorphism, excessive glowing treatments, ambient gradients, and heavy glassmorphism blurs. The design relies on flat structural hierarchy, meticulous typographic rhythm, deep obsidian surfaces, and a singular, electric cyan accent.

### Audience & Mood
- **Target Audience:** Discriminating listeners, audio purists, and modern digital minimalists who value speed, legibility, and distraction-free playback.
- **Emotional Tone:** Focus, precision, understated elegance, and effortless restraint.
- **Core Aesthetic:** Flat Architectural Minimalism. Content and cover art anchor the view; interface controls are quiet, crisp, and tactful.

## Colors

The palette is engineered exclusively for an uncompromising, battery-efficient dark mode. Backgrounds rely on solid, non-gradient foundations that prevent visual fatigue and maximize legibility.

### Surface Hierarchy
- **Canvas Base (`#0A0F1D`):** The absolute background for root views and bottom sheets.
- **Surface Elevation 1 (`#0F172A`):** The default card, track row, and container background.
- **Surface Elevation 2 (`#1E293B`):** Active states, search bars, player drawers, and elevated interactive panels.
- **Structural Stroke (`#334155`):** Razor-thin 1px borders providing structure without optical weight.

### Typography & Iconography
- **Primary Text (`#F8FAFC`):** Crisp high-contrast white for track names, active navigation, and primary headlines.
- **Secondary Text (`#94A3B8`):** Balanced slate gray for artist metadata, duration, album names, and secondary icons.
- **Tertiary Text (`#64748B`):** Muted slate for placeholders, timestamps, and inactive controls.

### Accents
- **Primary Accent (`#06B6D4`):** Pure electric cyan used sparingly for scrubber heads, active toggles, primary play controls, and verified badges.
- **Secondary Accent (`#38BDF8`):** Sky blue tint reserved strictly for hover or tapped states on cyan elements.

## Typography

Typography establishes an architectural and utilitarian balance. **Geist** provides an unpretentious, highly legible sans-serif for track titles, navigation, and artist names. **JetBrains Mono** is introduced for analytical audio data: track runtimes, bitrates (e.g., `24-BIT / 96KHZ FLAC`), sample rates, track order indexing, and status tags.

### Rules of Usage
- **Display & Headlines:** Keep tracking tight (`-0.01em` to `-0.02em`) with medium to semi-bold weights. Never use heavy black or condensed styles.
- **Body & Metadata:** Left-aligned, unembellished, rendering clean against dark canvases.
- **Mono Data:** Always uppercase for tags, timestamps, and bitrates to preserve tabular spacing.

## Layout & Spacing

The layout is optimized for single-handed mobile navigation using a compact 4-column fluid mobile grid anchored by consistent gutters and outer padding.

### Rhythm & Alignment
- **Screen Margins:** Fixed at `1rem` (16px) on mobile viewports to preserve edge-to-edge content density.
- **Row Rhythm:** List items enforce a tight vertical footprint with vertical padding scaled between `space-sm` and `space-md` to maximize screen real estate.
- **Docked Elements:** The persistent mini-player and bottom navigation dock sit above a dedicated safe area, maintaining a 1px `#334155` border divider rather than casting drop shadows.
- **Reflow Rules:** On tablet or larger devices, the single-column feed expands into an offset two-column split view (left: structural library/now-playing panel; right: track list/discovery grid).

## Elevation & Depth

This system intentionally rejects shadows, lighting simulations, and blurs. Depth is achieved exclusively through **tonal stacking** and **crisp borders**.

### Principles
- **Flat Surface Stacking:** Level changes are represented by shifting the base background tone. An active track row shifts from `#0A0F1D` (base) to `#0F172A`, and an elevated card or modal utilizes `#1E293B`.
- **Low-Contrast Outlines:** Surfaces demarcate boundaries with a solid `1px` border using `#334155`. Floating controls, sheets, and card edges avoid soft drop shadows completely.
- **Scrims & Modals:** Background overlays use a pure solid `#000000` with `70%` opacity—no backdrop-filter blur.

## Shapes

The shape system employs controlled, conservative corner rounding (`roundedness: 1`). Soft 4px (`0.25rem`) corners dominate standard elements, keeping the UI sharp, geometric, and functional.

- **Album Art & Cards:** 4px border radius.
- **Controls & Input Fields:** 4px border radius.
- **Filter Tags & Chips:** Full pill radius (`9999px`) reserved specifically for contextual tag filters to differentiate metadata tags from structural buttons.

## Components

### Buttons
- **Primary Play Button:** Solid electric cyan (`#06B6D4`) background, deep slate (`#0A0F1D`) bold icon or text. Square or slightly softened (4px) profile. No gradient, no glow.
- **Secondary / Ghost Button:** Transparent background, 1px `#334155` border, `#F8FAFC` text. On tap: background fills to `#1E293B`.
- **Icon Buttons (Shuffle, Repeat, More):** Transparent container, stroke-based iconography rendered in `#94A3B8`. Active state switches color to `#06B6D4`.

### Track Lists & Rows
- **Container:** Height fixed at 56px. Background defaults to transparent, transitioning to `#0F172A` on touch.
- **Structure:**
  - Left: 40x40px album thumbnail (4px radius) or 2-digit track number in JetBrains Mono (`#64748B`).
  - Center: Truncated track title in `#F8FAFC`, artist name beneath in `#94A3B8`.
  - Right: Duration (`label-md` in `#64748B`) followed by a minimal 3-dot action trigger.
- **Active Track:** Title text shifts to `#06B6D4`. A 2px vertical electric cyan indicator aligns to the far left margin.

### Chips & Filter Tags
- **Base State:** `#0F172A` background, 1px `#334155` border, `#94A3B8` text, pill-shaped.
- **Active State:** `#06B6D4` background, `#0A0F1D` text, border matches background.

### Scrubbers & Sliders
- **Track Rail:** 2px solid `#1E293B`.
- **Progress Fill:** Solid `#06B6D4` line with no gradient or outer drop glow.
- **Thumb:** 8px solid white or cyan circle without shadow, visible on drag.

### Input Fields
- **Search Bar:** Solid `#0F172A` background, 1px border in `#334155`, text in `#F8FAFC`, placeholder in `#64748B`. Focused state transitions the border to `#06B6D4`.

### Checkboxes & Radios
- **Selection State:** 16x16px square (2px radius) with `#334155` border. Checked state renders a solid `#06B6D4` fill with `#0A0F1D` checkmark.