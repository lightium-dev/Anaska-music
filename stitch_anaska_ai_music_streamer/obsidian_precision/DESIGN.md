---
name: Obsidian Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#b4c5ff'
  on-secondary: '#002a78'
  secondary-container: '#0053db'
  on-secondary-container: '#cdd7ff'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
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
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies high-precision technical minimalism. Built for professional-grade developer tools, command consoles, and focused utility interfaces, it completely eliminates non-essential decorative treatments—rejecting gradients, skeuomorphic glows, ambient color bleeds, and artificial blur layers. 

The emotional signature is disciplined, quiet, and hyper-legible. Contrast is engineered for prolonged operational focus in low-light environments. Surfaces sit grounded in true black, prioritizing the exact boundaries of content through sharp, architectural line work and a decisive, vibrant blue accent that delivers unmistakable focal hierarchy without visual clutter.

## Colors

The palette is strictly calibrated, flat, and matte. Every surface is an opaque solid; transparent overlays and radial fades are explicitly forbidden.

- **Canvas Background (`#000000`)**: Pure absolute pitch black for the base viewport and canvas frame.
- **Surface Elevation 1 (`#121212`)**: Dark neutral tone for structural panels, standard cards, and sidebars.
- **Surface Elevation 2 (`#181818`)**: Secondary dark tone for nested panels, table headers, hovered states, and segmented controls.
- **Border Neutral (`#262626`)**: The single universal border color used to delimit components cleanly against dark surfaces.
- **Text Primary (`#ffffff`)**: High-contrast, pure white reserved for primary headings, metric values, and primary button labels.
- **Text Muted (`#9ca3af`)**: Balanced medium-gray for supporting metadata, body copy, and secondary identifiers.
- **Accent Primary (`#3b82f6`)**: Clear, solid digital blue for active indicators, primary action triggers, and focused outlines.
- **Accent Interactive Hover (`#2563eb`)**: Grounded deep blue for hover and active pressed states of accent elements.

## Typography

The typographic hierarchy pairs **Geist** for natural reading rhythm and UI navigation with **JetBrains Mono** for technical labels, identifiers, data figures, and status chips. 

- Maintain crisp font smoothing at all times (`-webkit-font-smoothing: antialiased`).
- Never introduce display weights above `600`; impact is achieved through crisp color contrast against pure black rather than heavy font thickness.
- Use `JetBrains Mono` exclusively for inputs, numerical indices, badges, timestamps, and metadata tags to enforce structural precision.

## Layout & Spacing

The layout is structured around an uncompromising 4px/8px modular grid. The system uses a fluid layout model anchored to maximum content containment blocks on wide screens (max 1440px width).

- **Mobile (< 768px)**: 4-column structure with `margin: 1rem` and `gutter: 1rem`. Panels snap edge-to-edge with bottom horizontal boundaries.
- **Tablet (768px - 1024px)**: 8-column layout utilizing `margin-md: 1.5rem` and `gutter: 1rem`.
- **Desktop (> 1024px)**: 12-column layout utilizing `margin-lg: 2.5rem` and `gutter-lg: 1.5rem`.
- Strict structural alignment: Content elements must align flush against the defined column tracks without decorative organic drift.

## Elevation & Depth

This design system operates without drop shadows, ambient blurs, or glow effects. Depth is expressed exclusively through **tonal separation** and **crisp 1px borders**.

- **Level 0 (Canvas)**: `#000000`. The fundamental workspace.
- **Level 1 (Structural Containers)**: `#121212`, framed by a solid `1px solid #262626` outline.
- **Level 2 (Interactive Floating / Nested Panels / Dropdowns)**: `#181818`, edged with `1px solid #262626`.
- **Focus Rings**: Pure flat indicator lines (`2px solid #3b82f6` or `1px solid #3b82f6` with `1px` transparent offset). Diffuse halos and color-fade focus rings are strictly disallowed.

## Shapes

The geometric design token is set to `1` (Soft). Components utilize tight, disciplined corner radii to retain an engineered, mechanical contour:

- **Base Radius (`rounded`)**: `0.25rem` (4px). Standard for buttons, input fields, checkboxes, and chips.
- **Large Radius (`rounded-lg`)**: `0.5rem` (8px). Used for structural cards, flyout modals, and system dialogs.
- **Pill or circular shapes** are forbidden for interactive controls, except for standard 1:1 circular radio indicators.

## Components

### Buttons
- **Primary**: Background `#3b82f6`, color `#ffffff`, font `Geist Medium`, border none. Hover: `#2563eb`. Active: `#1d4ed8`.
- **Secondary / Neutral**: Background `#121212`, border `1px solid #262626`, color `#ffffff`. Hover: Background `#181818`, border `#3b82f6`.
- **Ghost**: Background transparent, border none, color `#9ca3af`. Hover: Background `#121212`, color `#ffffff`.
- Shape: `rounded` (4px), padding `space-sm space-md`. No box shadows.

### Input Fields
- Background: `#121212`.
- Border: `1px solid #262626`.
- Typography: `JetBrains Mono` 13px (`#ffffff`), placeholder `#9ca3af`.
- States: Hover changes border to `#3b82f6`. Active/Focus sets border to `#3b82f6` with zero outer glow. Error uses a single solid flat red (`#ef4444`).

### Cards & Panels
- Background: `#121212`.
- Border: `1px solid #262626`.
- Padding: `space-lg`.
- Nesting: Inner sections or data tables adopt `#181818` with clean dividing rules (`1px solid #262626`).

### Chips & Badges
- Background: `#181818`.
- Border: `1px solid #262626`.
- Typography: `JetBrains Mono` 11px uppercase (`#9ca3af`).
- Active / Selected: Background `#121212`, border `1px solid #3b82f6`, text `#ffffff`.

### Checkboxes & Radio Buttons
- Base: `16px x 16px`, background `#121212`, border `1px solid #262626`.
- Checked: Background `#3b82f6`, border `#3b82f6`.
- Checkmark / Radio dot: Flat `#ffffff`.
- Radio: Circular geometry (`rounded-full`). Checkbox: `rounded` (2px).

### Lists & Tables
- Table Headers: Background `#181818`, text `#9ca3af`, typography `JetBrains Mono` 11px uppercase, border-bottom `1px solid #262626`.
- Rows: Background `#121212`, alternating or hover state `#181818`. Clean `1px solid #262626` dividing rules.