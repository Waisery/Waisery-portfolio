# Grading rubric review

Reviewed: October 26, 2026 (Asia/Shanghai).

Implementation examined: `cb048a1a8f85c822754ff78e3043d906ada44cef`.

Authority: the owner's twelve grading categories and `Capstone Project Specification.md`. Points below are the rubric weights, not marks awarded by this audit.

## Finding

All required backend and frontend functional areas have implementation evidence and passing automated checks. The current complete suite passed **48 tests**, followed by a successful production build. No new blocking functional defect was reproduced in this review.

Full acceptance remains open. The production journal has zero articles, so visitors cannot discover an actual article and comment conversation from its index. Actual browser verification of the current design, media playback and complete interface workflows remains unavailable because the Windows browser helper fails to initialize. Production availability was observed during this run, not established as a continuous guarantee.

## Evidence levels

- **Verified functional:** source was reviewed and relevant automated behavior passed. Backend tests use a real isolated MongoDB process; React workflow tests use jsdom and an isolated mock API.
- **Live:** the stated behavior was checked against the deployed API, frontend document or production Atlas database. A successful SPA HTML response does not prove React navigation or a protected redirect executed in a browser.
- **Partial acceptance:** implementation exists, but content readiness or real browser/visual verification is still missing.

## Backend — 50 points

| Category | Weight | Result | Evidence |
| --- | ---: | --- | --- |
| Database and models | 10 | Verified functional + live | All five Mongoose models exist with required fields, reference types and requested timestamps. Request validation adds string, email, URL and size checks. Atlas SRV connection to `waisery_portfolio` succeeded. Required unique username/email indexes exist. Current project/author/comment references have no orphaned relations. |
| Authentication and authorization | 12 | Verified functional + live login | Registration hashes passwords with bcrypt (12 rounds) and cannot assign an administrator role. Login compares the hash. JWT `sub` contains the user ID, with an eight-hour expiry. `protect` verifies signature, algorithm, issuer, audience and the current account. Invalid/expired/tampered tokens and missing accounts are tested. The configured production administrator logged in and `/users/me` confirmed the administrator role. |
| Project and BlogPost CRUD | 10 | Verified functional + live public/guard checks | All required GET/POST/PUT/DELETE routes are present and covered by real-database tests. Projects require an administrator for writes. Only the original blog author can update/delete their article; both another author and an administrator are denied somebody else's article. Successful live content mutations were not performed. |
| Relationships, comments and contact | 8 | Verified functional + live reads/validation | Project owners, blog authors and comment authors use `populate()` with username projections. Tests persist a comment associated with the current user and post, fetch populated comments and save/retrieve contact messages. The live contact endpoint rejected invalid and malformed input; public comments on a nonexistent article returned the expected 404. |
| MVC and central errors | 5 | Verified functional + live errors | Models, routes and controllers are separated. Central middleware handles request/schema validation, duplicate identity, invalid identifiers, malformed JSON, oversized payloads, missing records and unexpected server errors consistently. Current live probes returned the intended JSON 400/401/404 responses. |
| Security and backend deployment | 5 | Verified functional + live | Helmet and dotenv are installed and used. Live API headers include `X-Content-Type-Options: nosniff` and omit `X-Powered-By`. The API returned production/connected health. Exact frontend CORS and authenticated-write preflight passed; an unrelated origin received no allow-origin header. The current tracked tree and submission ZIP exclude private files; no known local secret values were found in tracked files. |

Source: `server/src/models/`, `server/src/database.js`, `server/src/config.js`, `server/src/middleware/`, `server/src/controllers/`, `server/src/routes/index.js`, `server/src/app.js`, and `server/test/api.test.js`.

## Frontend — 50 points

| Category | Weight | Result | Evidence |
| --- | ---: | --- | --- |
| React architecture and design | 10 | Architecture verified; visual acceptance partial | Shared Header, Footer, Button, Field, Status, Notice, Artwork and content components use props. CSS Modules provide responsive layouts, minimum touch targets, focus states and reduced-motion rules. About and homepage layouts have explicit mobile reflow. The current rendered desktop/mobile composition has not received real browser acceptance. |
| Routing | 8 | Verified functional + live SPA document delivery | React Router defines every required public route, dynamic article route and protected `/admin`; project detail and About are additions. The guard redirects an anonymous visitor to login and waits for server session verification. React component tests exercise redirects, navigation between record IDs and homepage scroll-lock cleanup. Ten deployed route documents returned HTTP 200, including deep links; their browser behavior is supported by component tests rather than live rendering. |
| Public API integration | 10 | Verified functional + live data; journal content pending | `useResource` fetches projects, journal lists and article details from an effect with loading, slow-loading, failure, retry and cancellation states. The controlled contact form submits data, retains fields on failure and clears on success. Live projects and journal requests succeeded; the journal currently returns an empty list. Positive contact persistence is verified against isolated MongoDB. |
| Authentication and global state | 10 | Verified functional + live API login | Controlled login/registration pages call the API. Auth Context manages session data, verification, login/logout, expiry and retries. Header navigation responds to verified authentication state. Tests cover author registration, login return destinations, sign-out and rejection of a stale/fabricated local administrator role. Existing production administrator login and identity retrieval passed without exposing credentials. |
| Protected API integration | 10 | Verified functional; live browser loop pending | Actual React editor tests create, update and delete projects and the administrator's own articles, assert the exact Bearer header for every write, preserve media fields and require deletion confirmation. Comment tests assert the token and refreshed response. Server integration tests independently verify persistence and permissions. Production inbox retrieval succeeded with the administrator token. Successful production CRUD/comment/contact writes were not attempted. |
| Frontend deployment | 2 | Communication verified; final polish acceptance partial | Vercel production deployment `dpl_BFxNeTrTqkSiraFB365jnbohYVRv` is READY for the examined implementation commit. The deployed JavaScript embeds the Render API URL. Live production-origin reads and authenticated preflight succeed. Automated passing checks and HTTP availability cannot establish that every visual, gesture, playback or browser workflow is fault-free. |

Source: `client/src/App.jsx`, `client/src/context.jsx`, `client/src/api.js`, shared components, page components/styles, `client/test/`, `client/vite.config.js`, and `vercel.json`.

## Current verification results

| Check | Current result |
| --- | --- |
| Complete verification command | `npm run check` passed |
| Real MongoDB backend integration tests | 25 passed, 0 failed |
| Frontend API/presentation tests | 12 passed, 0 failed |
| React component workflow tests | 11 passed, 0 failed |
| Frontend production build | Passed |
| Production API probes | 32 expected responses passed |
| Deployed route documents | 10 HTTP 200 SPA responses |
| Production administrator | Login, JWT subject/lifetime and current role passed |
| Production Atlas | Connected; unique identity indexes and current references checked |
| Current production data | 1 user, 6 projects, 0 blog posts, 0 comments, 0 contact messages |
| Current tracked source | 94 files scanned; no private/generated tracked files or known local secret matches |
| Existing submission archive | 113 file/directory entries; required client/server/README/configuration present; no private file entries |
| Real browser acceptance | Blocked by `helper_unknown_error: setup refresh had errors` |

Production probes used public reads, administrator login/read access, deliberately invalid input and unauthenticated writes expected to be rejected. They created no accounts, works, articles, comments or contact messages. Valid registration and positive persistence/CRUD behavior were exercised in an isolated test database.

Live checks included all six project detail records and populated owners, malformed/nonexistent IDs, all seven mandatory protected writes without authentication, malformed contact JSON, invalid contact/registration inputs, CORS/preflight, health/security headers, administrator login, `/users/me`, and administrator inbox access. Empty production journal data prevented a positive live article/comment-detail read.

The first health request took approximately **27.5 seconds** from the checking client. This measures the complete network/request wall time; the cause was not diagnosed and it is not a measurement of server execution time. The client has a 65-second request timeout, an eight-second slow-loading notice and a retry path. Allow for service wake-up/network latency during a demonstration.

## Remaining steps before final grading/demo acceptance

1. Publish at least one owner-approved English journal article. This supplies a discoverable article detail page and a real destination for a comment demonstration. No article was invented or published by this audit.
2. Run the current interface in a working browser at representative desktop and mobile widths, including keyboard navigation, zoom, long content, validation errors, login/logout, protected redirects, project/article CRUD, comments, contact/inbox and actual media playback.
3. Recheck visual layout and the five-chapter transition controls against the current build. Previous screenshots do not establish acceptance of later About, typography or cover changes.

The rubric's original-author rule takes precedence over an interpretation that an administrator may edit all blog posts. The shared workspace therefore gives authors writing access and administrators project/inbox access, while both manage only their own articles.

The closing footer appears in the homepage's Contact chapter as part of the owner-approved presentation; other routes render the shared footer after main content. This is an explicit presentation choice, not a missing footer component.

This report supplies evidence for grading. It does not award 100/100 or certify an unobserved fault-free browser experience.
