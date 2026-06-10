# Design Brief

**Purpose**: Real-time IC network burn rate monitoring dashboard with clear metric display, trend visualization, and granular filtering.

**Aesthetic**: Premium tech, data-focused, minimal. Dark-first with high contrast for readability. No decorative elements; every pixel serves data clarity.

**Differentiation**: Direct IC management canister queries without intermediaries. Dual display of current rate + trend. Preset quick filters reduce friction.

## Palette

| Token | OKLCH | Usage |
|-------|-------|-------|
| background | 0.145 0.014 260 | Page background, depth layer 0 |
| card | 0.18 0.014 260 | Metric cards, raised containers |
| foreground | 0.95 0.01 260 | Primary text, high contrast |
| primary | 0.75 0.15 190 | CTAs, active states, refresh button |
| accent | 0.75 0.15 190 | Highlight data points, trend arrows |
| destructive | 0.55 0.2 25 | Warning states, anomalies |
| chart-1 to -5 | multi | Line series, stacked area colors |

**Dark mode**: Desaturated, reduced lightness. Chart colors retain hue variation for distinction.

## Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| display | General Sans | 600 | Section headers, metric labels |
| body | General Sans | 400 | Body text, descriptions |
| mono | JetBrains Mono | 400 | Numeric values, timestamps, data precision |

## Elevation & Depth

- **Flat cards**: md shadow (4px blur), 0.1 opacity
- **Hover elevated**: lg shadow (15px blur), 0.1 opacity
- **Active focus ring**: 3px accent ring, 0.1 opacity
- **Modal/overlay**: 2xl shadow (50px blur), 0.1 opacity

## Layout & Zones

| Zone | Size | Content |
|------|------|----------|
| Header | 60px | Title, dark-mode toggle, help icon |
| Filter bar | 80px | Time period tabs, date picker, quick presets |
| Metric grid | ~200px | Current burn rate cards (hourly, daily, weekly) with mono values + trend |
| Chart area | flex | Line chart showing selected period; responsive height |
| Footer | 40px | Refresh timestamp, manual refresh button |

## Spacing & Rhythm

- **Base unit**: 0.625rem (10px)
- **Card padding**: 1.5rem
- **Section gap**: 2rem
- **Grid gap**: 1.5rem
- **Border radius**: 0.625rem (consistent, slightly rounded)

## Component Patterns

- **Metric card**: Title + current value (mono, large) + trend arrow + sparkline or % change
- **Tab filter**: Unselected (muted bg, subtle text), selected (accent underline, accent text)
- **Date picker**: Button trigger → popover with calendar; no inline expansion
- **Quick preset buttons**: Secondary style, hover lift, active accent fill
- **Chart**: Line for trend clarity; no filled areas; 1px strokes; legend below
- **Refresh button**: Primary accent, icon + text; disabled state during fetch

## Motion

- **Chart transition**: 200ms ease-out on data update
- **Button hover**: 100ms scale(1.02), shadow lift
- **Loading spinner**: Indeterminate progress on refresh

## Constraints

- No data export (CSV/JSON) in v1
- No forecasting or alert thresholds
- Daily data rolling window; older data dropped
- Refresh interval: manual or 5min auto-poll (future)

## Signature Detail

Mono-rendered timestamps in UTC in chart tooltips. Dual-metric display (current + % change vs. period avg) per card to reinforce trend without requiring chart interaction.
