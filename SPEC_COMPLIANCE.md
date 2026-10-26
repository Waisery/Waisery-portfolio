# Specification compliance audit

Audit date: October 26, 2026 (Asia/Shanghai).

Authority: `Capstone Project Specification.md`. It is treated as the requested acceptance checklist. Reference archives, artwork studies, and supplied creative works do not override its functional requirements. The owner's later white presentation design and approved creative content are documented separately.

## Overall finding

All five required models, all fifteen mandatory API endpoints, all seven mandatory public routes, and the protected `/admin` route are implemented. The explicit MVC, React, routing, Context, authentication, authorization, persistence, and deployment requirements have source evidence and automated coverage. Three concrete client defects were reproduced and corrected during this audit.

The implementation is not declared completely accepted or bug-free. The production journal has no articles, so a visitor cannot currently discover a populated article/comment screen through the live journal. A complete live browser workflow and visual/playback acceptance remain unverified because the browser tool cannot initialize. An empty journal is a content/demo-readiness gap, not evidence that its API or editor is absent.

## Evidence and status key

- **Verified:** source reviewed and the relevant automated contract/workflow checks passed. The test type is stated; mocked client tests are not presented as live end-to-end tests.
- **Live:** a read-only or deliberately invalid request was also checked against the deployed service.
- **Partial:** implementation evidence exists but the named acceptance step remains open.
- **Decision:** an ambiguity or owner-approved extension is explained explicitly.

The completed check command is `npm run check`: **25 backend integration tests + 12 frontend API/gesture tests + 11 React component workflow tests = 48 passing tests**, followed by a successful production build. Backend integration tests use a real isolated MongoDB process. Component tests use React, React Router, jsdom, and an isolated test API; they exercise actual forms, state, routes, and request construction without writing to production.

## Phase 1 — Models and core structure

| Requirement | Status | Evidence and interpretation |
|---|---|---|
| Node/Express API in MVC form | Verified | `server/src/models`, `controllers`, and `routes` exist; routes delegate to controllers and models. |
| Cloud-hosted MongoDB Atlas | Verified / Live | `database.js` uses Mongoose; production health reports `mode: production` and `database: connected`. Production never falls back to the local demo. |
| User: required unique username | Verified | `models/User.js` sets required/unique/trim and length limits; duplicate username is rejected with HTTP 409 through the API. |
| User: required unique email | Verified | Required, normalized to lowercase, email validation, unique database index; duplicate email returns HTTP 409. |
| User: required password, minimum six characters | Verified | Mongoose and request validation enforce the minimum; registration rejects missing/short values and bcrypt inputs over 72 UTF-8 bytes. Password selection/serialization excludes the hash. |
| Project: required title and description | Verified | Required Mongoose strings and request validation; model-contract tests reject missing fields. |
| Project: optional imageUrl, repoUrl, liveUrl | Verified | Empty defaults preserve optional behavior; request validation rejects unsafe URL schemes. |
| Project: required User reference | Verified | ObjectId `user` references `User`; creation assigns the authenticated user instead of trusting a request-supplied ID. |
| BlogPost: required title/content/author | Verified | Validated strings and required ObjectId `author` referencing `User`; missing-field tests cover all three. |
| BlogPost: automatic timestamps | Verified | Schema uses `{ timestamps: true }`; list/detail data and client date rendering use the generated values. |
| Comment: required body/author/post | Verified | `body` is trimmed/validated; ObjectId references point to `User` and `BlogPost`. A nonexistent post cannot receive a comment. |
| Comment: automatic timestamps | Verified | Schema timestamps are enabled; chronological queries and displayed comment dates use them. |
| Message: required name/email/message | Verified | Required trimmed strings; email and request limits validated; saved contact messages are retrieved by the administrator inbox. |
| Message: automatic timestamps | Verified | Schema timestamps are enabled and the inbox displays creation dates. |

Additional `role`, media, literary-content, sample-label, inbox read-state, and import-key fields extend the five models without replacing or weakening required fields. There is no separate Skill model: skills are returned by `/api/profile`. The overview mentions skills, but the explicit model and endpoint requirements do not prescribe Skill CRUD.

## Phases 2–3 — Authentication and authorization

| Requirement | Status | Evidence and result |
|---|---|---|
| Hash passwords with bcrypt on registration | Verified | `User` pre-save hook uses `bcryptjs`, an implementation of the bcrypt algorithm, with 12 salt rounds. Stored values differ from plaintext and a correct comparison succeeds. |
| Compare passwords at login | Verified / Live | `controllers/users.js` selects the password for comparison; wrong credentials return HTTP 401; the configured production administrator successfully signs in. |
| JWT includes the user's ID | Verified | The ID is in the standard `sub` claim. Token lifetime is eight hours. Tests verify the ID and expiry interval. |
| Registration endpoint | Verified / Live | Valid registration is integration/component tested; invalid production input returns HTTP 400 without creating an account. Public registration cannot inject an administrator role. |
| Login endpoint | Verified / Live | Integration and component tests cover controlled input and redirect behavior; live administrator login and `/users/me` verification succeeded. |
| `protect` verifies Authorization: Bearer and attaches req.user | Verified | The middleware verifies signature/algorithm/issuer/audience and loads the user. Missing/tampered/expired/wrong-issuer/wrong-audience tokens and missing accounts are rejected. |
| Only the original blog author can update/delete | Verified | Controller compares the stored author ID to `req.user._id`. Other authors and administrators are both denied another author's article. |
| Project management is administrator-only | Verified / Live | POST/PUT/DELETE all apply `protect` and `adminOnly`. Tests reject anonymous and author attempts for every verb. Invalid-ID live negative probes do not touch real works. |

**Authorization decision:** “Admin Dashboard” does not override the specification's original-author rule. An administrator creates and manages their own posts; they cannot edit/delete somebody else's writing. The dashboard hides those controls, and the server independently enforces the rule. Registered authors get writing access, not project/inbox privileges.

## Phase 4 — Every mandatory API endpoint

| Method and route | Status | Contract checked |
|---|---|---|
| POST `/api/users/register` | Verified / Live negative | Creates an author, hashes password, returns a session; validates/uniquely constrains identities. |
| POST `/api/users/login` | Verified / Live | Correct password returns JWT/user; invalid credentials return HTTP 401. |
| GET `/api/projects` | Verified / Live | Public list with populated owner; six approved works were returned. |
| GET `/api/projects/:id` | Verified / Live | Public detail; all six production records were rechecked with owner usernames, media types, full-text presence, and sample labels. Unknown/malformed IDs have consistent errors. |
| POST `/api/projects` | Verified / Live negative | Authenticated administrator creates a project associated with the current user. React editor sends POST and Bearer token. |
| PUT `/api/projects/:id` | Verified / Live negative | Administrator updates the validated project fields; React editor preserves media fields and sends PUT/Bearer. |
| DELETE `/api/projects/:id` | Verified / Live negative | Administrator deletion persists and returns HTTP 204; client requires a confirmation before sending DELETE/Bearer. |
| POST `/api/contact` | Verified / Live negative | Controlled contact form saves a real Message. Invalid input returns field errors; retry preserves input and success clears the form. |
| GET `/api/blog` | Verified / Live | Public list populates the author's username. Production returned an empty array at audit time. |
| GET `/api/blog/:id` | Verified / Live negative | Returns author and all associated populated comments in integration tests. A valid but nonexistent live ID produces the article-not-found result. |
| POST `/api/blog` | Verified / Live negative | Authenticated author/admin creates an owned post. Client editor sends POST/Bearer. |
| PUT `/api/blog/:id` | Verified / Live negative | Only original author updates. Client sends PUT/Bearer, and another author/admin cannot bypass ownership. |
| DELETE `/api/blog/:id` | Verified / Live negative | Only original author deletes. Comments are cleaned up; client confirms before DELETE/Bearer. |
| GET `/api/blog/:postId/comments` | Verified / Live negative | Public comments are populated and sorted; missing posts are distinguished from an empty conversation. |
| POST `/api/blog/:postId/comments` | Verified / Live negative | Authenticated comment is related to the current user/post; client sends the body and Bearer token, then refreshes rendered comments. |

`Live negative` means a request intentionally used missing authorization, invalid input, or a nonexistent ObjectId. These probes validate the deployed guard/error contract without creating records or changing the six formal works. Successful live project/blog/contact/comment writes were not performed in this audit. Positive persistence/CRUD evidence comes from the real isolated MongoDB integration suite.

## Phase 5 — Security, errors, and backend deployment

| Requirement | Status | Evidence |
|---|---|---|
| Central consistent JSON error handling | Verified / Live | `middleware/errors.js` handles validation, duplicates, IDs, malformed JSON, size limits, and generic server failures as `{ error: { message, fields? } }`. |
| Helmet security headers | Verified / Live | `app.js` installs Helmet; `X-Content-Type-Options` was observed on live responses. |
| dotenv and secret separation | Verified | Server configuration reads local environment files; real credentials are absent from the client, tracked source, and submission ZIP. Environment examples contain placeholders. |
| Public live backend | Verified / Live | `https://waisery-api.onrender.com/api/health` returns HTTP 200 with a connected production database. |
| Frontend/backend origin configuration | Verified / Live | Exact production origin allowed; unrelated origin omitted; authenticated preflights are covered by integration tests and prior live checks. |

An initial health request timed out at 30 seconds; later requests and the health retry succeeded. This is an observed cold-start/availability limitation, not a passed latency guarantee. The client has a bounded 65-second timeout, a slow-loading message, and an explicit retry path. Access to the owner's Render control-plane logs remains unavailable through the current connector.

## Phase 6 — React architecture

| Requirement | Status | Evidence |
|---|---|---|
| Reusable logical components | Verified | Shared Header, Footer, Button, Field, Status, Notice, Artwork, ProjectCard, PostRow, and page/workspace components. |
| Props used effectively | Verified | Card data, editor kind/item/callbacks, button variants, field state/errors, and resource status travel through props. |
| Modern styling | Verified | CSS Modules in `styles.module.css` and `pages/Home.module.css`. |
| Professional responsive layout | Partial | Desktop/mobile breakpoints, reflow, minimum targets, focus, reduced-motion, and component behavior are implemented. Current browser viewport/visual acceptance could not run. |

## Phase 7 — State and API integration

| Requirement | Status | Evidence |
|---|---|---|
| useState for local state | Verified | Controlled forms, search/filter state, editor/deletion state, loading/errors, and homepage chapters use React state. |
| useEffect fetches live backend data | Verified | `useResource` performs abortable fetches in an effect; profile and auth state are supplied through Context. |
| Projects fetch GET /api/projects | Verified / Live source | Projects page and homepage consume the API; gallery search/detail and management mapping are tested. |
| Blog fetches GET /api/blog | Verified | Component tests load own/other-author posts, and the source fetch path matches the deployed API. |
| Blog detail fetches GET /api/blog/:id | Verified | Actual routed component loads article/comment payloads; switching IDs remounts record-specific state. |
| Loading and error rendering | Verified | `Status` renders loading, slow-loading, recoverable error, and retry states. Session-verification outage/retry is component tested. |
| Controlled contact POST | Verified | Form input, server error, retry, success, and clearing behavior are tested; real MongoDB message persistence is integration tested. |
| Controlled registration/login POST | Verified / Live login | Component tests exercise input payloads, auth-aware navigation, return destination, and access separation. |
| Authenticated comment POST | Verified | Component test confirms the exact endpoint/Bearer token and refreshed comment; integration suite confirms storage and populated author. |
| Protected dashboard requests carry JWT | Verified | Component tests inspect POST/PUT/DELETE for both projects and articles and assert Authorization: Bearer. |

## Phase 8 — Every required route and global state

| Route / requirement | Status | Evidence |
|---|---|---|
| `/` Home/About | Verified / Partial visual | Five-chapter owner-approved home includes work, about, journal, contact; chapter and exit logic are component tested. |
| `/projects` | Verified | Public gallery consumes projects; detail navigation and management resource mapping are exercised. |
| `/blog` | Verified | Public journal consumes the API; production content is currently empty. |
| `/blog/:id` | Verified / Partial live content | Routed reading/comment component tested; no live article is currently discoverable from the empty journal. |
| `/contact` | Verified | Controlled POST form and success/error paths tested. |
| `/login` | Verified | Login flow, protected redirect, and return-to-article behavior tested. |
| `/register` | Verified | Registration enters an author workspace and cannot expose project/inbox management. |
| `/admin` protected | Verified | Anonymous visitors are redirected; saved user roles are not trusted until `/users/me` verifies them. |
| Context API auth state | Verified | Providers expose user/token/checking/sign-in/sign-out/retry; session restoration, verification failure recovery, and sign-out are tested. |
| Auth-aware header | Verified | Register/Sign in for anonymous visitors; Dashboard/Sign out after authentication; sign-out removes authenticated comment controls. |

Additional `/about`, `/projects/:id`, Not Found handling, and the administrator inbox are extensions. Detail routes are keyed by ID so prior-record state does not leak into the next one. Ordinary routes retain document scrolling; leaving the presentation releases the home scroll lock.

## Phase 9 — Core pages and dashboard

| Requirement | Status | Evidence and decisions |
|---|---|---|
| Shared Header and Footer on pages | Verified / Decision | Components are shared across routes. On the presentation homepage, Footer appears in the Contact chapter; it is not pinned over every chapter. Other routes render it after main content. The owner-approved presentation changes the page flow, not the presence of its closing footer. |
| Protected dashboard | Verified | Verified current session required before the workspace renders. |
| UI to manage projects and posts | Verified | Editors/lists expose creation, edit, success/error, viewing, and confirmed deletion. Projects/inbox are admin-only. |
| Project create/update/delete | Verified | Full React form lifecycle and POST/PUT/DELETE/token construction tested; API suite verifies real persistence and role checks. |
| Blog create/update/delete | Verified | Administrator's own article lifecycle tested; server and UI deny editing another author's article. |

## Phase 10 — Frontend deployment

| Requirement | Status | Evidence |
|---|---|---|
| Production React build | Verified | `npm run check` ends with a successful Vite production build. |
| Public live frontend | Verified / Live | `https://waisery-portfolio.vercel.app/`; the connected Vercel project was READY before this audit's corrections. Corrections are published through the same repository workflow. |
| Deployed frontend uses deployed backend exclusively | Verified source / Partial live browser | Production bundle embeds `https://waisery-api.onrender.com/api`; local dev uses Vite's /api proxy. CORS and public data reads work. No mock-data fallback is shipped in the production app. Full post-correction browser acceptance remains open. |
| Polished and bug-free final behavior | Partial | Automated checks passed after the three corrections; that does not prove every viewport, real media playback, gesture, or browser path is bug-free. |

## Submission requirements

| Deliverable | Status | Evidence |
|---|---|---|
| Live frontend URL | Verified / Live | Listed above and in README. |
| Live backend URL | Verified / Live | API base and health URL listed in README. A bare API base returning no route is not a missing health/API deployment. |
| `_Project.zip` including server/client | Verified at packaging | Regenerated from the final committed source; required files/media are inspected and private data excluded. |
| README overview | Verified | Describes stack, features, public content, and project structure. |
| README live links | Verified | Frontend, API base, and health links present. |
| README endpoint inventory | Verified | All fifteen mandatory endpoints and five extra endpoints listed. Media/text payload additions were reconciled during this audit. |
| README local-running instructions | Verified | Lockfile install, dev command, ports/proxy, real demo database, environment setup, administrator provisioning, and optional works import explained. Node requirements updated for the complete test toolchain. |

## Defects reproduced and corrected

| Defect | Trigger and consequence | Correction / regression evidence |
|---|---|---|
| Cross-article comment draft leakage | Enter a draft on one article and navigate directly to another article ID. The existing component retained the first draft. | Key dynamic record components by ID. The regression navigates between two real routed components and checks the second form is empty. Project detail also gains fresh request-specific state. |
| Duplicate project-summary punctuation | A description containing a single complete sentence already ends in a period. The card added another period. | Preserve existing terminal punctuation before adding a period. The rendered-card regression checks the exact stored sentence. |
| Homepage accessible title word join | Adjacent display spans contained no separating whitespace, joining the end of one line to the next in the accessible name. | Add semantic whitespace between lines; the component test finds the heading by its correct complete accessible name. |

## Content correctness and remaining acceptance

1. Six owner-approved formal works are present: three Literature texts, two Media videos, one Art audio work. They are not labeled sample content. English literary editions and descriptive text are source-linked; original-language recordings and illustrative covers are identified.
2. The journal returned zero posts. This prevents a natural public live demonstration of article detail/comments. Publish an owner-approved journal article before a final public grading/demo run. This audit does not invent writing or duplicate portfolio works into the journal without an editorial decision.
3. Current visual, keyboard/gesture behavior in an actual browser, focus/overflow at representative viewports, and real playback still need manual acceptance. The browser helper failed to initialize on October 26 as well. Component tests do not replace a browser engine or a visual review.
4. The previous independent visual review remains at `recapture`; no new visual approval or formal Impeccable gate pass is claimed.
5. The rubric includes human judgments about design quality and production readiness. This report maps evidence to requirements; it does not assign a fabricated mark or guarantee 100/100.
