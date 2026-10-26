# Application audit — October 25, 2026

The course specification remains the acceptance standard. Reference archives and visual studies supply content and design evidence; they do not change the required behavior.

## Corrected findings

| Finding | Result |
|---|---|
| Production data sections showed “Failed to fetch” although database health was connected | The API now includes the exact owned production frontend origin in its allowlist. Configured origins are normalized. Tests check ordinary reads, authenticated preflights, and rejection of unrelated origins. |
| Header and footer navigation were difficult to read | Desktop navigation is 16px; mobile navigation is 18px; footer links are 16px, supporting text 15px, copyright 13px. Navigation targets are at least 44px high. |
| Secondary controls, field text, and management actions were too small | Larger labels and metadata, 16px form inputs, 44px icon controls, and a stacked narrow-screen content manager improve readability and reachability. |
| Network failures lacked a useful recovery path | Requests have cancellation and a 65-second timeout, helpful connection/unavailable messages, and an explicit retry action. Slow reads explain that the service may need a moment. Writes are not automatically retried. |
| Restored browser sessions could appear authenticated before verification | Saved session shape is checked and the server verifies the current user before protected content renders. Verification failures have a retry path. An expired response only clears the matching session. |
| Mobile navigation and workspace tabs needed keyboard behavior | Escape closes navigation and restores its trigger focus. Workspace tabs support arrows, Home, End, and a single active tab stop. |

## Functional evidence

- Nineteen backend integration tests exercise a real isolated MongoDB process: validation, hashed passwords, JWTs, role enforcement, ownership, project and article CRUD, comments and populated relationships, contact persistence, inbox access, error responses, payload limits, production configuration, and CORS.
- Eight frontend API-client tests cover authenticated JSON requests, no-content responses, field errors, expired sessions, connection failures, non-JSON outages, timeouts, and cancellation.
- The production frontend build completed successfully.
- Local browser checks confirmed public content loads, project search and its empty state, project detail links, administrator login, project update, logout, registration into an author-only workspace, and a contact submission arriving in the administrator inbox. Mark-as-read also completed successfully.
- Desktop navigation, footer, and the architectural panorama-to-figure transition were visually inspected. Mobile opening, navigation, transition, and dashboard layouts were inspected. A 320px layout check found no document overflow at the sampled state; a final cross-device sweep remains subject to the browser limitation below.

## Production and content acceptance

The production API returned a healthy connected database and the approved Waisery profile. Its projects and journal arrays were empty. Empty states are intentional until content is published. This was the pre-import observation. The owner subsequently supplied and approved six creative works; the later release below supersedes the empty-collection status. No demonstration projects were inserted into production.

Administrator provisioning was initially outstanding and was subsequently authorized and completed in the later release below. A live browser write-through review remains outstanding. Isolated tests and local demo checks verify implementation behavior; they are not evidence that a production administrator has been provisioned.

## Evidence limits

The browser automation connection stopped during the review because its Windows helper could not initialize. Checks completed before that interruption are recorded above. No later browser interactions are claimed. Saved viewport screenshots show the inspected states; the initial desktop full-page capture missed one offscreen lazy image, so it is not complete full-page visual evidence.

The Impeccable command-line engine could not initialize earlier in this environment. No automated comp-diff or build-phase approval is claimed. A separate fresh-context review assesses the supplied source and screenshots at their actual scope. See VERIFICATION.md for the final deployment observations.

## Superseding presentation and approved-work release

The owner requested a pure-white homepage with PPT-like keyframed transitions. Continuous homepage scrolling is replaced by five explicit chapters. The opening artwork sequence settles from architecture into the primary figure; long chapter content remains readable before a new wheel gesture advances. Keyboard, touch, chapter controls, transition locking, and reduced-motion paths are implemented. Other routes keep ordinary scrolling.

The owner supplied and authorized publication of six creative works and separately authorized production administrator provisioning and import. Three full literary texts, two full web-optimized videos, and an audio recording are prepared with English titles/descriptions. The production import completed successfully and preserved unrelated data. The journal remains empty until original articles are published; literary portfolio works are not silently duplicated as blog posts.

The final automated suite has 22 backend and 12 frontend tests. Media/text persistence, invalid sources, required media content, all six source records/assets, wheel momentum, nested reading boundaries, and direction reversal are covered. A server-rendered structural check additionally confirmed the homepage renders and inactive chapters are hidden/inert. Production build passed. Browser visual and playback acceptance remains blocked by the recorded Windows browser-helper failure. The independent reviewer returned `recapture` for the earlier invalid desktop evidence; no visual ship verdict is claimed for the new presentation.

## October 26 specification audit

A full requirement-by-requirement audit is recorded in SPEC_COMPLIANCE.md. No mandatory model, API endpoint, or route was missing. Three client defects were reproduced and corrected: comment drafts leaking across article IDs, duplicate punctuation in single-sentence project summaries, and a missing semantic word boundary in the homepage title. Regression and workflow coverage increased the passing suite to 48 tests (25 backend, 12 frontend utility, 11 React workflow), with a successful production build. The owner's production works were not modified by these checks. Original journal content and live browser/visual acceptance remain open.
