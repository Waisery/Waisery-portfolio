# Verification record

Last reviewed: October 26, 2026. The course specification remains the acceptance standard. See AUDIT.md for the earlier findings and MEDIA_PROVENANCE.json for supplied-work preparation.

## Automated verification

- Twenty-five backend integration tests passed against an isolated, real MongoDB 7.0.24 process.
- Twelve frontend API-client/presentation-interaction tests and eleven React component workflow tests passed: 48 tests in total across the complete application.
- The frontend production build completed successfully.
- Coverage includes authentication, hashed passwords, role/ownership enforcement, CRUD, comments, contact persistence, inbox permissions, validation, error handling, CORS, timeouts/cancellation, text/media project persistence, unsafe media sources, and the six approved work records/assets.
- Presentation tests cover trackpad momentum, gesture reversal, transition locks, and nested reading boundaries. React component tests additionally exercise protected redirects, registration, login/return destinations, comments, contact retry/success, project/article CRUD with Bearer tokens, ownership-aware controls, session verification/retry, literary/media rendering, record changes, and homepage exit cleanup. These use jsdom and an isolated test API, not a live browser.
- Staged publication checks exclude private environment/credential files, local data, caches, and known local secret values.
- The October 26 cover and typography revision passed the same 48-test suite and production build. The approved manifest checks distinct cover URLs, exact film titles and SHA-256 hashes for all six exported covers. The comment workflow test now waits for the asynchronous refreshed comment list after the publish confirmation.
- `TYPOGRAPHY_REVIEW.md` documents the shared and mobile font-size changes. The four new generated covers were visually inspected as image outputs; this does not substitute for rendered page inspection. The two film covers use the supplied images directly, with WebP encoding only.

## Local browser checks completed before the tool interruption

Public API content, project search/no-results recovery, project detail, administrator sign-in, project editing/saving, logout, author registration/role separation, contact submission, inbox receipt, and mark-as-read were exercised. Desktop and mobile header/footer typography and the prior hero transition were visually inspected.

The subsequent pure-white chapter presentation was compiled and structurally tested, but has not received a browser visual or gesture acceptance pass. Browser automation stopped because its Windows helper could not initialize. Earlier screenshots are historical evidence and do not show the new presentation. An independent review returned `recapture` because the old full-page desktop evidence omitted a lazy-loaded image. No visual ship verdict or automated Impeccable comp-diff/build-gate pass is claimed.

## Production observations

- Frontend: https://waisery-portfolio.vercel.app/
- API: https://waisery-api.onrender.com/api
- Repository: https://github.com/Waisery/Waisery-portfolio
- Application release `c812fc8` adds the pure-white five-chapter presentation, keyframed motion, media/text projects, six approved works, native media players, dashboard fields, and source provenance.
- Vercel deployment `dpl_4318bhecNv96cvE8itV1Vc8199xw` reached READY and has the production domain assigned.
- API health returned HTTP 200 with a connected production database. The frontend origin is allowed, authenticated preflights pass, and an unrelated origin receives no allow-origin header.
- The owner explicitly approved public display of the six supplied works, then separately authorized production administrator provisioning and import. The import completed successfully, preserving unrelated data.
- GET /api/projects returned six real works: three Literature entries, two Media videos, and one Art audio entry. All are labeled sample=false.
- The configured administrator successfully signed in through the production API. GET /api/users/me confirmed the Waisery administrator role, and GET /api/messages returned HTTP 200 with the correct CORS header. No credentials or tokens were printed or committed.
- Both videos returned HTTP 206, Content-Type video/mp4, and a correct byte range. The audio returned HTTP 206 with audio/mpeg. These checks establish media availability and seekable delivery; they do not establish a completed browser playback review.
- An earlier deployment check confirmed all public/protected route URLs return the SPA entry correctly, and the frontend bundle embeds the production API URL rather than a localhost endpoint.
- The Render connector cannot access the owner's Waisery workspace. Public API behavior is verified; deployment control-plane logs were unavailable.

## Remaining acceptance

1. Complete visual, keyboard, wheel, touch, focus, overflow, reduced-motion, and media playback checks of the new presentation when browser access is restored. Capture current desktop/mobile evidence and repeat the independent review.
2. Review the English literary editions and descriptive text editorially. Source originals are preserved; translations and illustrative covers are identified on the public pages.
3. Publish original journal articles when available. Portfolio literary works are not duplicated into the journal, and no sample articles are published as original writing.
4. Complete a live browser authenticated workflow, including content updates, comments, contact submission, and inbox confirmation. Backend integration coverage and the successful live login/read checks establish only their stated scope.

Production administrator credentials are available only in the ignored local file server/.admin-credentials.local.txt, excluded from Git and _Project.zip.

## October 26 specification audit

See SPEC_COMPLIANCE.md for the complete phase-by-phase, model-field, endpoint, route, and submission matrix. Three reproduced client defects were fixed: comment drafts retained between article IDs, duplicate project-summary punctuation, and joined accessible words in the homepage title. Dynamic detail routes now remount per ID. The complete test/build command passed after these corrections.

Current production reads returned six projects and zero blog posts; a health retry returned a connected production database, and administrator login/current-user verification succeeded. Invalid-input and unauthenticated probes check the live validation/guard contract without changing formal works. The first health call timed out at 30 seconds, so cold-start latency remains an observed limitation. Browser initialization failed again; no new live browser or visual acceptance is claimed.
