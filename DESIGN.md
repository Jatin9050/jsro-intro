---
name: JSRO Homepage
description: A graphite technical fieldbook for practical technology learning.
colors:
  void: "#141210"
  void-raised: "#1D1A17"
  void-deep: "#0C0B09"
  ink: "#F2EFEA"
  ink-muted: "#A39C93"
  rule: "#3A342D"
  rule-strong: "#5C544A"
  signal: "#FF4F00"
  signal-bright: "#FF7A45"
  lit-top: "#E2DBCF"
  lit-face: "#A89F93"
  lit-side: "#5A5249"
  lamp: "rgba(255, 146, 74, .13)"
  shadow-contact: "rgba(0, 0, 0, .62)"
  void-lift: "#241F1B"
  # --- Sounding Record world (CanSat programme page only) ---
  sounding-stock: "#F2EDDF"
  sounding-stock-deep: "#E8E1CF"
  sounding-grid-fine: "#CFD6C9"
  sounding-grid-major: "#A9B6A6"
  sounding-ink: "#221F1A"
  sounding-ink-soft: "#6A6459"
  sounding-pen: "#A52F1C"
  sounding-pen-wet: "#C8402A"
  sounding-stamp: "#1C4A74"
  sounding-stock-soft: "#CFC8B8"
  sounding-stock-faint: "#9A9285"
  sounding-rule-inverted: "#4A443B"
typography:
  display:
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "clamp(4rem, 8.4vw, 9.7rem)"
    fontWeight: 600
    lineHeight: 0.82
    letterSpacing: "-0.075em"
  body:
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "0.78rem"
    fontWeight: 700
  soundingDisplay:
    fontFamily: '"Archivo Narrow", "Helvetica Neue", Arial, sans-serif'
    fontWeight: 700
    letterSpacing: "-0.035em"
    textTransform: uppercase
    note: "Sounding Record world only — the CanSat programme page."
  soundingApparatus:
    fontFamily: '"Courier Prime", "Courier New", monospace'
    fontWeight: 400
    note: "Sounding Record world only — labels, keys, units, stamps.
spacing:
  compact: "14px"
  standard: "29px"
  section: "clamp(74px, 10vw, 150px)"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.void}"
    rounded: "0"
    padding: "0 21px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.signal-bright}"
---

# Design System: JSRO Homepage

## Overview

**Creative North Star: “The Technical Fieldbook, After Dark”**

The JSRO homepage is a Swiss editorial system set on a graphite drafting surface rather than a white page. It turns a robotics site away from dark-neon futurism without turning away from dark: the ground is warm iron, the type is a drawn light line, the structure is 1px rules, and there is one International Orange signal.

The ground is deliberately **warm**, not the cool blue-black the category defaults to. Two reasons hold it there. A cool navy ground is the generic robotics-and-space template this system exists to refuse. And a warm ground lets `#FF4F00` sit inside the palette as a member of it, rather than vibrating against its complement the way a bright vermilion does on cool near-black.

Its distinctive proof is not a decorative sci-fi image. A CSS-built robot is assembled as lit geometric volume and moved with Anime.js inside an exploded field of isometric machine plates, modules, rails, and signal points; it makes the practical, physical side of JSRO legible in the first viewport. The scope is the homepage only. Event pages, payment, and their data models are intentionally not defined by this system yet.

**Key Characteristics:**

- Asymmetric editorial compositions rather than centered card grids.
- Thin rules establish structure; orange is reserved for actions and emphasis.
- Large, tight display typography carries hierarchy without a kicker hierarchy.
- Flat surfaces, one warm ambient light, and one geometric 3D motion artifact.

## Colors

The palette is restrained and high contrast: a warm iron workshop at night with a single visible signal.

### Primary

- **International Orange** (`#FF4F00`): Primary actions, the closing contact field, the robot’s active parts, and small emphasis. Use it sparingly so it remains directional. Against the ground it reads 5.7:1, so it is safe as text.
- **Signal Bright** (`#FF7A45`): Hover state for the primary action only. **On a dark ground the hover brightens; it never darkens**, or the control recedes into the page instead of responding.

### Neutral

- **Iron** (`#141210`): Default page surface. Warm — red above green above blue — and never a stand-in for pure black.
- **Iron Raised** (`#1D1A17`): Alternate sections and the robot's bench.
- **Iron Deep** (`#0C0B09`): The workshop coordinate diagram, the one field that sits *beneath* the page.
- **Drawn Line** (`#F2EFEA`): Headings and body foreground, 16.3:1 on the ground. Warm off-white rather than `#FFFFFF`, which halates at display sizes on a dark field.
- **Measured Warm Gray** (`#A39C93`): Supporting copy, 7.1:1.
- **Rule** (`#3A342D`): Structural 1px dividers.
- **Rule Strong** (`#5C544A`): The single heavier rule that opens the focus list.

### Figure

- **Lit Top / Face / Side** (`#E2DBCF` / `#A89F93` / `#5A5249`): The three-step ramp that renders the robot as a solid lit from above-left. The step between faces *is* the form; flatten it and the robot becomes a silhouette.
- **Lamp** (`rgba(255, 146, 74, .13)`): One warm radial in the hero, low and wide. It is an ambient light source that justifies the scene and the robot's lighting — never a glow behind an element, and never bright enough to touch text contrast.
- **Contact Shadow** (`rgba(0, 0, 0, .62)`): The blurred pool the robot casts on its bench. The single place black is permitted, because a cast shadow subtracts light rather than painting a surface.
- **Iron Lift** (`#241F1B`): The hover state of an iron button sitting on an orange field, where the usual brighten-on-hover would run the wrong way. On orange, iron lifts toward light iron.

**The One-Signal Rule.** Orange is an action and emphasis colour, not a second background palette. Never introduce cyan, violet, multicolour gradients, or a competing accent into this homepage system. The steel-blue in the JSRO logo is the mark's own and does not license a second accent anywhere else.

**The Ink-on-Signal Rule.** Anything filled with `#FF4F00` carries `#141210` text, not white. White on orange is 3.3:1 and fails AA; iron on orange is 5.7:1 and passes.

## Typography

**Display Font:** Helvetica Neue, Helvetica, Arial, sans-serif
**Body Font:** Helvetica Neue, Helvetica, Arial, sans-serif

**Character:** One precise sans-serif family keeps the system direct and Swiss. Hierarchy is created through scale, weight, tight tracking, and an asymmetric grid—not a second display face.

### Hierarchy

- **Display** (600, `clamp(4rem, 8.4vw, 9.7rem)`, `0.82`): Hero only; tight `-0.075em` tracking.
- **Section Heading** (500, `clamp(2.6rem, 5.2vw, 6rem)`, `0.92`): Main section statements; use balanced wrapping.
- **Focus Title** (500, `clamp(1.8rem, 3.6vw, 3.8rem)`, `0.95`): Focus-area list entries.
- **Body** (400, `1rem`–`1.08rem`, `1.45`–`1.5`): Keep measures concise and in a narrow column.
- **Label** (700, `0.72rem`–`0.82rem`): Navigation, rail labels, and small context only.

**The Heading-First Rule.** Do not add eyebrows above headings. The heading must establish the section on its own.

## Layout

Desktop uses a wide asymmetric grid with 4vw side margins. The hero pairs a large left-aligned statement with the robot field on the right, then uses a bottom process rail. Subsequent sections alternate between the `void` ground and `void-raised`; rows and 1px rules hold the structure.

At 860px and below, the header becomes a button-controlled navigation, the hero stacks statement above robot, and split sections become vertical. At 500px and below, actions stack and focus-list rows tighten without horizontal overflow. Anchor sections use `scroll-margin-top: 24px`.

## Elevation & Depth

The page is flat by default. It uses no card shadows and no decorative glass. Depth comes from contrast fields, 1px rules, the recessed workshop diagram, the lit robot volume, and one wide ambient lamp in the hero. Primary actions lift by 2px on hover; that small movement is functional feedback, not an elevation system.

**Dissolve, don't cut.** On a dark ground an area fill lighter than the page announces its own rectangle. Fields that are meant to read as surface — the robot's bench above all — are masked so their outer edges fade to nothing instead of terminating in a hard seam. A hard edge on this page is a 1px rule, deliberately placed.

## Shapes

Rectangles, lines, concentric circles, and straight component edges establish the form language. Main controls are square-cornered; pills are absent. The only round forms are functional diagram/robot elements: orbital lines, nodes, and the workshop coordinate rings. Borders are normally 1px and carry structure rather than decorative container chrome.

## Components

### Buttons

- **Primary action:** Square `#FF4F00` field, `#141210` 700-weight label, 52px minimum height, 21px horizontal padding, icon at the trailing edge.
- **Hover / Focus:** Hover brightens to `#FF7A45` and rises 2px. Keyboard focus uses a 2px orange outline with a 4px offset; inside the orange contact field the outline switches to iron so it stays visible.
- **Text action:** Ink text with a 1px orange underline that scales in from the left on hover or keyboard focus.

### Navigation

The desktop header is a three-zone grid: logo/name, centered anchor links, and a contact action. Mobile uses an icon-only menu button with an accessible label and an expanding iron navigation field below the header. Never replace semantic links with click handlers on generic elements.

### Brand Lockup

`public/logojsro.jpeg` is a light mark on a pure-black plate. It is composited with `mix-blend-mode: screen`, which drops that plate to nothing against the ground and leaves the mark sitting directly on the page. Do not box it, tint it, or place it on a light surface — it has no light-ground variant.

### Event List and Event Pages

Events are editorial rows, built exactly like the focus list: a status marker,
a large title, a summary, a meta line, and an arrow. They are never cards, and
never a three-across grid.

Each event's detail page opens with a **status tag** — a square `#FF4F00` field
with iron text, set above the title. It is the first mark on the page, so the
visitor knows whether they can act before they read anything. Closed
registration inverts it to a 1px outline in `rule-strong` with muted text.

A fact JSRO has not confirmed is never invented. An unset date or venue is
dropped from the fact row rather than filled with a guess, and the fee line
renders as a link to JSRO until real pricing is published.

### Programme Pages

Programme pages are the **one sanctioned exception** to single-world discipline
on this site, at the user's explicit direction. A programme page may carry its
own visual world, scoped to that route. Everything else — homepage, events list,
registration, thank-you, about, 404, policies — stays in the graphite fieldbook.

The shared `SiteFooter` still closes every programme page, so a programme world
must resolve into something the graphite footer can sit beneath without a seam.

### Focus-Area List

Focus areas are editorial rows, not cards: an alphabetical marker, a large title, supporting copy, and an arrow. Rows are divided by 1px rules and shift 14px right with orange foreground on hover. Each row's rule is a real element, not a border, so the list can rule itself up on entry.

### CSS Robot

The robot is geometric media, built from hard-edged volumes and perspective transforms, rendered as a pale solid lit from above-left against the dark bench. It sits inside a background assembly field of isometric plates and parts; this field should stay behind the offer and never compromise text contrast. Anime.js provides a short assembly movement and a user-driven scroll response. It must honour `prefers-reduced-motion`; do not add a perpetual decorative loop.

## Motion

The page has **two** authored moments and no third.

1. **The hero assembles on load.** Statement, plates, modules, and robot arrive on one staggered exponential ease-out. This is the page's opening and the only place a blur is spent.
2. **The focus list rules itself up.** Its 1px rules draw left to right on a 90ms stagger when the list enters view — a structural gesture that says "a list is being ruled," not a decoration.

Everything else arrives quietly: sections lift 18px and fade over 620ms, once. Do not add a per-section blur-and-lift entrance; an identical reveal repeated down the page reads as template motion. Every animated element must be correct at rest with JavaScript off — rules default to `scaleX(1)`, content defaults to visible — and the whole system collapses under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:

- **Do** use `#141210`, `#1D1A17`, `#F2EFEA`, and one `#FF4F00` signal with thin rules.
- **Do** keep the ground warm; the cool blue-black robotics template is the thing this page refuses.
- **Do** put iron text, never white, on any orange fill.
- **Do** brighten on hover rather than darken — this is a dark ground.
- **Do** let oversized left-aligned type and large quiet space do the persuasive work.
- **Do** use Lucide or authored geometry for icons; keep decorative icons hidden from assistive technology.
- **Do** preserve visible focus, semantic landmarks, skip navigation, and reduced-motion behavior.
- **Do** use verified JSRO language only; keep unconfirmed event pricing, results, and payment claims out of the homepage.

### Don't:

- **Don't** reintroduce neon glows, cyan/purple gradients, glass panels, generic metric cards, or emoji interface icons. Dark is the ground here, not a licence for any of them.
- **Don't** use `#000000`, or a cool near-black standing in for it.
- **Don't** add a second accent colour or a second display font.
- **Don't** let a surface fill end in a hard edge; mask it or make it a rule.
- **Don't** round every container or create card-within-card layouts.
- **Don't** treat this system as a definition for the Razorpay flow before that surface is designed.
- **Don't** reach for a countdown hero, a starfield, or a neon glow on a space programme page. The category ships them by reflex; this system refuses them.

---

# Second World: The Sounding Record

**Scope: `src/pages/events/CansatProgram.jsx` only.** Seed key `10701b01`.

Every high-altitude balloon flight is, literally, a radiosonde sounding. So the
CanSat programme page is built as the artifact such a flight produces: a
strip-chart recorder trace on gridded chart stock. Time runs down the long axis,
the pen's horizontal position is altitude, and the record unrolls as you scroll.

It refuses two things at once — the starfield-and-neon page this category always
ships (which is what this page used to be), and that template's predictable
opposite, the white minimal spec sheet (which is what the rest of this site
already does well).

## Colors

- **Chart stock** (`#F2EDDF`): the paper. Printed with a 22px minor and 110px
  major grid in `#CFD6C9` / `#A9B6A6`, drawn as background gradients.
- **Margin rail** (`#E8E1CF`): the darker strip down the left edge carrying the
  time marks and the pen.
- **Form ink** (`#221F1A`) and **soft ink** (`#6A6459`): all set text.
- **Recorder pen** (`#A52F1C`): the trace, the keys, the primary action. The
  oxblood of an analog pen, not a brand red — and deliberately not the
  homepage's International Orange.
- **Stamp blue** (`#1C4A74`): the registration stamp only.
- **Inverted ground**: the sign-off station flips the record — ink ground, stock
  text, with `#CFC8B8` for body, `#9A9285` for form labels and `#4A443B` for the
  ruled line. It is the one dark block on the page, and it lets the shared
  graphite footer follow without a seam.

## Typography

**Display:** Archivo Narrow, 700, uppercase, `-0.035em` — a condensed grotesque
with the compression of a printed form heading.
**Apparatus:** Courier Prime — every label, key, unit, tick and stamp. The
typewriter is the voice of the form, not a costume for "technical": it sets only
the things a real sounding form would have typed or stamped.

Both faces load from the page itself, so no other route pays for them.

## Structure

Six stations in flight order — Release, Instrument, Burst, Recovery,
Preparation, Sign-on — each pinned to a time mark on the rail. The offer and the
primary action sit at T+00:00 so a Persuade visitor meets them first; the
eight-phase programme sits at PRE-FLIGHT, because that is when it happens.

## Motion

One authored moment: the pen draws as the record unrolls, scroll-linked, the way
a drum recorder lays down ink. It reaches 100% at the foot of the page and is
static under `prefers-reduced-motion`. There is no other animation on this page.

## Do's and Don'ts

- **Do** keep the trace inside its margin rail. A recorder pen never crosses the
  record's text.
- **Do** give grids fixed column counts. A wrapped remainder row breaks the
  ruled-form illusion immediately.
- **Don't** import graphite tokens here, or sounding tokens anywhere else. The
  two worlds share the footer and nothing else.
- **Don't** let this precedent spread. One programme page, one world, by
  explicit instruction — not a general licence.
