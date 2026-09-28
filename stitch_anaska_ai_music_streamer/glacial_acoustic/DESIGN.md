---
name: Glacial Acoustic
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#171c25'
  surface-container: '#1b2029'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2f0'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dfe2f0'
  inverse-on-surface: '#2c303b'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dce6'
  primary: '#e0fdff'
  on-primary: '#00373a'
  primary-container: '#00f2fe'
  on-primary-container: '#006a70'
  inverse-primary: '#00696f'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#e7fcff'
  on-tertiary: '#00363c'
  tertiary-container: '#6dedfe'
  on-tertiary-container: '#006a75'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ff6ff'
  primary-fixed-dim: '#00dce6'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#91f1ff'
  tertiary-fixed-dim: '#54d8e8'
  on-tertiary-fixed: '#001f23'
  on-tertiary-fixed-variant: '#004f57'
  background: '#0f131d'
  on-background: '#dfe2f0'
  surface-variant: '#31353f'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-timestamp:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system manifests an acoustic arctic tundra—immersion through absolute zero, pristine clarity, and crystalline precision. Created for discerning audiophiles and ambient sound explorers, the interface evokes the isolation of polar expanses, sub-glacial acoustics, and sharp fracture-lines of ancient pack ice. 

The aesthetic is a union of **Sub-Zero Glassmorphism** and **Technical Precision**. It avoids warm hues, saturated magentas, and standard cyber-neon entirely. Instead, depth is built through stacked layers of frosted rime, sharp cyan light refractions, and intense polar abyss backgrounds. The experience feels chilling, quiet, pristine, and luminous—delivering audio playback as an ethereal, focused sensory ritual.

## Colors
The palette is rooted in cryogenic depths and refractive ice optics:

- **Abyss Foundations**: Deep freezing navy `#070B14` acts as the root canvas. Surface containers scale through sub-zero abyss tones: `#0A111F` for resting surfaces and `#0E182A` for elevated cards and sheets.
- **Glacial Energy**: `#00F2FE` (electric cyan) functions as the primary driver for active playback states, progress needles, and intense acoustic highlights. Secondary `#38BDF8` (glacial blue) softens structural active states, while tertiary `#67E8F9` (ice rime) provides secondary luminescence and glowing audio spectrum peaks.
- **Atmospheric Whites & Frost Tints**: High-contrast typography relies on crisp frosty white (`#F0F9FF`) with faint blue undertones. Subdued metadata utilizes `#94A3B8` and muted ice `#64748B`.
- **Crystalline Borders**: Borders use low-opacity frosty highlights (`rgba(103, 232, 249, 0.16)` to `rgba(224, 242, 254, 0.28)`), mimicking the faceted edges of cut glacial sheets rather than opaque strokes.

## Typography
Typographic rhythm balances industrial sonic instrumentation with geometric clarity.

- **Headlines (`Space Grotesk`)**: Provides sharp, angular geometric letterforms that reflect crystalline formation and cold acoustic technology. Display and headline scales utilize tight letter tracking for an intentional, condensed gravity.
- **Body (`Hanken Grotesk`)**: Provides razor-sharp legibility against pitch-black abyss backdrops, preventing optical bleed in high-contrast situations.
- **Technical & Utility (`JetBrains Mono`)**: Deployed for timecodes, bitrates, audio codecs (FLAC 24-bit/192kHz), frequency metrics, and track numbering. This reinforces the feeling of a laboratory-grade cryogenic audio deck.

## Layout & Spacing
The layout relies on a disciplined fluid grid balanced against structural horizontal rhythm:

- **Grid Architecture**: 12 columns on desktop (`>= 1200px`) with `2.5rem` margins and `1.5rem` gutters. Tablet (`768px - 1199px`) resolves to 8 columns with `1.5rem` margins. Mobile (`< 768px`) condenses to a 4-column framework with `1rem` outer canvas padding to maximize visual presence for album art and waveforms.
- **Acoustic Hierarchy**: Layout panels split cleanly between structural browsing panes (docked left/top) and continuous playback stages (fixed bottom or persistent right docking on ultrawide viewports).
- **Rhythm & Whitespace**: Generous `space-xl` gaps separate major sonic categories, allowing individual media objects to breathe against the empty void, preventing visual clutter in dense playlists.

## Elevation & Depth
Depth does not use standard drop shadows. Visual tiers are engineered via **Sub-Zero Glassmorphism**, ice-sheet layering, and ambient frost luminescence:

- **Tier 0 (Abyss Canvas)**: Base level `#070B14`. Solid, light-absorbent.
- **Tier 1 (Submerged Trays)**: Background `#0A111F` with a soft top-border glow: `inset 0 1px 0 0 rgba(224, 242, 254, 0.08)`.
- **Tier 2 (Glacial Sheets / Floating Decks)**: Background `rgba(14, 24, 42, 0.72)` supported by a backdrop blur of `20px` to `32px`. Edges are lined with a crystalline hairline stroke (`1px solid rgba(103, 232, 249, 0.2)`).
- **Freezing Mist / Luminescence**: Interactive focal points cast cold cyan ambient fields instead of drop shadows: `0 8px 32px -4px rgba(0, 242, 254, 0.22), 0 0 16px 0 rgba(56, 189, 248, 0.15)`.
- **Frost Sheen**: High-priority modal surfaces feature an angled linear gradient across the face (`linear-gradient(135deg, rgba(240, 249, 255, 0.06) 0%, rgba(7, 11, 20, 0.4) 100%)`) providing the illusion of cold light striking compressed sheet ice.

## Shapes
The shape language favors tight, semi-chiseled corners rather than circular pills, echoing the natural geometry of cleaved ice and crystalline formations:

- **Scale Factor 1 (Soft)**: Base UI elements (buttons, inputs, audio chips) take `0.25rem` (4px) radii. Structural glass cards and player chassis use `rounded-lg` at `0.5rem` (8px). Modal viewports and full-bleed artwork containers max out at `rounded-xl` (`0.75rem` / 12px).
- **Precision Exceptions**: Playback scrubber thumbs, circular transport toggles (Play/Pause master disc), and frequency equalizer nodes retain true circles (`9999px`) to stand out as dynamic, rotating control points against geometric ice frames.

## Components

### Buttons
- **Primary (Cryo Flash)**: Solid `#00F2FE` fill, ink-black text (`#070B14`, Space Grotesk 600). Hover produces an external glacial mist blur (`0 0 24px rgba(0, 242, 254, 0.6)`) and shifts background to `#E0F2FE`.
- **Secondary (Glacial Glass)**: Background `rgba(14, 24, 42, 0.8)`, border `1px solid rgba(103, 232, 249, 0.3)`, text `#F0F9FF`. Hover increases border brightness to `#67E8F9` with inner frost glow.
- **Ghost / Utility**: Monospaced labels with cyan accents on hover; transparent background.

### Player Controls & Waveform Scrubbers
- **Scrubber Track**: Inactive track is a 2px horizontal slit of `rgba(255, 255, 255, 0.1)`. Active elapsed track is `#00F2FE` with a continuous `0 0 10px rgba(0, 242, 254, 0.7)` frost plume.
- **Waveform Visualizer**: Composed of vertical micro-bars using gradient fills from `#38BDF8` (trough) to `#00F2FE` (peak), with zero-level dB floor masked into navy transparency.

### Cards (Album, Artist, Glacier Mixes)
- Built on `rgba(14, 24, 42, 0.6)` with `backdrop-filter: blur(16px)`. Border is crisp `1px solid rgba(103, 232, 249, 0.12)`.
- On hover: The border illuminates to `rgba(0, 242, 254, 0.5)`, while artwork receives an icy sheen via a top-to-bottom translucent gradient overlay.

### Lists & Track Rows
- Alternating or flush lists with subtle horizontal dividers (`rgba(224, 242, 254, 0.05)`).
- Hovering states reveal a sleek frosted strip (`rgba(56, 189, 248, 0.06)`) with track numbers converting to an animated cyan frequency equalizer icon. Track duration rendered in `JetBrains Mono` at `#64748B`.

### Chips & Filters
- Compact `0.25rem` radius filters with a muted navy foundation (`#0A111F`) and faint cyan border. Active state flips border to `#00F2FE` with frosty white typography and a subtle sub-zero cyan backlight badge.

### Inputs & Search
- Inputs present an ice-trench appearance: inset shadow with deep `#070B14` base, encased in `1px solid rgba(103, 232, 249, 0.2)`. Placeholder text sits in `#64748B`. Active focus triggers an electric cyan perimeter glow without outline breaks.

### Audio Spec Badges (Niche Component)
- Dedicated micro-pills showcasing format details (e.g., `LOSSLESS`, `DSD`, `24-BIT/192kHZ`). Styled in `JetBrains Mono`, font size 10px, with `rgba(0, 242, 254, 0.12)` background, `#67E8F9` text, and fine glacial micro-borders.