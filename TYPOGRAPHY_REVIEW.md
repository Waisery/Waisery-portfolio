# Typography review

Reviewed on October 26, 2026. This is a refinement of the existing Cormorant Garamond and DM Sans system.

| Role | Final size at the default 16px browser setting | Scope |
| --- | --- | --- |
| Reading and descriptive text | 16px / 1rem | Collection descriptions, journal excerpts, contact copy, comments, inbox messages, mobile article body |
| Main navigation and footer links | 16px; mobile menu 18px | Header and footer, including the final homepage chapter |
| Buttons and form labels | 15px; compact mobile links 14px | Public forms and workspace controls |
| Input text | 16px / 1rem | Search, login, registration, contact and content editors |
| Help, errors and presentation notes | 14px | Form hints, notices, cover provenance and demo instructions |
| Secondary metadata | 13px | Dates, categories, tags, roles and comment counts |
| Footer body and copyright | 16px and 14px | Shared footer |
| Project card headings | 28–35.2px, fluid | Shared gallery and homepage selected work |
| Literature | 20–24px serif, line height 1.75 | Full poems and fiction |

Primary headings retain their existing fluid display hierarchy. Text sizes use rem units for user font preferences. Long project names can wrap inside shrinking flex containers without forcing their category outside the card; detail headings can also wrap unbroken title segments. Article and literature measures remain limited to 70ch and 68ch.

The audit covered shared components, the presentation homepage, collections, project and journal details, about, contact, authentication and the administration workspace. Previously undersized 10–12px dates, roles, helper text and inbox metadata were increased. Navigation and footer links were already 16px and remain at that size; footer descriptive text and copyright were increased.

## Verification scope

CSS declarations, breakpoint overrides, component wiring, content provenance, automated workflows and the production build are checked. Browser automation failed to initialize with `helper_unknown_error: setup refresh had errors`, so this review does not claim rendered desktop/mobile, zoom, overflow or animation acceptance. Those visual checks remain pending a working browser session. No screenshots from the older ivory homepage are treated as evidence for the current white presentation.

## Cover content

`major dissemination_1` uses the supplied College of Artificial Intelligence image. `major dissemination_2` uses the supplied campus image. Their original composition is preserved during WebP export. The four other covers are photographic interpretations generated with the built-in ImageGen tool; full prompts and asset hashes are recorded in `COVER_ARTWORK.json`. They are identified as generated interpretations in the public work notes.
