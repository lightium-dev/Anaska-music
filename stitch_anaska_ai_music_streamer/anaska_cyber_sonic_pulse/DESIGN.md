---
name: Anaska Cyber-Sonic Pulse
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ddb7ff'
  on-tertiary: '#490080'
  tertiary-container: '#b76dff'
  on-tertiary-container: '#400071'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-mono:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.1em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a forward-looking, sonic-first atmosphere where high-fidelity audio engineering converges with synthetic intelligence. Built for modern listeners, dynamic creators, and nightlife tastemakers, the aesthetic merges precision cyber-minimalism with deep luminescence and frosted glass dimensionality.

The visual direction centers on **Electric Glassmorphism & Neon Depth**:
- **Atmospheric Void:** Deep, charcoal canvases that eliminate visual fatigue and allow vibrant album art, waveforms, and visualizers to take center stage.
- **Synesthetic Glow:** Luminous purple-violet energy counterbalanced by responsive cyan-teal pulses, signifying audio flow and active generative DJ intelligence.
- **Dimensional Translucency:** Fine, semi-transparent frosted panels (`backdrop-blur-md`, subtle edge reflections) that hover smoothly above deep spatial audio environments.
- **Fluid Intelligence:** Visual elements react organically to rhythm and algorithmic adjustments, balancing technical sharpness with welcoming tactile curves.

## Colors

The palette is tuned specifically for low-light contexts with high-vibrancy audio visualizers.

- **Primary (`#8B5CF6` / `#7C3AED`):** Electric Violet represents core identity, user interaction states, play buttons, and active media progress tracks.
- **Secondary (`#06B6D4` / `#22D3EE`):** Neon Cyan/Teal designates intelligence cues, the DJ Muse assistant voice engine, live waveform peaks, and temporal metadata.
- **Tertiary (`#A855F7`):** Accent Violet introduces depth to linear gradients, hover glows, and premium audio badges.
- **Surfaces & Backgrounds:**
  - Canvas Root: Deep Obsidian (`#0A0B10`)
  - Elevated Container Base: Midnight Charcoal (`#12141F`)
  - Floating Overlays & Cards: Slate Trench (`#1A1D2D`) layered with `rgba(255, 255, 255, 0.05)`
  - Edge Borders: Crisp low-opacity specular outlines (`rgba(255, 255, 255, 0.1)`)
- **Semantic Feedback:**
  - Success/In Sync: `#10B981`
  - Warning/Bitrate Throttling: `#F59E0B`
  - Critical/Drop Stream: `#EF4444`

## Typography

Typography establishes an intentional dynamic between future-forward geometry and effortless rapid reading.

- **Headlines (Sora):** Carries structural boldness and tech-forward curves, used for artist names, album titles, and hero audio spaces.
- **Body Text (Plus Jakarta Sans):** Delivers clean readability across lyrics, descriptions, and user comments with open apertures in low-light viewports.
- **Labels & Metadata (Space Grotesk):** Provides engineered precision for audio bitrates, track durations, timestamps, and DJ Muse technical status cues.

## Layout & Spacing

The layout is built on a responsive 12-column fluid grid system engineered for streaming hierarchy: persistent left navigation/queue panels, a dynamic center stage showcase, and a dedicated right-docked AI DJ Muse panel.

- **Desktop (1200px+):** 12 columns with 24px gutters and 32px canvas margins. Sidebars occupy 3 to 4 fixed or proportional columns; the central content scrolls smoothly beneath sticky frosted glass media headers.
- **Tablet (768px - 1199px):** 8 columns with 16px gutters and 24px margins. DJ Muse shifts to a collapsable split drawer or slide-over sheet.
- **Mobile (<768px):** 4 columns with 16px gutters and 16px margins. Media controls and DJ Muse dock to a sticky bottom floating pill with ambient reactive glow.
- **Vertical Rhythm:** Strict multiples of 4px and 8px govern component paddings, keeping track listings dense while allowing hero visualizers expansive breathing room.

## Elevation & Depth

Visual hierarchy uses frosted glassmorphism anchored over ambient light-bleed fields rather than muddy dropped drop-shadows.

1. **Base Layer (Level 0):** Unlit background canvas (`#0A0B10`).
2. **Surface Layer (Level 1):** Midnight charcoal surfaces (`#12141F`) with subtle 1px border stroke (`rgba(255, 255, 255, 0.04)`).
3. **Glass Floating Containers (Level 2):** Translucent fill (`rgba(255, 255, 255, 0.05)`), backed by `backdrop-filter: blur(16px)` and perimeter highlights (`border: 1px solid rgba(255, 255, 255, 0.10)`).
4. **Interactive Overlays & Modals (Level 3):** Frosted glass elevated with dual ambient shadows: a soft black foundation (`0 20px 40px -10px rgba(0, 0, 0, 0.7)`) accompanied by a diffuse neon-tinted underglow (`0 0 30px rgba(139, 92, 246, 0.15)`).
5. **DJ Muse AI Engine (Luminescent Priority):** The AI module emits an active radial neon flare (`box-shadow: 0 0 24px rgba(6, 182, 212, 0.35)`), expanding and contracting based on speech and musical frequency.

## Shapes

The design uses a generous curved shape language (`roundedness: 3`) to contrast with the dark cyber-aesthetic, evoking tactile touchscreens and modern ergonomic hardware.

- **Pill Radius (Fully Rounded):** Primary playback buttons, status chips, audio tag filters, search bars, and the floating player bar.
- **Extended Corners (`rounded-3xl` / 24px-32px):** Album presentation cards, floating modal containers, DJ Muse interactive visualizer hub, and lyric panes.
- **Standard Corners (`rounded-2xl` / 16px):** Track row containers, utility dropdowns, and settings modules.

## Components

### Buttons & Controls
- **Primary Play / Action:** Fully rounded pill filled with a linear gradient (`from-[#8B5CF6] to-[#06B6D4]`), pure white text/icons, and an active soft hover glow (`box-shadow: 0 0 20px rgba(139, 92, 246, 0.45)`).
- **Secondary Glass Action:** Pill button with `backdrop-blur-md`, `bg-white/5`, `border border-white/10`, transitioning on hover to `border-white/20 bg-white/10`.
- **Icon Buttons (Shuffle, Repeat, Volume):** Borderless 40x40px touch targets with centered glyphs in muted lavender-gray (`#94A3B8`), illuminating in neon cyan upon activation.

### Translucent Track Cards & Tiles
- Album and playlist cards feature a 1:1 aspect ratio media block, nested within a `rounded-3xl` card container using `bg-white/5 border border-white/10 p-4`. On hover, the card scales minimally (101.5%) while the border increases brightness to `rgba(255, 255, 255, 0.2)`.

### Track List Row
- Horizontal layout with subtle separation. Background is transparent by default, shifting to `bg-white/[0.04]` with `rounded-xl` on hover. Displays track index, album thumbnail, track title (`Plus Jakarta Sans`), duration/bitrate (`Space Grotesk`), and inline action menus.

### Chips & Genre Tags
- Compact pills utilizing `bg-white/5 border border-white/10 px-3.5 py-1.5 label-md text-slate-300`. Active tags feature an electric violet stroke and subtle background color fill (`bg-violet-500/15 border-violet-500/50 text-white`).

### Input Fields & Search
- Rounded-full containers with `bg-[#12141F] border border-white/10 text-white px-5 py-3`. Focus states illuminate the border with a cyan glow (`border-[#06B6D4] shadow-[0_0_12px_rgba(6,182,212,0.25)]`).

### DJ Muse AI Widget
- Dedicated component incorporating an animated concentric SVG gradient ring (`#8B5CF6` into `#06B6D4`) paired with an interior audio-wave visualizer.
- Textual responses use frosted card callouts with a cyan edge accent (`border-l-2 border-l-[#06B6D4]`).

### Progress & Volume Scrubbers
- 4px baseline bar with a filled gradient segment (`#8B5CF6` to `#06B6D4`) topped with an 8px circular scrubber knob that expands to 12px with a neon halo on hover/drag.