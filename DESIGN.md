# VibeFlow DESIGN.md

How VibeFlow should look and feel. AGENTS/build notes say how the project is built; this file is the design contract. When a screen is built or changed, follow this file. When the owner locks a new design decision, update this file in the same change.

## 1. Theme

Light premium (theme v2, owner decision Oct 29 2026, supersedes the dark theme). The people layer of Arc should feel like a quiet, expensive fintech product: paper-white surfaces, hairline borders instead of stacked boxes, one accent color, big confident headlines, and a lot of empty space. The owner avatar or character never appears anywhere in this product. Layout discipline comes from the owner's portfolio (haroon-web3.vercel.app): breathing space, very little text, one idea per view, clean and simple motion, never tacky or flashy. If a screen feels dense like a document, it is wrong.

## 2. Colors

Tokens live in src/app/globals.css and are the single source. Use the CSS variables, never raw hex in components.

- --bg #f5f6fa: page background.
- --bg-raised #ffffff: raised panels and cards.
- --glass #ffffff: card surfaces (strips, composer).
- --glass-strong #eceff6: hover and emphasis surface.
- --line rgba(177, 190, 226, 0.12): every border and divider. Hairlines only.
- --fg #0b0d16: primary text.
- --fg-muted #59637a: secondary text.
- --fg-faint #8b94a9: tertiary text, timestamps, hints.
- --accent #2775ca: USDC blue. The only accent. Primary actions, live indicators, links of consequence.
- --accent-soft rgba(39, 117, 202, 0.16): accent tint backgrounds.
- --data #1f6fd0: data blue for numbers' unit labels and chart-like details.
- --radius 16px: default corner radius.

The logo gradient (violet to blue V mark) is brand art and stays as it is; it never recolors the UI. No other accent colors. No gradient washes on surfaces.

## 3. Typography

- Headlines: the app sans, bold, tight tracking, large. One statement per hero.
- Body: 15-16px, relaxed leading, --fg-muted for supporting copy.
- Mono: uppercase labels (the .mono-label class) and all numbers (font-mono). Numbers are always live or clearly labelled as a window (for example, last ~10 min). Never show a number that is not real.
- Inputs and textareas are 16px or larger on mobile (smaller text triggers iOS zoom).

## 4. Components

- Primary button: --accent background, white text, pill or the landing's squared style per surface, label names the exact action (Post, Send tip, Launch App).
- Secondary button: hairline border, --fg-muted text, brightens on hover.
- Cards and strips: --glass or --bg-raised with a --line border, divided by hairlines (divide-y / gap-px grids), never shadow stacks.
- Review step before signing is always one clean summary card: recipients, total, fee, then the sign action. Nothing moves before the user sees it.
- Live badge: small pill with a pulsing --accent dot and a mono LIVE label.
- Status tags are honest: Live now only when it works in production today, Coming soon otherwise.

## 5. Layout

- App screens: max-w-3xl column for feed-like pages, max-w-5xl/6xl for data and landing.
- One section, one message. Sections separated by whitespace and hairlines, not boxes inside boxes.
- Everything reachable within two taps from the sidebar (mobile bottom bar: Home, Vibrain, Square, Earn, Pay).
- Landing: hero statement, live numbers strip, product screen, numbered how-it-works (1 Connect, 2 Add recipients, 3 Review and send), features, FAQ, footer with the onchain contract proof row.

## 6. Elevation

Flat by design. Depth comes from surface color steps (bg, bg-raised, glass) and hairlines. Shadows are effectively banned except the product-preview treatment on the landing. Floating elements (USDC coins) belong on the landing only.

## 7. Do and do not

Do: whitespace, hairlines, mono numbers, live data, plain words, fees and totals upfront, empty states that say what happens next.
Do not: invented stats, fake balances or zeros presented as data, gradient text, emoji clusters, hype copy, more than one accent, animations that bounce or flash, a screen that needs a paragraph to explain itself.

## 8. Responsive behavior

Mobile first; the owner's phone is the acceptance test. Tap targets at least 44px. Tap feedback is instant (hover/active states, disabled while pending). Every send is simulated before the wallet opens so it does not fail at signing. A feature is not done until it has been checked at phone width.

## 9. Agent prompt guide

Build to this file first, then the code tokens. Where this file is silent, apply Vercel's Web Interface Guidelines (accessibility, focus, forms, loading and error states) and restrained taste: low variance, low motion, low density. Never invent a stat, a partner, or a feature state. Site copy is plain English; errors tell the user how to fix the problem. If a component needs a new color, size, or pattern, stop and extend this file instead of improvising.
