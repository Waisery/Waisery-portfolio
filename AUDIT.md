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

The production API returned a healthy connected database and the approved Waisery profile. Its projects and journal arrays were empty. Empty states are intentional until content is published. The formal Literature, Art, and Media materials and original writing remain owner-supplied acceptance items. No demonstration projects were inserted into the production database during this audit.

Production administrator provisioning and a live authenticated write-through review remain outstanding. Isolated tests and local demo checks verify implementation behavior; they are not evidence that a production administrator has been provisioned.

## Evidence limits

The browser automation connection stopped during the review because its Windows helper could not initialize. Checks completed before that interruption are recorded above. No later browser interactions are claimed. Saved viewport screenshots show the inspected states; the initial desktop full-page capture missed one offscreen lazy image, so it is not complete full-page visual evidence.

The Impeccable command-line engine could not initialize earlier in this environment. No automated comp-diff or build-phase approval is claimed. A separate fresh-context review assesses the supplied source and screenshots at their actual scope. See VERIFICATION.md for the final deployment observations.
