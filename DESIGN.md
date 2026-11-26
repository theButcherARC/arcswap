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
- --line rgba(11, 13, 22, 0.09): every border and divider. Hairlines only.
- --fg #0b0d16: primary text.
- --fg-muted #59637a: secondary text.
- --fg-faint #8b94a9: tertiary text, timestamps, hints.
- --accent #2775ca: USDC blue. The only accent. Primary actions, live indicators, links of consequence.
- --accent-soft rgba(39, 117, 202, 0.1): accent tint backgrounds.
- --data #1f6fd0: data blue for numbers' unit labels and chart-like details.
- --success #12805c: success and PASS states. --danger #c22744: errors and destructive actions. --warn #a35a08: warnings. Each has a soft tint (--success-soft, --danger-soft, --warn-soft) for badge and alert fills, on the --accent-soft pattern. Semantic UI uses these tokens, never Tailwind palette colors.
- --radius 16px: default corner radius.

The logo gradient (violet to blue V mark) is brand art and stays as it is; it never recolors the UI.
- The logo is always shown as a full official variant: never cropped, never set into a small black tile, never redrawn.
No other accent colors. No gradient washes on surfaces.

## 3. Typography

- Headlines: the app sans, bold, tight tracking, large. One statement per hero.
- Receipts and the proof page are the one exception to the sans: big amounts there set in a serif display face. Labels stay mono uppercase everywhere.
- Body: 14px, relaxed leading, --fg-muted for supporting copy. Secondary and meta text: 12px.
- Mono: uppercase labels (the .mono-label class) and all numbers (font-mono). Numbers are always live or clearly labelled as a window (for example, last ~10 min). Never show a number that is not real.
- Inputs and textareas are 16px or larger on mobile (smaller text triggers iOS zoom).

## 4. Components

- Primary button: --accent background, white text, pill or the landing's squared style per surface, label names the exact action (Post, Send tip, Launch App).
- Secondary button: hairline border, --fg-muted text, brightens on hover.
- Cards and strips: --glass or --bg-raised with a --line border, divided by hairlines (divide-y / gap-px grids), never shadow stacks.
- Review step before signing is always one clean summary card: recipients, total, fee, then the sign action. Nothing moves before the user sees it.
- Every claim in copy is true of the implementation, not the intention. If a send approves tokens, the screen says it approves exactly that amount. "Zero approvals", "no fees", "instant" appear only when they are literally true of the flow.
- Batch receipts are a perforated payslip card. Proof checks are PASS-pill rows. Receipt and proof surfaces may use a warm paper tint with a faint dot grid; app screens never do.
- Live badge: small pill with a pulsing --accent dot and a mono LIVE label.
- Status tags are honest: Live now only when it works in production today, Coming soon otherwise.
- Feature names say what the thing does today. The bulk-pay drafting page is named AI, never AI Pay, never AI Payment Agent: the AI drafts, the user reviews and signs. A name never promises a capability the product does not have yet.
- The Built with Arc Studio badge stays: a small floating pill, bottom right, on app screens and the landing, linking to Arc Studio.

## 5. Layout

- App screens: max-w-3xl column for feed-like pages, max-w-5xl/6xl for data and landing.
- One section, one message. Sections separated by whitespace and hairlines, not boxes inside boxes.
- Everything reachable within two taps from the sidebar (mobile bottom bar: Home, Vibrain, Square, Earn, Pay).
- Landing: hero statement, live numbers strip, product screen, an exploded batch anatomy section after the product screen (the batch card separates into its five checked parts on scroll, FIG labels, with a blueprint toggle), numbered how-it-works (1 Connect, 2 Add recipients, 3 Review and send), features, FAQ, footer with the onchain contract proof row.
- The landing headline is locked: "The people layer of Arc." It never changes. Outcome wording goes in the subtext, never in the headline.

## 6. Elevation

Flat by design. Depth comes from surface color steps (bg, bg-raised, glass) and hairlines. Shadows are effectively banned except the product-preview treatment on the landing. Floating elements (USDC coins) belong on the landing only. Receipt and proof surfaces follow §4 instead: the perforated payslip card is a paper artifact, presented as one, not app chrome.

## 7. Do and do not

Do: whitespace, hairlines, mono numbers, live data, plain words, fees and totals upfront, empty states that say what happens next.
Do not: invented stats, fake balances or zeros presented as data, gradient text, emoji clusters, hype copy, more than one accent, animations that bounce or flash, a screen that needs a paragraph to explain itself.

## 8. Responsive behavior

Mobile first; the owner's phone is the acceptance test. Tap targets at least 44px. Tap feedback is instant (hover/active states, disabled while pending). Every send is simulated before the wallet opens so it does not fail at signing. A feature is not done until it has been checked at phone width.
- Fast load is part of done: a slow first paint on the owner's phone is a defect, not a polish item.
- Motion: feedback starts on pointer-down, never waits for release. Transitions use the settle curve (--ease-settle), critically damped, no overshoot. Drawers and menus stay interruptible: they can be reversed mid-motion and never lock input. Under prefers-reduced-motion, reveals show instantly with no transition and the drawer snaps.

## 9. Agent prompt guide

Build to this file first, then the code tokens. Where this file is silent, apply Vercel's Web Interface Guidelines (accessibility, focus, forms, loading and error states) and restrained taste: low variance, low motion, low density. Never invent a stat, a partner, or a feature state. Site copy is plain English; errors tell the user how to fix the problem. If a component needs a new color, size, or pattern, stop and extend this file instead of improvising.
