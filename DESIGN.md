---
name: Waisery
description: A spacious celestial portfolio and journal with a white chapter presentation and warm ivory reading surfaces.
colors:
  paper: "#faf7f0"
  ink: "#30291f"
  muted: "#746957"
  gold: "#94713c"
  line: "#dcd3c2"
  home-paper: "#fff"
  home-ink: "#272925"
  home-muted: "#626760"
  home-line: "#e3e5df"
  home-emphasis: "#8c6a37"
  link-hover: "#805c29"
  button-text: "#fffaf0"
  button-hover: "#5d4930"
  secondary-border: "#a99a82"
  secondary-hover: "#eee4d4"
  secondary-hover-border: "#8c7757"
  field-surface: "#fdfbf6"
  field-border: "#c8bda9"
  field-focus: "#b69563"
  focus: "#9a672a"
  tag-surface: "#eee7da"
  tag-text: "#6b5b44"
  editor-surface: "#f2ecdf"
  error: "#963d2b"
  notice-surface: "#f9eee8"
  notice-text: "#7f392c"
  notice-border: "#cba594"
  success-surface: "#edf0e5"
  success-text: "#465538"
  success-border: "#b4bda1"
  media-surface: "#171915"
typography:
  display:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "clamp(3.8rem,6.3vw,7rem)"
    fontWeight: 500
    lineHeight: 0.97
    letterSpacing: "-.045em"
  headline:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "clamp(3rem,4.6vw,5.2rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-.035em"
  page-title:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "clamp(3.1rem, 5.6vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-.025em"
  section-title:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "clamp(2.35rem, 3.5vw, 3.5rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-.025em"
  title:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "1.9rem"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-.025em"
  body:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "1rem"
    lineHeight: 1.75
  literature:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
    fontSize: "clamp(1.25rem,2vw,1.5rem)"
    fontWeight: 400
    lineHeight: 1.75
  navigation:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "1rem"
    lineHeight: 1.5
  label:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: ".9375rem"
    fontWeight: 500
  button:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: ".9375rem"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  tag: "4px"
  field: "5px"
  artwork: "6px"
  editor: "8px"
  filter: "24px"
  button: "28px"
  circle: "50%"
spacing:
  tight: "8px"
  compact: "14px"
  standard: "16px"
  group: "24px"
  section-gap: "30px"
  grid-gap: "38px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.button-text}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "14px 25px"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
    textColor: "{colors.button-text}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "14px 25px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
    textColor: "{colors.ink}"
  field:
    backgroundColor: "{colors.field-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "13px 14px"
  tag:
    backgroundColor: "{colors.tag-surface}"
    textColor: "{colors.tag-text}"
    rounded: "{rounded.tag}"
    padding: "6px 10px"
  navigation:
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
  artwork:
    rounded: "{rounded.artwork}"
  chapter-arrow:
    backgroundColor: "{colors.home-paper}"
    textColor: "{colors.home-ink}"
    rounded: "{rounded.circle}"
---

# Design System: Waisery

## Overview

**Creative North Star: "Veil of Light with Jade Horizon"**

Waisery carries the confirmed Chinese celestial direction: elegant, dignified, grand, and striking. White-jade architecture, cloud seas, pale-gold light, fine openwork, translucent layers, and an anonymous dark figure establish the imagery. The figure is an atmospheric illustration, not a portrait of the portfolio owner. Spacious serif headlines and restrained functional text keep the work legible within that world. All interface copy and project documentation use English.

The implemented home is a pure-white, five-chapter presentation with deliberate keyframed changes between Opening, Work, About, Journal, and Contact. Inner routes retain the warm ivory, gold, and ink system for browsing, reading, forms, and management. The home composition is a route-specific expression; its viewport presentation is not a requirement for other screens.

**Key Characteristics:**

- Spacious typography with a clear distinction between literary display and functional text.
- Celestial artwork balanced by quiet white or ivory surfaces.
- Ink actions, fine warm rules, modest corners, and restrained motion.
- Responsive reading space with explicit keyboard, focus, status, and reduced-motion behavior.

This record is extracted from `client/src/styles.module.css`, `client/src/components.jsx`, `client/src/pages/Home.module.css`, `client/src/pages/HomePresentation.jsx`, and `client/src/App.jsx`. It records source behavior; it does not certify a completed live visual review.

## Colors

The palette pairs warm paper and ink with pale-gold imagery; the homepage introduces a cooler white canvas through scoped custom properties.

### Primary

- **Quiet Gold** (`gold`): brand dot, short rules, selected workspace underline, and chapter indicator. The homepage headline uses the related `home-emphasis` value.
- **Deep Ink** (`ink`): inner-route text and primary action surfaces. Hovered links use `link-hover` rather than a saturated accent.

### Neutral

- **Warm Paper** (`paper`): default application background and inner-route navigation.
- **White Chapter Canvas** (`home-paper`): presentation, home header, and chapter control bar.
- **Botanical Charcoal** (`home-ink`) and **Cool Grey** (`home-muted`): scoped home text roles.
- **Warm Muted Text** (`muted`): supporting copy, metadata, and functional secondary text on inner routes.
- **Fine Rules** (`line`, `home-line`): inner and home separation respectively.
- **Quiet Field** (`field-surface`) and **Editor Paper** (`editor-surface`): subtle functional surface changes.

Error and success surfaces use the named notice and success tokens. These communicate form or request outcomes, independently of the decorative gold. Video uses `media-surface` so its image has a dark frame.

**The Scoped Paper Rule.** Pure white belongs to the homepage presentation and its header; inner routes keep warm paper unless an existing component explicitly defines another surface.

Home custom properties inherit into shared components: a primary button uses the home ink inside the presentation, while the secondary border, tag colors, and field colors remain their explicit shared values. The home header is white but retains the shared navigation text styling.

## Typography

**Display Font:** Cormorant Garamond, with Georgia and serif fallbacks.

**Body Font:** DM Sans, with a sans-serif fallback.

The serif supplies the stately editorial character; the sans-serif keeps navigation, metadata, forms, and reading support direct. Headings balance text automatically. There is no prescribed uniform type-scale ratio: the implementation uses responsive clamps and component-specific sizes.

- **Display:** the home opening headline uses `display`, with a maximum width of 10.8ch. Its emphasized word is italic gold at weight 400.
- **Headline:** the home chapter headings use `headline`; the closing chapter has its own larger clamp, `clamp(3.1rem,5.6vw,6rem)`.
- **Page and section titles:** inner-route headings use `page-title` and `section-title`; project-card titles are 2.3rem and journal-row titles are 2.2rem on desktop.
- **Body:** the base is 16px with paragraph line-height 1.75. Supporting copy varies by surface, commonly 14–16px. Descriptions and articles typically stop at 65–70ch.
- **Literature:** full literary text uses the `literature` role in a 68ch column, preserving line breaks and wrapping long content.
- **Navigation:** header links are 16px; mobile navigation links become 18px. Footer navigation, description, and copyright use 16px, 15px, and 13px respectively. The desktop Register link is 15px.
- **Label:** form labels are 14px at weight 500. Metadata and tags commonly use 12px; these small supporting styles do not replace readable body copy.

**The Two Voices Rule.** Use Cormorant Garamond for expressive headings and literary passages; use DM Sans for controls and functional information.

## Layout

Shared pages center within a 1440px maximum and use 6.5% horizontal padding on desktop. Inner pages begin at 162px to clear the fixed 92px header, with 100px bottom padding. Shared sections use 75px top and 90px bottom space. The work grid is asymmetric (1.2fr / 1fr) with 46px row and 34px column gaps. Detail pages pair a flexible article with a 260px aside and an 80px gap. Forms and management layouts use explicit grids rather than a universal card grid.

The homepage locks document-body scrolling while mounted and uses a 100svh presentation with a 400px minimum height. Each scene occupies the area between the 92px header and 80px control bar, with `clamp(28px,5vh,70px)` vertical padding and 7% horizontal padding. Its frame is capped at 1440px. Opening uses 1.1fr / 1fr columns; Work uses 1.12fr / 1fr with a 38px gap; About uses equal columns with 10% separation. Each scene can scroll internally when its content exceeds the available height, preserving access on short screens.

At 1100px, shared navigation gaps narrow, page headings wrap, and the management editor moves above its list in a single column. At 1050px, the home headline and journal thumbnail grid compress and the progress instruction hides. At 760px, the header becomes 76px, shared pages use 7% side padding and start at 122px, most content grids stack, and the home control bar becomes 70px. Home slides sit between those smaller fixed elements; Opening stacks copy and artwork, Work and About use one column, chapter names become two-digit numbers, and the progress counter hides. The body supports a 320px minimum width. The shared 1600px media query concerns retained legacy hero styles, not the active homepage presentation.

## Elevation & Depth

Depth comes primarily from the artwork, masked edges, tonal surfaces, and thin rules. Cards and buttons have no resting shadow. The open mobile navigation has the sole shared panel shadow (`0 15px 20px #30291f12`). Active header links use a fine lower stroke implemented as `box-shadow: 0 1px 0 #a27c46`; this is a selection marker, not surface elevation.

**The Quiet Surface Rule.** Keep ordinary content surfaces flat and express separation through space, rules, and the existing paper tones.

## Shapes

Primary and secondary buttons are generous pills using the `button` radius and a minimum height of 48px. Filter buttons use the smaller `filter` pill. Artwork has modest `artwork` corners; fields, notices, and journal images use `field`; tags use `tag`; the editor uses `editor`. Circular arrow controls, avatars, and the brand dot share round geometry. These measured corners keep the literary system composed without introducing large rounded container panels.

The opening artwork is an edge-masked image region, not a bordered card. Two aligned plates dissolve from the architectural panorama into the figure-led scene, keeping the figure on the right on desktop. Mobile changes the image crop and mask to suit the stacked composition.

## Components

### Buttons and text links

Shared buttons render as a React Router link when a destination is provided, otherwise as a native button. Primary uses ink with light text and a matching border. Hover changes background and border to `button-hover`. Secondary is transparent with a taupe border; hover uses `secondary-hover` and `secondary-hover-border`. Both use 14px type, 14px × 25px padding, and a 22px icon gap, with smaller home-mobile action spacing. Their color, background, and border changes take 0.2s. Disabled buttons use opacity 0.55 and a wait cursor by default; chapter arrows override this to opacity 0.35 and a default cursor.

Text links have a 44px minimum height, a fine warm underline, 15px type, and a 24px arrow gap. Their arrow moves 4px right over 0.2s on hover.

### Navigation and footer

The fixed header has a 92px desktop height, 5.2% side padding, and 28px desktop navigation gaps. Inner-route header translucency becomes stronger with scrolling or an open menu, and gains a fine border. The homepage header uses a solid white surface. Active route links change color and gain a fine lower marker. Navigation controls retain a 44px minimum height.

At 760px, the navigation is hidden behind a 44px menu button. The open menu forms a vertical panel below the 76px header; links use 18px text. Its white home variant limits height to the available viewport and permits internal scrolling. Escape closes the menu and returns focus to the trigger; navigation closes on route changes. The trigger exposes expanded state and the controlled navigation ID.

The footer uses a two-column desktop grid and stacks on mobile. Home renders it inside the Contact chapter; other routes render it after main content.

### Work cards, tags, and journal rows

Work cards are open editorial articles with no surrounding panel. The image uses a 1.9 aspect ratio on desktop and 1.65 on mobile, modest corners, and an inset circular arrow. Hover scales the image to 1.035 over 0.7s with `cubic-bezier(.2,.8,.2,1)`. Title, category, excerpt, and wrapping tags sit below it. Tags are supporting labels, not interactive filters.

Journal rows pair an image and text with a circular arrow on desktop and a thin lower rule. Their image scales to 1.03 over 0.5s on hover. Shared mobile rows use a 105px thumbnail; the homepage uses 90px. The separate arrow hides at the mobile breakpoint while title and image links remain available.

Filter controls use native buttons with `aria-pressed`; the selected filter gains ink and paper colors. Search is a transparent 16px input in an underlined row.

### Inputs, notices, and resource states

Fields have a 1px `field-border`, `field-surface`, 13px × 14px padding, 16px input type, and 1.5 line-height. Input and textarea focus uses a 2px `field-focus` outline with a 2px offset. Invalid fields change border color; error and hint text connect through `aria-describedby`. Required labels expose the native required constraint while their decorative asterisk is hidden from assistive technology. Textareas resize vertically with a 90px minimum height.

Error notices use an alert role, and success notices use a status role. Loading uses a status region with a spinner and delayed-service copy; request errors include a retry button. Empty states use a dashed warm rule and readable explanation. Failed artwork becomes a warm placeholder with an accessible image label.

### Literature and media

Literary passages sit below a fine top rule, with preserved newlines and a 68ch maximum. Video is full-width with modest corners, a dark background, and a 72svh maximum height. Audio players span the content width with 24px vertical margins. Keep native playback controls and their independent interaction behavior.

### Chapter presentation

The homepage has five scenes and persistent chapter buttons, previous/next arrows, and desktop progress. The active button exposes `aria-current="step"` and a fine gold underline. At either end, the unavailable direction is disabled. Chapters support wheel intent, touch swipes, arrows, Page Up/Down, Space, Home, and End. Internal scene scrolling takes precedence while there is content to read. Form fields, editable content, video/audio controls, an open site menu, and modified keyboard shortcuts are excluded from scene navigation. There is no automatic chapter advance.

Scene arrival takes 0.8s using `cubic-bezier(.16,1,.3,1)`: direction-aware 42px horizontal travel, a subtle 0.985 scale, and opacity. Departure takes 0.36s with 24px opposing travel. Copy arrives over 0.72s with a 20px vertical offset and small stagger; the artwork dissolves over 1.6s. Navigation is locked for 820ms during a normal transition and 160ms with reduced motion.

Inactive scenes are hidden; a departing scene remains briefly visible but inert and hidden from assistive technology. A polite live region announces chapter changes. Explicit navigation moves focus to the new heading; wheel/touch navigation also moves focus if it would otherwise remain in the old panel.

### Focus and reduced motion

Global keyboard focus uses a 2px `focus` outline with a 5px offset. The skip link appears at the top left on focus. Main and programmatically focused scene headings suppress their own outline; interactive controls keep visible focus. Do not remove the shared focus treatment from controls.

With `prefers-reduced-motion: reduce`, the shared stylesheet disables smooth document scrolling and forces all animation and transition durations to 0.01ms with `!important`. The home stylesheet additionally declares opacity-only scene arrival/departure and removes the image dissolve, showing the final figure-led plate. The home rules explicitly preserve a 0.14s opacity arrival and 0.12s departure with matching important declarations. Spatial movement is removed, the loading spinner is static, and inner reading scrolls immediately.

## Do's and Don'ts

### Do:

- **Do** preserve the scoped white homepage and warm ivory inner-route distinction.
- **Do** keep serif display and literary text paired with sans-serif functional copy.
- **Do** preserve the celestial artwork's anonymous figure, luminous architecture, and restrained gold character.
- **Do** keep overflow content readable, focus visible, scene announcements available, and native media controls independent.
- **Do** use the existing responsive grids and reduced-motion behavior when extending a component.

### Don't:

- **Don't** apply the homepage's viewport presentation to reading or management routes without an explicit new design decision.
- **Don't** use the illustrated figure as the portfolio owner's portrait.
- **Don't** replace ordinary flat content surfaces with decorative elevation or remove the existing focus outlines.
- **Don't** treat generated sidecar tonal ramps as additional production color tokens.

The direction and product records now include the owner's superseding white chapter presentation. Earlier continuous-opening descriptions remain historical context. This documentation follows the active source and latest approved direction. Legacy hero rules remain in the shared stylesheet but are not the active home system. Small metadata in existing management/comment views is recorded as existing source variation, not promoted to the default text scale. No live browser acceptance is claimed.
