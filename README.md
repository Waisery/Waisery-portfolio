# Waisery — Portfolio & Journal

A full-stack personal portfolio and blog built with React, React Router, CSS Modules, Node.js, Express, and MongoDB/Mongoose. The homepage uses a pure-white canvas with five presentation chapters, keyframed transitions, and Chinese celestial artwork. Inner pages retain the ivory, pale-gold, and ink design system.

## Deployment targets

- Frontend: https://waisery-portfolio.vercel.app/
- API base: https://waisery-api.onrender.com/api
- API health: https://waisery-api.onrender.com/api/health

These are the owner's configured deployment targets. See `VERIFICATION.md` for the latest verified deployment status; a target URL alone does not confirm a successful release.

## Features

- Responsive portfolio, project gallery, project detail pages, about page, and journal.
- Article detail pages with populated authors and authenticated comments.
- Controlled contact form with validation and persistent message storage.
- Registration and sign-in with bcrypt password hashing and expiring JWTs.
- Authentication Context, session restoration, protected dashboard, and auth-aware navigation.
- Project CRUD for administrators; article CRUD restricted to the original author.
- Administrator contact inbox with read/unread controls.
- Consistent JSON errors, request validation, URL validation, Helmet, CORS, rate limits, and graceful shutdown.
- Real MongoDB for both local demonstration and production; no browser-only mock data.

The biography, learning focus, and contact information are adapted from the owner's reference frontend. Waisery is the public display name, and the owner explicitly approved publishing the contact email and six supplied works: three literary texts, two videos, and one audio recording. Literature is presented in English; videos and audio retain the supplied recording language with English presentation text. Generated covers are identified as illustrations. Local demonstration content stays labeled. The celestial figure is artwork, not a portrait of the portfolio owner. See `CONTENT_SOURCES.md` and `MEDIA_PROVENANCE.json` for source mapping.

## Requirements

- Node.js 24.19.0 is recommended and used for verification. The complete test suite supports Node.js 22.22.2 or newer in the 22.x line, 24.15.0 or newer in the 24.x line, or 26.x and later.
- npm and an internet connection for the first dependency installation.
- MongoDB Atlas for production.

## Run locally

From the repository root:

```bash
npm ci --include=dev --ignore-scripts
npm run dev
```

Open http://127.0.0.1:5173/. The API runs on port 4000, and Vite proxies `/api` to it.

Without a MongoDB URI in development, the application starts an actual local MongoDB process and seeds example content. On the first run it downloads the platform-specific MongoDB distribution; this can take several minutes. Database files persist in `server/.data/mongodb`, and binaries are cached in `server/.data/binaries`.

Local demo administrator:

```text
Email: admin@waisery.local
Password: WaiseryDemo!2026
```

This account exists only in the local demo database. Production refuses demo mode and never provisions these credentials automatically.

For a database of your own, copy `server/.env.example` to `server/.env`, set `MONGODB_URI`, set a random `JWT_SECRET` of at least 32 characters, and set `DEMO_MODE=false`. Use `MONGODB_DB_NAME` to isolate this application's collections. `DNS_SERVERS` is an optional comma-separated resolver override for environments with restricted SRV resolution.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the API and Vite together |
| `npm test` | Run real-MongoDB API integration tests, frontend API/gesture tests, and React component workflow tests |
| `npm run build` | Build the frontend into `client/dist` |
| `npm start` | Start the API; also serves `client/dist` if present |
| `npm run check` | Run both test suites and the frontend production build |
| `npm run seed` | Provision the explicitly configured administrator; optionally seed sample content |
| `npm run import:works` | Explicitly import the six approved works into the configured local database |

## Project structure

```text
client/
  src/                 React pages, reusable components, auth context, API client
  public/images/       Generated production artwork in WebP format
server/
  src/models/          User, Project, BlogPost, Comment, Message
  src/controllers/     Request handlers
  src/routes/          REST endpoint wiring
  src/middleware/      JWT protection, role checks, validation, errors
  test/                Database-backed API integration tests
scripts/               Local connection checks and source packaging
render.yaml            Render API deployment configuration
vercel.json            Vercel frontend build, SPA routing, security headers
IMPLEMENTATION_PLAN.md Scope, acceptance criteria, and implementation decisions
```

## API endpoints

Use `Authorization: Bearer <token>` for protected endpoints. JSON request and response bodies use `Content-Type: application/json`. Errors have the form `{ "error": { "message": "...", "fields": { "field": "..." } } }`; `fields` appears for input validation errors.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API and database readiness |
| GET | `/api/profile` | Public | Portfolio profile and demo-mode status |
| POST | `/api/users/register` | Public | Create an author account and return a session |
| POST | `/api/users/login` | Public | Authenticate and return a session |
| GET | `/api/users/me` | Signed in | Verify the current user |
| GET | `/api/projects` | Public | List projects with owner username |
| GET | `/api/projects/:id` | Public | Read one project |
| POST | `/api/projects` | Administrator | Create a project |
| PUT | `/api/projects/:id` | Administrator | Update a project |
| DELETE | `/api/projects/:id` | Administrator | Delete a project |
| GET | `/api/blog` | Public | List articles with author username |
| GET | `/api/blog/:id` | Public | Read an article with populated comments |
| POST | `/api/blog` | Signed in | Create an article |
| PUT | `/api/blog/:id` | Original author | Update an article |
| DELETE | `/api/blog/:id` | Original author | Delete an article and its comments |
| GET | `/api/blog/:postId/comments` | Public | List populated comments |
| POST | `/api/blog/:postId/comments` | Signed in | Add a comment |
| POST | `/api/contact` | Public | Save a contact message |
| GET | `/api/messages` | Administrator | Read the contact inbox |
| PATCH | `/api/messages/:id` | Administrator | Change read/unread status |

Registration accepts `username`, `email`, and `password`; it cannot grant an administrator role. Project payloads accept `title`, `description`, `imageUrl`, `repoUrl`, `liveUrl`, `category`, `tags`, `featured`, `sample`, `mediaType`, `mediaUrl`, `content`, and `contentNote`. Article payloads accept `title`, `content`, `excerpt`, `imageUrl`, `category`, and `sample`. The server assigns owner/author IDs from the verified session rather than trusting request fields.

Passwords use bcrypt through the pure-JavaScript `bcryptjs` implementation, with 12 salt rounds and a validated 72-byte maximum. Tokens expire after eight hours and are verified for signature algorithm, issuer, and audience. Browser sessions are stored in sessionStorage and cleared on sign-out or an authentication rejection.

## Render backend

Connect this repository as a Node web service. Keep Root Directory empty.

```text
Build Command: npm ci --omit=dev --ignore-scripts
Start Command: npm start
Health Check Path: /api/health
```

Set these environment variables in Render:

```text
NODE_ENV=production
NODE_VERSION=24.19.0
DEMO_MODE=false
MONGODB_DB_NAME=waisery_portfolio
MONGODB_URI=<your Atlas connection string>
JWT_SECRET=<a unique random secret of at least 32 characters>
CLIENT_ORIGIN=https://waisery-portfolio.vercel.app
```

Render supplies `PORT`. No persistent disk is required because production data lives in Atlas. The Blueprint declares the URI and origin as user-supplied values and can generate the JWT secret. It does not contain credentials.

If the frontend does not exist yet, temporarily set `CLIENT_ORIGIN=http://127.0.0.1:5173`, deploy the API, deploy Vercel using the resulting API URL, and then update `CLIENT_ORIGIN` to the final frontend origin. Multiple explicit origins can be comma-separated; add an exact preview origin if testing a Vercel preview deployment.

## Vercel frontend

Import this repository, choose Vite, and keep Root Directory at the repository root (`./`). `vercel.json` supplies:

```text
Build Command: npm run build -w client
Output Directory: client/dist
Install Command: npm ci --include=dev --ignore-scripts
```

Set `VITE_API_URL=https://waisery-api.onrender.com/api` as a Config variable for the intended environments. It is a public API address and is compiled into the browser bundle. Redeploy after changing it. Do not add database credentials or the JWT signing secret to the frontend.

## Provision a production administrator

Public registration creates authors. To provision the owner, temporarily set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend environment, then run `npm run seed` using that environment. The password must be at least 12 characters and no more than 72 UTF-8 bytes. Remove `ADMIN_PASSWORD` from the hosting environment afterward. An existing author is not silently promoted by the seed command.

Set `SEED_SAMPLE_CONTENT=true` only if you explicitly want the example projects and articles. Seeding inserts examples only when the corresponding collection is empty; it does not replace existing content. Production startup itself never seeds.

## Personalization and artwork

Edit `server/src/profile.js` for the biography and focus areas. Use the dashboard to replace sample projects and posts, and clear their sample-content label when publishing your own content. Hosted image URLs must use http/https; bundled images use `/images/...` paths.

Generated illustration prompts and source-reference descriptions are recorded in `ASSET_PROVENANCE.json`; WebP assets contain embedded generation descriptions. UI text and controls remain semantic HTML rather than being baked into the artwork.

## Submission

The submission archive is named `_Project.zip`. It contains application source, artwork, lockfile, environment examples, deployment configuration, and documentation. Secret environment files, dependencies, local database files, caches, and generated build output are excluded. Production URLs must be checked after deployment before marking the hosted submission complete.

## Presentation and creative works

The homepage has five manually controlled chapters: Opening, Work, About, Journal, and Contact. Use the chapter controls, arrow keys, Page Up/Down, or a deliberate wheel/swipe gesture. Trackpad momentum cannot skip multiple chapters. Long chapter content remains scrollable before an edge gesture changes chapters. Browser zoom and media controls are preserved. Reduced-motion preferences replace spatial movement with a short fade. Inner routes keep ordinary document scrolling.

Projects support `mediaType` values `image`, `text`, `video`, and `audio`, together with `mediaUrl`, `content`, and `contentNote`. Text works require content; audio and video require a safe URL. Local media belongs under `client/public/media`. The dashboard edits these fields and the public detail page provides native media controls or a readable full-text view. Video and audio do not autoplay.

Stop the local development server before a local command-line import, because both use the same persistent demo database directory. An import requires explicitly configured administrator credentials. `npm run import:works -- --production` reads the ignored `server/.env.production.local` file and targets its Atlas database. It provisions that configured administrator if absent and upserts only the six stable source keys. It preserves unrelated records and never runs automatically at server start. Re-running the import replaces imported fields for these six works, so preserve later dashboard edits before choosing to import again. Production imports do not add sample content.

The generated production administrator credentials are stored only in the ignored local file `server/.admin-credentials.local.txt`. They are excluded from Git and `_Project.zip`.

## Specification audit

SPEC_COMPLIANCE.md maps every specification phase, required model field, mandatory endpoint, route, and submission item to source and verification evidence. The complete suite contains 25 real-MongoDB backend integration tests, 12 frontend API/gesture tests, and 11 React component workflow tests using an isolated test API. It distinguishes this automated evidence from outstanding live browser acceptance and the currently empty production journal.
